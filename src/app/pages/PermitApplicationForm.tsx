import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { citizenService } from "../../services/citizenService";

const PERMIT_TYPE_VALUES: Record<string, number> = {
  Sport: 0,
  Collection: 1,
  Protection: 2,
  Hunting: 3,
  Other: 4,
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export function PermitApplicationForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    requestedPermitType: "",
    reason: "",
    medicalCertificate: null as File | null,
    psychologicalCertificate: null as File | null,
  });

  const validateFile = (file: File | null, label: string) => {
    if (!file) return `Dodaj ${label}`;
    if (!ALLOWED_TYPES.includes(file.type)) return "Dozwolone są tylko pliki PDF, JPG albo PNG";
    if (file.size > MAX_FILE_SIZE) return "Plik może mieć maksymalnie 10 MB";
    return "";
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.requestedPermitType) e.requestedPermitType = "Wybierz rodzaj pozwolenia";
    if (!formData.reason || formData.reason.length < 20) e.reason = "Uzasadnienie musi mieć minimum 20 znaków";

    const medicalError = validateFile(formData.medicalCertificate, "zaświadczenie lekarskie");
    const psychologicalError = validateFile(formData.psychologicalCertificate, "zaświadczenie psychologiczne");
    if (medicalError) e.medicalCertificate = medicalError;
    if (psychologicalError) e.psychologicalCertificate = psychologicalError;

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
      const application = await citizenService.createPermitApplication({
        requestedPermitType: PERMIT_TYPE_VALUES[formData.requestedPermitType] as any,
        reason: formData.reason,
      });

      await citizenService.uploadPermitApplicationAttachments(application.id, {
        medicalCertificate: formData.medicalCertificate,
        psychologicalCertificate: formData.psychologicalCertificate,
      });

      toast.success("Wniosek o pozwolenie złożony", {
        description: "Wniosek i załączniki zostały przekazane do WPA.",
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

  const fileName = (file: File | null) => file ? (
    <p className="text-xs text-muted-foreground mt-1.5 truncate">{file.name}</p>
  ) : null;

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">
          Wniosek o pozwolenie na broń
        </h1>
        <p className="text-muted-foreground">Złóż wniosek o wydanie pozwolenia na posiadanie broni palnej</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Informacje o wniosku</CardTitle>
            <CardDescription>Twoje dane osobowe są już w systemie. Podaj rodzaj pozwolenia i uzasadnienie.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="requestedPermitType">Rodzaj pozwolenia <span className="text-red-600">*</span></Label>
              <Select
                value={formData.requestedPermitType}
                onValueChange={(v) => setFormData({ ...formData, requestedPermitType: v })}
              >
                <SelectTrigger id="requestedPermitType" className="mt-2">
                  <SelectValue placeholder="Wybierz rodzaj pozwolenia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sport">Pozwolenie sportowe</SelectItem>
                  <SelectItem value="Hunting">Pozwolenie łowieckie</SelectItem>
                  <SelectItem value="Collection">Pozwolenie kolekcjonerskie</SelectItem>
                  <SelectItem value="Protection">Pozwolenie do ochrony osobistej</SelectItem>
                  <SelectItem value="Other">Inne</SelectItem>
                </SelectContent>
              </Select>
              {errors.requestedPermitType && (
                <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />{errors.requestedPermitType}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reason">Uzasadnienie / cel posiadania broni <span className="text-red-600">*</span></Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">Opisz cel, w jakim chcesz posiadać broń (min. 20 znaków)</p>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="min-h-[120px] rounded-xl"
                placeholder="Np. sport strzelecki, kolekcjonerstwo, łowiectwo..."
              />
              <div className="flex justify-between mt-1">
                {errors.reason ? (
                  <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />{errors.reason}
                  </p>
                ) : <span />}
                <span className="text-xs text-muted-foreground">{formData.reason.length} / 20+</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Zaświadczenia medyczne</CardTitle>
            <CardDescription>
              Dodaj skany zaświadczeń. WPA zweryfikuje pliki i wpisze daty ważności przy zatwierdzaniu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="medicalCertificate">Zaświadczenie lekarskie <span className="text-red-600">*</span></Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">PDF, JPG albo PNG, maksymalnie 10 MB.</p>
              <Input
                id="medicalCertificate"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => setFormData({ ...formData, medicalCertificate: e.target.files?.[0] ?? null })}
                className="min-h-[44px] rounded-xl"
              />
              {fileName(formData.medicalCertificate)}
              {errors.medicalCertificate && (
                <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />{errors.medicalCertificate}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="psychologicalCertificate">Zaświadczenie psychologiczne <span className="text-red-600">*</span></Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">PDF, JPG albo PNG, maksymalnie 10 MB.</p>
              <Input
                id="psychologicalCertificate"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => setFormData({ ...formData, psychologicalCertificate: e.target.files?.[0] ?? null })}
                className="min-h-[44px] rounded-xl"
              />
              {fileName(formData.psychologicalCertificate)}
              {errors.psychologicalCertificate && (
                <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />{errors.psychologicalCertificate}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 space-y-1">
                <p className="font-semibold">Informacja o procesie</p>
                <ul className="text-blue-700 space-y-1 list-disc list-inside text-xs">
                  <li>WPA rozpatrzy Twój wniosek w ciągu 30 dni roboczych</li>
                  <li>Zaświadczenia zostaną zweryfikowane przez funkcjonariusza WPA</li>
                  <li>Status sprawdzisz w zakładce Moje wnioski</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="min-h-[44px] flex-1 rounded-xl">
            Anuluj
          </Button>
          <Button type="submit" disabled={loading} className="min-h-[52px] flex-1 rounded-xl">
            {loading ? "Składanie..." : "Złóż wniosek"}
          </Button>
        </div>
      </form>
    </div>
  );
}
