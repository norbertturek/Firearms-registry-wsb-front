/** Camera API requires a secure context (HTTPS or localhost). */
export function isSecureCameraContext(): boolean {
  return typeof window !== "undefined" && window.isSecureContext === true;
}

export const INSECURE_CONTEXT_MESSAGE =
  "Kamera działa tylko po HTTPS. Zamiast adresu http://192.168… użyj tunelu (np. cloudflared) albo wpisz token w zakładce „Token”.";
