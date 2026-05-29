import type { LucideIcon } from "lucide-react";
import { ListChecks } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "../ui/utils";
import { CITIZEN_LIST_CARD_CONTENT_CLASS, CITIZEN_NAV_ICON_TONE } from "../../utils/citizenCardUi";

export type ApplicationProcessStep = {
  text: string;
  icon?: LucideIcon;
};

type ApplicationProcessNoticeProps = {
  title?: string;
  subtitle?: string;
  steps: ApplicationProcessStep[];
};

/** „Co dalej?” — spójne z sekcjami wniosków citizen i krokami w ShopDashboard. */
export function ApplicationProcessNotice({
  title = "Co dalej?",
  subtitle = "Po wysłaniu wniosku do WPA",
  steps,
}: ApplicationProcessNoticeProps) {
  return (
    <Card className="rounded-2xl border-none shadow-sm gap-0 overflow-hidden">
      <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
        <div className="flex items-center gap-3 mb-3">
          <div className={cn("p-3 rounded-2xl shrink-0", CITIZEN_NAV_ICON_TONE)}>
            <ListChecks className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="space-y-2" role="list">
          {steps.map((step) => {
            const StepIcon = step.icon ?? ListChecks;
            return (
              <div
                key={step.text}
                role="listitem"
                className="rounded-xl bg-muted/30 p-3 flex items-start gap-3"
              >
                <StepIcon className="h-4 w-4 mt-0.5 text-primary shrink-0" aria-hidden />
                <p className="text-xs text-foreground/90 leading-relaxed">{step.text}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
