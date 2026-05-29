import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Shield, AlertCircle, Crosshair, QrCode, ArrowRightLeft, Clock, ChevronRight, FileText } from "lucide-react";
import { CitizenMedicalNavIcon } from "../components/citizen/CitizenMedicalNavIcon";
import { CitizenApplicationCard } from "../components/citizen/CitizenApplicationCard";
import { cn } from "../components/ui/utils";
import { DateStatusMeta } from "../components/DateStatusMeta";
import { citizenService } from "../../services/citizenService";
import type { CitizenMedicalAlertDto, CitizenProfileDto, PermitDto, PermitApplicationDto, PromiseApplicationDto } from "../../types/api";
import { mapPermitExamEntries, worstExamStatus } from "../../lib/permitExams";
import { getApplicationStatusMeta } from "../../lib/statusUi";
import { CITIZEN_NAV_ICON_TONE, CITIZEN_PERMIT_STACK_CARD_INTERACTION } from "../utils/citizenCardUi";

type RecentEntry =
  | { kind: "permit"; data: PermitApplicationDto }
  | { kind: "promise"; data: PromiseApplicationDto };

function renderStatusBadge(status: string) {
  const meta = getApplicationStatusMeta(status);
  if (!meta) {
    return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
  return <Badge variant={meta.variant} className={meta.badgeClassName}>{meta.label}</Badge>;
}

function getPermitTypeLabel(app: PermitApplicationDto) {
  const typeName = app.requestedPermitTypeName || String(app.requestedPermitType);
  return PERMIT_TYPE_LABELS[typeName] ?? typeName;
}

const PERMIT_TYPE_LABELS: Record<string, string> = {
  "0": "Sportowe",
  "1": "Kolekcjonerskie",
  "2": "Ochrony osobistej",
  "3": "Łowieckie",
  "4": "Inne",
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

export function CitizenDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CitizenProfileDto | null>(null);
  const [permits, setPermits] = useState<PermitDto[]>([]);
  const [recentApps, setRecentApps] = useState<RecentEntry[]>([]);
  const [permitApps, setPermitApps] = useState<PermitApplicationDto[]>([]);
  const [medicalAlerts, setMedicalAlerts] = useState<CitizenMedicalAlertDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, permitsRes, permitAppsRes, promiseAppsRes, alertsRes] = await Promise.all([
          citizenService.getProfile(),
          citizenService.getPermits(),
          citizenService.getPermitApplications(),
          citizenService.getPromiseApplications(),
          citizenService.getMedicalAlerts(),
        ]);
        setProfile(profileRes);
        setPermits(permitsRes);
        setPermitApps(permitAppsRes);
        setMedicalAlerts(alertsRes);
        const combined: RecentEntry[] = [
          ...permitAppsRes.map<RecentEntry>((data) => ({ kind: "permit", data })),
          ...promiseAppsRes.map<RecentEntry>((data) => ({ kind: "promise", data })),
        ];
        combined.sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime());
        setRecentApps(combined.slice(0, 3));
      } catch {
        // silent fail — empty states will show
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sortedPermits = [...permits].sort((a, b) => {
    if (a.statusName === "Active" && b.statusName !== "Active") return -1;
    if (a.statusName !== "Active" && b.statusName === "Active") return 1;
    return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
  });
  const permitCardThemes: Record<string, string> = {
    Sport: "bg-gradient-to-br from-[#0069e8] via-[#008cf0] to-[#00a6e8] text-white",
    Collection: "bg-gradient-to-br from-[#009f7a] via-[#00a878] to-[#1fbe87] text-white",
    Protection: "bg-gradient-to-br from-[#7442d8] via-[#7a35b0] to-[#923f9b] text-white",
    Hunting: "bg-gradient-to-br from-[#f97316] via-[#fb7d16] to-[#f5aa35] text-white",
    Other: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 text-white",
  };
  const activePermitApplication = [...permitApps]
    .filter((app) => !["Approved", "Rejected"].includes(app.statusName))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const correctionApps = permitApps.filter(
    (app) => app.statusName === "RequiresCorrection" && app.id !== activePermitApplication?.id
  );
  const examEntries = useMemo(() => mapPermitExamEntries(permits, medicalAlerts), [permits, medicalAlerts]);
  const examAttentionStatus = useMemo(() => worstExamStatus(examEntries), [examEntries]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div className="space-y-6 pt-2 max-md:pb-2">
        <div className="px-1">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-40 rounded-3xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2 max-md:pb-2">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Cześć, {profile?.firstName ?? ""}
        </h1>
        <p className="text-muted-foreground mt-1">Twój panel zarządzania bronią</p>
      </div>

      {/* Permit cards */}
      {sortedPermits.length > 0 ? (
        <div>
          <div className="flex items-end justify-between mb-3 px-1">
            <h3 className="text-lg font-bold text-foreground">Moje pozwolenia</h3>
            <span className="text-sm text-muted-foreground">{sortedPermits.length} razem</span>
          </div>
          <div className="relative">
            {sortedPermits.map((permit, index) => (
              <div
                key={permit.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl p-4 min-h-[164px] shadow-[0_-4px_10px_rgba(15,23,42,0.08),0_10px_22px_rgba(15,23,42,0.14)] ring-1 ring-white/15",
                  CITIZEN_PERMIT_STACK_CARD_INTERACTION,
                  permit.statusName === "Active"
                    ? permitCardThemes[permit.permitTypeName] ?? permitCardThemes.Other
                    : "bg-muted text-foreground",
                )}
                style={{
                  marginTop: index === 0 ? 0 : -86,
                  zIndex: index + 1,
                }}
                onClick={() => navigate(`/permits/${permit.id}`)}
              >
                {index > 0 && (
                  <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white/18 to-transparent" />
                )}
                <div className="absolute inset-0 opacity-[0.08]">
                  <div className="h-full w-full bg-[repeating-linear-gradient(135deg,white_0px,white_1px,transparent_1px,transparent_7px)]" />
                </div>
                <div className="absolute -right-5 -top-6 opacity-15">
                  <Crosshair className="h-28 w-28" />
                </div>
                <div className="relative z-10 h-full min-h-[132px] flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={permit.statusName === "Active" ? "text-white/85 text-sm font-semibold mb-1" : "text-muted-foreground text-sm font-semibold mb-1"}>
                        e-Pozwolenie
                      </p>
                      <h2 className="text-lg font-bold truncate">
                        {PERMIT_TYPE_LABELS[permit.permitTypeName] ?? permit.permitTypeName}
                      </h2>
                      <p className={permit.statusName === "Active" ? "text-white/80 text-xs font-mono mt-1 truncate" : "text-muted-foreground text-xs font-mono mt-1 truncate"}>
                        {permit.permitNumber}
                      </p>
                    </div>
                    <div className={permit.statusName === "Active" ? "bg-white/20 p-2 rounded-xl backdrop-blur-sm shrink-0" : "bg-background/80 p-2 rounded-xl shrink-0"}>
                      <Shield className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_auto] items-end gap-3 pt-8">
                    <div className="min-w-0">
                      <p className={permit.statusName === "Active" ? "text-white/80 text-xs mb-0.5" : "text-muted-foreground text-xs mb-0.5"}>
                        Ważne do
                      </p>
                      <p className="text-sm font-semibold truncate">{formatDate(permit.expiryDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className={permit.statusName === "Active" ? "text-white/80 text-xs mb-0.5" : "text-muted-foreground text-xs mb-0.5"}>
                        Miejsca
                      </p>
                      <p className="font-medium text-sm">{permit.usedSlots} / {permit.maxFirearms}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-70 mb-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activePermitApplication ? (
        <div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-amber-50 p-5 shadow-sm border border-blue-100 cursor-pointer transition-transform active:scale-[0.98]"
          onClick={() => navigate(
            activePermitApplication.statusName === "RequiresCorrection"
              ? `/applications/${activePermitApplication.id}/correction?type=permit`
              : "/applications"
          )}
        >
          <div className="absolute -right-6 -top-6 text-blue-100">
            <FileText className="h-28 w-28" />
          </div>
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className={cn("p-3 rounded-2xl shrink-0", CITIZEN_NAV_ICON_TONE)}>
                {activePermitApplication.statusName === "RequiresCorrection" ? (
                  <AlertCircle className="h-6 w-6" />
                ) : (
                  <Clock className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-blue-950 mb-1">
                  Wniosek o pozwolenie jest już złożony
                </p>
                <h2 className="text-lg font-bold text-foreground truncate">
                  {getPermitTypeLabel(activePermitApplication)}
                </h2>
                <DateStatusMeta className="mt-2" statusBadge={renderStatusBadge(activePermitApplication.statusName)}>
                  {formatDate(activePermitApplication.createdAt)}
                </DateStatusMeta>
                <p className="text-sm text-muted-foreground mt-3 leading-snug">
                  {activePermitApplication.statusName === "RequiresCorrection"
                    ? "WPA poprosiło o uzupełnienie danych. Kliknij, żeby poprawić wniosek."
                    : "Nie musisz składać kolejnego wniosku. Status sprawdzisz w swoich sprawach."}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-4" />
          </div>
        </div>
      ) : (
        <div
          className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-md cursor-pointer transition-transform active:scale-[0.98]"
          onClick={() => navigate("/application/new")}
        >
          <div className="absolute -right-6 -top-6 text-muted-foreground/10 pointer-events-none">
            <Shield className="h-28 w-28" />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[140px] gap-3">
            <div className={cn("p-3 rounded-2xl", CITIZEN_NAV_ICON_TONE)}>
              <Shield className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium text-foreground">Brak aktywnego pozwolenia</p>
            <Button size="sm" className="rounded-xl">Nowy wniosek</Button>
          </div>
        </div>
      )}

      {/* Alert for corrections needed */}
      {correctionApps.map((app) => (
        <Card
          key={app.id}
          className="rounded-2xl border-none shadow-sm bg-orange-50/50 cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate("/applications")}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-900">Uzupełnij braki</p>
                <p className="text-xs text-orange-700">
                  Wniosek o pozwolenie ({getPermitTypeLabel(app)}) wymaga uwagi
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full text-orange-700 h-8 w-8 hover:bg-orange-100">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-lg font-bold mb-3 px-1 text-foreground">Usługi</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Nowy wniosek", icon: FileText, path: "/application/new" },
            { label: "Moje promesy", icon: QrCode, path: "/promises" },
            { label: "Rejestr broni", icon: Crosshair, path: "/weapons" },
            { label: "Moje wnioski", icon: FileText, path: "/applications" },
            { label: "Transfery", icon: ArrowRightLeft, path: "/transfers" },
            { label: "Badania", path: "/medical-alerts" },
          ].map(({ label, icon: Icon, path }) => (
            <Card
              key={path}
              className="rounded-2xl border-none shadow-sm cursor-pointer active:scale-[0.98]"
              onClick={() => navigate(path)}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-[100px]">
                {path === "/medical-alerts" ? (
                  <CitizenMedicalNavIcon status={examAttentionStatus} />
                ) : (
                  <div className={cn("p-3 rounded-2xl mb-1 relative", CITIZEN_NAV_ICON_TONE)}>
                    <Icon className="h-6 w-6" />
                  </div>
                )}
                <span className="text-xs font-semibold leading-tight">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Permit Applications */}
      {recentApps.length > 0 && (
        <div>
          <div className="flex justify-between items-baseline gap-3 mb-3 px-1">
            <h3 className="text-lg font-bold text-foreground leading-tight">Ostatnie wnioski</h3>
            <Button
              variant="link"
              className="text-primary text-sm h-auto min-h-0 px-0 py-0 font-medium shrink-0"
              onClick={() => navigate("/applications")}
            >
              Wszystkie
            </Button>
          </div>

          <div className="space-y-3">
            {recentApps.map((entry) => {
              const isPermit = entry.kind === "permit";
              const title = isPermit
                ? `Wniosek o pozwolenie — ${getPermitTypeLabel(entry.data)}`
                : `Wniosek o e-Promesę — ${entry.data.requestedWeaponType}`;
              return (
                <CitizenApplicationCard
                  key={entry.data.id}
                  variant={isPermit ? "permit" : "promise"}
                  title={title}
                  date={formatDate(entry.data.createdAt)}
                  statusBadge={renderStatusBadge(entry.data.statusName)}
                  onClick={() =>
                    navigate(
                      `/applications/${entry.data.id}?type=${isPermit ? "permit" : "promise"}`,
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
