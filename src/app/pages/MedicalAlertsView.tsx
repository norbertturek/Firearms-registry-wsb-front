import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsTrigger } from "../components/ui/tabs";
import { AppTabsList } from "../components/ui/AppTabsList";
import type { LucideIcon } from "lucide-react";
import { CheckCircle, ChevronRight, Shield, Stethoscope, UserCheck } from "lucide-react";
import { cn } from "../components/ui/utils";
import { CitizenNavIconTile } from "../components/citizen/CitizenNavIconTile";
import { CITIZEN_LIST_CARD_CONTENT_CLASS } from "../utils/citizenCardUi";
import { DateStatusMeta } from "../components/DateStatusMeta";
import { useNavigate } from "react-router";
import { citizenService } from "../../services/citizenService";
import type { CitizenMedicalAlertDto, PermitDto } from "../../types/api";
import { formatMedicalAlertDate, getDaysUntilDueDate } from "../../lib/medicalAlerts";

type ExamType = "medical" | "psychological";
type ExamStatus = "current" | "expiring" | "expired" | "missing";

interface PermitExamEntry {
  id: string;
  permitId: string;
  permitNumber: string;
  permitTypeName: string;
  examType: ExamType;
  expiryDate: string | null;
  daysLeft: number | null;
  status: ExamStatus;
  alertMessage: string | null;
}

interface PermitExamGroup {
  permitId: string;
  permitNumber: string;
  permitTypeName: string;
  exams: PermitExamEntry[];
}

const WARNING_DAYS = 30;

