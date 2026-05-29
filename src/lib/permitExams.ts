import type { LucideIcon } from "lucide-react";
import { Brain, HeartPulse } from "lucide-react";
import type { CitizenMedicalAlertDto, PermitDto } from "../types/api";
import { getDaysUntilDueDate } from "./medicalAlerts";

export type ExamType = "medical" | "psychological";
export type ExamStatus = "current" | "expiring" | "expired" | "missing";

export const EXAM_WARNING_DAYS = 30;

export interface PermitExamEntry {
  id: string;
  permitId: string;
  permitNumber: string;
  permitTypeName: string;
  examType: ExamType;
  expiryDate: string | null;
  daysLeft: number | null;
  status: ExamStatus;
  alertMessage: string | null;
}

export interface PermitExamGroup {
  permitId: string;
  permitNumber: string;
  permitTypeName: string;
  exams: PermitExamEntry[];
}

export function examLabel(type: ExamType) {
  return type === "medical" ? "Badanie lekarskie" : "Badanie psychologiczne";
}

export function examIcon(type: ExamType): LucideIcon {
  return type === "medical" ? HeartPulse : Brain;
}

export function buildAlertMap(alerts: CitizenMedicalAlertDto[]) {
  const map = new Map<string, CitizenMedicalAlertDto>();
  for (const alert of alerts) {
    map.set(`${alert.permitId}:${alert.alertTypeName}`, alert);
  }
  return map;
}

export function resolveExamStatus(
  expiryDate: string | null,
  expiredAlert: CitizenMedicalAlertDto | undefined,
  expiringAlert: CitizenMedicalAlertDto | undefined,
): { status: ExamStatus; daysLeft: number | null; alertMessage: string | null } {
  const daysLeft = getDaysUntilDueDate(expiryDate);
  if (daysLeft == null) {
    return {
      status: "missing",
      daysLeft: null,
      alertMessage: "Brak daty ważności. WPA musi potwierdzić i uzupełnić dane badań.",
    };
  }
  if (daysLeft <= 0 || expiredAlert) {
    return { status: "expired", daysLeft, alertMessage: expiredAlert?.message ?? null };
  }
  if (daysLeft <= EXAM_WARNING_DAYS || expiringAlert) {
    return { status: "expiring", daysLeft, alertMessage: expiringAlert?.message ?? null };
  }
  return { status: "current", daysLeft, alertMessage: null };
}

function createExamEntriesForPermit(
  permit: PermitDto,
  alertMap: Map<string, CitizenMedicalAlertDto>,
): PermitExamEntry[] {
  const medicalExpired = alertMap.get(`${permit.id}:MedicalExamExpired`);
  const medicalExpiring = alertMap.get(`${permit.id}:MedicalExamExpiring`);
  const psychExpired = alertMap.get(`${permit.id}:PsychologicalExamExpired`);
  const psychExpiring = alertMap.get(`${permit.id}:PsychologicalExamExpiring`);

  const medical = resolveExamStatus(permit.medicalExamExpiryDate, medicalExpired, medicalExpiring);
  const psychological = resolveExamStatus(
    permit.psychologicalExamExpiryDate,
    psychExpired,
    psychExpiring,
  );

  return [
    {
      id: `${permit.id}:medical`,
      permitId: permit.id,
      permitNumber: permit.permitNumber,
      permitTypeName: permit.permitTypeName,
      examType: "medical",
      expiryDate: permit.medicalExamExpiryDate,
      daysLeft: medical.daysLeft,
      status: medical.status,
      alertMessage: medical.alertMessage,
    },
    {
      id: `${permit.id}:psychological`,
      permitId: permit.id,
      permitNumber: permit.permitNumber,
      permitTypeName: permit.permitTypeName,
      examType: "psychological",
      expiryDate: permit.psychologicalExamExpiryDate,
      daysLeft: psychological.daysLeft,
      status: psychological.status,
      alertMessage: psychological.alertMessage,
    },
  ];
}

export function getExamEntriesForPermit(
  permit: PermitDto,
  alerts: CitizenMedicalAlertDto[],
): PermitExamEntry[] {
  return createExamEntriesForPermit(permit, buildAlertMap(alerts));
}

export function mapPermitExamEntries(
  permits: PermitDto[],
  alerts: CitizenMedicalAlertDto[],
): PermitExamEntry[] {
  const alertMap = buildAlertMap(alerts);
  const activePermits = permits.filter((permit) => permit.statusName === "Active");
  return activePermits.flatMap((permit) => createExamEntriesForPermit(permit, alertMap));
}

export function groupEntriesByPermit(entries: PermitExamEntry[]): PermitExamGroup[] {
  const byPermit = new Map<string, PermitExamGroup>();

  for (const entry of entries) {
    const existing = byPermit.get(entry.permitId);
    if (existing) {
      existing.exams.push(entry);
      continue;
    }
    byPermit.set(entry.permitId, {
      permitId: entry.permitId,
      permitNumber: entry.permitNumber,
      permitTypeName: entry.permitTypeName,
      exams: [entry],
    });
  }

  const examOrder = (type: ExamType) => (type === "medical" ? 0 : 1);

  return Array.from(byPermit.values())
    .map((group) => ({
      ...group,
      exams: [...group.exams].sort((a, b) => examOrder(a.examType) - examOrder(b.examType)),
    }))
    .sort((a, b) => {
      const earliest = (exams: PermitExamEntry[]) =>
        Math.min(...exams.map((e) => (e.expiryDate ? new Date(e.expiryDate).getTime() : Number.POSITIVE_INFINITY)));
      return earliest(a.exams) - earliest(b.exams);
    });
}

export function worstExamStatus(exams: PermitExamEntry[]): ExamStatus {
  if (exams.some((e) => e.status === "expired")) return "expired";
  if (exams.some((e) => e.status === "missing")) return "missing";
  if (exams.some((e) => e.status === "expiring")) return "expiring";
  return "current";
}

export function needsExamAttention(status: ExamStatus) {
  return status !== "current";
}

const GROUP_ATTENTION_SORT_ORDER: Record<ExamStatus, number> = {
  expired: 0,
  missing: 1,
  expiring: 2,
  current: 3,
};

export function permitGroupNeedsAttention(group: PermitExamGroup) {
  return needsExamAttention(worstExamStatus(group.exams));
}

export function filterPermitGroupsNeedingAttention(groups: PermitExamGroup[]) {
  return groups.filter(permitGroupNeedsAttention);
}

/** Sort groups for attention inbox: expired → missing data → expiring. */
export function sortPermitGroupsByAttentionPriority(groups: PermitExamGroup[]) {
  return [...groups].sort(
    (a, b) =>
      GROUP_ATTENTION_SORT_ORDER[worstExamStatus(a.exams)] -
      GROUP_ATTENTION_SORT_ORDER[worstExamStatus(b.exams)],
  );
}

/** Icon tile background for exam status (citizen nav, list rows, permit details). */
export function getExamStatusTileClass(status: ExamStatus | null | undefined) {
  if (!status || status === "current") return undefined;
  if (status === "expired") return "bg-red-100 text-red-700";
  if (status === "expiring") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

/** Attention dot on medical nav icon (amber = wygasa, red = wygasło). */
export function getExamAttentionBadgeClass(status: ExamStatus) {
  if (status === "expired") return "bg-red-500";
  if (status === "missing") return "bg-slate-600";
  return "bg-amber-500";
}
