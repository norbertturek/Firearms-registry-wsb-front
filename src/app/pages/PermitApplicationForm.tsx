import { AlertCircle, Brain, ChevronRight, HeartPulse, Shield } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../components/ui/utils";
import { CITIZEN_LIST_CARD_CONTENT_CLASS, CITIZEN_NAV_ICON_TONE } from "../utils/citizenCardUi";
import { CertificateUploadRow } from "./permit-application/CertificateUploadRow";
import { FormActions } from "./permit-application/FormActions";
import { ApplicationProcessNotice } from "../components/citizen/ApplicationProcessNotice";
import { PERMIT_APPLICATION_PROCESS_STEPS } from "./permit-application/processNoticeSteps";
import {
  PERMIT_TYPE_OPTIONS,
  usePermitApplicationForm,
  validatePermitApplicationForm,
} from "./permit-application/shared";

export function PermitApplicationForm() {
  const { formData, setFormData, errors, loading, handleSubmit, navigate } = usePermitApplicationForm();
  const canSubmit = Object.keys(validatePermitApplicationForm(formData)).length === 0;

  return (
    <div className="pt-2 space-y-4">
      <div className="px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">
          Wniosek o pozwolenie na broń
        </h1>
        <p className="text-muted-foreground">Złóż wniosek o wydanie pozwolenia na posiadanie broni palnej</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="space-y-3"
      >
        <Card className="rounded-2xl border-none shadow-sm gap-0 overflow-hidden scroll-mt-24">
          <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-3 rounded-2xl shrink-0", CITIZEN_NAV_ICON_TONE)}>
                <Shield className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">Rodzaj pozwolenia</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Dane osobowe są już w systemie</p>
              </div>
            </div>
            <Label htmlFor="requestedPermitType" className="sr-only">
              Rodzaj pozwolenia
            </Label>
            <Select
              value={formData.requestedPermitType}
              onValueChange={(v) => setFormData({ ...formData, requestedPermitType: v })}
            >
              <SelectTrigger id="requestedPermitType" className="rounded-xl min-h-[44px]">
                <SelectValue placeholder="Wybierz rodzaj pozwolenia" />
              </SelectTrigger>
              <SelectContent>
                {PERMIT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.requestedPermitType && (
              <p className="flex items-center gap-1.5 mt-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                {errors.requestedPermitType}
              </p>
            )}
          </CardContent>
        </Card>

        <Card id="reason" className="rounded-2xl border-none shadow-sm gap-0 overflow-hidden scroll-mt-24">
          <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-3 rounded-2xl shrink-0", CITIZEN_NAV_ICON_TONE)}>
                <ChevronRight className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">Uzasadnienie</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Min. 20 znaków</p>
              </div>
            </div>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="min-h-[120px] rounded-xl"
              placeholder="Np. sport strzelecki, kolekcjonerstwo, łowiectwo..."
            />
            <div className="flex justify-between mt-1">
              {errors.reason ? (
                <p className="flex items-center gap-1.5 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                  {errors.reason}
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs text-muted-foreground">{formData.reason.length} / 20+</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm gap-0 overflow-hidden">
          <CardContent className={cn(CITIZEN_LIST_CARD_CONTENT_CLASS, "pt-4")}>
            <div className="flex items-center gap-3 mb-1">
              <div className={cn("p-3 rounded-2xl shrink-0", CITIZEN_NAV_ICON_TONE)}>
                <HeartPulse className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">Zaświadczenia</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dołącz plik i datę ważności z zaświadczenia
                </p>
              </div>
            </div>
            <div className="divide-y divide-border/80">
              <CertificateUploadRow
                id="medicalCertificate"
                label="Badanie lekarskie"
                icon={HeartPulse}
                file={formData.medicalCertificate}
                expiryDate={formData.medicalExamExpiryDate}
                error={errors.medicalCertificate}
                expiryError={errors.medicalExamExpiryDate}
                onFileChange={(file) => setFormData({ ...formData, medicalCertificate: file })}
                onExpiryDateChange={(medicalExamExpiryDate) =>
                  setFormData({ ...formData, medicalExamExpiryDate })
                }
              />
              <CertificateUploadRow
                id="psychologicalCertificate"
                label="Badanie psychologiczne"
                icon={Brain}
                file={formData.psychologicalCertificate}
                expiryDate={formData.psychologicalExamExpiryDate}
                error={errors.psychologicalCertificate}
                expiryError={errors.psychologicalExamExpiryDate}
                onFileChange={(file) => setFormData({ ...formData, psychologicalCertificate: file })}
                onExpiryDateChange={(psychologicalExamExpiryDate) =>
                  setFormData({ ...formData, psychologicalExamExpiryDate })
                }
              />
            </div>
          </CardContent>
        </Card>

        <ApplicationProcessNotice steps={PERMIT_APPLICATION_PROCESS_STEPS} />
        {!canSubmit && !loading && (
          <p className="text-sm text-muted-foreground px-1 text-center">
            Uzupełnij rodzaj pozwolenia, uzasadnienie (min. 20 znaków), oba zaświadczenia i daty ważności.
          </p>
        )}
        <FormActions loading={loading} submitDisabled={!canSubmit} onCancel={() => navigate(-1)} />
      </form>
    </div>
  );
}
