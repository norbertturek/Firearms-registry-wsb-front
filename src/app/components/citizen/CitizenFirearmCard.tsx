import { ChevronDown, ChevronUp, Shield } from "lucide-react";
import { DateStatusMeta } from "../DateStatusMeta";
import { Card, CardContent } from "../ui/card";
import { cn } from "../ui/utils";
import { CitizenNavIconTile } from "./CitizenNavIconTile";
import { CITIZEN_LIST_CARD_CONTENT_CLASS } from "../../utils/citizenCardUi";
import type { FirearmDto } from "../../../types/api";

type CitizenFirearmCardProps = {
  firearm: FirearmDto;
  expanded: boolean;
  onToggle: () => void;
  statusBadge: React.ReactNode;
  categoryBadge: React.ReactNode;
  formatDate: (dateStr: string) => string;
  children?: React.ReactNode;
};

export function CitizenFirearmCard({
  firearm,
  expanded,
  onToggle,
  statusBadge,
  categoryBadge,
  formatDate,
  children,
}: CitizenFirearmCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border-none shadow-sm gap-0 overflow-hidden transition-colors",
        expanded ? "bg-muted/40" : "hover:bg-muted/30",
      )}
    >
      <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
        <button
          type="button"
          className="flex w-full items-center gap-3 text-left cursor-pointer active:scale-[0.99]"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <CitizenNavIconTile>
            <Shield />
          </CitizenNavIconTile>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm leading-snug text-foreground line-clamp-2">
              {firearm.brand} {firearm.model}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {firearm.caliber} · <span className="font-mono">{firearm.serialNumber}</span>
            </p>
            <DateStatusMeta
              className="mt-1"
              statusBadge={
                <>
                  {statusBadge}
                  {categoryBadge}
                </>
              }
            >
              {formatDate(firearm.registeredAt)}
            </DateStatusMeta>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground self-center" aria-hidden />
          ) : (
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground self-center" aria-hidden />
          )}
        </button>
        {expanded && children && (
          <div className="mt-3 pt-3 border-t border-border/80">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
