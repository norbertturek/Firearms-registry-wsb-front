import type { PermitDto } from "../../types/api";

/** Pozwolenia, na podstawie których można złożyć wniosek o e-Promesę */
export function getEligiblePermitsForPromise(permits: PermitDto[]) {
  return permits.filter((p) => p.statusName === "Active" && p.availableSlots > 0);
}

export function canApplyForPromise(permits: PermitDto[]) {
  return getEligiblePermitsForPromise(permits).length > 0;
}
