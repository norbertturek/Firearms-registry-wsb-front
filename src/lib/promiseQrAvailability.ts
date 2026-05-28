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

function scoreMatch(application: PromiseApplicationLike, promise: PromiseDto) {
  let score = 0;
  if (normalize(promise.weaponType) === normalize(application.requestedWeaponType)) score += 3;
  if (promise.quantity === application.requestedQuantity) score += 2;
  if (promise.qrToken) score += 4;
  return score;
}

export function findIssuedPromiseForApplication(
  application: PromiseApplicationLike,
  issuedPromises: PromiseDto[]
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
  issuedPromises: PromiseDto[]
): PromiseQrMatchResult {
  const issuedPromise = findIssuedPromiseForApplication(application, issuedPromises);
  const canOpenQrModal = Boolean(issuedPromise?.qrToken);
  const showPendingFallback = application.statusName === "Approved" && !canOpenQrModal;
  return {
    issuedPromise,
    canOpenQrModal,
    showPendingFallback,
  };
}
