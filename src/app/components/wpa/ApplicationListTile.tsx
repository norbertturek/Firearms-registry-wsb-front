import { ChevronRight } from "lucide-react";
import { CitizenNavIconTile } from "../citizen/CitizenNavIconTile";
import { DateStatusMeta } from "../DateStatusMeta";
import { cn } from "../ui/utils";

type ApplicationListTileProps = {
  icon: React.ReactNode;
  title: string;
  lines: string[];
  /** Formatted submission date (no label prefix — shown next to status) */
  date?: string;
  statusBadge: React.ReactNode;
  highlight?: boolean;
  headerBadge?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export function ApplicationListTile({
  icon,
  title,
  lines,
  date,
  statusBadge,
  highlight = false,
  headerBadge,
  actions,
  footer,
  className,
  onClick,
}: ApplicationListTileProps) {
  const clickable = !!onClick;
  const interactiveProps = clickable
    ? {
        role: "button" as const,
        tabIndex: 0,
        onClick,
        onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick?.();
          }
        },
      }
    : {};
  return (
    <div
      {...interactiveProps}
      className={cn(
        "rounded-2xl p-4 transition-colors",
        highlight
          ? "border border-blue-200/80 bg-blue-50/30 hover:bg-blue-50/50"
          : "bg-muted/30 hover:bg-muted/50",
        clickable &&
          "cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <CitizenNavIconTile>{icon}</CitizenNavIconTile>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h3 className="font-semibold text-sm leading-snug text-foreground line-clamp-2 min-w-0 flex-1">{title}</h3>
              {headerBadge}
            </div>
            {lines.map((line, index) => (
              <p key={`${index}-${line}`} className="text-xs text-muted-foreground mt-0.5 line-clamp-2 last:mb-0">
                {line}
              </p>
            ))}
            {date ? (
              <DateStatusMeta className="mt-1" statusBadge={statusBadge}>
                {date}
              </DateStatusMeta>
            ) : (
              <div className="flex items-center gap-2 mt-1 flex-wrap">{statusBadge}</div>
            )}
          </div>
          {clickable && (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground self-center" aria-hidden />
          )}
        </div>
        {actions && (
          <div
            className="flex gap-2 shrink-0"
            onClick={(event) => event.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>
      {footer && (
        <div
          className="mt-3 md:mt-4 space-y-2"
          onClick={clickable ? (event) => event.stopPropagation() : undefined}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export function isNewForVerification(type: "permit" | "promise", statusName: string) {
  if (type === "permit") return statusName === "Submitted";
  return statusName === "Submitted" || statusName === "Paid";
}

export function isPendingApplication(type: "permit" | "promise", statusName: string) {
  if (type === "permit") return statusName === "Submitted" || statusName === "UnderReview";
  return statusName === "Submitted" || statusName === "Paid" || statusName === "UnderReview";
}

export function getDecisionActionLabel(_type: "permit" | "promise", statusName: string) {
  if (statusName === "Approved" || statusName === "Rejected") return "Podgląd";
  return "Rozpatrz";
}
