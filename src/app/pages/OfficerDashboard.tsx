import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { AppTabsList } from "../components/ui/AppTabsList";
import { AppTabTrigger } from "../components/ui/AppTabTrigger";
import { FileText, Clock, CheckCircle, Shield, CreditCard, AlertTriangle, Search, User, CalendarCheck, Ban } from "lucide-react";
import { toast } from "sonner";
import { wpaService } from "../../services/wpaService";
import type { WpaPermitApplicationDto, WpaPromiseApplicationDto, WpaMedicalAlertDto } from "../../types/api";
import { getApplicationStatusMeta } from "../../lib/statusUi";
import { StatusBadge } from "../components/StatusBadge";
import { getApiErrorMessage } from "../../lib/apiErrors";
import {
  formatMedicalAlertDate,
  getMedicalAlertTypeLabel,
  isMedicalAlertExpired,
} from "../../lib/medicalAlerts";
import { ApplicationListTile } from "../components/wpa/ApplicationListTile";
import { WpaListSectionHeader } from "../components/wpa/WpaListSectionHeader";
import { WpaQuickToolCard } from "../components/wpa/WpaQuickToolCard";
import { getPermitApplicationTypeLabel } from "../utils/permitLabels";

function getStatusBadge(status: string) {
  return <StatusBadge meta={getApplicationStatusMeta(status)} />;
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

function getMedicalAlertLines(alert: WpaMedicalAlertDto) {
  const lines = [`Obywatel: ${alert.citizenName}`, `PESEL: ${alert.citizenPesel}`];
  if (alert.permitNumber) {
    lines.push(`Pozwolenie: ${alert.permitNumber}`);
  }
  if (alert.message) {
    lines.push(alert.message);
  }
  if (alert.dueDate) {
    lines.push(`Data wygaśnięcia: ${formatMedicalAlertDate(alert.dueDate)}`);
  }
  return lines;
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
        description: getApiErrorMessage(err) || "Spróbuj ponownie",
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
  const defaultTab = pendingPromises.length > pendingPermits.length ? "promises" : "permits";
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
          <WpaQuickToolCard
            title="Wyszukiwarka"
            description="Szukaj obywateli i broni w rejestrze"
            icon={Search}
            onClick={() => navigate("/officer/search")}
          />
          <WpaQuickToolCard
            title="Wszystkie wnioski"
            description="Przeglądaj archiwum wniosków"
            icon={FileText}
            onClick={() => navigate("/applications")}
          />
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4 md:space-y-6">
        <AppTabsList className="grid grid-cols-3">
          <AppTabTrigger value="permits" label="Pozwolenia" icon={Shield} count={pendingPermits.length} />
          <AppTabTrigger value="promises" label="Promesy" icon={CreditCard} count={pendingPromises.length} />
          <AppTabTrigger
            value="alerts"
            label="Alerty"
            ariaLabel="Alerty medyczne"
            icon={AlertTriangle}
            count={alerts.length}
          />
        </AppTabsList>

        <TabsContent value="permits" className="mt-0 space-y-3">
          <WpaListSectionHeader
            title="Wnioski o pozwolenie na broń"
            description="Oczekujące wnioski do rozpatrzenia"
          />
          {pendingPermits.length > 0 ? (
            <div className="space-y-3">
              {pendingPermits.map((app) => (
                  <ApplicationListTile
                    key={app.id}
                    icon={<Shield />}
                    title={`Pozwolenie — ${getPermitApplicationTypeLabel(app)}`}
                    lines={[`Wnioskodawca: ${app.citizenName}`, `PESEL: ${app.citizenPesel}`]}
                    date={formatDate(app.createdAt)}
                    statusBadge={getStatusBadge(app.statusName)}
                    onClick={() => navigate(`/applications/${app.id}?type=permit`)}
                  />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground rounded-2xl bg-muted/20">
              <Clock className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 opacity-30" aria-hidden />
              <p className="text-sm md:text-base">Brak oczekujących wniosków o pozwolenie</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="promises" className="mt-0 space-y-3">
          <WpaListSectionHeader
            title="Wnioski o e-Promesę"
            description="Oczekujące wnioski do rozpatrzenia"
          />
          {pendingPromises.length > 0 ? (
            <div className="space-y-3">
              {pendingPromises.map((app) => (
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
                    onClick={() => navigate(`/applications/${app.id}?type=promise`)}
                  />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground rounded-2xl bg-muted/20">
              <Clock className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 opacity-30" aria-hidden />
              <p className="text-sm md:text-base">Brak oczekujących wniosków o promesę</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="mt-0 space-y-3">
          <WpaListSectionHeader
            title="Alerty medyczne"
            description="Wygasające i wygasłe badania lekarskie"
          />
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <ApplicationListTile
                  key={alert.id}
                  icon={<AlertTriangle />}
                  title={getMedicalAlertTypeLabel(alert.alertTypeName)}
                  lines={getMedicalAlertLines(alert)}
                  statusBadge={getAlertBadge(alert.alertTypeName)}
                  footer={
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="min-h-[44px] rounded-xl text-sm flex-1 sm:flex-none"
                        onClick={() => navigate(`/officer/citizens/${alert.citizenId}`)}
                      >
                        <User className="h-4 w-4 mr-2" aria-hidden />
                        Profil
                      </Button>
                      {alert.permitId && (
                        <Button
                          variant="outline"
                          className="min-h-[44px] rounded-xl text-sm flex-1 sm:flex-none"
                          onClick={() => navigate(`/officer/citizens/${alert.citizenId}?permitId=${alert.permitId}`)}
                        >
                          <CalendarCheck className="h-4 w-4 mr-2" aria-hidden />
                          Aktualizuj badania
                        </Button>
                      )}
                      {alert.permitId && isMedicalAlertExpired(alert.alertTypeName) && (
                        <Button
                          variant="destructive"
                          className="min-h-[44px] rounded-xl text-sm flex-1 sm:flex-none"
                          disabled={suspendingPermitId === alert.permitId}
                          onClick={() => handleSuspendPermit(alert)}
                        >
                          <Ban className="h-4 w-4 mr-2" aria-hidden />
                          {suspendingPermitId === alert.permitId ? "Zawieszanie..." : "Zawieś pozwolenie"}
                        </Button>
                      )}
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground rounded-2xl bg-muted/20">
              <CheckCircle className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 opacity-30" aria-hidden />
              <p className="text-sm md:text-base">Brak aktywnych alertów medycznych</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