const PERMIT_TYPE_LABELS: Record<string, string> = {
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

function examLabel(type: ExamType) {
  return type === "medical" ? "Badanie lekarskie" : "Badanie psychologiczne";
}

function examIcon(type: ExamType): LucideIcon {
  return type === "medical" ? Stethoscope : UserCheck;
}

function buildAlertMap(alerts: CitizenMedicalAlertDto[]) {
  const map = new Map<string, CitizenMedicalAlertDto>();
  for (const alert of alerts) {
    const key = `${alert.permitId}:${alert.alertTypeName}`;
    map.set(key, alert);
  }
  return map;
}

function resolveStatus(
  expiryDate: string | null,
  expiredAlert: CitizenMedicalAlertDto | undefined,
  expiringAlert: CitizenMedicalAlertDto | undefined
): { status: ExamStatus; daysLeft: number | null; alertMessage: string | null } {
  const daysLeft = getDaysUntilDueDate(expiryDate);
  if (daysLeft == null) {
    return {
      status: "missing",
      daysLeft: null,
      alertMessage: "Brak daty ważności. WPA musi potwierdzić i uzupełnić dane badań.",
    };
  }
  if (daysLeft <= 0 || expiredAlert) {
    return { status: "expired", daysLeft, alertMessage: expiredAlert?.message ?? null };
  }
  if (daysLeft <= WARNING_DAYS || expiringAlert) {
    return { status: "expiring", daysLeft, alertMessage: expiringAlert?.message ?? null };
  }
  return { status: "current", daysLeft, alertMessage: null };
}

function mapPermitExamEntries(permits: PermitDto[], alerts: CitizenMedicalAlertDto[]): PermitExamEntry[] {
  const alertMap = buildAlertMap(alerts);
  const activePermits = permits.filter((permit) => permit.statusName === "Active");
  const entries: PermitExamEntry[] = [];

  for (const permit of activePermits) {
    const medicalExpired = alertMap.get(`${permit.id}:MedicalExamExpired`);
    const medicalExpiring = alertMap.get(`${permit.id}:MedicalExamExpiring`);
    const psychExpired = alertMap.get(`${permit.id}:PsychologicalExamExpired`);
    const psychExpiring = alertMap.get(`${permit.id}:PsychologicalExamExpiring`);

    const medical = resolveStatus(permit.medicalExamExpiryDate, medicalExpired, medicalExpiring);
    entries.push({
      id: `${permit.id}:medical`,
      permitId: permit.id,
      permitNumber: permit.permitNumber,
      permitTypeName: permit.permitTypeName,
      examType: "medical",
      expiryDate: permit.medicalExamExpiryDate,
      daysLeft: medical.daysLeft,
      status: medical.status,
      alertMessage: medical.alertMessage,
    });

    const psychological = resolveStatus(permit.psychologicalExamExpiryDate, psychExpired, psychExpiring);
    entries.push({
      id: `${permit.id}:psychological`,
      permitId: permit.id,
      permitNumber: permit.permitNumber,
      permitTypeName: permit.permitTypeName,
      examType: "psychological",
      expiryDate: permit.psychologicalExamExpiryDate,
      daysLeft: psychological.daysLeft,
      status: psychological.status,
      alertMessage: psychological.alertMessage,
    });
  }

  return entries;
}

function groupEntriesByPermit(entries: PermitExamEntry[]): PermitExamGroup[] {
  const byPermit = new Map<string, PermitExamGroup>();

  for (const entry of entries) {
    const existing = byPermit.get(entry.permitId);
    if (existing) {
      existing.exams.push(entry);
      continue;
    }
    byPermit.set(entry.permitId, {
      permitId: entry.permitId,
      permitNumber: entry.permitNumber,
      permitTypeName: entry.permitTypeName,
      exams: [entry],
    });
  }

  const examOrder = (type: ExamType) => (type === "medical" ? 0 : 1);

  return Array.from(byPermit.values())
    .map((group) => ({
      ...group,
      exams: [...group.exams].sort((a, b) => examOrder(a.examType) - examOrder(b.examType)),
    }))
    .sort((a, b) => {
      const earliest = (exams: PermitExamEntry[]) =>
        Math.min(...exams.map((e) => (e.expiryDate ? new Date(e.expiryDate).getTime() : Number.POSITIVE_INFINITY)));
      return earliest(a.exams) - earliest(b.exams);
    });
}

function worstGroupStatus(exams: PermitExamEntry[]): ExamStatus {
  if (exams.some((e) => e.status === "expired")) return "expired";
  if (exams.some((e) => e.status === "missing")) return "missing";
  if (exams.some((e) => e.status === "expiring")) return "expiring";
  return "current";
}

function statusBadge(entry: PermitExamEntry) {
  if (entry.status === "missing") {
    return <Badge className="bg-slate-100 text-slate-800 border-none rounded-full">Brak danych</Badge>;
  }
  if (entry.status === "expired") {
    return <Badge variant="destructive" className="rounded-full">Wygasło</Badge>;
  }
  if (entry.status === "expiring") {
    if (entry.daysLeft != null && entry.daysLeft <= 7) {
      return <Badge className="bg-red-100 text-red-800 border-none rounded-full">Pilne ({entry.daysLeft} dni)</Badge>;
    }
    return <Badge className="bg-amber-100 text-amber-800 border-none rounded-full">Wygasa</Badge>;
  }
  return <Badge className="bg-emerald-100 text-emerald-800 border-none rounded-full">Aktualne</Badge>;
}

export function MedicalAlertsView() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<CitizenMedicalAlertDto[]>([]);
  const [permits, setPermits] = useState<PermitDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    Promise.all([citizenService.getMedicalAlerts(), citizenService.getPermits()])
      .then(([alertsRes, permitsRes]) => {
        setAlerts(alertsRes);
        setPermits(permitsRes);
      })
      .catch(() => {
        setAlerts([]);
        setPermits([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const examEntries = useMemo(() => mapPermitExamEntries(permits, alerts), [permits, alerts]);
  const attentionEntries = examEntries.filter((entry) => entry.status === "expiring" || entry.status === "expired");
  const missingEntries = examEntries.filter((entry) => entry.status === "missing");
  const allGroups = useMemo(() => groupEntriesByPermit(examEntries), [examEntries]);
  const attentionGroups = useMemo(() => groupEntriesByPermit(attentionEntries), [attentionEntries]);
  const missingGroups = useMemo(() => groupEntriesByPermit(missingEntries), [missingEntries]);
  const activePermits = permits.filter((permit) => permit.statusName === "Active");

  const ExamRow = ({ entry }: { entry: PermitExamEntry }) => {
    const showWarningBlock = entry.status === "expired" || entry.status === "missing";
    const Icon = examIcon(entry.examType);

    return (
      <div className="flex gap-3 py-3 first:pt-0 last:pb-0">
        <CitizenNavIconTile className="scale-90 origin-top-left [&_svg]:h-5 [&_svg]:w-5 p-2.5">
          <Icon />
        </CitizenNavIconTile>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm leading-snug text-foreground">{examLabel(entry.examType)}</h4>

          <DateStatusMeta className="mt-1" emphasizeDate statusBadge={statusBadge(entry)}>
            {entry.expiryDate
              ? `${entry.status === "expired" ? "Wygasło" : "Ważne do"}: ${formatMedicalAlertDate(entry.expiryDate)}`
              : "Ważne do: brak danych"}
            {entry.daysLeft != null && entry.daysLeft < 0 && ` (${Math.abs(entry.daysLeft)} dni temu)`}
          </DateStatusMeta>

          {entry.alertMessage && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">{entry.alertMessage}</p>
          )}

          {showWarningBlock && (
            <div
              className={cn(
                "rounded-lg p-2 mt-2",
                entry.status === "expired" ? "bg-red-100" : "bg-slate-100",
              )}
            >
              <p className={cn("text-xs", entry.status === "expired" ? "text-red-900" : "text-slate-800")}>
                <strong>Wymagane działanie:</strong>{" "}
                {entry.status === "missing"
                  ? "Brakuje potwierdzonej daty ważności badania. Skontaktuj się z WPA w celu aktualizacji."
                  : "Odnów badanie i dostarcz zaświadczenie do WPA, aby odblokować pozwolenie."}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PermitExamGroupCard = ({ group }: { group: PermitExamGroup }) => {
    const permitType = PERMIT_TYPE_LABELS[group.permitTypeName] ?? group.permitTypeName;
    const tone = worstGroupStatus(group.exams);

    return (
      <Card
        className={cn(
          "rounded-2xl border-none shadow-sm gap-0 overflow-hidden",
          tone === "expired" && "bg-red-50/40",
          tone === "missing" && "bg-slate-50",
          tone === "current" && "bg-card",
          tone === "expiring" && "bg-card",
        )}
      >
        <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 text-left rounded-xl -m-1 p-1 transition-colors",
              "hover:bg-muted/30 active:scale-[0.99]",
            )}
            onClick={() => navigate(`/permits/${group.permitId}`)}
          >
            <CitizenNavIconTile>
              <Shield />
            </CitizenNavIconTile>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Pozwolenie</p>
              <h3 className="font-semibold text-sm leading-snug text-foreground font-mono">{group.permitNumber}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{permitType}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground self-center" aria-hidden />
          </button>

          <div className="mt-3 pt-3 border-t border-border/80 divide-y divide-border/80">
            {group.exams.map((entry) => (
              <ExamRow key={entry.id} entry={entry} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGroups = (groups: PermitExamGroup[]) =>
    groups.map((group) => <PermitExamGroupCard key={group.permitId} group={group} />);

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="px-1">
          <div className="h-8 w-40 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">Badania medyczne</h1>
        <p className="text-muted-foreground">
          Wszystkie badania lekarskie i psychologiczne powiązane z aktywnymi pozwoleniami
        </p>
      </div>

      {activePermits.length === 0 ? (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-30 text-emerald-600" />
            <p className="text-foreground font-semibold mb-1">Brak aktywnych pozwoleń</p>
            <p className="text-muted-foreground text-sm">
              Gdy pozwolenie zostanie aktywowane, badania pojawią się automatycznie w tym widoku.
            </p>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate("/weapons")}>
              <Shield className="h-4 w-4 mr-2" />
              Moje pozwolenia
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <AppTabsList className="grid grid-cols-3">
            <TabsTrigger value="all" className="rounded-xl">
              Wszystkie
              {allGroups.length > 0 && (
                <Badge className="ml-2 bg-slate-500 hover:bg-slate-600 px-1.5 py-0 text-xs h-5 min-w-5">
                  {allGroups.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="attention" className="rounded-xl">
              Do uwagi
              {attentionEntries.length > 0 && (
                <Badge className="ml-2 bg-amber-500 hover:bg-amber-600 px-1.5 py-0 text-xs h-5 min-w-5">
                  {attentionEntries.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="missing" className="rounded-xl">
              Braki
              {missingGroups.length > 0 && (
                <Badge className="ml-2 bg-slate-500 hover:bg-slate-600 px-1.5 py-0 text-xs h-5 min-w-5">
                  {missingGroups.length}
                </Badge>
              )}
            </TabsTrigger>
          </AppTabsList>

          <TabsContent value="all" className="space-y-3">
            {allGroups.length === 0 ? (
              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-30 text-emerald-600" />
                  <p className="text-muted-foreground">Brak danych o badaniach dla aktywnych pozwoleń</p>
                </CardContent>
              </Card>
            ) : (
              renderGroups(allGroups)
            )}
          </TabsContent>

          <TabsContent value="attention" className="space-y-3">
            {attentionGroups.length === 0 ? (
              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-30 text-emerald-600" />
                  <p className="text-muted-foreground">Brak badań wymagających uwagi</p>
                </CardContent>
              </Card>
            ) : (
              renderGroups(attentionGroups)
            )}
          </TabsContent>

          <TabsContent value="missing" className="space-y-3">
            {missingGroups.length === 0 ? (
              <Card className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-30 text-emerald-600" />
                  <p className="text-muted-foreground">Brak nieuzupełnionych danych badań</p>
                </CardContent>
              </Card>
            ) : (
              renderGroups(missingGroups)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
