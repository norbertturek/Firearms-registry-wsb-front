import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { FileText, Image as ImageIcon, Eye } from "lucide-react";
import { AttachmentPreviewDialog } from "./AttachmentPreviewDialog";
import { wpaService } from "../../../services/wpaService";
import type { WpaPermitApplicationAttachmentDto } from "../../../types/api";

const ATTACHMENT_LABELS: Record<string, string> = {
  MedicalCertificate: "Zaświadczenie lekarskie",
  PsychologicalCertificate: "Zaświadczenie psychologiczne",
};

type Props = {
  applicationId: string;
  attachments: WpaPermitApplicationAttachmentDto[];
  title?: string;
  description?: string;
  bare?: boolean;
};

export function PermitApplicationAttachmentsCard({
  applicationId,
  attachments,
  title = "Załączniki do weryfikacji",
  description = "Zaświadczenia lekarskie i psychologiczne dołączone przez obywatela.",
  bare = false,
}: Props) {
  const [previewAttachment, setPreviewAttachment] = useState<{
    id: string;
    fileName: string;
    contentType: string;
  } | null>(null);

  const attachmentList = attachments.length > 0 ? (
    <div className="space-y-1.5 md:space-y-2">
      {attachments.map((attachment) => {
        const isImage = attachment.contentType.startsWith("image/");
        return (
          <button
            key={attachment.id}
            type="button"
            onClick={() =>
              setPreviewAttachment({
                id: attachment.id,
                fileName: attachment.fileName,
                contentType: attachment.contentType,
              })
            }
            className="w-full flex items-center justify-between gap-2 md:gap-3 rounded-lg md:rounded-xl bg-muted/30 p-2.5 md:p-3 text-left border border-transparent"
          >
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className={`p-1.5 md:p-2 rounded-md md:rounded-lg shrink-0 ${isImage ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {isImage ? <ImageIcon className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <FileText className="h-3.5 w-3.5 md:h-4 md:w-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium truncate">{attachment.fileName}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground leading-snug">
                  {ATTACHMENT_LABELS[attachment.attachmentTypeName] ?? attachment.attachmentTypeName}
                  {" • "}
                  {(attachment.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs text-primary font-medium shrink-0">
              <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Podgląd
            </div>
          </button>
        );
      })}
    </div>
  ) : (
    <div className="rounded-lg md:rounded-xl bg-orange-50 p-2.5 md:p-3 text-xs md:text-sm text-orange-900 leading-snug">
      Brak załączonych zaświadczeń. Wezwij obywatela do uzupełnienia.
    </div>
  );

  return (
    <>
      {bare ? (
        attachmentList
      ) : (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{attachmentList}</CardContent>
        </Card>
      )}

      {previewAttachment && (
        <AttachmentPreviewDialog
          open={!!previewAttachment}
          onOpenChange={(open) => !open && setPreviewAttachment(null)}
          fileName={previewAttachment.fileName}
          contentType={previewAttachment.contentType}
          viewUrl={`/officer/attachments/${applicationId}/${previewAttachment.id}?name=${encodeURIComponent(previewAttachment.fileName)}`}
          fetchBlob={() =>
            wpaService.downloadPermitApplicationAttachment(applicationId, previewAttachment.id)
          }
        />
      )}
    </>
  );
}
