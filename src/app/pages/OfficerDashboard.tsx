import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsTrigger } from "../components/ui/tabs";
import { AppTabsList } from "../components/ui/AppTabsList";
import { FileText, Clock, CheckCircle, Shield, CreditCard, AlertTriangle, Search, User, CalendarCheck, Ban } from "lucide-react";
import { toast } from "sonner";
import { wpaService } from "../../services/wpaService";
import type { WpaPermitApplicationDto, WpaPromiseApplicationDto, WpaMedicalAlertDto } from "../../types/api";
import { getApplicationStatusMeta } from "../../lib/statusUi";
import {
  formatMedicalAlertDate,
  getMedicalAlertTypeLabel,
  isMedicalAlertExpired,
} from "../../lib/medicalAlerts";
import {
  ApplicationListTile,
  getDecisionActionLabel,
  isNewForVerification,
} from "../components/wpa/ApplicationListTile";

const PERMIT_TYPE_LABELS: Record<string, string> = {
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

function getStatusBadge(status: string) {
  const meta = getApplicationStatusMeta(status);
  if (!meta) {
    return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
  return <Badge variant={meta.variant} className={meta.badgeClassName}>{meta.label}</Badge>;
}

function getAlertBadge(type: string) {
  if (isMedicalAlertExpired(type)) {
    return <Badge variant="destructive" className="rounded-full px-2 py-0.5">Wygasło</Badge>;
  }
  return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-2 py-0.5 rounded-full">Wygasa</Badge>;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_PRIORITY: Record<string, number> = {
  Submitted: 0,
  Paid: 1,
  UnderReview: 2,
};

function sortPendingApplications<T extends { statusName: string; createdAt: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const statusDiff = (STATUS_PRIORITY[a.statusName] ?? 9) - (STATUS_PRIORITY[b.statusName] ?? 9);
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function TabNotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-muted">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function getPrimaryActionLabel(type: "permit" | "promise", statusName: string) {
  return getDecisionActionLabel(type, statusName);
}

export function OfficerDashboard() {
  const navigate = useNavigate();
  const [permitApps, setPermitApps] = useState<WpaPermitApplicationDto[]>([]);
  const [promiseApps, setPromiseApps] = useState<WpaPromiseApplicationDto[]>([]);
  const [alerts, setAlerts] = useState<WpaMedicalAlertDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspendingPermitId, setSuspendingPermitId] = useState<string | null>(null);

  const loadAlerts = async () => {
    const al = await wpaService.getMedicalAlerts({ page: 1, pageSize: 20, resolved: false });
    setAlerts(al.items);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [pa, pra] = await Promise.all([
          wpaService.getPermitApplications({ page: 1, pageSize: 20 }),
          wpaService.getPromiseApplications({ page: 1, pageSize: 20 }),
        ]);
        setPermitApps(pa.items);
        setPromiseApps(pra.items);
        await loadAlerts();
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSuspendPermit = async (alert: WpaMedicalAlertDto) => {
    if (!alert.permitId) {
      toast.error("Brak powiązanego pozwolenia");
      return;
    }
    const reason = window.prompt("Powód zawieszenia pozwolenia (np. wygasłe badanie):");
    if (reason === null) return;

    setSuspendingPermitId(alert.permitId);
    try {
      await wpaService.suspendPermit(alert.permitId, { reason: reason || undefined });
      toast.success("Pozwolenie zawieszone");
      await loadAlerts();
    } catch (err: unknown) {
      toast.error("Nie udało się zawiesić pozwolenia", {
        description: err instanceof Error ? err.message : "Spróbuj ponownie",
      });
    } finally {
      setSuspendingPermitId(null);
    }
  };

  const pendingPermits = sortPendingApplications(
    permitApps.filter((a) => a.statusName === "Submitted" || a.statusName === "UnderReview"),
  );
  const pendingPromises = sortPendingApplications(
    promiseApps.filter((a) => a.statusName === "Submitted" || a.statusName === "Paid" || a.statusName === "UnderReview"),
  );
  const newPermits = pendingPermits.filter((a) => isNewForVerification("permit", a.statusName)).length;
  const newPromises = pendingPromises.filter((a) => isNewForVerification("promise", a.statusName)).length;
  const defaultTab = newPromises > newPermits ? "promises" : "permits";
  if (loading) {
    return (
      <div className="pt-1 md:pt-2">
        <div className="mb-4 md:mb-6 px-0.5">
          <div className="h-7 md:h-8 w-40 md:w-48 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-3.5 md:h-4 w-56 md:w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2 md:space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 md:h-28 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-1 md:pt-2">
      <div className="mb-4 md:mb-6 px-0.5">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-0.5 md:mb-1">Panel urzędnika WPA</h1>
        <p className="text-sm md:text-base text-muted-foreground leading-snug">Rozpatrywanie wniosków i zarządzanie decyzjami administracyjnymi</p>
      </div>

      <div className="mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-3 px-0.5 text-foreground">Narzędzia WPA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          <Card className="rounded-2xl border-none shadow-sm hover:bg-muted/30 transition-colors cursor-pointer active:scale-[0.98]" onClick={() => navigate("/wpa/search")}>
            <CardContent className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
              <div className="bg-primary/10 p-2 md:p-3 rounded-lg md:rounded-xl">
                <Search className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm md:text-base mb-0.5">Wyszukiwarka</h4>
                <p className="text-[11px] md:text-xs text-muted-foreground">Szukaj obywateli i broni w rejestrze</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm hover:bg-muted/30 transition-colors cursor-pointer active:scale-[0.98]" onClick={() => navigate("/applications")}>
            <CardContent className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
              <div className="bg-primary/10 p-2 md:p-3 rounded-lg md:rounded-xl">
                <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm md:text-base mb-0.5">Wszystkie wnioski</h4>
                <p className="text-[11px] md:text-xs text-muted-foreground">Przeglądaj archiwum wniosków</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4 md:space-y-6">
        <AppTabsList className="grid grid-cols-3 h-auto">
          <TabsTrigger value="permits" className="flex flex-col items-center justify-center gap-0.5 sm:flex-row sm:gap-2 py-2 px-1 min-h-[52px] sm:min-h-[44px]">
            <div className="relative">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <TabNotificationBadge count={newPermits} />
            </div>
            <span className="text-[10px] sm:text-sm leading-none">Pozwolenia</span>
          </TabsTrigger>
          <TabsTrigger value="promises" className="flex flex-col items-center justify-center gap-0.5 sm:flex-row sm:gap-2 py-2 px-1 min-h-[52px] sm:min-h-[44px]">
            <div className="relative">
              <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <TabNotificationBadge count={newPromises} />
            </div>
            <span className="text-[10px] sm:text-sm leading-none">Promesy</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex flex-col items-center justify-center gap-0.5 sm:flex-row sm:gap-2 py-2 px-1 min-h-[52px] sm:min-h-[44px]">
            <div className="relative">
              <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <TabNotificationBadge count={alerts.length} />
            </div>
            <span className="text-[10px] sm:text-sm leading-none">Alerty</span>
          </TabsTrigger>
        </AppTabsList>

        <TabsContent value="permits" className="mt-0">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6 md:pb-3">
              <CardTitle className="text-base md:text-lg">Wnioski o pozwolenie na broń</CardTitle>
              <CardDescription className="text-xs md:text-sm">Oczekujące wnioski do rozpatrzenia</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
              {pendingPermits.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {pendingPermits.map((app) => {
                    const isNew = isNewForVerification("permit", app.statusName);
                    return (
                      <ApplicationListTile
                        key={app.id}
                        icon={<Shield />}
                        title={`Pozwolenie — ${PERMIT_TYPE_LABELS[app.requestedPermitTypeName] ?? app.requestedPermitTypeName}`}
                        lines={[`Wnioskodawca: ${app.citizenName}`, `PESEL: ${app.citizenPesel}`]}
                        date={formatDate(app.createdAt)}
                        statusBadge={getStatusBadge(app.statusName)}
                        highlight={isNew}
                        onClick={() => navigate(`/applications/${app.id}?type=permit`)}
                        headerBadge={isNew ? (
                          <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-none rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-[11px] shrink-0">
                            Nowy
                          </Badge>
                        ) : undefined}
                        actions={
                          <>
                            <Button onClick={() => navigate(`/decision/${app.id}?type=permit`)} className="min-h-[44px] rounded-xl flex-1 lg:flex-none text-sm">
                              {getPrimaryActionLabel("permit", app.statusName)}
                            </Button>
                            <Button onClick={() => navigate(`/applications/${app.id}?type=permit`)} variant="outline" className="hidden md:flex min-h-[44px] rounded-xl flex-1 lg:flex-none text-sm">
                              Szczegóły
                            </Button>
                          </>
                        }
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8 text-muted-foreground">
                  <Clock className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 opacity-30" />
                  <p className="text-sm md:text-base">Brak oczekujących wniosków o pozwolenie</p>
                </div>
              )}

              {permitApps.length > 0 && (
                <div className="mt-4 text-center">
                  <Button onClick={() => navigate("/applications")} variant="outline" className="min-h-[44px] rounded-lg md:rounded-xl text-sm">
                    Zobacz wszystkie wnioski
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promises" className="mt-0">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6 md:pb-3">
              <CardTitle className="text-base md:text-lg">Wnioski o e-Promesę</CardTitle>
              <CardDescription className="text-xs md:text-sm">Oczekujące wnioski do rozpatrzenia</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
              {pendingPromises.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {pendingPromises.map((app) => {
                    const isNew = isNewForVerification("promise", app.statusName);
                    return (
                      <ApplicationListTile
                        key={app.id}
                        icon={<CreditCard />}
                        title={app.requestedWeaponType}
                        lines={[
                          `Wnioskodawca: ${app.citizenName}`,
                          `PESEL: ${app.citizenPesel}`,
                          `Pozwolenie: ${app.permitNumber} · Ilość: ${app.requestedQuantity}`,
                        ]}
                        date={formatDate(app.createdAt)}
                        statusBadge={getStatusBadge(app.statusName)}
                        highlight={isNew}
                        onClick={() => navigate(`/applications/${app.id}?type=promise`)}
                        headerBadge={isNew ? (
                          <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-none rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-[11px] shrink-0">
                            Nowy
                          </Badge>
                        ) : undefined}
                        actions={
                          <>
                            <Button onClick={() => navigate(`/decision/${app.id}?type=promise`)} className="min-h-[44px] rounded-xl flex-1 lg:flex-none text-sm">
                              {getPrimaryActionLabel("promise", app.statusName)}
                            </Button>
                            <Button onClick={() => navigate(`/applications/${app.id}?type=promise`)} variant="outline" className="hidden md:flex min-h-[44px] rounded-xl flex-1 lg:flex-none text-sm">
                              Szczegóły
                            </Button>
                          </>
                        }
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8 text-muted-foreground">
                  <Clock className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 opacity-30" />
                  <p className="text-sm md:text-base">Brak oczekujących wniosków o promesę</p>
                </div>
              )}

              {promiseApps.length > 0 && (
                <div className="mt-4 text-center">
                  <Button onClick={() => navigate("/applications")} variant="outline" className="min-h-[44px] rounded-lg md:rounded-xl text-sm">
                    Zobacz wszystkie wnioski
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-0">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6 md:pb-3">
              <CardTitle className="text-base md:text-lg">Alerty medyczne</CardTitle>
              <CardDescription className="text-xs md:text-sm">Wygasające i wygasłe badania lekarskie</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
              {alerts.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="bg-muted/30 rounded-2xl p-3 md:p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <h3 className="flex-1 font-semibold text-sm md:text-base leading-snug">
                              {getMedicalAlertTypeLabel(alert.alertTypeName)}
                            </h3>
                            {getAlertBadge(alert.alertTypeName)}
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground mb-0.5 md:mb-1">Obywatel: {alert.citizenName}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">PESEL: {alert.citizenPesel}</p>
                          {alert.permitNumber && (
                            <p className="text-xs md:text-sm text-muted-foreground mt-1">
                              Pozwolenie: <span className="font-mono">{alert.permitNumber}</span>
                            </p>
                          )}
                          {alert.message && (
                            <p className="text-xs md:text-sm text-muted-foreground mt-1">{alert.message}</p>
                          )}
                          {alert.dueDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Data wygaśnięcia: {formatMedicalAlertDate(alert.dueDate)}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                          <Button
                            variant="outline"
                            className="min-h-[44px] rounded-xl text-sm"
                            onClick={() => navigate(`/wpa/citizens/${alert.citizenId}`)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Profil
                          </Button>
                          {alert.permitId && (
                            <Button
                              variant="outline"
                              className="min-h-[44px] rounded-xl text-sm"
                              onClick={() => navigate(`/wpa/citizens/${alert.citizenId}?permitId=${alert.permitId}`)}
                            >
                              <CalendarCheck className="h-4 w-4 mr-2" />
                              Aktualizuj badania
                            </Button>
                          )}
                          {alert.permitId && isMedicalAlertExpired(alert.alertTypeName) && (
                            <Button
                              variant="destructive"
                              className="min-h-[44px] rounded-xl text-sm"
                              disabled={suspendingPermitId === alert.permitId}
                              onClick={() => handleSuspendPermit(alert)}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              {suspendingPermitId === alert.permitId ? "Zawieszanie..." : "Zawieś pozwolenie"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 opacity-30" />
                  <p className="text-sm md:text-base">Brak aktywnych alertów medycznych</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
