import QRCode from "react-qr-code";
import { Clock, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import type { PromiseDto } from "../../../types/api";

interface PromiseQrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promiseData: PromiseDto | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

function fallbackCopy(text: string): boolean {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;left:-9999px;top:-9999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}

export function PromiseQrModal({ open, onOpenChange, promiseData }: PromiseQrModalProps) {
  if (!promiseData || !promiseData.qrToken) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(promiseData.qrToken!);
      } else if (!fallbackCopy(promiseData.qrToken!)) {
        throw new Error("copy-failed");
      }
      toast.success("Token skopiowany do schowka");
    } catch {
      toast.error("Nie udało się skopiować. Skopiuj ręcznie.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl p-0 overflow-hidden sm:max-w-xl w-[calc(100vw-1.5rem)] max-h-[92vh] border-none shadow-xl bg-white [&>button]:hidden flex flex-col">
        <div className="relative z-10 sticky top-0 bg-gradient-to-br from-[#0069e8] via-[#008cf0] to-[#00a6e8] p-6 text-center text-white shrink-0">
          <DialogClose
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label="Zamknij okno kodu QR"
          >
            <X className="h-5 w-5" />
          </DialogClose>
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold">Kod QR e-Promesy</DialogTitle>
            <DialogDescription className="text-white/80">
              Pokaż ten kod w sklepie podczas zakupu broni
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 overflow-y-auto bg-white flex-1 min-h-0">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-background p-6 rounded-2xl shadow-sm border border-border">
              <QRCode value={promiseData.qrToken} size={200} level="H" />
            </div>

            <div className="w-full bg-card rounded-2xl p-4 space-y-2 text-sm shadow-sm border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Numer promesy:</span>
                <span className="font-mono font-semibold">{promiseData.promiseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Typ broni:</span>
                <span className="font-medium">{promiseData.weaponType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ilość:</span>
                <span className="font-semibold">{promiseData.remainingQuantity} / {promiseData.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ważna do:</span>
                <span className="font-semibold">{formatDate(promiseData.expiryDate)}</span>
              </div>
            </div>

            <div className="w-full">
              <Label className="text-xs text-muted-foreground mb-2 block">Token (opcjonalne wpisanie ręczne)</Label>
              <div className="flex gap-2">
                <Input
                  value={promiseData.qrToken}
                  readOnly
                  className="font-mono text-xs bg-background rounded-xl border-border min-h-[44px]"
                />
                <Button variant="outline" size="icon" onClick={() => void handleCopy()} className="shrink-0 rounded-xl min-h-[44px] min-w-[44px]">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card className="w-full bg-blue-50/60 border-none rounded-2xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-3 text-sm text-blue-900">
                  <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Ważne informacje</p>
                    <ul className="text-blue-700 space-y-1 text-xs list-disc list-inside">
                      <li>Kod QR jest unikalny dla tej promesy</li>
                      <li>Sklep zeskanuje kod przed sprzedażą</li>
                      <li>Po wykorzystaniu broń pojawi się w Twoim rejestrze</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="button"
              className="w-full min-h-[44px] rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Zamknij
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
