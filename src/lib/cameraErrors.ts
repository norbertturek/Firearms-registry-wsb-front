import { INSECURE_CONTEXT_MESSAGE, isSecureCameraContext } from "./cameraAvailability";

function errorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "";
}

/**
 * Maps browser MediaDevices / html5-qrcode errors to user-facing Polish messages.
 */
export function mapCameraStartError(err: unknown): string {
  if (!isSecureCameraContext()) {
    return INSECURE_CONTEXT_MESSAGE;
  }

  const msg = errorMessage(err).toLowerCase();

  if (err instanceof DOMException) {
    switch (err.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return "Brak dostępu do aparatu. Zezwól na kamerę w ustawieniach przeglądarki lub systemu (ikona przy pasku adresu), potem odśwież stronę.";
      case "NotFoundError":
      case "DevicesNotFoundError":
        return "Nie wykryto kamery. Wpisz token promesy ręcznie w zakładce „Token”.";
      case "NotReadableError":
      case "TrackStartError":
        return "Kamera jest zajęta przez inną aplikację. Zamknij ją i odśwież stronę.";
      case "OverconstrainedError":
      case "ConstraintNotSatisfiedError":
        return "Ta kamera nie obsługuje wymaganego trybu. Spróbuj ponownie lub wpisz token ręcznie.";
      case "SecurityError":
        return INSECURE_CONTEXT_MESSAGE;
      default:
        break;
    }
  }

  if (
    msg.includes("notallowed") ||
    msg.includes("permission denied") ||
    msg.includes("permissiondenied") ||
    msg.includes("not allowed")
  ) {
    return "Brak dostępu do aparatu. Zezwól na kamerę w ustawieniach przeglądarki lub systemu, potem odśwież stronę.";
  }

  if (msg.includes("notfound") || msg.includes("no device") || msg.includes("devices not found")) {
    return "Nie wykryto kamery. Wpisz token promesy ręcznie w zakładce „Token”.";
  }

  if (msg.includes("not readable") || msg.includes("in use")) {
    return "Kamera jest zajęta przez inną aplikację. Zamknij ją i spróbuj ponownie.";
  }

  if (
    msg.includes("secure") ||
    msg.includes("https") ||
    msg.includes("secure context") ||
    msg.includes("only supported")
  ) {
    return INSECURE_CONTEXT_MESSAGE;
  }

  return "Nie udało się uruchomić aparatu. Zezwól na dostęp do kamery po monicie przeglądarki lub wpisz token ręcznie.";
}
