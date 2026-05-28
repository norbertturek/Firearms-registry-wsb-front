import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsTrigger } from "../components/ui/tabs";
import { AppTabsList, embeddedTabsTriggerClass } from "../components/ui/AppTabsList";
import { cn } from "../components/ui/utils";
import { AlertCircle, ShieldCheck, CheckCircle, XCircle, QrCode, RotateCcw, Camera, Hash } from "lucide-react";
import { toast } from "sonner";
import { ReviewCollapsibleCard } from "../components/wpa/ReviewCollapsibleCard";
import { applicationSectionIcon } from "../components/wpa/ApplicationDetailField";
import { shopService, translateVerifyMessage } from "../../services/shopService";
import type { FirearmCategory, VerifyPermitResponse } from "../../types/api";
import { QrScanner } from "../components/shop/QrScanner";
import { parseScannedPromesaCode } from "../../lib/promesaQr";
import { getApiErrorMessage } from "../../lib/apiErrors";
import { useShopVerifiedContext } from "../../lib/shopFlowContext";

type VerifyMode = "scan" | "qr" | "number";
const CollapsibleCard: any = ReviewCollapsibleCard;

export function ShopSalePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillToken = searchParams.get("qrToken") ?? "";
  const { context, save, clear } = useShopVerifiedContext();

  const [errors, setErrors] = useState({} as Record<string, string>);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyMode, setVerifyMode] = useState("scan" as VerifyMode);
  const [promiseNumber, setPromiseNumber] = useState("");
  const [verifiedQrToken, setVerifiedQrToken] = useState(prefillToken || context?.qrToken || "");
  const [verification, setVerification] = useState(null as VerifyPermitResponse | null);

  const [formData, setFormData] = useState({
    qrToken: prefillToken || context?.qrToken || "",
    brand: "",
    model: "",
    category: "B" as FirearmCategory,
    caliber: "",
    serialNumber: "",
    productionYear: "",
  });

  const runVerify = useCallback(async (payload: { qrToken?: string; promiseNumber?: string }) => {
    if (!payload.qrToken && !payload.promiseNumber) {
      setErrors({ qrToken: "Wprowadź token QR lub numer promesy" });
      return;
    }

    setVerifying(true);
    setErrors({});

    try {
      const result = await shopService.verifyPermit(
        payload.qrToken ? { qrToken: payload.qrToken } : { promiseNumber: payload.promiseNumber! },
      );
      setVerification(result);

      if (!result.isValid) {
        setVerifiedQrToken("");
        clear();
        toast.error("Promesa nieważna", { description: translateVerifyMessage(result.message) });
        return;
      }

      if (payload.qrToken) {
        setVerifiedQrToken(payload.qrToken);
        save({
          qrToken: payload.qrToken,
          verifiedAt: new Date().toISOString(),
          result,
        });
        toast.success("Promesa zweryfikowana", { description: translateVerifyMessage(result.message) });
        return;
      }

      setVerifiedQrToken("");
      clear();
      toast.info("Promesa sprawdzona po numerze", {
        description: "Aby zarejestrować sprzedaż, zeskanuj pełny kod QR obywatela.",
      });
    } catch (err: unknown) {
      const message = getApiErrorMessage(err);
      setVerifiedQrToken("");
      clear();
      toast.error("Błąd weryfikacji", { description: message });
    } finally {
      setVerifying(false);
    }
  }, [clear, save]);

  useEffect(() => {
    if (prefillToken) {
      setFormData((f) => ({ ...f, qrToken: prefillToken }));
      void runVerify({ qrToken: prefillToken });
      return;
    }
    if (context?.result?.isValid) {
      setFormData((f) => ({ ...f, qrToken: context.qrToken }));
      setVerifiedQrToken(context.qrToken);
      setVerification(context.result);
    }
  }, [prefillToken, runVerify, context]);

  const promesaVerified = verification?.isValid === true && Boolean(verifiedQrToken);
  const firearmSectionLocked = !promesaVerified;

  const handleResetVerification = () => {
    setVerification(null);
    setVerifiedQrToken("");
    setPromiseNumber("");
    setVerifyMode("scan");
    setFormData((f) => ({ ...f, qrToken: "" }));
    setErrors({});
    clear();
  };

  const handleScanned = (raw: string) => {
    const parsed = parseScannedPromesaCode(raw);
    if (parsed.qrToken) {
      setVerifyMode("scan");
      setFormData((f) => ({ ...f, qrToken: parsed.qrToken! }));
      void runVerify({ qrToken: parsed.qrToken });
      return;
    }
    if (parsed.promiseNumber) {
      setVerifyMode("number");
      setPromiseNumber(parsed.promiseNumber);
      void runVerify({ promiseNumber: parsed.promiseNumber });
      return;
    }
    toast.error("Nierozpoznany kod", { description: "Użyj kodu z aplikacji e-Broń." });
  };

  const handleVerifyClick = () => {
    if (verifyMode === "number") {
      if (!promiseNumber) {
        setErrors({ promiseNumber: "Wprowadź numer promesy" });
        return;
      }
      void runVerify({ promiseNumber });
      return;
    }
    if (!formData.qrToken) {
      setErrors({ qrToken: "Wprowadź token QR" });
      return;
    }
    void runVerify({ qrToken: formData.qrToken });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.qrToken) newErrors.qrToken = "Wymagany";
    if (!formData.brand) newErrors.brand = "Wymagane";
    if (!formData.model) newErrors.model = "Wymagane";
    if (!formData.category) newErrors.category = "Wymagane";
    if (!formData.caliber) newErrors.caliber = "Wymagane";
    if (!formData.serialNumber) newErrors.serialNumber = "Wymagane";
    if (!formData.productionYear) newErrors.productionYear = "Wymagany";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await shopService.registerSale({
        qrToken: formData.qrToken,
        brand: formData.brand,
        model: formData.model,
        category: formData.category,
        caliber: formData.caliber,
        serialNumber: formData.serialNumber,
        productionYear: parseInt(formData.productionYear, 10),
      });

      toast.success("Broń zarejestrowana", {
        description: `Nr rejestracji: ${response.registrationNumber ?? "(brak)"}. ${response.message ?? ""}`,
        duration: 6000,
      });
      clear();
      navigate("/shop");
    } catch (err: unknown) {
      const message = getApiErrorMessage(err);
      toast.error("Błąd rejestracji sprzedaży", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">Zarejestruj sprzedaż</h1>
        <p className="text-muted-foreground">
          {promesaVerified
            ? "Promesa potwierdzona — uzupełnij dane sprzedawanej broni."
            : "Zeskanuj kod QR obywatela, zweryfikuj promesę i uzupełnij dane broni."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <CollapsibleCard
          title="1. Weryfikacja promesy"
          description={
            promesaVerified
              ? "Kod QR został już odczytany i zweryfikowany."
              : "Skanuj QR (zalecane), użyj tokenu lub numeru promesy jako fallback."
          }
          defaultOpen
          priority={!promesaVerified}
          icon={applicationSectionIcon(<QrCode className="h-5 w-5" />)}
        >
          <div className="space-y-3">
            {!promesaVerified && (
              <Tabs
                value={verifyMode}
                onValueChange={(value) => {
                  setVerifyMode(value as VerifyMode);
                  setErrors({});
                }}
                className="space-y-4"
              >
                <AppTabsList embedded className="grid grid-cols-3">
                  <TabsTrigger
                    value="scan"
                    className={cn("flex items-center gap-1.5 text-xs sm:text-sm", embeddedTabsTriggerClass)}
                  >
                    <Camera className="h-4 w-4 shrink-0" />
                    Skanuj
                  </TabsTrigger>
                  <TabsTrigger
                    value="qr"
                    className={cn("flex items-center gap-1.5 text-xs sm:text-sm", embeddedTabsTriggerClass)}
                  >
                    <QrCode className="h-4 w-4 shrink-0" />
                    Token
                  </TabsTrigger>
                  <TabsTrigger
                    value="number"
                    className={cn("flex items-center gap-1.5 text-xs sm:text-sm", embeddedTabsTriggerClass)}
                  >
                    <Hash className="h-4 w-4 shrink-0" />
                    Numer
                  </TabsTrigger>
                </AppTabsList>

                <TabsContent value="scan" className="mt-0 space-y-2">
                  <QrScanner onScan={handleScanned} disabled={verifying || submitting} verifying={verifying} />
                </TabsContent>

                <TabsContent value="qr" className="mt-0 space-y-2">
                  <Label htmlFor="qrToken" className="font-semibold text-sm">
                    Token QR <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="qrToken"
                    value={formData.qrToken}
                    onChange={(e) => setFormData({ ...formData, qrToken: e.target.value })}
                    className="min-h-[52px]"
                    placeholder="Wklej zeskanowany token..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Token pozwala zweryfikować i od razu przejść do rejestracji sprzedaży.
                  </p>
                </TabsContent>

                <TabsContent value="number" className="mt-0 space-y-2">
                  <Label htmlFor="promiseNumber" className="font-semibold text-sm">
                    Numer promesy <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="promiseNumber"
                    value={promiseNumber}
                    onChange={(e) => setPromiseNumber(e.target.value)}
                    className="min-h-[52px]"
                    placeholder="PROM-YYYYMMDD-XXXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground">
                    Po numerze sprawdzisz status promesy, ale sprzedaż wymaga pełnego kodu QR.
                  </p>
                </TabsContent>

                {verifyMode !== "scan" && (
                  <Button
                    type="button"
                    onClick={handleVerifyClick}
                    disabled={verifying || submitting}
                    className="min-h-[52px] rounded-xl w-full"
                  >
                    {verifying ? "Sprawdzam..." : "Sprawdź"}
                  </Button>
                )}
              </Tabs>
            )}

            {errors.qrToken && (
              <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errors.qrToken}
              </p>
            )}
            {errors.promiseNumber && (
              <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errors.promiseNumber}
              </p>
            )}

            {verification && (
              <div className={`rounded-xl p-3 text-xs ${verification.isValid ? "bg-emerald-100 text-emerald-900" : "bg-red-100 text-red-900"}`}>
                <div className="flex items-center gap-2 mb-1 font-semibold">
                  {verification.isValid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {verification.isValid ? "Promesa ważna" : "Promesa nieważna"}
                </div>
                <p>{translateVerifyMessage(verification.message)}</p>
                {verification.isValid && (
                  <div className="mt-2 space-y-1">
                    <p><strong>Nabywca:</strong> {verification.citizenName}</p>
                    <p><strong>Pozwolenie:</strong> {verification.permitNumber} ({verification.permitType})</p>
                    <p><strong>Dopuszczalna broń:</strong> {verification.weaponType}</p>
                    <p><strong>Pozostała ilość:</strong> {verification.remainingPromiseQuantity} • Wolne sloty: {verification.availableSlots}</p>
                    <p><strong>Badania:</strong> {verification.medicalExamsValid ? "aktualne" : "wygasły"}</p>
                  </div>
                )}
              </div>
            )}

            {promesaVerified && (
              <Button
                type="button"
                variant="outline"
                onClick={handleResetVerification}
                disabled={submitting}
                className="w-full min-h-[44px] rounded-xl"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Zeskanuj inną promesę
              </Button>
            )}
          </div>
        </CollapsibleCard>

        <CollapsibleCard
          title="2. Dane zbywanej broni"
          description={
            firearmSectionLocked
              ? "Najpierw zweryfikuj promesę kodem QR. Sekcja jest zablokowana."
              : "Dane z faktury/certyfikatu. Aktywne po pozytywnej weryfikacji promesy."
          }
          defaultOpen={promesaVerified}
          priority={promesaVerified}
          locked={firearmSectionLocked}
          icon={applicationSectionIcon(<ShieldCheck className="h-5 w-5" />)}
          className={firearmSectionLocked ? "opacity-75" : ""}
        >
          {firearmSectionLocked && (
            <div className="mb-3 bg-amber-50 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Dane broni odblokują się dopiero po pozytywnej weryfikacji promesy pełnym kodem QR.</span>
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand" className="font-semibold text-sm">Producent <span className="text-red-600">*</span></Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  disabled={firearmSectionLocked}
                  className="min-h-[52px] mt-1.5 rounded-xl text-base"
                  placeholder="Glock"
                />
                {errors.brand && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.brand}</p>}
              </div>

              <div>
                <Label htmlFor="model" className="font-semibold text-sm">Model <span className="text-red-600">*</span></Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  disabled={firearmSectionLocked}
                  className="min-h-[52px] mt-1.5 rounded-xl text-base"
                  placeholder="17 Gen 5"
                />
                {errors.model && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.model}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category" className="font-semibold text-sm">Kategoria <span className="text-red-600">*</span></Label>
                <Select
                  value={formData.category}
                  disabled={firearmSectionLocked}
                  onValueChange={(value) => setFormData({ ...formData, category: value as FirearmCategory })}
                >
                  <SelectTrigger id="category" className="min-h-[52px] mt-1.5 rounded-xl text-base">
                    <SelectValue placeholder="Kategoria" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="A">Kat. A</SelectItem>
                    <SelectItem value="B">Kat. B</SelectItem>
                    <SelectItem value="C">Kat. C</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.category}</p>}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="caliber" className="font-semibold text-sm">Kaliber <span className="text-red-600">*</span></Label>
                <Input
                  id="caliber"
                  value={formData.caliber}
                  onChange={(e) => setFormData({ ...formData, caliber: e.target.value })}
                  disabled={firearmSectionLocked}
                  className="min-h-[52px] mt-1.5 rounded-xl text-base"
                  placeholder="9x19mm"
                />
                {errors.caliber && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.caliber}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serialNumber" className="font-semibold text-sm">Nr seryjny <span className="text-red-600">*</span></Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  disabled={firearmSectionLocked}
                  className="min-h-[52px] mt-1.5 uppercase"
                  placeholder="SN-123456"
                />
                {errors.serialNumber && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.serialNumber}</p>}
              </div>

              <div>
                <Label htmlFor="productionYear" className="font-semibold text-sm">Rok produkcji <span className="text-red-600">*</span></Label>
                <Input
                  id="productionYear"
                  type="number"
                  value={formData.productionYear}
                  onChange={(e) => setFormData({ ...formData, productionYear: e.target.value })}
                  disabled={firearmSectionLocked}
                  className="min-h-[52px] mt-1.5 rounded-xl text-base"
                  placeholder="2024"
                  min="1900"
                  max={new Date().getFullYear()}
                />
                {errors.productionYear && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{errors.productionYear}</p>}
              </div>
            </div>
          </div>
        </CollapsibleCard>

        {verification?.isValid && !promesaVerified && (
          <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Promesa sprawdzona po numerze. Aby sprzedać broń, zeskanuj pełny kod QR obywatela.</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting || !promesaVerified}
          className="w-full min-h-[52px] rounded-xl text-base font-semibold"
        >
          {submitting ? "Rejestrowanie..." : "Zatwierdź i zgłoś sprzedaż"}
        </Button>
      </form>
    </div>
  );
}
