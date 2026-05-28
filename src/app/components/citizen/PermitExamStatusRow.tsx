import { Badge } from "../ui/badge";
import { CitizenNavIconTile } from "./CitizenNavIconTile";
import { DateStatusMeta } from "../DateStatusMeta";
import { cn } from "../ui/utils";
import { formatMedicalAlertDate } from "../../../lib/medicalAlerts";
import {
  examIcon,
  examLabel,
  getExamStatusTileClass,
  type ExamStatus,
  type PermitExamEntry,
} from "../../../lib/permitExams";

export function ExamStatusBadge({
  status,
  daysLeft,
}: {
  status: ExamStatus;
  daysLeft?: number | null;
}) {
  if (status === "missing") {
    return <Badge className="bg-slate-100 text-slate-800 border-none rounded-full">Brak danych</Badge>;
  }
  if (status === "expired") {
    return <Badge variant="destructive" className="rounded-full">Wygasło</Badge>;
  }
  if (status === "expiring") {
    if (daysLeft != null && daysLeft <= 7) {
      return (
        <Badge className="bg-red-100 text-red-800 border-none rounded-full">
          Pilne ({daysLeft} dni)
        </Badge>
      );
    }
    return <Badge className="bg-amber-100 text-amber-800 border-none rounded-full">Wygasa</Badge>;
  }
  return <Badge className="bg-emerald-100 text-emerald-800 border-none rounded-full">Aktualne</Badge>;
}

function statusBadge(entry: PermitExamEntry) {
  return <ExamStatusBadge status={entry.status} daysLeft={entry.daysLeft} />;
}

type PermitExamStatusRowProps = {
  entry: PermitExamEntry;
  className?: string;
};

export function PermitExamStatusRow({ entry, className }: PermitExamStatusRowProps) {
  const showWarningBlock = entry.status === "expired" || entry.status === "missing";
  const Icon = examIcon(entry.examType);
  return (
    <div className={cn("flex items-start gap-3 py-3 first:pt-0 last:pb-0", className)}>
      <CitizenNavIconTile
        className={cn(
          "self-center shrink-0 scale-90 [&_svg]:h-5 [&_svg]:w-5 p-2.5",
          getExamStatusTileClass(entry.status),
        )}
      >
        <Icon />
      </CitizenNavIconTile>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm leading-snug text-foreground">{examLabel(entry.examType)}</h4>

        <DateStatusMeta className="mt-1" emphasizeDate statusBadge={statusBadge(entry)}>
          {entry.expiryDate
            ? `${entry.status === "expired" ? "Wygasło" : "Ważne do"}: ${formatMedicalAlertDate(entry.expiryDate)}`
            : "Ważne do: brak danych"}
          {entry.daysLeft != null && entry.daysLeft < 0 && ` (${Math.abs(entry.daysLeft)} dni temu)`}
        </DateStatusMeta>

        {entry.alertMessage && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">{entry.alertMessage}</p>
        )}

        {showWarningBlock && (
          <div
            className={cn(
              "rounded-lg p-2 mt-2",
              entry.status === "expired" ? "bg-red-100" : "bg-slate-100",
            )}
          >
            <p className={cn("text-xs", entry.status === "expired" ? "text-red-900" : "text-slate-800")}>
              <strong>Wymagane działanie:</strong>{" "}
              {entry.status === "missing"
                ? "Brakuje potwierdzonej daty ważności badania. Skontaktuj się z WPA w celu aktualizacji."
                : "Odnów badanie i dostarcz zaświadczenie do WPA, aby odblokować pozwolenie."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
