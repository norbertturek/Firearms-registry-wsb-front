import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Shield, CreditCard, ChevronDown } from "lucide-react";
import { ApplicationDetailField } from "./ApplicationDetailField";
import { CitizenNavIconTile } from "../citizen/CitizenNavIconTile";
import { cn } from "../ui/utils";
import { contentColumnClass } from "../../utils/layout";
import type { PermitDto, WpaPermitApplicationDto, WpaPromiseApplicationDto } from "../../../types/api";
import { formatApplicationId } from "../../../lib/registryNumbers";
import { getPermitApplicationTypeLabel } from "../../utils/permitLabels";

export const WPA_REVIEW_BAR_PORTAL_ID = "wpa-review-bar-portal";

function getStatusBadge(status: string) {
  switch (status) {
    case "Submitted":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none px-2 py-0.5 rounded-full shrink-0 text-[10px] md:text-xs">Złożony</Badge>;
    case "Paid":
      return <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-none px-2 py-0.5 rounded-full shrink-0 text-[10px] md:text-xs">Opłacony</Badge>;
    case "UnderReview":
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-2 py-0.5 rounded-full shrink-0 text-[10px] md:text-xs">W weryfikacji</Badge>;
    case "Approved":
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full shrink-0 text-[10px] md:text-xs">Zatwierdzony</Badge>;
    case "Rejected":
      return <Badge variant="destructive" className="rounded-full px-2 py-0.5 shrink-0 text-[10px] md:text-xs">Odrzucony</Badge>;
    case "RequiresCorrection":
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none px-2 py-0.5 rounded-full shrink-0 text-[10px] md:text-xs">Do uzupełnienia</Badge>;
    default:
      return <Badge className="rounded-full px-2 py-0.5 shrink-0 text-[10px] md:text-xs">{status}</Badge>;
  }
}

function getAppTitle(
  permitApp?: WpaPermitApplicationDto | null,
  promiseApp?: WpaPromiseApplicationDto | null,
) {
  if (permitApp) {
    return `Wniosek o pozwolenie — ${getPermitApplicationTypeLabel(permitApp)}`;
  }
  if (promiseApp) {
    return `Wniosek o promesę — ${promiseApp.requestedWeaponType}`;
  }
  return "Wniosek";
}

