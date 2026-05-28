import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, Crosshair, Shield } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { PermitRequiredForPromiseNotice } from "../components/citizen/PermitRequiredForPromiseNotice";
import { SelectedPermitSummary } from "../components/citizen/SelectedPermitSummary";
import { citizenService } from "../../services/citizenService";
import { getEligiblePermitsForPromise } from "../utils/permitEligibility";
import { getPermitDisplayTypeLabel } from "../utils/permitLabels";
import { cn } from "../components/ui/utils";
import { CITIZEN_LIST_CARD_CONTENT_CLASS, CITIZEN_NAV_ICON_TONE } from "../utils/citizenCardUi";
import { FormActions } from "./permit-application/FormActions";
import { ApplicationProcessNotice } from "../components/citizen/ApplicationProcessNotice";
import { PROMISE_APPLICATION_PROCESS_STEPS } from "./permit-application/processNoticeSteps";
import type { PermitDto } from "../../types/api";

export function PromiseApplicationForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [permitsLoading, setPermitsLoading] = useState(true);
  const [permits, setPermits] = useState<PermitDto[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    permitId: "",
    requestedWeaponType: "",
    requestedQuantity: 1,
  });

  useEffect(() => {
    citizenService
      .getPermits()
      .then((r) => setPermits(getEligiblePermitsForPromise(r)))
      .catch(() => setPermits([]))
      .finally(() => setPermitsLoading(false));
  }, []);

  const selectedPermit = permits.find((p) => p.id === formData.permitId) ?? null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.permitId) e.permitId = "Wybierz pozwolenie";
    if (!formData.requestedWeaponType || formData.requestedWeaponType.length < 5) {
      e.requestedWeaponType = "Typ broni musi mieć minimum 5 znaków";
    }
    if (formData.requestedQuantity < 1) e.requestedQuantity = "Ilość musi być większa niż 0";
    if (selectedPermit && formData.requestedQuantity > selectedPermit.availableSlots) {
      e.requestedQuantity = `Maksymalna ilość dla tego pozwolenia: ${selectedPermit.availableSlots}`;
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await citizenService.createPromiseApplication({
        permitId: formData.permitId,
        requestedWeaponType: formData.requestedWeaponType,
        requestedQuantity: formData.requestedQuantity,
      });

      toast.success("Wniosek o e-Promesę złożony", {
        description: "Wniosek przekazany do WPA. Śledź status w zakładce Moje wnioski.",
        duration: 5000,
      });
      navigate("/applications");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Spróbuj ponownie";
      toast.error("Błąd podczas składania wniosku", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const showForm = permitsLoading || permits.length > 0;

  return (
    <div className="pt-2 space-y-4">
      <div className="px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">Wniosek o e-Promesę</h1>
        <p className="text-muted-foreground">Złóż wniosek o promesę na zakup broni palnej</p>
      </div>

      {!permitsLoading && permits.length === 0 ? (
        <PermitRequiredForPromiseNotice />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Card className="rounded-2xl border-none shadow-sm gap-0 overflow-hidden">
            <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("p-3 rounded-2xl shrink-0", CITIZEN_NAV_ICON_TONE)}>
                  <Shield className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <h2 className="font-semibold text-sm text-foreground">Pozwolenie</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Promesa jest wydawana w ramach aktywnego pozwolenia z wolnymi miejscami
                  </p>
                </div>
              </div>

              {permitsLoading ? (
                <div className="h-11 rounded-xl bg-muted animate-pulse" />
              ) : (
                <>
                  <Label htmlFor="permitId" className="sr-only">
                    Pozwolenie
                  </Label>
                  <Select
                    value={formData.permitId}
                    onValueChange={(v) => setFormData({ ...formData, permitId: v })}
                  >
                    <SelectTrigger id="permitId" className="rounded-xl min-h-[44px]">
                      <SelectValue placeholder="Wybierz pozwolenie" />
                    </SelectTrigger>
                    <SelectContent>
                      {permits.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex flex-col py-0.5">
                            <span className="font-semibold">
                              {getPermitDisplayTypeLabel(p)} • {p.permitNumber}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Wolne miejsca: {p.availableSlots} / {p.maxFirearms}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.permitId && (
                    <p className="flex items-center gap-1.5 mt-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                      {errors.permitId}
                    </p>
                  )}
                  {selectedPermit && <SelectedPermitSummary permit={selectedPermit} />}
                </>
              )}
            </CardContent>
          </Card>

          {showForm && !permitsLoading && (
            <Card className="rounded-2xl border-none shadow-sm gap-0 overflow-hidden">
              <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("p-3 rounded-2xl shrink-0", CITIZEN_NAV_ICON_TONE)}>
                    <Crosshair className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm text-foreground">Dane broni</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Opisz broń, którą planujesz kupić</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="requestedWeaponType">
                      Typ broni <span className="text-red-600">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1 mb-2">
                      Np. pistolet sportowy Glock 17, kaliber 9 mm (max 100 znaków)
                    </p>
                    <Input
                      id="requestedWeaponType"
                      value={formData.requestedWeaponType}
                      onChange={(e) => setFormData({ ...formData, requestedWeaponType: e.target.value })}
                      className="min-h-[44px] rounded-xl"
                      placeholder="Pistolet sportowy Glock 17, 9 mm"
                      maxLength={100}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.requestedWeaponType ? (
                        <p className="flex items-center gap-1.5 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                          {errors.requestedWeaponType}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-muted-foreground">{formData.requestedWeaponType.length} / 100</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requestedQuantity">
                      Ilość <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="requestedQuantity"
                      type="number"
                      value={formData.requestedQuantity}
                      onChange={(e) =>
                        setFormData({ ...formData, requestedQuantity: Number(e.target.value) })
                      }
                      className="mt-2 min-h-[44px] rounded-xl"
                      min={1}
                      max={selectedPermit?.availableSlots ?? 10}
                    />
                    {errors.requestedQuantity && (
                      <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                        {errors.requestedQuantity}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {showForm && (
            <>
              <ApplicationProcessNotice steps={PROMISE_APPLICATION_PROCESS_STEPS} />
              <FormActions
                loading={loading}
                onCancel={() => navigate(-1)}
                submitDisabled={permitsLoading || permits.length === 0}
              />
            </>
          )}
        </form>
      )}
    </div>
  );
}
