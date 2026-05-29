import type { LucideIcon } from "lucide-react";
import { TabsTrigger } from "./tabs";
import { cn } from "./utils";

/** Tab label with optional count in parentheses, e.g. "Pozwolenia (12)". */
export function formatTabLabel(label: string, count?: number | null) {
  if (count == null || count <= 0) return label;
  const capped = count > 99 ? "99+" : count;
  return `${label} (${capped})`;
}

type AppTabTriggerProps = {
  value: string;
  label: string;
  icon?: LucideIcon;
  count?: number | null;
  /** When false, count is hidden even if provided (e.g. firearms tab before search). */
  showCount?: boolean;
  ariaLabel?: string;
  className?: string;
};

/** List/review tab trigger: icon + label with in-text count, consistent sizing. */
export function AppTabTrigger({
  value,
  label,
  icon: Icon,
  count,
  showCount = true,
  ariaLabel,
  className,
}: AppTabTriggerProps) {
  const displayLabel =
    showCount && count != null && count > 0 ? formatTabLabel(label, count) : label;

  return (
    <TabsTrigger
      value={value}
      aria-label={ariaLabel}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-xl text-xs sm:text-sm",
        className,
      )}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
      <span>{displayLabel}</span>
    </TabsTrigger>
  );
}
