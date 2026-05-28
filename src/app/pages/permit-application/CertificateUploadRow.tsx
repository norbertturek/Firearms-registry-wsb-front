import { AlertCircle, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CitizenNavIconTile } from "../../components/citizen/CitizenNavIconTile";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { cn } from "../../components/ui/utils";
import { FILE_ACCEPT } from "./shared";

type CertificateUploadRowProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  file: File | null;
  expiryDate: string;
  error?: string;
  expiryError?: string;
  onFileChange: (file: File | null) => void;
  onExpiryDateChange: (value: string) => void;
};

export function CertificateUploadRow({
  id,
  label,
  icon: Icon,
  file,
  expiryDate,
  error,
  expiryError,
  onFileChange,
  onExpiryDateChange,
}: CertificateUploadRowProps) {
  const inputId = `${id}-file`;
  const expiryId = `${id}-expiry`;

  return (
    <div id={id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 scroll-mt-24">
      <CitizenNavIconTile className="self-center shrink-0 scale-90 [&_svg]:h-5 [&_svg]:w-5 p-2.5">
        <Icon />
      </CitizenNavIconTile>
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <h4 className="font-semibold text-sm leading-snug text-foreground">{label}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">PDF, JPG lub PNG, maks. 10 MB</p>
        </div>
        <label
          htmlFor={inputId}
          className={cn(
            "flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-dashed px-3 py-2 transition-colors",
            error ? "border-red-300 bg-red-50/50" : "border-border bg-muted/20 hover:bg-muted/40",
          )}
        >
          <Upload className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="text-sm text-foreground truncate flex-1">
            {file ? file.name : "Wybierz plik"}
          </span>
        </label>
        <input
          id={inputId}
          type="file"
          accept={FILE_ACCEPT}
          className="sr-only"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        {error && (
          <p className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}
        <div>
          <Label htmlFor={expiryId} className="text-xs text-muted-foreground">
            Ważne do <span className="text-red-600">*</span>
          </Label>
          <Input
            id={expiryId}
            type="date"
            value={expiryDate}
            onChange={(e) => onExpiryDateChange(e.target.value)}
            className={cn("mt-1 rounded-xl min-h-[44px]", expiryError && "border-red-300")}
          />
          {expiryError && (
            <p className="flex items-center gap-1.5 mt-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              {expiryError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
