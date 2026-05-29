import { Calendar } from "lucide-react";
import { cn } from "./ui/utils";

type DateStatusMetaProps = {
  children: React.ReactNode;
  statusBadge?: React.ReactNode;
  className?: string;
  /** Stronger date text (e.g. expiry labels on alert cards) */
  emphasizeDate?: boolean;
};

export function DateStatusMeta({
  children,
  statusBadge,
  className,
  emphasizeDate = false,
}: DateStatusMetaProps) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs md:text-sm min-w-0",
          emphasizeDate ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{children}</span>
      </div>
      {statusBadge}
    </div>
  );
}
