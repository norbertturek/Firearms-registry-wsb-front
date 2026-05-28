import type { Html5Qrcode } from "html5-qrcode";

/** Stops and clears html5-qrcode without throwing when the scanner never started. */
export async function releaseQrScanner(
  scanner: Html5Qrcode,
  started: boolean
): Promise<void> {
  if (started) {
    try {
      await scanner.stop();
    } catch {
      // Scanner may already be stopped (tab switch, race with start).
    }
  }

  try {
    await scanner.clear();
  } catch {
    // DOM node may already be gone after unmount.
  }
}
