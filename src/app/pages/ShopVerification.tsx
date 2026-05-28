import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsTrigger } from "../components/ui/tabs";
import { AppTabsList } from "../components/ui/AppTabsList";
import {
  AlertCircle,
  CheckCircle,
  Search,
  FileText,
  XCircle,
  FileCheck,
  Info,
  QrCode,
  Hash,
  Camera,
  RotateCcw,
} from "lucide-react";
import { Separator } from "../components/ui/separator";
import { shopService, translateVerifyMessage } from "../../services/shopService";
import type { VerifyPermitResponse } from "../../types/api";
import { QrScanner } from "../components/shop/QrScanner";
import { parseScannedPromesaCode } from "../../lib/promesaQr";
import { getApiErrorMessage } from "../../lib/apiErrors";
import { useShopVerifiedContext } from "../../lib/shopFlowContext";
import { toast } from "sonner";

type InputMode = "scan" | "qr" | "number";

export function ShopVerification() {
  const navigate = useNavigate();
  const { context, hasContext, save, clear } = useShopVerifiedContext();
  const [mode, setMode] = useState<InputMode>("scan");
  const [qrToken, setQrToken] = useState("");
  const [promiseNumber, setPromiseNumber] = useState("");
  const [verifiedQrToken, setVerifiedQrToken] = useState("");
  const [result, setResult] = useState<VerifyPermitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!context) return;
    setMode("scan");
    setQrToken(context.qrToken);
    setVerifiedQrToken(context.qrToken);
    setResult(context.result);
  }, [context]);

  const runVerify = useCallback(async (payload: { qrToken?: string; promiseNumber?: string }) => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const r = await shopService.verifyPermit(
        payload.qrToken ? { qrToken: payload.qrToken } : { promiseNumber: payload.promiseNumber! }
      );
      setResult(r);
      if (payload.qrToken) {
        setVerifiedQrToken(payload.qrToken);
        if (r.isValid) {
          save({
            qrToken: payload.qrToken,
            verifiedAt: new Date().toISOString(),
            result: r,
          });
        }
      } else {
        setVerifiedQrToken("");
        clear();
      }
      if (r.isValid) {
        toast.success("Promesa zweryfikowana", { description: translateVerifyMessage(r.message) });
      } else {
        toast.error("Promesa nieważna", { description: translateVerifyMessage(r.message) });
      }
    } catch (err: unknown) {
      const message = getApiErrorMessage(err);
      setError(message);
      setVerifiedQrToken("");
      clear();
      toast.error("Błąd weryfikacji", { description: message, duration: 10000 });
    } finally {
      setLoading(false);
    }
  }, [clear, save]);

  const handleScanned = useCallback(
    (raw: string) => {
      const parsed = parseScannedPromesaCode(raw);

      if (parsed.qrToken) {
        setMode("scan");
        setQrToken(parsed.qrToken);
        void runVerify({ qrToken: parsed.qrToken });
        return;
      }

      if (parsed.promiseNumber) {
        setMode("number");
        setPromiseNumber(parsed.promiseNumber);
        void runVerify({ promiseNumber: parsed.promiseNumber });
        toast.info("Odczytano numer promesy", {
          description: "Sprzedaż wymaga pełnego kodu QR z aplikacji obywatela.",
        });
        return;
      }

      const msg = "Nierozpoznany kod QR. Użyj kodu z aplikacji e-Broń.";
      setError(msg);
      toast.error("Nierozpoznany kod", { description: msg });
    },
    [runVerify]
  );

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const value = mode === "number" ? promiseNumber : qrToken;
    if (!value) {
      setError(mode === "number" ? "Wprowadź numer promesy" : "Wprowadź token QR");
      return;
    }

    if (mode === "number") {
      await runVerify({ promiseNumber: value });
    } else {
      await runVerify({ qrToken: value });
    }
  };

  const hasVerificationResult = result !== null || hasContext;

  const handleReset = () => {
    setResult(null);
    setError("");
    setVerifiedQrToken("");
    setQrToken("");
    setPromiseNumber("");
    setMode("scan");
    clear();
  };

  const canStartSale =
    result?.isValid &&
    !!verifiedQrToken &&
    result.medicalExamsValid &&
    result.remainingPromiseQuantity > 0 &&
    result.availableSlots > 0;

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">Sprawdź promesę</h1>
        <p className="text-muted-foreground">
          {hasVerificationResult
            ? "Promesa zweryfikowana — możesz przejść do sprzedaży lub sprawdzić inną promesę."
            : "Zeskanuj kod QR obywatela lub wpisz dane ręcznie. Sprzedaż wymaga poprawnej weryfikacji po tokenie QR."}
        </p>
      </div>

      {!hasVerificationResult && (
      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v as InputMode);
          setError("");
        }}
        className="mb-6 space-y-4"
      >
        <AppTabsList className="grid grid-cols-3">
          <TabsTrigger value="scan" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Camera className="h-4 w-4 shrink-0" />
            Skanuj
          </TabsTrigger>
          <TabsTrigger value="qr" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <QrCode className="h-4 w-4 shrink-0" />
            Token
          </TabsTrigger>
          <TabsTrigger value="number" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Hash className="h-4 w-4 shrink-0" />
            Numer
          </TabsTrigger>
        </AppTabsList>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="pt-5">
            <TabsContent value="scan" className="mt-0 space-y-3">
              <QrScanner onScan={handleScanned} disabled={loading} verifying={loading} />
              {loading && (
                <p className="text-sm text-center text-primary font-medium animate-pulse">Weryfikuję promesę…</p>
              )}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </TabsContent>

            <form onSubmit={handleVerify} className="space-y-3">
              <TabsContent value="qr" className="mt-0">
                <Label htmlFor="qrToken" className="mb-2 block">
                  Token z kodu QR <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="qrToken"
                  value={qrToken}
                  onChange={(e) => setQrToken(e.target.value)}
                  placeholder="Wklej zeskanowany token..."
                  className="min-h-[44px] rounded-xl font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">Token z kodu QR jest wymagany do rejestracji sprzedaży.</p>
              </TabsContent>

              <TabsContent value="number" className="mt-0">
                <Label htmlFor="promiseNumber" className="mb-2 block">
                  Numer promesy <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="promiseNumber"
                  value={promiseNumber}
                  onChange={(e) => setPromiseNumber(e.target.value)}
                  placeholder="PROM-YYYYMMDD-XXXXXXXX"
                  className="min-h-[44px] rounded-xl font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Po numerze możesz tylko sprawdzić promesę — sprzedaż wymaga zeskanowania pełnego kodu QR.
                </p>
              </TabsContent>

              {mode !== "scan" && (
                <>
                  <Button type="submit" disabled={loading} className="w-full min-h-[52px] rounded-xl text-base font-semibold">
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? "Sprawdzam..." : "Sprawdź"}
                  </Button>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </Tabs>
      )}

      {hasVerificationResult && (
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="mb-4 w-full min-h-[44px] rounded-xl"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Sprawdź inną promesę
        </Button>
      )}

      {result && !result.isValid && (
        <Card className="mb-6 rounded-2xl border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">Jak działa e-Promesa</p>
                <p>
                  Promesa zezwala na zakup <strong>określonej liczby egzemplarzy</strong> broni. Każda transakcja wykorzystuje 1
                  slot.
                </p>
                <p>
                  Po wykorzystaniu wszystkich sztuk promesa ma status <code className="text-foreground">Used</code> — potrzebny
                  jest nowy wniosek.
                </p>
                <p>
                  Ważność promesy w systemie: 3 miesiące od wydania (status <code className="text-foreground">Expired</code> po
                  terminie).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className={`mb-6 rounded-2xl border-2 shadow-sm ${result.isValid ? "border-emerald-300" : "border-red-300"}`}>
          <CardHeader className={result.isValid ? "bg-emerald-50/50 rounded-t-2xl" : "bg-red-50/50 rounded-t-2xl"}>
            <div className="flex items-center gap-3">
              {result.isValid ? (
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <div>
                <CardTitle className={result.isValid ? "text-emerald-900" : "text-red-900"}>
                  {result.isValid ? "Promesa aktywna" : "Promesa nieważna"}
                </CardTitle>
                <CardDescription className={result.isValid ? "text-emerald-700" : "text-red-700"}>
                  {translateVerifyMessage(result.message)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          {result.isValid && (
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <FileText className="h-5 w-5 text-primary" />
                  Dane promesy
                </h3>
                <div className="bg-muted/30 p-4 rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Dopuszczalna broń:</span>
                    <span className="font-medium text-right">{result.weaponType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pozostała ilość:</span>
                    <Badge
                      className={`${result.remainingPromiseQuantity > 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"} hover:bg-current border-none`}
                    >
                      {result.remainingPromiseQuantity}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Numer pozwolenia:</span>
                    <span className="font-medium font-mono">{result.permitNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Typ pozwolenia:</span>
                    <span className="font-medium">{result.permitType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dostępne sloty:</span>
                    <span className={`font-medium ${result.availableSlots > 0 ? "text-emerald-700" : "text-red-700"}`}>
                      {result.availableSlots}
                    </span>
                  </div>
                  {result.promiseExpiryDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wygasa:</span>
                      <span className="font-medium">
                        {new Date(result.promiseExpiryDate).toLocaleDateString("pl-PL")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Badania:</span>
                    {result.medicalExamsValid ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Aktualne</Badge>
                    ) : (
                      <Badge variant="destructive">Nieaktualne</Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 font-semibold">Nabywca</h3>
                <div className="bg-muted/30 p-4 rounded-xl">
                  <p className="font-medium">{result.citizenName}</p>
                </div>
              </div>

              <Separator />

              {canStartSale ? (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="mb-2 text-blue-900 font-semibold">Można przystąpić do sprzedaży</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Wszystkie wymagania są spełnione. Możesz teraz wprowadzić dane sprzedawanej broni.
                  </p>
                  <Button
                    onClick={() => navigate(`/shop/sale?qrToken=${encodeURIComponent(verifiedQrToken)}`)}
                    className="min-h-[44px] w-full rounded-xl"
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Zarejestruj sprzedaż na tej promesie
                  </Button>
                </div>
              ) : (
                <div className="bg-amber-50 p-4 rounded-xl text-sm text-amber-900">
                  {!verifiedQrToken ? (
                    <p>Aby zarejestrować sprzedaż zeskanuj pełny kod QR z aplikacji obywatela (nie sam numer promesy).</p>
                  ) : !result.medicalExamsValid ? (
                    <p>Badania medyczne obywatela nie są aktualne — sprzedaż zostanie odrzucona przez system.</p>
                  ) : result.remainingPromiseQuantity <= 0 ? (
                    <p>Promesa jest w całości wykorzystana.</p>
                  ) : result.availableSlots <= 0 ? (
                    <p>Brak wolnych slotów w pozwoleniu nabywcy.</p>
                  ) : (
                    <p>Sprzedaż nie może być zarejestrowana.</p>
                  )}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
