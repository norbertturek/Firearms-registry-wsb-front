import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { Loader2, FileWarning } from "lucide-react";
import { wpaService } from "../../services/wpaService";

export function WpaAttachmentViewPage() {
  const { applicationId, attachmentId } = useParams<{
    applicationId: string;
    attachmentId: string;
  }>();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string>("application/octet-stream");
  const [searchParams] = useSearchParams();
  const fileName = searchParams.get("name") ?? "Załącznik";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId || !attachmentId) {
      setError("Brak identyfikatora załącznika");
      setLoading(false);
      return;
    }

    let revokedUrl: string | null = null;
    let cancelled = false;

    wpaService
      .downloadPermitApplicationAttachment(applicationId, attachmentId)
      .then((blob) => {
        if (cancelled) return;
        const type = blob.type || "application/pdf";
        setContentType(type);
        const url = URL.createObjectURL(blob);
        revokedUrl = url;
        setBlobUrl(url);
      })
      .catch((err: { message?: string }) => {
        if (cancelled) return;
        setError(err?.message ?? "Nie udało się pobrać pliku");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (revokedUrl) URL.revokeObjectURL(revokedUrl);
    };
  }, [applicationId, attachmentId]);

  useEffect(() => {
    if (fileName) document.title = fileName;
  }, [fileName]);

  const isImage = contentType.startsWith("image/");
  const isPdf = contentType === "application/pdf";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 text-muted-foreground bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Wczytywanie załącznika...</p>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 text-red-600 p-6 text-center bg-background">
        <FileWarning className="h-8 w-8" />
        <p className="text-sm">{error ?? "Nie udało się wyświetlić pliku"}</p>
      </div>
    );
  }

  if (isPdf) {
    return (
      <iframe
        src={blobUrl}
        title={fileName}
        className="fixed inset-0 w-full h-full border-0 bg-white"
      />
    );
  }

  if (isImage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
        <img src={blobUrl} alt={fileName} className="max-w-full max-h-screen object-contain" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 text-muted-foreground p-6 text-center bg-background">
      <FileWarning className="h-8 w-8" />
      <p className="text-sm">
        Format <code>{contentType}</code> nie obsługuje podglądu. Zamknij kartę i pobierz plik z aplikacji.
      </p>
    </div>
  );
}
