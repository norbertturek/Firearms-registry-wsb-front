import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { cn } from "../components/ui/utils";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  FileWarning,
  Clock,
  Shield,
  Paperclip,
  Scale,
  BookOpen,
} from "lucide-react";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { wpaService } from "../../services/wpaService";
import { WpaApplicationReviewBar } from "../components/wpa/WpaApplicationReviewBar";
import { ReviewCollapsibleCard } from "../components/wpa/ReviewCollapsibleCard";
import { applicationSectionIcon } from "../components/wpa/ApplicationDetailField";
import { PermitApplicationAttachmentsCard } from "../components/wpa/PermitApplicationAttachmentsCard";
import type { WpaPermitApplicationDto, WpaPromiseApplicationDto, PermitDto } from "../../types/api";
import { getApplicationStatusMeta } from "../../lib/statusUi";

const PERMIT_TYPE_LABELS: Record<string, string> = {
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

type Decision = "mark-under-review" | "approve" | "reject" | "require-correction";

const APPROVABLE_PROMISE_STATUSES = ["UnderReview", "Paid"];
const APPROVABLE_PERMIT_STATUSES = ["Submitted", "UnderReview"];
const REVIEWABLE_PROMISE_STATUSES = ["Submitted", "Paid"];
const REVIEWABLE_PERMIT_STATUSES = ["Submitted"];
const CORRECTABLE_STATUSES = ["Submitted", "UnderReview"];
const FINAL_STATUSES = ["Approved", "Rejected"];

function getStatusBadge(status: string) {
  const meta = getApplicationStatusMeta(status);
  if (!meta) {
    return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
  return <Badge variant={meta.variant} className={meta.badgeClassName}>{meta.label}</Badge>;
}

export function DecisionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = (searchParams.get("type") as "permit" | "promise") || "permit";

  const [permitApp, setPermitApp] = useState<WpaPermitApplicationDto | null>(null);
  const [promiseApp, setPromiseApp] = useState<WpaPromiseApplicationDto | null>(null);
  const [linkedPermit, setLinkedPermit] = useState<PermitDto | null>(null);
  const [citizenPermits, setCitizenPermits] = useState<PermitDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [decision, setDecision] = useState<Decision | null>(null);
  const [justification, setJustification] = useState("");
  const [maxFirearms, setMaxFirearms] = useState<string>("1");
  const [medicalExpiry, setMedicalExpiry] = useState("");
  const [psychologicalExpiry, setPsychologicalExpiry] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLinkedPermit(null);
    setCitizenPermits([]);
    const fetcher = type === "permit"
      ? wpaService.getPermitApplicationById(id).then((d) => { setPermitApp(d); setPromiseApp(null); })
      : wpaService.getPromiseApplicationById(id).then(async (d) => {
          setPromiseApp(d);
          setPermitApp(null);
          try {
            const citizen = await wpaService.getCitizenById(d.citizenId);
            setCitizenPermits(citizen.permits);
            setLinkedPermit(citizen.permits.find((p) => p.id === d.permitId) ?? null);
          } catch {
            // citizen lookup not critical
          }
        });
    fetcher
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, type]);

  const app = permitApp ?? promiseApp;

  useEffect(() => {
    if (permitApp) {
      if (permitApp.medicalExamExpiryDate) setMedicalExpiry(permitApp.medicalExamExpiryDate.slice(0, 10));
      if (permitApp.psychologicalExamExpiryDate) setPsychologicalExpiry(permitApp.psychologicalExamExpiryDate.slice(0, 10));
    }
  }, [permitApp]);

  const canMarkUnderReview = app
    ? type === "permit"
      ? REVIEWABLE_PERMIT_STATUSES.includes(app.statusName)
      : REVIEWABLE_PROMISE_STATUSES.includes(app.statusName)
    : false;

  const canApprove = app
    ? type === "permit"
      ? APPROVABLE_PERMIT_STATUSES.includes(app.statusName)
      : APPROVABLE_PROMISE_STATUSES.includes(app.statusName)
    : false;

  const canRequireCorrection = app ? CORRECTABLE_STATUSES.includes(app.statusName) : false;
  const canReject = app ? !FINAL_STATUSES.includes(app.statusName) : false;
  const isReadOnly = app ? FINAL_STATUSES.includes(app.statusName) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !app) return;

    const newErrors: Record<string, string> = {};
    if (!decision) newErrors.decision = "Musisz podjąć decyzję";

    if (decision === "mark-under-review" && !canMarkUnderReview) {
      newErrors.decision = "Tego wniosku nie mozna juz oznaczyc jako weryfikowany";
    }
    if (decision === "approve" && !canApprove) {
      newErrors.decision = type === "promise"
        ? "Najpierw oznacz wniosek jako weryfikowany, dopiero potem zatwierdz promese"
        : "Tego wniosku nie mozna zatwierdzic w obecnym statusie";
    }

    if (decision === "require-correction" && !canRequireCorrection) {
      newErrors.decision = "Tego wniosku nie można wezwać do uzupełnienia w obecnym statusie";
    }
    if (decision === "reject" && !canReject) {
      newErrors.decision = "Tego wniosku nie można odrzucić w obecnym statusie";
    }

    if (decision === "reject" || decision === "require-correction") {
      if (!justification || justification.length < 20) {
        newErrors.justification = "Uzasadnienie musi zawierać minimum 20 znaków";
      }
    }

    if (decision === "approve" && type === "permit") {
      const n = parseInt(maxFirearms, 10);
      if (!Number.isFinite(n) || n < 1 || n > 50) {
        newErrors.maxFirearms = "Podaj wartość 1–50";
      }
      if (!medicalExpiry) newErrors.medicalExpiry = "Wpisz datę po weryfikacji zaświadczenia lekarskiego";
      if (!psychologicalExpiry) newErrors.psychologicalExpiry = "Wpisz datę po weryfikacji zaświadczenia psychologicznego";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const examDates =
        type === "permit" && medicalExpiry && psychologicalExpiry
          ? {
              medicalExamExpiryDate: `${medicalExpiry}T00:00:00Z`,
              psychologicalExamExpiryDate: `${psychologicalExpiry}T00:00:00Z`,
            }
          : undefined;

      if (type === "permit") {
        if (decision === "mark-under-review") await wpaService.markPermitApplicationUnderReview(id, examDates);
        else if (decision === "approve") await wpaService.approvePermitApplication(id, {
          maxFirearms: parseInt(maxFirearms, 10),
          medicalExamExpiryDate: examDates!.medicalExamExpiryDate,
          psychologicalExamExpiryDate: examDates!.psychologicalExamExpiryDate,
        });
        else if (decision === "reject") {
          await wpaService.rejectPermitApplication(id, { reason: justification, ...examDates });
        } else if (decision === "require-correction") {
          await wpaService.requirePermitApplicationCorrection(id, { reason: justification, ...examDates });
        }
      } else {
        if (decision === "mark-under-review") await wpaService.markPromiseApplicationUnderReview(id);
        else if (decision === "approve") await wpaService.approvePromiseApplication(id);
        else if (decision === "reject") await wpaService.rejectPromiseApplication(id, { reason: justification });
        else if (decision === "require-correction") await wpaService.requirePromiseApplicationCorrection(id, { reason: justification });
      }
      const messages: Record<Decision, string> = {
        "mark-under-review": "Wniosek oznaczony jako weryfikowany",
        approve: "Wniosek zatwierdzony",
        reject: "Wniosek odrzucony",
        "require-correction": "Wezwanie do uzupełnienia wysłane",
      };
      toast.success(messages[decision!]);
      navigate("/officer");
    } catch (err: any) {
      toast.error("Błąd zapisu decyzji", { description: err?.message ?? "Spróbuj ponownie" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="h-8 w-40 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="pt-2">
        <p className="text-muted-foreground">Nie znaleziono wniosku.</p>
      </div>
    );
  }

  const guidelinesContent = (
    <div className="text-xs md:text-sm text-muted-foreground leading-snug space-y-2 md:space-y-3">
      <p><strong className="text-foreground">Weryfikacja:</strong> sprawdź ważność badań medycznych, zgodność danych obywatela oraz zasadność uzasadnienia.</p>
      <p><strong className="text-foreground">Braki:</strong> wybierz &quot;Wezwij do uzupełnienia&quot; i wskaż konkretne braki.</p>
      <p><strong className="text-foreground">Odrzucenie:</strong> wymaga uzasadnienia zgodnie z k.p.a. art. 107 § 1 pkt 6.</p>
    </div>
  );

  return (
    <div className="pt-2">
      <WpaApplicationReviewBar
        type={type}
        permitApp={permitApp}
        promiseApp={promiseApp}
        linkedPermit={linkedPermit}
        contextLabel={isReadOnly ? "Podgląd wniosku" : "Rozpatrz wniosek"}
      />

      <div className="grid gap-2.5 md:gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 md:gap-4">
            {!isReadOnly && (
              <ReviewCollapsibleCard
                title="Wytyczne"
                description="Przeczytaj przed podjęciem decyzji"
                icon={applicationSectionIcon(<BookOpen className="h-5 w-5" />)}
                defaultOpen
                priority
                className="order-0 lg:hidden"
              >
                {guidelinesContent}
              </ReviewCollapsibleCard>
            )}

            <ReviewCollapsibleCard
              title={isReadOnly ? "Podgląd decyzji" : "Decyzja"}
              description={isReadOnly ? "Status końcowy wniosku" : "Wybierz akcję i podaj uzasadnienie"}
              icon={applicationSectionIcon(<Scale className="h-5 w-5" />)}
              defaultOpen
              priority
              className="order-1 lg:order-6"
            >
              {isReadOnly ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(app.statusName)}
                    <p className="text-sm text-muted-foreground">
                      {app.statusName === "Approved"
                        ? "Wniosek został zatwierdzony. Decyzja jest ostateczna i nie może być zmieniona."
                        : "Wniosek został odrzucony. Decyzja jest ostateczna i nie może być zmieniona."}
                    </p>
                  </div>
                  {app.rejectionReason && (
                    <div className="rounded-xl border border-border bg-muted/30 p-3 md:p-4 space-y-1.5">
                      <p className="text-sm font-semibold text-foreground">Uzasadnienie odrzucenia</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{app.rejectionReason}</p>
                    </div>
                  )}
                </div>
              ) : (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <div role="radiogroup" aria-label="Wybór decyzji" className="grid gap-2 md:gap-3">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={decision === "mark-under-review"}
                      disabled={!canMarkUnderReview}
                      onClick={() => setDecision("mark-under-review")}
                      className={cn(
                        "w-full flex items-start gap-2.5 md:gap-3 border rounded-lg md:rounded-xl p-3 md:p-4 text-left transition-colors",
                        canMarkUnderReview ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                        decision === "mark-under-review" ? "bg-blue-50/50 border-blue-200" : "border-border",
                      )}
                    >
                      <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm md:text-base text-foreground mb-0.5">Oznacz jako weryfikowany</p>
                        <p className="text-xs md:text-sm text-muted-foreground leading-snug">Zmiana statusu na &quot;W weryfikacji&quot;</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={decision === "approve"}
                      disabled={!canApprove}
                      onClick={() => setDecision("approve")}
                      className={cn(
                        "w-full flex items-start gap-2.5 md:gap-3 border rounded-lg md:rounded-xl p-3 md:p-4 text-left transition-colors",
                        canApprove ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                        decision === "approve" ? "bg-emerald-50/50 border-emerald-200" : "border-border",
                      )}
                    >
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-emerald-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm md:text-base text-foreground mb-0.5">Zatwierdź wniosek</p>
                        <p className="text-xs md:text-sm text-muted-foreground leading-snug">{type === "permit" ? "Wygeneruj pozwolenie na broń" : "Wygeneruj aktywną promesę"}</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={decision === "require-correction"}
                      disabled={!canRequireCorrection}
                      onClick={() => setDecision("require-correction")}
                      className={cn(
                        "w-full flex items-start gap-2.5 md:gap-3 border rounded-lg md:rounded-xl p-3 md:p-4 text-left transition-colors",
                        canRequireCorrection ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                        decision === "require-correction" ? "bg-orange-50/50 border-orange-200" : "border-border",
                      )}
                    >
                      <FileWarning className="h-4 w-4 md:h-5 md:w-5 text-orange-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm md:text-base text-foreground mb-0.5">Wezwij do uzupełnienia</p>
                        <p className="text-xs md:text-sm text-muted-foreground leading-snug">Wniosek posiada braki formalne lub dokumentacyjne</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={decision === "reject"}
                      disabled={!canReject}
                      onClick={() => setDecision("reject")}
                      className={cn(
                        "w-full flex items-start gap-2.5 md:gap-3 border rounded-lg md:rounded-xl p-3 md:p-4 text-left transition-colors",
                        canReject ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                        decision === "reject" ? "bg-red-50/50 border-red-200" : "border-border",
                      )}
                    >
                      <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm md:text-base text-foreground mb-0.5">Odrzuć wniosek</p>
                        <p className="text-xs md:text-sm text-muted-foreground leading-snug">Wydaj negatywną decyzję z uzasadnieniem</p>
                      </div>
                    </button>
                  </div>
                  {type === "promise" && !canApprove && (
                    <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                      Najpierw oznacz wniosek jako weryfikowany. Zatwierdzenie promesy bedzie dostepne po zmianie statusu na &quot;UnderReview&quot;.
                    </div>
                  )}
                  {errors.decision && (
                    <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="h-4 w-4 shrink-0" />{errors.decision}
                    </p>
                  )}
                </div>

                {decision === "approve" && type === "permit" && (
                  <>
                    <Separator className="bg-border" />
                    <div className="space-y-4">
                      <p className="text-sm font-semibold">Parametry wydawanego pozwolenia</p>
                      <div>
                        <Label htmlFor="maxFirearms">Maksymalna liczba broni (1–50) <span className="text-red-600">*</span></Label>
                        <Input
                          id="maxFirearms"
                          type="number"
                          min={1}
                          max={50}
                          value={maxFirearms}
                          onChange={(e) => setMaxFirearms(e.target.value)}
                          className="min-h-[44px] mt-1.5 rounded-xl"
                        />
                        {errors.maxFirearms && (
                          <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.maxFirearms}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Daty ważności badań wpisz w sekcji <strong>&quot;Ważność badań po weryfikacji&quot;</strong> poniżej.
                      </p>
                    </div>
                  </>
                )}

                {decision && decision !== "approve" && (
                  <>
                    <Separator className="bg-border" />
                    <div className="space-y-2">
                      <Label htmlFor="justification">
                        {decision === "mark-under-review" ? "Notatka (opcjonalne)" : "Uzasadnienie decyzji / Treść wezwania"}
                        {decision !== "mark-under-review" && <span className="text-red-600"> *</span>}
                      </Label>
                      <p className="text-xs md:text-sm text-muted-foreground leading-snug mb-2">
                        {decision === "mark-under-review"
                          ? "Możesz dodać notatkę wewnętrzną (opcjonalne)."
                          : "Podaj szczegóły decyzji (minimum 20 znaków)."}
                      </p>
                      <Textarea
                        id="justification"
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        className="min-h-[150px] rounded-xl"
                        placeholder={decision === "mark-under-review" ? "Notatka wewnętrzna..." : "Treść uzasadnienia..."}
                      />
                      <div className="flex justify-between items-center mt-1">
                        {errors.justification ? (
                          <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                            <AlertCircle className="h-4 w-4 shrink-0" />{errors.justification}
                          </p>
                        ) : <span />}
                        {decision !== "mark-under-review" && (
                          <span className="text-xs text-muted-foreground">Znaków: {justification.length} / 20</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              )}
            </ReviewCollapsibleCard>

            {permitApp && (
              <ReviewCollapsibleCard
                title="Załączniki"
                description="Zaświadczenia lekarskie i psychologiczne dołączone przez obywatela"
                icon={applicationSectionIcon(<Paperclip className="h-5 w-5" />)}
                defaultOpen
                className="order-2 lg:order-3"
              >
                <PermitApplicationAttachmentsCard
                  bare
                  applicationId={permitApp.id}
                  attachments={permitApp.attachments ?? []}
                />
              </ReviewCollapsibleCard>
            )}

            {permitApp && !isReadOnly && (
              <ReviewCollapsibleCard
                title="Ważność badań po weryfikacji"
                description="Daty z zaświadczeń — widoczne w szczegółach wniosku i zapisywane na pozwoleniu przy zatwierdzeniu"
                icon={applicationSectionIcon(<Clock className="h-5 w-5" />)}
                defaultOpen
                className="order-3 lg:order-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="medExp">Bad. lekarskie ważne do <span className="text-red-600">*</span></Label>
                    <Input
                      id="medExp"
                      type="date"
                      value={medicalExpiry}
                      onChange={(e) => setMedicalExpiry(e.target.value)}
                      className="mt-1.5"
                    />
                    {errors.medicalExpiry && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.medicalExpiry}</p>}
                  </div>
                  <div>
                    <Label htmlFor="psyExp">Bad. psychologiczne ważne do <span className="text-red-600">*</span></Label>
                    <Input
                      id="psyExp"
                      type="date"
                      value={psychologicalExpiry}
                      onChange={(e) => setPsychologicalExpiry(e.target.value)}
                      className="mt-1.5"
                    />
                    {errors.psychologicalExpiry && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.psychologicalExpiry}</p>}
                  </div>
                </div>
              </ReviewCollapsibleCard>
            )}

            {promiseApp && (
              <ReviewCollapsibleCard
                title="Pozwolenie bazowe"
                description="Promesa może być wydana tylko przy aktywnym pozwoleniu z wolnymi slotami i aktualnych badaniach"
                icon={applicationSectionIcon(<Shield className="h-5 w-5" />)}
                defaultOpen={false}
                className="order-6 lg:order-4"
              >
                {linkedPermit ? (
                  <div className="space-y-3 md:space-y-4">
                    <div className="grid grid-cols-2 gap-2.5 md:gap-4">
                      <div>
                        <p className="text-[11px] md:text-xs text-muted-foreground">Numer pozwolenia</p>
                        <p className="font-medium font-mono text-xs md:text-sm">{linkedPermit.permitNumber}</p>
                      </div>
                      <div>
                        <p className="text-[11px] md:text-xs text-muted-foreground">Typ</p>
                        <p className="font-medium text-sm md:text-base">
                          {PERMIT_TYPE_LABELS[linkedPermit.permitTypeName] ?? linkedPermit.permitTypeName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] md:text-xs text-muted-foreground">Status</p>
                        <p className={`font-medium text-sm md:text-base ${linkedPermit.statusName === "Active" ? "text-emerald-700" : "text-red-600"}`}>
                          {linkedPermit.statusName === "Active" ? "Aktywne" : linkedPermit.statusName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] md:text-xs text-muted-foreground">Wolne sloty</p>
                        <p className={`font-medium text-sm md:text-base ${linkedPermit.availableSlots > 0 ? "text-emerald-700" : "text-red-600"}`}>
                          {linkedPermit.availableSlots} z {linkedPermit.maxFirearms}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] md:text-xs text-muted-foreground">Ważne do</p>
                        <p className="font-medium text-sm md:text-base">{new Date(linkedPermit.expiryDate).toLocaleDateString("pl-PL")}</p>
                      </div>
                    </div>

                    <Separator className="bg-border" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                      {(() => {
                        const today = new Date();
                        const med = linkedPermit.medicalExamExpiryDate ? new Date(linkedPermit.medicalExamExpiryDate) : null;
                        const psy = linkedPermit.psychologicalExamExpiryDate ? new Date(linkedPermit.psychologicalExamExpiryDate) : null;
                        const medValid = med && med >= today;
                        const psyValid = psy && psy >= today;
                        return (
                          <>
                            <div className={`rounded-lg md:rounded-xl p-2.5 md:p-3 ${medValid ? "bg-emerald-50" : "bg-red-50"}`}>
                              <p className="text-[11px] md:text-xs text-muted-foreground">Bad. lekarskie ważne do</p>
                              <p className={`font-semibold text-sm md:text-base ${medValid ? "text-emerald-900" : "text-red-900"}`}>
                                {med ? med.toLocaleDateString("pl-PL") : "Brak danych"}
                                {!medValid && med && " (wygasło)"}
                              </p>
                            </div>
                            <div className={`rounded-lg md:rounded-xl p-2.5 md:p-3 ${psyValid ? "bg-emerald-50" : "bg-red-50"}`}>
                              <p className="text-[11px] md:text-xs text-muted-foreground">Bad. psychologiczne ważne do</p>
                              <p className={`font-semibold text-sm md:text-base ${psyValid ? "text-emerald-900" : "text-red-900"}`}>
                                {psy ? psy.toLocaleDateString("pl-PL") : "Brak danych"}
                                {!psyValid && psy && " (wygasło)"}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                    Nie udało się pobrać pozwolenia bazowego ({promiseApp.permitNumber}). Sprawdź, czy istnieje i czy jest aktywne.
                    {citizenPermits.length > 0 && (
                      <p className="mt-2 text-xs">Pozwolenia obywatela: {citizenPermits.map((p) => p.permitNumber).join(", ")}</p>
                    )}
                  </div>
                )}
              </ReviewCollapsibleCard>
            )}

            {!isReadOnly && (
            <div className="order-7">
              <Button
                type="submit"
                disabled={submitting}
                className="min-h-[52px] w-full rounded-xl text-sm md:text-base font-semibold"
              >
                {submitting ? "Zapisywanie..." : "Zatwierdź i wyślij"}
              </Button>
            </div>
            )}
          </form>
        </div>

        {!isReadOnly && (
        <div className="hidden lg:block space-y-4">
          <ReviewCollapsibleCard
            title="Wytyczne"
            icon={applicationSectionIcon(<BookOpen className="h-5 w-5" />)}
            defaultOpen
          >
            {guidelinesContent}
          </ReviewCollapsibleCard>
        </div>
        )}
      </div>
    </div>
  );
}
