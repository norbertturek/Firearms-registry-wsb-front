import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, QrCode } from "lucide-react";
import { citizenService } from "../../services/citizenService";
import type { PromiseDto } from "../../types/api";
import { PromiseQrModal } from "../components/citizen/PromiseQrModal";
import { DateStatusMeta } from "../components/DateStatusMeta";
import { CITIZEN_LIST_CARD_CONTENT_CLASS } from "../utils/citizenCardUi";
import { getPromiseStatusMeta } from "../../lib/statusUi";

const STATUS_ICON: Record<string, ReactNode> = {
  Active: <CheckCircle className="h-3 w-3 mr-1" />,
  Used: <CheckCircle className="h-3 w-3 mr-1" />,
  Expired: <XCircle className="h-3 w-3 mr-1" />,
};

function getStatusBadge(status: string) {
  const meta = getPromiseStatusMeta(status);
  if (!meta) {
    return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
  return (
    <Badge variant={meta.variant} className={meta.badgeClassName}>
      {STATUS_ICON[status]}
      {meta.label}
    </Badge>
  );
}

function daysUntil(dateStr: string | null): number {
  if (!dateStr) return 0;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 3600 * 24));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

export function PromisesView() {
  const navigate = useNavigate();
  const [promises, setPromises] = useState<PromiseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    citizenService
      .getPromises()
      .then(setPromises)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selected = promises.find((p) => p.id === selectedId) ?? null;

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="px-1">
          <div className="h-8 w-40 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        {[1, 2].map((i) => <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">Moje e-Promesy</h1>
        <p className="text-muted-foreground">Aktywne promesy na zakup broni z kodami QR</p>
      </div>

      {promises.length === 0 ? (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-12 text-center">
            <QrCode className="h-16 w-16 mx-auto mb-4 opacity-30 text-primary" />
            <p className="text-muted-foreground mb-4">Nie masz żadnych promes</p>
            <Button onClick={() => navigate("/applications/new/promise")} className="min-h-[44px] rounded-xl">
              Złóż wniosek o promesę
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {promises.map((promise) => {
            const daysLeft = daysUntil(promise.expiryDate);
            const isExpiringSoon = daysLeft > 0 && daysLeft <= 14;
            const isActive = promise.statusName === "Active" || promise.statusName === "Approved";

            return (
              <Card
                key={promise.id}
                className={`rounded-2xl border-none shadow-sm gap-0 transition-all ${selectedId === promise.id ? "ring-2 ring-primary" : ""}`}
              >
                <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-foreground mb-2">{promise.weaponType}</h3>
                      <DateStatusMeta
                        className="mb-3"
                        emphasizeDate
                        statusBadge={getStatusBadge(promise.statusName)}
                      >
                        <span className={isExpiringSoon ? "text-orange-600" : undefined}>
                          Ważne do: {formatDate(promise.expiryDate)}
                          {daysLeft > 0 && ` (${daysLeft} dni)`}
                        </span>
                      </DateStatusMeta>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="block">Nr promesy:</span>
                          <span className="font-mono text-foreground">{promise.promiseNumber}</span>
                        </div>
                        <div>
                          <span className="block">Ilość:</span>
                          <span className="font-medium text-foreground">{promise.remainingQuantity} / {promise.quantity}</span>
                        </div>
                        <div className="col-span-2">
                          <DateStatusMeta>Wydano: {formatDate(promise.issueDate)}</DateStatusMeta>
                        </div>
                      </div>

                      {isExpiringSoon && isActive && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span className="font-medium">Promesa wygasa za {daysLeft} dni!</span>
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <div className="flex flex-col items-center gap-2">
                        <Button
                          variant={selectedId === promise.id ? "default" : "outline"}
                          size="sm"
                          className="rounded-xl px-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(selectedId === promise.id ? null : promise.id);
                          }}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Pokaż kod QR
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <PromiseQrModal
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        promiseData={selected}
      />
    </div>
  );
}
