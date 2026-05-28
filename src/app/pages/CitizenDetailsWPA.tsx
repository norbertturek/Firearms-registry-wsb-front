import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { User, Shield, AlertTriangle, CalendarCheck, ChevronRight } from "lucide-react";
import { CitizenNavIconTile } from "../components/citizen/CitizenNavIconTile";
import { toast } from "sonner";
import { wpaService } from "../../services/wpaService";
import type { WpaCitizenDto } from "../../types/api";
import { getPermitStatusMeta } from "../../lib/statusUi";

const PERMIT_TYPE_LABELS: Record<string, string> = {
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

function getPermitStatusBadge(status: string) {
  const meta = getPermitStatusMeta(status);
  if (!meta) {
    return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
  return <Badge variant={meta.variant} className={meta.badgeClassName}>{meta.label}</Badge>;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

function toDateInput(s?: string | null) {
  return s ? s.slice(0, 10) : "";
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
  const [examForm, setExamForm] = useState({
    medicalExamExpiryDate: "",
    psychologicalExamExpiryDate: "",
  });

  const loadCitizen = async () => {
    if (!id) return;
    try {
      const result = await wpaService.getCitizenById(id);
      setCitizen(result);
    } catch {
      setCitizen(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCitizen();
  }, [id]);

  useEffect(() => {
    if (!citizen || !permitIdFromQuery) return;
    const permit = citizen.permits.find((p) => p.id === permitIdFromQuery);
    if (!permit) return;
    setEditingPermitId(permit.id);
    setExamForm({
      medicalExamExpiryDate: toDateInput(permit.medicalExamExpiryDate),
      psychologicalExamExpiryDate: toDateInput(permit.psychologicalExamExpiryDate),
    });
  }, [citizen, permitIdFromQuery]);

  const startEditingExams = (permit: WpaCitizenDto["permits"][number]) => {
    setEditingPermitId(permit.id);
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
    } catch (err: any) {
      toast.error("Nie udało się zaktualizować badań", {
        description: err?.message ?? "Spróbuj ponownie",
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
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">Szczegóły obywatela</h1>
        <p className="text-muted-foreground">Pełny profil i historia aktywności</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <CitizenNavIconTile>
                  <User />
                </CitizenNavIconTile>
                <div>
                  <CardTitle className="text-lg">{citizen.firstName} {citizen.lastName}</CardTitle>
                  <CardDescription>PESEL: {citizen.pesel}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Numer dokumentu</p>
                  <p className="font-medium">{citizen.documentNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Nr książki broni</p>
                  <p className="font-medium font-mono">{citizen.weaponBookNumber}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Adres zamieszkania</p>
                <p className="font-medium">{citizen.address}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Data rejestracji w systemie</p>
                <p className="font-medium">{formatDate(citizen.createdAt)}</p>
              </div>

              <Separator className="bg-border" />

              <div className="flex gap-3">
                <div className="flex-1 bg-muted/30 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Egzemplarze broni</p>
                  <p className="text-2xl font-bold">{citizen.totalFirearms}</p>
                </div>
                <div className="flex-1 bg-muted/30 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Aktywne alerty</p>
                  <p className="text-2xl font-bold text-orange-600">{citizen.activeAlerts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permits */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pozwolenia ({citizen.permits.length})</CardTitle>
              <CardDescription>Wszystkie pozwolenia obywatela</CardDescription>
            </CardHeader>
            <CardContent>
              {citizen.permits.length > 0 ? (
                <div className="space-y-3">
                  {citizen.permits.map((permit) => (
                    <div
                      key={permit.id}
                      className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.99]"
                      onClick={() => navigate(`/permits/${permit.id}`)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <CitizenNavIconTile>
                          <Shield />
                        </CitizenNavIconTile>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm leading-snug text-foreground">
                              Pozwolenie {PERMIT_TYPE_LABELS[permit.permitTypeName] ?? permit.permitTypeName}
                            </h3>
                            {getPermitStatusBadge(permit.statusName)}
                          </div>
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">{permit.permitNumber}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground self-center" aria-hidden />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Data wydania</p>
                          <p className="font-medium">{formatDate(permit.issueDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Wygasa</p>
                          <p className="font-medium">{formatDate(permit.expiryDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Wykorzystane sloty</p>
                          <p className="font-medium">{permit.usedSlots} / {permit.maxFirearms}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Dostępne sloty</p>
                          <p className="font-bold">{permit.availableSlots}</p>
                        </div>
                      </div>
                      {(permit.medicalExamExpiryDate || permit.psychologicalExamExpiryDate) && (
                        <>
                          <Separator className="bg-border my-3" />
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {permit.medicalExamExpiryDate && (
                              <div>
                                <p className="text-xs text-muted-foreground">Badanie lekarskie</p>
                                <p className="font-medium">{formatDate(permit.medicalExamExpiryDate)}</p>
                              </div>
                            )}
                            {permit.psychologicalExamExpiryDate && (
                              <div>
                                <p className="text-xs text-muted-foreground">Badanie psychologiczne</p>
                                <p className="font-medium">{formatDate(permit.psychologicalExamExpiryDate)}</p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      <Separator className="bg-border my-3" />
                      {editingPermitId === permit.id ? (
                        <div className="space-y-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <Label htmlFor={`medical-${permit.id}`}>Badanie lekarskie ważne do</Label>
                              <Input
                                id={`medical-${permit.id}`}
                                type="date"
                                className="mt-2 min-h-[44px] rounded-xl"
                                value={examForm.medicalExamExpiryDate}
                                onChange={(e) => setExamForm({ ...examForm, medicalExamExpiryDate: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`psychological-${permit.id}`}>Badanie psychologiczne ważne do</Label>
                              <Input
                                id={`psychological-${permit.id}`}
                                type="date"
                                className="mt-2 min-h-[44px] rounded-xl"
                                value={examForm.psychologicalExamExpiryDate}
                                onChange={(e) => setExamForm({ ...examForm, psychologicalExamExpiryDate: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="min-h-[44px] rounded-xl"
                              disabled={savingPermitId === permit.id}
                              onClick={() => saveMedicalExams(permit.id)}
                            >
                              {savingPermitId === permit.id ? "Zapisywanie..." : "Zapisz badania"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="min-h-[44px] rounded-xl"
                              onClick={() => setEditingPermitId(null)}
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
                          onClick={() => startEditingExams(permit)}
                        >
                          <CalendarCheck className="h-4 w-4 mr-2" />
                          Zaktualizuj badania
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm py-4 text-center">Brak pozwoleń</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {citizen.activeAlerts > 0 && (
            <Card className="rounded-2xl border-none shadow-sm bg-orange-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">Alerty ({citizen.activeAlerts})</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-900 mb-3">Obywatel ma aktywne alerty medyczne wymagające uwagi.</p>
                <Button variant="outline" size="sm" className="w-full min-h-[44px] rounded-xl" onClick={() => navigate("/officer")}>
                  Wróć do panelu WPA
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
