/** Matches backend promise numbers, e.g. PROM-20240515-DEMO0001 */
const PROMISE_NUMBER_RE = /^PROM-\d{8}-[A-Z0-9]+$/i;

export interface ParsedPromesaScan {
  qrToken?: string;
  promiseNumber?: string;
}

/**
 * Normalizes raw QR / barcode text from the citizen app or manual entry.
 * Citizen QR encodes `qrToken`; optional future payloads may include JSON or URIs.
 */
export function parseScannedPromesaCode(raw: string): ParsedPromesaScan {
  const trimmed = raw.trim();
  if (!trimmed) return {};

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as {
        t?: string;
        n?: string;
        qrToken?: string;
        promiseNumber?: string;
      };
      const qrToken = parsed.t ?? parsed.qrToken;
      const promiseNumber = parsed.n ?? parsed.promiseNumber;
      return {
        ...(qrToken ? { qrToken: qrToken.trim() } : {}),
        ...(promiseNumber ? { promiseNumber: promiseNumber.trim().toUpperCase() } : {}),
      };
    } catch {
      /* fall through */
    }
  }

  const uriMatch = trimmed.match(/ebron:\/\/promesa\/(.+)/i);
  if (uriMatch) {
    const id = uriMatch[1].trim();
    if (PROMISE_NUMBER_RE.test(id)) return { promiseNumber: id.toUpperCase() };
    return { qrToken: id };
  }

  if (PROMISE_NUMBER_RE.test(trimmed)) {
    return { promiseNumber: trimmed.toUpperCase() };
  }

  return { qrToken: trimmed };
}
