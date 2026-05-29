import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { User, Shield, AlertTriangle, CalendarCheck, Crosshair } from "lucide-react";
import { toast } from "sonner";
import { wpaService } from "../../services/wpaService";
import type { PermitDto, WpaCitizenDto, WpaFirearmSearchResult } from "../../types/api";
import { getPermitStatusMeta, getFirearmStatusMeta } from "../../lib/statusUi";
import { StatusBadge } from "../components/StatusBadge";
import { getApiErrorMessage } from "../../lib/apiErrors";
import { ReviewCollapsibleCard } from "../components/wpa/ReviewCollapsibleCard";
import { ApplicationDetailField, applicationSectionIcon } from "../components/wpa/ApplicationDetailField";
import { WpaListSectionHeader } from "../components/wpa/WpaListSectionHeader";
import { WpaFirearmSearchCard } from "../components/wpa/WpaFirearmSearchCard";
import { getFirearmCategoryBadge } from "../utils/firearmUi";
import { formatPermitCount, getPermitDisplayTypeLabel } from "../utils/permitLabels";
import { cn } from "../components/ui/utils";

function getPermitStatusBadge(status: string) {
  return <StatusBadge meta={getPermitStatusMeta(status)} />;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

function toDateInput(s?: string | null) {
  return s ? s.slice(0, 10) : "";
}

type PermitRowProps = {
  permit: PermitDto;
  expanded: boolean;
  onToggle: () => void;
  editing: boolean;
  examForm: { medicalExamExpiryDate: string; psychologicalExamExpiryDate: string };
  onExamFormChange: (form: { medicalExamExpiryDate: string; psychologicalExamExpiryDate: string }) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: () => void;
  saving: boolean;
};

function PermitRow({
  permit,
  expanded,
  onToggle,
  editing,
  examForm,
  onExamFormChange,
  onStartEditing,
  onCancelEditing,
  onSave,
  saving,
}: PermitRowProps) {
  return (
    <div className="rounded-2xl bg-muted/30 overflow-hidden">
      <button
        type="button"
        className="flex w-full items-start gap-3 p-4 text-left cursor-pointer active:scale-[0.99]"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm leading-snug text-foreground">
              Pozwolenie {getPermitDisplayTypeLabel(permit)}
            </h3>
            {getPermitStatusBadge(permit.statusName)}
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{permit.permitNumber}</p>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/60 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ApplicationDetailField label="Data wydania">{formatDate(permit.issueDate)}</ApplicationDetailField>
            <ApplicationDetailField label="Wygasa">{formatDate(permit.expiryDate)}</ApplicationDetailField>
            <ApplicationDetailField label="Wykorzystane miejsca">
              {permit.usedSlots} / {permit.maxFirearms}
            </ApplicationDetailField>
            <ApplicationDetailField label="Wolne miejsca">{permit.availableSlots}</ApplicationDetailField>
            {permit.medicalExamExpiryDate && (
              <ApplicationDetailField label="Badanie lekarskie">
                {formatDate(permit.medicalExamExpiryDate)}
              </ApplicationDetailField>
            )}
            {permit.psychologicalExamExpiryDate && (
              <ApplicationDetailField label="Badanie psychologiczne">
                {formatDate(permit.psychologicalExamExpiryDate)}
              </ApplicationDetailField>
            )}
          </div>
          {editing ? (
            <div
              className="space-y-3"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`medical-${permit.id}`}>Badanie lekarskie ważne do</Label>
                  <Input
                    id={`medical-${permit.id}`}
                    type="date"
                    className="mt-2 min-h-[44px] rounded-xl"
                    value={examForm.medicalExamExpiryDate}
                    onChange={(e) =>
                      onExamFormChange({ ...examForm, medicalExamExpiryDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`psychological-${permit.id}`}>Badanie psychologiczne ważne do</Label>
                  <Input
                    id={`psychological-${permit.id}`}
                    type="date"
                    className="mt-2 min-h-[44px] rounded-xl"
                    value={examForm.psychologicalExamExpiryDate}
                    onChange={(e) =>
                      onExamFormChange({ ...examForm, psychologicalExamExpiryDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="min-h-[44px] rounded-xl"
                  disabled={saving}
                  onClick={onSave}
                >
                  {saving ? "Zapisywanie..." : "Zapisz badania"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-[44px] rounded-xl"
                  onClick={onCancelEditing}
                >
                  Anuluj
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] rounded-xl"
              onClick={(e) => {
                e.stopPropagation();
                onStartEditing();
              }}
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              Zaktualizuj badania
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function CitizenDetailsWPA() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const permitIdFromQuery = searchParams.get("permitId");
  const [citizen, setCitizen] = useState<WpaCitizenDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPermitId, setSavingPermitId] = useState<string | null>(null);
  const [editingPermitId, setEditingPermitId] = useState<string | null>(null);
  const [expandedPermitId, setExpandedPermitId] = useState<string | null>(null);
  const [expandedFirearmId, setExpandedFirearmId] = useState<string | null>(null);
  const [permitsOpen, setPermitsOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    medicalExamExpiryDate: "",
    psychologicalExamExpiryDate: "",
  });

  const firearms = useMemo(() => citizen?.firearms ?? [], [citizen?.firearms]);
  const firearmCount = firearms.length;

  const loadCitizen = async () => {
    if (!id) return;
    try {
      const result = await wpaService.getCitizenById(id);
      let resolvedFirearms: WpaFirearmSearchResult[] = result.firearms ?? [];

      if (resolvedFirearms.length === 0 && result.pesel) {
        const search = await wpaService.searchFirearms({ pesel: result.pesel, pageSize: 100 });
        resolvedFirearms = search.items;
      }

      setCitizen({
        ...result,
        firearms: resolvedFirearms,
        totalFirearms: resolvedFirearms.length,
      });
    } catch {
      setCitizen(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadCitizen();
  }, [id]);

  useEffect(() => {
    if (!citizen || !permitIdFromQuery) return;
    const permit = citizen.permits.find((p) => p.id === permitIdFromQuery);
    if (!permit) return;
    setPermitsOpen(true);
    setExpandedPermitId(permit.id);
    setEditingPermitId(permit.id);
    setExamForm({
      medicalExamExpiryDate: toDateInput(permit.medicalExamExpiryDate),
      psychologicalExamExpiryDate: toDateInput(permit.psychologicalExamExpiryDate),
    });
  }, [citizen, permitIdFromQuery]);

  const startEditingExams = (permit: PermitDto) => {
    setEditingPermitId(permit.id);
    setExpandedPermitId(permit.id);
    setExamForm({
      medicalExamExpiryDate: toDateInput(permit.medicalExamExpiryDate),
      psychologicalExamExpiryDate: toDateInput(permit.psychologicalExamExpiryDate),
    });
  };

  const saveMedicalExams = async (permitId: string) => {
    if (!examForm.medicalExamExpiryDate || !examForm.psychologicalExamExpiryDate) {
      toast.error("Podaj obie daty badań");
      return;
    }

    setSavingPermitId(permitId);
    try {
      await wpaService.updateMedicalExams(permitId, {
        medicalExamExpiryDate: `${examForm.medicalExamExpiryDate}T00:00:00Z`,
        psychologicalExamExpiryDate: `${examForm.psychologicalExamExpiryDate}T00:00:00Z`,
      });
      toast.success("Badania zaktualizowane");
      setEditingPermitId(null);
      await loadCitizen();
    } catch (err: unknown) {
      toast.error("Nie udało się zaktualizować badań", {
        description: getApiErrorMessage(err) || "Spróbuj ponownie",
      });
    } finally {
      setSavingPermitId(null);
    }
  };

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="h-8 w-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 rounded-2xl bg-muted animate-pulse" />
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!citizen) {
    return (
      <div className="pt-2">
        <p className="text-muted-foreground">Nie znaleziono obywatela.</p>
      </div>
    );
  }

  return (
    <div className="pt-2 space-y-4">
      <WpaListSectionHeader
        title={`${citizen.firstName} ${citizen.lastName}`}
        description={`PESEL: ${citizen.pesel}`}
      />

      <ReviewCollapsibleCard
        title="Dane obywatela"
        icon={applicationSectionIcon(<User />)}
        defaultOpen
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ApplicationDetailField label="PESEL">
            <span className="font-mono">{citizen.pesel}</span>
          </ApplicationDetailField>
          <ApplicationDetailField label="Numer dokumentu">{citizen.documentNumber}</ApplicationDetailField>
          <ApplicationDetailField label="Nr książki broni">
            <span className="font-mono">{citizen.weaponBookNumber}</span>
          </ApplicationDetailField>
          <ApplicationDetailField label="Data rejestracji">{formatDate(citizen.createdAt)}</ApplicationDetailField>
          <ApplicationDetailField label="Adres zamieszkania" className="sm:col-span-2">
            {citizen.address}
          </ApplicationDetailField>
        </div>
        <div className="mt-4 flex gap-3">
          <div className="flex-1 bg-muted/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Egzemplarze broni</p>
            <p className="text-2xl font-bold">{firearmCount}</p>
          </div>
          <div className="flex-1 bg-muted/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Aktywne alerty medyczne</p>
            <p className={cn("text-2xl font-bold", citizen.activeAlerts > 0 && "text-orange-600")}>
              {citizen.activeAlerts}
            </p>
          </div>
        </div>
      </ReviewCollapsibleCard>

      <ReviewCollapsibleCard
        title={`Pozwolenia (${citizen.permits.length})`}
        description={formatPermitCount(citizen.permits.length)}
        icon={applicationSectionIcon(<Shield />)}
        open={permitsOpen}
        onOpenChange={setPermitsOpen}
      >
        {citizen.permits.length > 0 ? (
          <div className="space-y-3">
            {citizen.permits.map((permit) => (
              <PermitRow
                key={permit.id}
                permit={permit}
                expanded={expandedPermitId === permit.id}
                onToggle={() =>
                  setExpandedPermitId((current) => (current === permit.id ? null : permit.id))
                }
                editing={editingPermitId === permit.id}
                examForm={examForm}
                onExamFormChange={setExamForm}
                onStartEditing={() => startEditingExams(permit)}
                onCancelEditing={() => setEditingPermitId(null)}
                onSave={() => saveMedicalExams(permit.id)}
                saving={savingPermitId === permit.id}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-2 text-center">Brak pozwoleń</p>
        )}
      </ReviewCollapsibleCard>

      <ReviewCollapsibleCard
        title={`Broń (${firearmCount})`}
        description={firearmCount === 1 ? "1 egz. w rejestrze" : `${firearmCount} egz. w rejestrze`}
        icon={applicationSectionIcon(<Crosshair />)}
      >
        {firearms.length > 0 ? (
          <div className="space-y-3">
            {firearms.map((firearm) => (
              <WpaFirearmSearchCard
                key={firearm.id}
                firearm={firearm}
                expanded={expandedFirearmId === firearm.id}
                onToggle={() =>
                  setExpandedFirearmId((current) => (current === firearm.id ? null : firearm.id))
                }
                statusBadge={<StatusBadge meta={getFirearmStatusMeta(firearm.status)} />}
                categoryBadge={getFirearmCategoryBadge(firearm.category)}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-2 text-center">Brak zarejestrowanej broni</p>
        )}
      </ReviewCollapsibleCard>

      {citizen.activeAlerts > 0 && (
        <ReviewCollapsibleCard
          title={`Alerty medyczne (${citizen.activeAlerts})`}
          description="Wygasające lub wygasłe badania lekarskie"
          icon={applicationSectionIcon(<AlertTriangle />, "bg-orange-50 text-orange-600")}
          priority
        >
          <p className="text-sm text-muted-foreground mb-3">
            Obywatel ma aktywne alerty medyczne wymagające uwagi urzędnika.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto min-h-[44px] rounded-xl"
            onClick={() => navigate("/officer")}
          >
            Wróć do panelu urzędnika
          </Button>
        </ReviewCollapsibleCard>
      )}
    </div>
  );
}
