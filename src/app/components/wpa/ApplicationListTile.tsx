import { ChevronRight } from "lucide-react";
import { CitizenNavIconTile } from "../citizen/CitizenNavIconTile";
import { DateStatusMeta } from "../DateStatusMeta";
import { Card, CardContent } from "../ui/card";
import { cn } from "../ui/utils";
import {
  CITIZEN_LIST_CARD_CLASS,
  CITIZEN_LIST_CARD_CONTENT_CLASS,
  CITIZEN_TILE_SUBTITLE_CLASS,
  CITIZEN_TILE_TITLE_CLASS,
} from "../../utils/citizenCardUi";

type ApplicationListTileProps = {
  icon: React.ReactNode;
  title: string;
  lines: string[];
  /** Formatted submission date (no label prefix — shown next to status) */
  date?: string;
  statusBadge: React.ReactNode;
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
  footer,
  className,
  onClick,
}: ApplicationListTileProps) {
  const clickable = !!onClick;

  return (
    <Card
      className={cn(
        CITIZEN_LIST_CARD_CLASS,
        !clickable && "cursor-default active:scale-100",
        className,
      )}
      onClick={clickable ? onClick : undefined}
    >
      <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
        <div className="flex items-center gap-3">
          <CitizenNavIconTile>{icon}</CitizenNavIconTile>
          <div className="flex-1 min-w-0">
            <h3 className={CITIZEN_TILE_TITLE_CLASS}>{title}</h3>
            {lines.map((line, index) => (
              <p key={`${index}-${line}`} className={CITIZEN_TILE_SUBTITLE_CLASS}>
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
        {footer && (
          <div
            className="mt-3 flex flex-col sm:flex-row flex-wrap gap-2"
            onClick={clickable ? (event) => event.stopPropagation() : undefined}
          >
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
