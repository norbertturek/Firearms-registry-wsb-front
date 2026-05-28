import type { PromiseApplicationDto, PromiseDto } from "../types/api";

type PromiseApplicationLike = Pick<
  PromiseApplicationDto,
  "statusName" | "requestedWeaponType" | "requestedQuantity"
>;

export interface PromiseQrMatchResult {
  issuedPromise: PromiseDto | null;
  canOpenQrModal: boolean;
  showPendingFallback: boolean;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function hasUsablePromiseStatus(statusName: string) {
  return statusName === "Active" || statusName === "Approved";
}

/** Match only when weapon type matches; quantity breaks ties. QR token is not a match signal. */
function scoreMatch(application: PromiseApplicationLike, promise: PromiseDto) {
  if (normalize(promise.weaponType) !== normalize(application.requestedWeaponType)) {
    return 0;
  }
  let score = 3;
  if (promise.quantity === application.requestedQuantity) score += 2;
  return score;
}

export function findIssuedPromiseForApplication(
  application: PromiseApplicationLike,
  issuedPromises: PromiseDto[],
): PromiseDto | null {
  const candidates = issuedPromises
    .filter((promise) => hasUsablePromiseStatus(promise.statusName))
    .map((promise) => ({
      promise,
      score: scoreMatch(application, promise),
      issueDate: promise.issueDate ? new Date(promise.issueDate).getTime() : 0,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.issueDate - a.issueDate;
    });

  return candidates[0]?.promise ?? null;
}

export function getPromiseQrMatchResult(
  application: PromiseApplicationLike,
  issuedPromises: PromiseDto[],
): PromiseQrMatchResult {
  if (application.statusName !== "Approved") {
    return {
      issuedPromise: null,
      canOpenQrModal: false,
      showPendingFallback: false,
    };
  }

  const issuedPromise = findIssuedPromiseForApplication(application, issuedPromises);
  const canOpenQrModal = Boolean(issuedPromise?.qrToken);
  const showPendingFallback = !canOpenQrModal;

  return {
    issuedPromise,
    canOpenQrModal,
    showPendingFallback,
  };
}

export function getPromiseQrUnavailableMessage(statusName: string) {
  if (statusName === "Rejected") {
    return "Wniosek został odrzucony — promesa z kodem QR nie zostanie wydana.";
  }
  if (statusName === "Approved") {
    return "Kod QR promesy będzie dostępny po wydaniu aktywnej promesy.";
  }
  return "Kod QR promesy będzie dostępny po zatwierdzeniu wniosku przez WPA i wydaniu promesy.";
}
