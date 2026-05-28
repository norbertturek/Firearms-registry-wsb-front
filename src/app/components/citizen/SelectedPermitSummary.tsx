import { Shield } from "lucide-react";
import { Badge } from "../ui/badge";
import { getPermitStatusMeta } from "../../../lib/statusUi";
import type { PermitDto } from "../../../types/api";
import { CitizenNavIconTile } from "./CitizenNavIconTile";
import { getPermitDisplayTypeLabel } from "../../utils/permitLabels";

type SelectedPermitSummaryProps = {
  permit: PermitDto;
};

export function SelectedPermitSummary({ permit }: SelectedPermitSummaryProps) {
  const statusMeta = getPermitStatusMeta(permit.statusName);

  return (
    <div className="mt-3 rounded-xl bg-muted/30 p-3">
      <div className="flex items-start gap-3">
        <CitizenNavIconTile className="shrink-0 scale-90 [&_svg]:h-5 [&_svg]:w-5 p-2.5">
          <Shield aria-hidden />
        </CitizenNavIconTile>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-sm text-foreground">{getPermitDisplayTypeLabel(permit)}</h3>
            {statusMeta && (
              <Badge variant={statusMeta.variant} className={`${statusMeta.badgeClassName} text-xs border-none`}>
                {statusMeta.label}
              </Badge>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-muted-foreground">Numer</dt>
              <dd className="font-mono text-foreground mt-0.5">{permit.permitNumber}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Wolne miejsca</dt>
              <dd className="font-semibold text-foreground mt-0.5">
                {permit.availableSlots} / {permit.maxFirearms}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
