import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AlertTriangle, CalendarDays, ClipboardList, Crosshair, Shield } from "lucide-react";
import { CitizenMedicalNavIcon } from "../components/citizen/CitizenMedicalNavIcon";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { cn } from "../components/ui/utils";
import { Separator } from "../components/ui/separator";
import { ReviewCollapsibleCard } from "../components/wpa/ReviewCollapsibleCard";
import { applicationSectionIcon } from "../components/wpa/ApplicationDetailField";
import { ExamStatusBadge, PermitExamStatusRow } from "../components/citizen/PermitExamStatusRow";
import { citizenService } from "../../services/citizenService";
import type { CitizenMedicalAlertDto, PermitDto } from "../../types/api";
import { getPermitStatusMeta } from "../../lib/statusUi";
import { getExamEntriesForPermit, needsExamAttention, worstExamStatus } from "../../lib/permitExams";
import { CITIZEN_LIST_CARD_CONTENT_CLASS } from "../utils/citizenCardUi";

const PERMIT_TYPE_LABELS: Record<string, string> = {
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

const PERMIT_CARD_THEMES: Record<string, string> = {
  Sport: "bg-gradient-to-br from-[#0069e8] via-[#008cf0] to-[#00a6e8] text-white",
  Collection: "bg-gradient-to-br from-[#009f7a] via-[#00a878] to-[#1fbe87] text-white",
  Protection: "bg-gradient-to-br from-[#7442d8] via-[#7a35b0] to-[#923f9b] text-white",
  Hunting: "bg-gradient-to-br from-[#f97316] via-[#fb7d16] to-[#f5aa35] text-white",
  Other: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 text-white",
};

function formatDate(date: string | null) {
  if (!date) return "Brak danych";
  return new Date(date).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
}

function statusBadge(status: string) {
  const meta = getPermitStatusMeta(status);
  if (!meta) {
    return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
  return <Badge variant={meta.variant} className={meta.badgeClassName}>{meta.label}</Badge>;
}

export function PermitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [permit, setPermit] = useState<PermitDto | null>(null);
  const [alerts, setAlerts] = useState<CitizenMedicalAlertDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([citizenService.getPermits(), citizenService.getMedicalAlerts()])
      .then(([permits, alertsRes]) => {
        setPermit(permits.find((p) => p.id === id) ?? null);
        setAlerts(alertsRes);
      })
      .catch(() => {
        setPermit(null);
        setAlerts([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const examEntries = useMemo(
    () => (permit ? getExamEntriesForPermit(permit, alerts) : []),
    [permit, alerts],
  );
  const examAttentionStatus = worstExamStatus(examEntries);
  const examsNeedAttention = needsExamAttention(examAttentionStatus);
  const examsSectionRef = useRef<HTMLDivElement>(null);
  const [examsSectionOpen, setExamsSectionOpen] = useState(false);

  useEffect(() => {
    if (examsNeedAttention) {
      setExamsSectionOpen(true);
    }
  }, [examsNeedAttention, permit?.id]);

  const scrollToExamsSection = () => {
    setExamsSectionOpen(true);
    requestAnimationFrame(() => {
      examsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="h-10 w-32 rounded-xl bg-muted animate-pulse" />
        <div className="h-52 rounded-3xl bg-muted animate-pulse" />
        <div className="h-40 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="pt-2">
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6 text-center text-muted-foreground">
            Nie znaleziono pozwolenia.
          </CardContent>
        </Card>
      </div>
    );
  }

  const permitType = PERMIT_TYPE_LABELS[permit.permitTypeName] ?? permit.permitTypeName;
  const permitTheme = permit.statusName === "Active"
    ? PERMIT_CARD_THEMES[permit.permitTypeName] ?? PERMIT_CARD_THEMES.Other
    : "bg-muted text-foreground";
  const availableSlots = Math.max(permit.maxFirearms - permit.usedSlots, 0);

  return (
    <div className="pt-2 space-y-4">
      <div className="px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Szczegóły pozwolenia</h1>
        <p className="text-muted-foreground mt-1">Dokument i limity przypisane do konta</p>
      </div>

      {examsNeedAttention && (
        <Card
          className="rounded-2xl border-none shadow-sm bg-amber-50/80 gap-0 cursor-pointer active:scale-[0.99] transition-transform"
          onClick={scrollToExamsSection}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              scrollToExamsSection();
            }
          }}
        >
          <CardContent className={cn(CITIZEN_LIST_CARD_CONTENT_CLASS, "flex items-center gap-3")}>
            <div className="bg-amber-100 p-2 rounded-full text-amber-700 shrink-0">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-950 leading-snug">Badania wymagają uwagi</p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {examAttentionStatus === "expired"
                  ? "Co najmniej jedno badanie wygasło — odnowienie jest konieczne przed dalszymi operacjami."
                  : examAttentionStatus === "missing"
                    ? "Brakuje dat ważności badań — skontaktuj się z WPA."
                    : "Zbliża się termin ważności badań — sprawdź szczegóły."}
              </p>
            </div>
            <div className="shrink-0 self-center">
              <ExamStatusBadge status={examAttentionStatus} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className={`relative overflow-hidden rounded-3xl p-6 shadow-md ${permitTheme}`}>
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="h-full w-full bg-[repeating-linear-gradient(135deg,white_0px,white_1px,transparent_1px,transparent_7px)]" />
        </div>
        <div className="absolute -right-5 -top-6 opacity-15">
          <Crosshair className="h-32 w-32" />
        </div>
        <div className="relative z-10 min-h-[160px] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={permit.statusName === "Active" ? "text-white/85 text-sm font-semibold mb-1" : "text-muted-foreground text-sm font-semibold mb-1"}>
                e-Pozwolenie
              </p>
              <h2 className="text-2xl font-bold">{permitType}</h2>
            </div>
            <div className={permit.statusName === "Active" ? "bg-white/20 p-2 rounded-2xl backdrop-blur-sm" : "bg-background/80 p-2 rounded-2xl"}>
              <Shield className="h-6 w-6" />
            </div>
          </div>
          <div>
            <p className={permit.statusName === "Active" ? "text-white/80 text-xs mb-1" : "text-muted-foreground text-xs mb-1"}>
              Numer dokumentu
            </p>
            <p className="font-mono text-xl tracking-wider">{permit.permitNumber}</p>
          </div>
        </div>
      </div>

      <ReviewCollapsibleCard
        title="Status i limity"
        description="Aktualny status dokumentu oraz wykorzystanie slotów"
        defaultOpen
        icon={applicationSectionIcon(<ClipboardList />)}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Status</span>
            {statusBadge(permit.statusName)}
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Limit</p>
              <p className="text-xl font-bold">{permit.maxFirearms}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Uzyte</p>
              <p className="text-xl font-bold">{permit.usedSlots}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Wolne</p>
              <p className="text-xl font-bold">{availableSlots}</p>
            </div>
          </div>
        </div>
      </ReviewCollapsibleCard>

      <ReviewCollapsibleCard
        title="Terminy"
        description="Daty wydania i ważności pozwolenia"
        icon={applicationSectionIcon(<CalendarDays />)}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Data wydania</span>
            <span className="text-sm font-medium text-right">{formatDate(permit.issueDate)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Ważne do</span>
            <span className="text-sm font-medium text-right">{formatDate(permit.expiryDate)}</span>
          </div>
        </div>
      </ReviewCollapsibleCard>

      <div ref={examsSectionRef} id="permit-medical-exams" className="scroll-mt-4">
        <ReviewCollapsibleCard
          title="Badania"
          description="Ważność badań medycznych i psychologicznych"
          icon={<CitizenMedicalNavIcon status={examAttentionStatus} variant="inline" />}
          titleAddon={examsNeedAttention ? <ExamStatusBadge status={examAttentionStatus} /> : undefined}
          open={examsSectionOpen}
          onOpenChange={setExamsSectionOpen}
        >
          <div className="divide-y divide-border/80 -mx-1">
            {examEntries.map((entry) => (
              <PermitExamStatusRow key={entry.id} entry={entry} />
            ))}
          </div>
          {examsNeedAttention && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-4 pt-3 border-t border-border/80">
              Po odnowieniu badań dostarcz zaświadczenia do WPA. Urzędnik zaktualizuje daty na tym pozwoleniu —
              nie składasz ponownie wniosku o nowe pozwolenie, o ile sam dokument pozwolenia nadal obowiązuje.
            </p>
          )}
        </ReviewCollapsibleCard>
      </div>

      <Button className="w-full min-h-[52px] rounded-xl" onClick={() => navigate("/applications/new/promise")}>
        Złóż wniosek o promesę
      </Button>
    </div>
  );
}
