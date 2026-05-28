import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { CITIZEN_LIST_CARD_CONTENT_CLASS, CITIZEN_NAV_ICON_TONE } from "../../utils/citizenCardUi";
import { cn } from "../ui/utils";

type WpaQuickToolCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
};

export function WpaQuickToolCard({ title, description, icon: Icon, onClick }: WpaQuickToolCardProps) {
  return (
    <Card
      className="rounded-2xl border-none shadow-sm gap-0 hover:bg-muted/30 transition-colors cursor-pointer active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-2xl shrink-0", CITIZEN_NAV_ICON_TONE)}>
            <Icon className="h-6 w-6" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm leading-snug text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground self-center" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}