function formatDate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(s: string) {
  return new Date(s).toLocaleString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ApplicationHeaderInfo({
  app,
  permitApp,
  promiseApp,
  compact = false,
}: {
  app: WpaPermitApplicationDto | WpaPromiseApplicationDto;
  permitApp?: WpaPermitApplicationDto | null;
  promiseApp?: WpaPromiseApplicationDto | null;
  compact?: boolean;
}) {
  const labelClass = compact
    ? "text-[10px] text-muted-foreground leading-snug"
    : "text-[11px] md:text-xs text-muted-foreground leading-snug";
  const titleClass = compact
    ? "font-semibold text-[15px] text-foreground leading-snug tracking-tight"
    : "font-bold text-base sm:text-lg text-foreground leading-tight";
  const metaClass = compact
    ? "text-[11px] font-medium text-foreground leading-snug"
    : "text-sm md:text-base font-medium text-foreground leading-snug";

  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      {compact ? (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <p className={labelClass}>Rodzaj wniosku</p>
              {getStatusBadge(app.statusName)}
            </div>
            <div className="shrink-0 text-right">
              <p className={labelClass}>Data złożenia</p>
              <p className={metaClass}>{formatDateTime(app.createdAt)}</p>
            </div>
          </div>
          <p className={cn(titleClass, "mt-0.5 w-full")}>{getAppTitle(permitApp, promiseApp)}</p>
        </>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className={labelClass}>Rodzaj wniosku</p>
              {getStatusBadge(app.statusName)}
            </div>
            <p className={cn(titleClass, "mt-0.5")}>{getAppTitle(permitApp, promiseApp)}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className={labelClass}>Data złożenia</p>
            <p className={metaClass}>{formatDateTime(app.createdAt)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpandedApplicationDetails({
  app,
  permitApp,
  promiseApp,
  linkedPermit,
}: {
  app: WpaPermitApplicationDto | WpaPromiseApplicationDto;
  permitApp?: WpaPermitApplicationDto | null;
  promiseApp?: WpaPromiseApplicationDto | null;
  linkedPermit?: PermitDto | null;
}) {
  return (
    <div className="space-y-2.5 md:space-y-3">
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:gap-x-4">
        <ApplicationDetailField label="Wnioskodawca">
          {app.citizenName}
          <span className="block font-normal text-muted-foreground text-[10px] md:text-xs mt-0.5">
            PESEL: {app.citizenPesel}
          </span>
        </ApplicationDetailField>
        <ApplicationDetailField label="Nr wniosku" valueClassName="font-mono truncate">
          <span title={app.id}>{formatApplicationId(app.id)}</span>
        </ApplicationDetailField>
      </div>

      {permitApp && (
        <>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:gap-x-4">
            <ApplicationDetailField label="Bad. lekarskie">
              {formatDate(permitApp.medicalExamExpiryDate)}
            </ApplicationDetailField>
            <ApplicationDetailField label="Bad. psychologiczne">
              {formatDate(permitApp.psychologicalExamExpiryDate)}
            </ApplicationDetailField>
          </div>

          <ApplicationDetailField label="Uzasadnienie obywatela" valueClassName="font-normal">
            <p className="text-[11px] md:text-sm text-foreground bg-muted/30 rounded-lg p-2 md:p-2.5 leading-snug">
              {permitApp.reason}
            </p>
          </ApplicationDetailField>

          {permitApp.attachments?.length > 0 && (
            <ApplicationDetailField label="Załączniki">
              {permitApp.attachments.length} do weryfikacji
            </ApplicationDetailField>
          )}
        </>
      )}

      {promiseApp && (
        <>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:gap-x-4">
            <ApplicationDetailField label="Pozwolenie bazowe" valueClassName="font-mono truncate">
              {promiseApp.permitNumber}
            </ApplicationDetailField>
            <ApplicationDetailField label="Broń / ilość">
              {promiseApp.requestedWeaponType} • {promiseApp.requestedQuantity} szt.
            </ApplicationDetailField>
          </div>

          {linkedPermit && (
            <ApplicationDetailField label="Wolne sloty pozwolenia">
              <span className={linkedPermit.availableSlots > 0 ? "text-emerald-700" : "text-red-600"}>
                {linkedPermit.availableSlots} / {linkedPermit.maxFirearms}
                {linkedPermit.statusName !== "Active" && " · pozwolenie nieaktywne"}
              </span>
            </ApplicationDetailField>
          )}
        </>
      )}
    </div>
  );
}

type Props = {
  type: "permit" | "promise";
  permitApp?: WpaPermitApplicationDto | null;
  promiseApp?: WpaPromiseApplicationDto | null;
  linkedPermit?: PermitDto | null;
  contextLabel?: string;
};

export function WpaApplicationReviewBar({
  type,
  permitApp,
  promiseApp,
  linkedPermit,
  contextLabel = "Rozpatrz wniosek",
}: Props) {
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const app = permitApp ?? promiseApp;

  useEffect(() => {
    setPortalEl(document.getElementById(WPA_REVIEW_BAR_PORTAL_ID));
  }, []);

  useEffect(() => {
    setExpanded(false);
  }, [app?.id]);

  if (!app || !portalEl) return null;

  const Icon = permitApp ? Shield : CreditCard;
  return createPortal(
    <div className={cn(contentColumnClass, "py-2 md:py-3")}>
      <p className="sr-only">{contextLabel}</p>
      <div className="rounded-2xl border-none bg-card overflow-hidden">
        <div className="px-3 pt-2.5 pb-3 md:px-6 md:pt-4 md:pb-3">
          <button
            type="button"
            className="w-full flex items-start justify-between gap-2 md:gap-3 text-left rounded-xl cursor-pointer"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? "Zwiń szczegóły wniosku" : "Rozwiń szczegóły wniosku"}
          >
            <div className="flex items-start gap-2.5 md:gap-3 min-w-0 flex-1">
              <CitizenNavIconTile>
                <Icon />
              </CitizenNavIconTile>
              <div className="min-w-0 flex-1 md:hidden">
                <ApplicationHeaderInfo
                  app={app}
                  permitApp={permitApp}
                  promiseApp={promiseApp}
                  compact
                />
              </div>
              <div className="min-w-0 flex-1 hidden md:block">
                <ApplicationHeaderInfo
                  app={app}
                  permitApp={permitApp}
                  promiseApp={promiseApp}
                />
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 md:h-5 md:w-5 shrink-0 text-primary/80 transition-transform duration-200 mt-0.5 md:mt-1",
                expanded && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          {expanded && (
            <>
              <Separator className="hidden md:block bg-border mt-4" />
              <div className="mt-2.5 pt-2.5 md:mt-0 md:pt-4 border-t border-border/60 md:border-t-0">
                <ExpandedApplicationDetails
                  app={app}
                  permitApp={permitApp}
                  promiseApp={promiseApp}
                  linkedPermit={linkedPermit}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    portalEl,
  );
}
