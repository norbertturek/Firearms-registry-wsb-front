import { AlertTriangle, HeartPulse } from "lucide-react";
import { cn } from "../ui/utils";
import { CITIZEN_NAV_ICON_TONE } from "../../utils/citizenCardUi";
import {
  getExamAttentionBadgeClass,
  getExamStatusTileClass,
  needsExamAttention,
  type ExamStatus,
} from "../../../lib/permitExams";

type CitizenMedicalNavIconProps = {
  status?: ExamStatus;
  /** Dashboard service tile */
  variant?: "nav" | "inline";
  className?: string;
};

/** HeartPulse + optional attention badge — shared by dashboard „Badania” and permit sections. */
export function CitizenMedicalNavIcon({
  status = "current",
  variant = "nav",
  className,
}: CitizenMedicalNavIconProps) {
  const attention = needsExamAttention(status);
  const iconSize = "h-6 w-6";
  const padding = "p-3";
  /** Dashboard grid: same tile tone as other services; attention only on the badge. */
  const tileTone =
    variant === "nav"
      ? CITIZEN_NAV_ICON_TONE
      : getExamStatusTileClass(attention ? status : null) ?? CITIZEN_NAV_ICON_TONE;

  return (
    <div
      className={cn(
        "rounded-2xl relative shrink-0 inline-flex items-center justify-center",
        padding,
        variant === "nav" && "mb-1",
        tileTone,
        className,
      )}
    >
      <HeartPulse className={iconSize} aria-hidden />
      {attention && (
        <span
          className={cn(
            "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-sm",
            getExamAttentionBadgeClass(status),
          )}
          aria-label="Badania wymagają uwagi"
        >
          <AlertTriangle className="h-3 w-3" aria-hidden />
        </span>
      )}
    </div>
  );
}
