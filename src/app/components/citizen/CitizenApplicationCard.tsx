import { ChevronRight, CreditCard, FileText } from "lucide-react";
import { DateStatusMeta } from "../DateStatusMeta";
import { Card, CardContent } from "../ui/card";
import { cn } from "../ui/utils";
import { CitizenNavIconTile } from "./CitizenNavIconTile";
import {
  CITIZEN_LIST_CARD_CLASS,
  CITIZEN_LIST_CARD_CONTENT_CLASS,
  CITIZEN_TILE_SUBTITLE_CLASS,
  CITIZEN_TILE_TITLE_CLASS,
} from "../../utils/citizenCardUi";

type CitizenApplicationCardProps = {
  variant: "permit" | "promise";
  title: string;
  date: string;
  statusBadge: React.ReactNode;
  onClick: () => void;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
};

export function CitizenApplicationCard({
  variant,
  title,
  date,
  statusBadge,
  onClick,
  subtitle,
  footer,
  className,
}: CitizenApplicationCardProps) {
  const Icon = variant === "permit" ? FileText : CreditCard;

  return (
    <Card className={cn(CITIZEN_LIST_CARD_CLASS, className)} onClick={onClick}>
      <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
        <div className="flex items-center gap-3">
          <CitizenNavIconTile>
            <Icon />
          </CitizenNavIconTile>
          <div className="flex-1 min-w-0">
            <h4 className={CITIZEN_TILE_TITLE_CLASS}>{title}</h4>
            {subtitle && <p className={CITIZEN_TILE_SUBTITLE_CLASS}>{subtitle}</p>}
            <DateStatusMeta className="mt-1" statusBadge={statusBadge}>
              {date}
            </DateStatusMeta>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground self-center" aria-hidden />
        </div>
        {footer && (
          <div
            className="mt-3 flex flex-col items-start gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
