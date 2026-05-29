import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { AppTabsList } from "../components/ui/AppTabsList";
import { AppTabTrigger } from "../components/ui/AppTabTrigger";
import { ArrowRightLeft, CheckCircle, XCircle, Clock, AlertCircle, Inbox, ArrowUpRight, History } from "lucide-react";
import { toast } from "sonner";
import { citizenService, translateTransferError } from "../../services/citizenService";
import type { TransferRequestDto } from "../../types/api";
import { getTransferRequestStatusMeta } from "../../lib/statusUi";
import { DateStatusMeta } from "../components/DateStatusMeta";
import { CITIZEN_LIST_CARD_CONTENT_CLASS } from "../utils/citizenCardUi";

const TRANSFER_STATUS_ICON: Record<string, ReactNode> = {
  PendingAcceptance: <Clock className="h-3 w-3 mr-1" />,
  Accepted: <CheckCircle className="h-3 w-3 mr-1" />,
  Completed: <CheckCircle className="h-3 w-3 mr-1" />,
  Rejected: <XCircle className="h-3 w-3 mr-1" />,
};

function getStatusBadge(status: string) {
  const meta = getTransferRequestStatusMeta(status);
  if (!meta) {
    return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
  return (
    <Badge variant={meta.variant} className={meta.badgeClassName}>
      {TRANSFER_STATUS_ICON[status]}
      {meta.label}
    </Badge>
  );
}

const TRANSFER_TYPE_LABELS: Record<string, string> = {
  Sale: "Sprzedaż",
  Donation: "Darowizna",
  Inheritance: "Dziedziczenie",
  AdministrativeCorrection: "Korekta administracyjna",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

export function TransfersList() {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState<TransferRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("incoming");

  const load = () => {
    setLoading(true);
    citizenService
      .getTransferRequests()
      .then(setTransfers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const incoming = transfers.filter((t) => t.isBuyer && t.statusName === "PendingAcceptance");
  const outgoing = transfers.filter((t) => t.isSeller);
  const completed = transfers.filter((t) => t.statusName === "Completed" || t.statusName === "Accepted" || t.statusName === "Rejected" || t.statusName === "Cancelled");

  const handleAccept = async (t: TransferRequestDto) => {
    setActionLoading(t.id);
    try {
      await citizenService.acceptTransfer(t.id);
      toast.success("Transfer zaakceptowany", {
        description: "Broń została przypisana do Twojego konta.",
      });
      load();
    } catch (err: any) {
      toast.error("Nie można zaakceptować transferu", {
        description: translateTransferError(err?.message ?? "") || (err?.message ?? "Spróbuj ponownie"),
        duration: 7000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (t: TransferRequestDto) => {
    setActionLoading(t.id);
    try {
      await citizenService.rejectTransfer(t.id);
      toast.success("Transfer odrzucony");
      load();
    } catch (err: any) {
      toast.error("Błąd odrzucenia transferu", { description: translateTransferError(err?.message ?? "") || err?.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (t: TransferRequestDto) => {
    setActionLoading(t.id);
    try {
      await citizenService.cancelTransfer(t.id);
      toast.success("Transfer anulowany", {
        description: "Broń pozostaje w Twoim rejestrze. Możesz zainicjować nowy transfer w dowolnej chwili.",
      });
      load();
    } catch (err: any) {
      toast.error("Nie można anulować transferu", { description: translateTransferError(err?.message ?? "") || err?.message });
    } finally {
      setActionLoading(null);
    }
  };

  const TransferCard = ({ t }: { t: TransferRequestDto }) => (
    <Card className="rounded-2xl border-none shadow-sm gap-0">
      <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-2">{t.firearmDescription}</h3>
              <DateStatusMeta className="mb-3" emphasizeDate statusBadge={getStatusBadge(t.statusName)}>
                Zgłoszono: {formatDate(t.createdAt)}
              </DateStatusMeta>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {t.isBuyer && t.buyerName == null && (
                  <div>
                    <span className="block">Rola:</span>
                    <span className="font-medium text-foreground">Kupujący</span>
                  </div>
                )}
                {t.isSeller && (
                  <>
                    {t.buyerName && (
                      <div>
                        <span className="block">Kupujący:</span>
                        <span className="font-medium text-foreground">{t.buyerName}</span>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <span className="block">Typ:</span>
                  <span className="font-medium text-foreground">
                    {TRANSFER_TYPE_LABELS[t.transferTypeName] ?? t.transferTypeName}
                  </span>
                </div>
                {t.transactionDate && (
                  <div className="col-span-2">
                    <DateStatusMeta>Zakończono: {formatDate(t.transactionDate)}</DateStatusMeta>
                  </div>
                )}
              </div>
            </div>
          </div>

          {t.statusName === "PendingAcceptance" && t.isBuyer && (
            <>
              <div className="bg-amber-50 rounded-xl p-3 flex gap-3 items-start border border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>Wymagana akcja:</strong> Sprzedający zainicjował transfer tej broni na Twoje konto. Sprawdź dane i zaakceptuj lub odrzuć.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl min-h-[44px]"
                  disabled={actionLoading === t.id}
                  onClick={() => handleReject(t)}
                >
                  <XCircle className="h-4 w-4 mr-2" />Odrzuć
                </Button>
                <Button
                  className="flex-1 rounded-xl min-h-[44px]"
                  disabled={actionLoading === t.id}
                  onClick={() => handleAccept(t)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {actionLoading === t.id ? "Przetwarzanie..." : "Zaakceptuj"}
                </Button>
              </div>
            </>
          )}

          {t.statusName === "PendingAcceptance" && t.isSeller && (
            <Button
              variant="outline"
              className="w-full rounded-xl min-h-[44px]"
              disabled={actionLoading === t.id}
              onClick={() => handleCancel(t)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {actionLoading === t.id ? "Anulowanie..." : "Anuluj transfer"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ label }: { label: string }) => (
    <Card className="rounded-2xl border-none shadow-sm">
      <CardContent className="p-12 text-center">
        <ArrowRightLeft className="h-16 w-16 mx-auto mb-4 opacity-30 text-primary" />
        <p className="text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="px-1">
          <div className="h-8 w-40 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-56 bg-muted animate-pulse rounded" />
        </div>
        {[1, 2].map((i) => <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">Transfery broni</h1>
            <p className="text-muted-foreground">Zarządzaj transferami między obywatelami</p>
          </div>
          <Button size="sm" className="rounded-xl" onClick={() => navigate("/weapons")}>
            <ArrowRightLeft className="h-4 w-4 mr-1" /> Inicjuj transfer
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <AppTabsList className="grid grid-cols-3">
          <AppTabTrigger value="incoming" label="Przychodzące" icon={Inbox} count={incoming.length} />
          <AppTabTrigger value="outgoing" label="Wychodzące" icon={ArrowUpRight} count={outgoing.length} />
          <AppTabTrigger value="completed" label="Historia" icon={History} count={completed.length} />
        </AppTabsList>

        <TabsContent value="incoming" className="space-y-4">
          {incoming.length === 0
            ? <EmptyState label="Brak oczekujących transferów" />
            : incoming.map((t) => <TransferCard key={t.id} t={t} />)}
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-4">
          {outgoing.length === 0
            ? <EmptyState label="Brak wychodzących transferów" />
            : outgoing.map((t) => <TransferCard key={t.id} t={t} />)}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completed.length === 0
            ? <EmptyState label="Brak zakończonych transferów" />
            : completed.map((t) => <TransferCard key={t.id} t={t} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
