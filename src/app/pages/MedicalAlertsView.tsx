import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { AppTabsList } from "../components/ui/AppTabsList";
import { AppTabTrigger } from "../components/ui/AppTabTrigger";
import { CheckCircle, ChevronRight, Shield, ClipboardList, AlertTriangle } from "lucide-react";
import { cn } from "../components/ui/utils";
import { CitizenNavIconTile } from "../components/citizen/CitizenNavIconTile";
import { PermitExamStatusRow } from "../components/citizen/PermitExamStatusRow";
import { CITIZEN_LIST_CARD_CONTENT_CLASS } from "../utils/citizenCardUi";
import { useNavigate } from "react-router";
import { citizenService } from "../../services/citizenService";
import type { CitizenMedicalAlertDto, PermitDto } from "../../types/api";
import {
  filterPermitGroupsNeedingAttention,
  groupEntriesByPermit,
  mapPermitExamEntries,
  sortPermitGroupsByAttentionPriority,
  worstExamStatus,
  type PermitExamGroup,
} from "../../lib/permitExams";

const PERMIT_TYPE_LABELS: Record<string, string> = {
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

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
  const allGroups = useMemo(() => groupEntriesByPermit(examEntries), [examEntries]);
  const attentionGroups = useMemo(
    () => sortPermitGroupsByAttentionPriority(filterPermitGroupsNeedingAttention(allGroups)),
    [allGroups],
  );
  const activePermits = permits.filter((permit) => permit.statusName === "Active");

  const PermitExamGroupCard = ({ group }: { group: PermitExamGroup }) => {
    const permitType = PERMIT_TYPE_LABELS[group.permitTypeName] ?? group.permitTypeName;
    const tone = worstExamStatus(group.exams);

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
            className="flex w-full items-center gap-3 text-left rounded-xl -m-1 p-1 active:scale-[0.99]"
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
              <PermitExamStatusRow key={entry.id} entry={entry} />
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
          <AppTabsList className="grid grid-cols-2">
            <AppTabTrigger value="all" label="Wszystkie" icon={ClipboardList} count={allGroups.length} />
            <AppTabTrigger value="attention" label="Wymaga uwagi" icon={AlertTriangle} count={attentionGroups.length} />
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
                  <p className="text-foreground font-semibold mb-1">Wszystko aktualne</p>
                  <p className="text-muted-foreground text-sm">
                    Żadne badanie nie wygasa, nie wygasło ani nie ma brakującej daty w rejestrze.
                  </p>
                </CardContent>
              </Card>
            ) : (
              renderGroups(attentionGroups)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
