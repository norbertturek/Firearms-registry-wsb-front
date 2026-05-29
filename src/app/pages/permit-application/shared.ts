import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { citizenService } from "../../../services/citizenService";

export const PERMIT_TYPE_VALUES: Record<string, number> = {
  Sport: 0,
  Collection: 1,
  Protection: 2,
  Hunting: 3,
  Other: 4,
};

export const PERMIT_TYPE_OPTIONS = [
  { value: "Sport", label: "Pozwolenie sportowe", shortLabel: "Sportowe" },
  { value: "Hunting", label: "Pozwolenie łowieckie", shortLabel: "Łowieckie" },
  { value: "Collection", label: "Pozwolenie kolekcjonerskie", shortLabel: "Kolekcjonerskie" },
  { value: "Protection", label: "Pozwolenie do ochrony osobistej", shortLabel: "Ochrony osobistej" },
  { value: "Other", label: "Inne", shortLabel: "Inne" },
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const FILE_ACCEPT = "application/pdf,image/jpeg,image/png";

export type PermitApplicationFormData = {
  requestedPermitType: string;
  reason: string;
  medicalCertificate: File | null;
  psychologicalCertificate: File | null;
  medicalExamExpiryDate: string;
  psychologicalExamExpiryDate: string;
};

const VALIDATION_FIELD_ORDER: (keyof PermitApplicationFormData)[] = [
  "requestedPermitType",
  "reason",
  "medicalCertificate",
  "medicalExamExpiryDate",
  "psychologicalCertificate",
  "psychologicalExamExpiryDate",
];

function scrollToValidationField(fieldId: string) {
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusable =
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLButtonElement
      ? el
      : el.querySelector<HTMLElement>('input, textarea, button, [role="combobox"]');
  focusable?.focus({ preventScroll: true });
}

function getValidationToastDescription(errors: Record<string, string>) {
  const messages = VALIDATION_FIELD_ORDER.map((key) => errors[key]).filter(Boolean);
  if (messages.length === 0) return undefined;
  if (messages.length === 1) return messages[0];
  return messages.slice(0, 2).join(" · ");
}

function validateFile(file: File | null, label: string) {
  if (!file) return `Dodaj ${label}`;
  if (!ALLOWED_TYPES.includes(file.type)) return "Dozwolone są tylko pliki PDF, JPG albo PNG";
  if (file.size > MAX_FILE_SIZE) return "Plik może mieć maksymalnie 10 MB";
  return "";
}

export function validatePermitApplicationForm(formData: PermitApplicationFormData) {
  const e: Record<string, string> = {};
  if (!formData.requestedPermitType) e.requestedPermitType = "Wybierz rodzaj pozwolenia";
  if (!formData.reason || formData.reason.length < 20) {
    e.reason = "Uzasadnienie musi mieć minimum 20 znaków";
  }
  const medicalError = validateFile(formData.medicalCertificate, "zaświadczenie lekarskie");
  const psychologicalError = validateFile(formData.psychologicalCertificate, "zaświadczenie psychologiczne");
  if (medicalError) e.medicalCertificate = medicalError;
  if (psychologicalError) e.psychologicalCertificate = psychologicalError;
  if (formData.medicalCertificate && !formData.medicalExamExpiryDate) {
    e.medicalExamExpiryDate = "Podaj datę ważności badania lekarskiego";
  }
  if (formData.psychologicalCertificate && !formData.psychologicalExamExpiryDate) {
    e.psychologicalExamExpiryDate = "Podaj datę ważności badania psychologicznego";
  }
  return e;
}

function toIsoDate(date: string) {
  return date.includes("T") ? date : `${date}T00:00:00Z`;
}

export function usePermitApplicationForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<PermitApplicationFormData>({
    requestedPermitType: "",
    reason: "",
    medicalCertificate: null,
    psychologicalCertificate: null,
    medicalExamExpiryDate: "",
    psychologicalExamExpiryDate: "",
  });

  const handleSubmit = async () => {
    const newErrors = validatePermitApplicationForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstField = VALIDATION_FIELD_ORDER.find((key) => newErrors[key]);
      if (firstField) {
        scrollToValidationField(firstField);
      }
      const missingCount = Object.keys(newErrors).length;
      toast.error("Uzupełnij wymagane pola", {
        description:
          getValidationToastDescription(newErrors) ??
          `Popraw ${missingCount} ${missingCount === 1 ? "pole" : "pola"}, aby złożyć wniosek.`,
      });
      return false;
    }

    setErrors({});

    setLoading(true);
    try {
      const medicalExamExpiryDate = formData.medicalExamExpiryDate
        ? toIsoDate(formData.medicalExamExpiryDate)
        : undefined;
      const psychologicalExamExpiryDate = formData.psychologicalExamExpiryDate
        ? toIsoDate(formData.psychologicalExamExpiryDate)
        : undefined;

      const application = await citizenService.createPermitApplication({
        requestedPermitType: PERMIT_TYPE_VALUES[formData.requestedPermitType] as never,
        reason: formData.reason,
        medicalExamExpiryDate,
        psychologicalExamExpiryDate,
      });

      await citizenService.uploadPermitApplicationAttachments(application.id, {
        medicalCertificate: formData.medicalCertificate,
        psychologicalCertificate: formData.psychologicalCertificate,
        medicalExamExpiryDate,
        psychologicalExamExpiryDate,
      });

      toast.success("Wniosek o pozwolenie złożony", {
        description: "Wniosek i załączniki zostały przekazane do WPA.",
        duration: 5000,
      });
      navigate("/applications");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Spróbuj ponownie";
      toast.error("Błąd podczas składania wniosku", { description: message });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    loading,
    handleSubmit,
    navigate,
  };
}
