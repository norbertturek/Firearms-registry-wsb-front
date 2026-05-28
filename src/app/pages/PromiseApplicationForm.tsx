import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertCircle, Shield, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { citizenService } from "../../services/citizenService";
import { getEligiblePermitsForPromise } from "../utils/permitEligibility";
import { PermitRequiredForPromiseNotice } from "../components/citizen/PermitRequiredForPromiseNotice";
import type { PermitDto } from "../../types/api";
import { getPermitStatusMeta } from "../../lib/statusUi";

const PERMIT_TYPE_LABELS: Record<string, string> = {
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

const PERMIT_TYPE_LABELS_BY_VALUE: Record<number, string> = {
  0: "Sportowe",
  1: "Kolekcjonerskie",
  2: "Ochrony osobistej",
  3: "Ĺowieckie",
  4: "Inne",
};

function getPermitTypeLabel(permit: PermitDto) {
  if (permit.permitTypeName) return PERMIT_TYPE_LABELS[permit.permitTypeName] ?? permit.permitTypeName;
  const permitType = permit.permitType as unknown;
  if (typeof permitType === "number") return PERMIT_TYPE_LABELS_BY_VALUE[permitType] ?? String(permitType);
  if (typeof permitType === "string") return PERMIT_TYPE_LABELS[permitType] ?? permitType;
  return "Nieznane";
}

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
      .catch(() => {})
      .finally(() => setPermitsLoading(false));
  }, []);

  const selectedPermit = permits.find((p) => p.id === formData.permitId) ?? null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.permitId) e.permitId = "Wybierz pozwolenie";
    if (!formData.requestedWeaponType || formData.requestedWeaponType.length < 5)
      e.requestedWeaponType = "Typ broni musi mieć minimum 5 znaków";
    if (formData.requestedQuantity < 1) e.requestedQuantity = "Ilość musi być większa niż 0";
    if (selectedPermit && formData.requestedQuantity > selectedPermit.availableSlots)
      e.requestedQuantity = `Maksymalna ilość dla tego pozwolenia: ${selectedPermit.availableSlots}`;
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
    } catch (err: any) {
      toast.error("Błąd podczas składania wniosku", {
        description: err?.message ?? "Spróbuj ponownie",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">Wniosek o e-Promesę</h1>
        <p className="text-muted-foreground">Złóż wniosek o promesę na zakup broni palnej</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!permitsLoading && permits.length === 0 ? (
          <PermitRequiredForPromiseNotice />
        ) : (
          <>
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Wybierz pozwolenie</CardTitle>
            <CardDescription>Promesa jest wydawana w ramach aktywnego pozwolenia na broń</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {permitsLoading ? (
              <div className="h-12 rounded-xl bg-muted animate-pulse" />
            ) : (
              <>
                <div>
                  <Label htmlFor="permitId">Pozwolenie <span className="text-red-600">*</span></Label>
                  <Select
                    value={formData.permitId}
                    onValueChange={(v) => setFormData({ ...formData, permitId: v })}
                  >
                    <SelectTrigger id="permitId" className="mt-2">
                      <SelectValue placeholder="Wybierz pozwolenie" />
                    </SelectTrigger>
                    <SelectContent>
                      {permits.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex flex-col py-1">
                            <span className="font-semibold">
                              {getPermitTypeLabel(p)} • {p.permitNumber}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Wolne sloty: {p.availableSlots} / {p.maxFirearms}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.permitId && (
                    <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="h-4 w-4 shrink-0" />{errors.permitId}
                    </p>
                  )}
                </div>

                {selectedPermit && (
                  <Card className="bg-muted/30 border-none rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl shrink-0">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-sm">
                              {getPermitTypeLabel(selectedPermit)}
                            </h3>
                            {(() => {
                              const meta = getPermitStatusMeta(selectedPermit.statusName);
                              return meta ? (
                                <Badge variant={meta.variant} className={`${meta.badgeClassName} text-xs`}>
                                  {meta.label}
                                </Badge>
                              ) : null;
                            })()}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>
                              <span className="block">Numer:</span>
                              <span className="font-mono text-foreground">{selectedPermit.permitNumber}</span>
                            </div>
                            <div>
                              <span className="block">Dostępne miejsca:</span>
                              <span className="font-semibold text-foreground">
                                {selectedPermit.availableSlots} / {selectedPermit.maxFirearms}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {permits.length > 0 && (
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Dane broni</CardTitle>
              <CardDescription>Opisz typ broni, którą planujesz kupić</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="requestedWeaponType">Typ broni <span className="text-red-600">*</span></Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Np. &quot;Pistolet sportowy Glock 17, kaliber 9mm&quot; (max 100 znaków)
                </p>
                <Input
                  id="requestedWeaponType"
                  value={formData.requestedWeaponType}
                  onChange={(e) => setFormData({ ...formData, requestedWeaponType: e.target.value })}
                  className="min-h-[44px] rounded-xl"
                  placeholder="Pistolet sportowy Glock 17, 9mm"
                  maxLength={100}
                />
                <div className="flex justify-between mt-1">
                  {errors.requestedWeaponType ? (
                    <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="h-4 w-4 shrink-0" />{errors.requestedWeaponType}
                    </p>
                  ) : <span />}
                  <span className="text-xs text-muted-foreground">{formData.requestedWeaponType.length} / 100</span>
                </div>
              </div>

              <div>
                <Label htmlFor="requestedQuantity">Ilość <span className="text-red-600">*</span></Label>
                <Input
                  id="requestedQuantity"
                  type="number"
                  value={formData.requestedQuantity}
                  onChange={(e) => setFormData({ ...formData, requestedQuantity: Number(e.target.value) })}
                  className="mt-2"
                  min={1}
                  max={selectedPermit?.availableSlots ?? 10}
                />
                {errors.requestedQuantity && (
                  <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />{errors.requestedQuantity}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-2xl border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Co dalej?</p>
                <ul className="text-blue-700 space-y-1 text-xs list-disc list-inside">
                  <li>WPA rozpatrzy wniosek w ciągu 14 dni</li>
                  <li>Po zatwierdzeniu otrzymasz promesę z kodem QR</li>
                  <li>Promesa będzie ważna przez 6 miesięcy</li>
                  <li>Kod QR pokaż w sklepie przy zakupie broni</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="min-h-[44px] flex-1 rounded-xl">
            Anuluj
          </Button>
          <Button type="submit" disabled={loading || permitsLoading || permits.length === 0} className="min-h-[52px] flex-1 rounded-xl">
            {loading ? "Składanie..." : "Złóż wniosek"}
          </Button>
        </div>
          </>
        )}
      </form>
    </div>
  );
}
