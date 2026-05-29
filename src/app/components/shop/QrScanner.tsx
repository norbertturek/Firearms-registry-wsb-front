import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { AlertCircle, Camera, CameraOff, Loader2 } from "lucide-react";
import { cn } from "../ui/utils";
import { mapCameraStartError } from "../../../lib/cameraErrors";
import { INSECURE_CONTEXT_MESSAGE, isSecureCameraContext } from "../../../lib/cameraAvailability";
import { releaseQrScanner } from "../../../lib/qrScannerLifecycle";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  disabled?: boolean;
  verifying?: boolean;
  className?: string;
}

type CameraPhase = "checking" | "starting" | "active" | "unavailable";

export function QrScanner({ onScan, disabled = false, verifying = false, className }: QrScannerProps) {
  const elementId = useId().replace(/:/g, "");
  const onScanRef = useRef(onScan);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerStartedRef = useRef(false);
  const lockedRef = useRef(false);
  const cameraToastShownRef = useRef(false);
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>("checking");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraHint, setCameraHint] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);

  onScanRef.current = onScan;

  const reportCameraError = (err: unknown, options?: { showToast?: boolean }) => {
    const message = mapCameraStartError(err);
    setCameraPhase("unavailable");
    setCameraError(message);
    if (options?.showToast === false || cameraToastShownRef.current) return;
    cameraToastShownRef.current = true;
    toast.error("Kamera niedostępna", {
      description: message,
      duration: 8000,
    });
  };

  const setInsecureContext = () => {
    setCameraPhase("unavailable");
    setCameraError(INSECURE_CONTEXT_MESSAGE);
  };

  useEffect(() => {
    if (disabled) return;

    let cancelled = false;
    lockedRef.current = false;
    cameraToastShownRef.current = false;
    scannerStartedRef.current = false;
    scannerRef.current = null;
    setCameraError(null);
    setCameraHint(null);
    setScanned(false);
    setCameraPhase("checking");

    const startScanner = async () => {
      if (!isSecureCameraContext()) {
        setInsecureContext();
        return;
      }

      setCameraPhase("starting");

      const scanner = new Html5Qrcode(elementId);
      if (cancelled) return;

      scannerRef.current = scanner;

      const config = { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1.0 };

      const onDecode = (decodedText: string) => {
        if (cancelled || lockedRef.current) return;
        lockedRef.current = true;
        setScanned(true);
        void Promise.resolve(scanner.pause()).catch(() => {});
        onScanRef.current(decodedText);
      };

      const tryStart = (cameraIdOrConfig: Parameters<Html5Qrcode["start"]>[0]) =>
        scanner.start(cameraIdOrConfig, config, onDecode, () => {});

      let lastError: unknown = new Error("Camera start failed");

      const attempts: Array<Parameters<Html5Qrcode["start"]>[0]> = [
        { facingMode: "environment" },
        { facingMode: "user" },
      ];

      try {
        const cameras = await Html5Qrcode.getCameras();
        for (const camera of cameras) {
          attempts.push({ deviceId: { exact: camera.id } });
        }
      } catch (err: unknown) {
        lastError = err;
      }

      for (const cameraConfig of attempts) {
        if (cancelled) return;
        try {
          await tryStart(cameraConfig);
          scannerStartedRef.current = true;
          break;
        } catch (err: unknown) {
          lastError = err;
        }
      }

      if (!scannerStartedRef.current) {
        if (cancelled) return;
        await releaseQrScanner(scanner, false);
        scannerRef.current = null;
        reportCameraError(lastError);
        return;
      }

      if (cancelled) {
        await releaseQrScanner(scanner, scannerStartedRef.current);
        scannerRef.current = null;
        scannerStartedRef.current = false;
        return;
      }

      setCameraPhase("active");

      // Some desktops expose pseudo-cameras that return a black stream.
      // If no actual video dimensions appear shortly after start, show fallback guidance.
      window.setTimeout(() => {
        if (cancelled || scannerRef.current !== scanner || !scannerStartedRef.current) return;
        const root = document.getElementById(elementId);
        const video = root?.querySelector("video");
        if (!video || video.videoWidth <= 0 || video.videoHeight <= 0) {
          setCameraHint(
            "Obraz z kamery jest niedostępny (czarny podgląd). Jeśli urządzenie nie ma fizycznej kamery, użyj zakładki Token."
          );
        }
      }, 2500);
    };

    void startScanner().catch((err: unknown) => {
      if (cancelled) return;
      const scanner = scannerRef.current;
      if (scanner) {
        void releaseQrScanner(scanner, scannerStartedRef.current).finally(() => {
          scannerRef.current = null;
          scannerStartedRef.current = false;
        });
      }
      reportCameraError(err);
    });

    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      const started = scannerStartedRef.current;
      scannerRef.current = null;
      scannerStartedRef.current = false;
      if (!instance) return;
      void releaseQrScanner(instance, started);
    };
  }, [elementId, disabled]);

  const handleScanAgain = () => {
    if (cameraPhase !== "active" || !scannerStartedRef.current) return;
    lockedRef.current = false;
    setScanned(false);
    scannerRef.current?.resume().catch(() => {});
  };

  const showViewfinder = cameraPhase === "active" && !cameraError && !scanned;
  const showChecking = cameraPhase === "checking" || cameraPhase === "starting";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative overflow-hidden rounded-2xl bg-black/90 aspect-square max-h-[min(70vw,320px)] mx-auto w-full">
        {cameraPhase !== "unavailable" && (
          <div
            id={elementId}
            className="w-full h-full [&_video]:object-cover [&_#html5-qrcode-anchor-scan-type-change]:hidden [&_span]:hidden"
          />
        )}

        {(scanned || verifying) && cameraPhase === "active" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/70 p-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <p className="text-sm font-medium text-white">
              {verifying ? "Weryfikuję promesę…" : "Kod odczytany"}
            </p>
          </div>
        )}

        {showViewfinder && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[min(65%,260px)] w-[min(65%,260px)] rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>
        )}

        {showChecking && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/95 p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {cameraPhase === "checking" ? "Przygotowanie skanera…" : "Oczekiwanie na dostęp do aparatu…"}
            </p>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/95 p-6 text-center">
            <CameraOff className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{cameraError}</p>
          </div>
        )}
      </div>

      {cameraPhase !== "unavailable" && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Camera className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Skieruj aparat na kod QR z aplikacji e-Broń obywatela. Przeglądarka poprosi o dostęp do kamery przy
            pierwszym skanowaniu.
          </p>
        </div>
      )}

      {scanned && cameraPhase === "active" && (
        <Button
          type="button"
          variant="outline"
          className="w-full min-h-[44px] rounded-xl"
          onClick={handleScanAgain}
          disabled={disabled}
        >
          Skanuj ponownie
        </Button>
      )}

      {cameraError && (
        <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-50 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Możesz wpisać token ręcznie w zakładce poniżej.</span>
        </div>
      )}

      {!cameraError && cameraHint && (
        <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-50 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{cameraHint}</span>
        </div>
      )}
    </div>
  );
}
