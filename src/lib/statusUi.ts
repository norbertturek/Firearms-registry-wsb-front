import type {
  FirearmStatus,
  PermitStatus,
  PromiseStatus,
  TransferRequestStatus,
} from "../types/api";

export type ApplicationStatusName =
  | "Submitted"
  | "Paid"
  | "UnderReview"
  | "Approved"
  | "Rejected"
  | "RequiresCorrection";

type StatusMeta = {
  label: string;
  badgeClassName: string;
  variant: "default" | "secondary" | "destructive";
};

type ApplicationStatusMeta = StatusMeta;

const BADGE_BASE = "border-none px-2 py-0.5 rounded-full";

const APPLICATION_STATUS_META: Record<ApplicationStatusName, ApplicationStatusMeta> = {
  Submitted: {
    label: "Złożony",
    variant: "secondary",
    badgeClassName: `bg-blue-100 text-blue-800 hover:bg-blue-200 ${BADGE_BASE}`,
  },
  Paid: {
    label: "Opłacony",
    variant: "secondary",
    badgeClassName: `bg-cyan-100 text-cyan-800 hover:bg-cyan-200 ${BADGE_BASE}`,
  },
  UnderReview: {
    label: "W weryfikacji",
    variant: "secondary",
    badgeClassName: `bg-amber-100 text-amber-800 hover:bg-amber-200 ${BADGE_BASE}`,
  },
  Approved: {
    label: "Zaakceptowany",
    variant: "default",
    badgeClassName: `bg-emerald-100 text-emerald-800 hover:bg-emerald-200 ${BADGE_BASE}`,
  },
  Rejected: {
    label: "Odrzucony",
    variant: "destructive",
    badgeClassName: "rounded-full px-2 py-0.5",
  },
  RequiresCorrection: {
    label: "Wymaga uzupełnienia",
    variant: "secondary",
    badgeClassName: `bg-orange-100 text-orange-800 hover:bg-orange-200 ${BADGE_BASE}`,
  },
};

export function getApplicationStatusMeta(status: string): ApplicationStatusMeta | null {
  return APPLICATION_STATUS_META[status as ApplicationStatusName] ?? null;
}

const PERMIT_STATUS_META: Record<PermitStatus, StatusMeta> = {
  Active: {
    label: "Aktywne",
    variant: "default",
    badgeClassName: `bg-emerald-100 text-emerald-800 hover:bg-emerald-200 ${BADGE_BASE}`,
  },
  Suspended: {
    label: "Zawieszone",
    variant: "secondary",
    badgeClassName: `bg-amber-100 text-amber-800 hover:bg-amber-200 ${BADGE_BASE}`,
  },
  Revoked: {
    label: "Cofnięte",
    variant: "destructive",
    badgeClassName: "rounded-full px-2 py-0.5",
  },
  Expired: {
    label: "Wygasłe",
    variant: "secondary",
    badgeClassName: `bg-slate-100 text-slate-700 hover:bg-slate-200 ${BADGE_BASE}`,
  },
};

export function getPermitStatusMeta(status: string): StatusMeta | null {
  return PERMIT_STATUS_META[status as PermitStatus] ?? null;
}

const FIREARM_STATUS_META: Record<FirearmStatus, StatusMeta> = {
  Registered: {
    label: "Zarejestrowana",
    variant: "default",
    badgeClassName: `bg-emerald-100 text-emerald-800 hover:bg-emerald-200 ${BADGE_BASE}`,
  },
  Transferred: {
    label: "Przeniesiona",
    variant: "secondary",
    badgeClassName: `bg-blue-100 text-blue-800 hover:bg-blue-200 ${BADGE_BASE}`,
  },
  Lost: {
    label: "Zgubiona / skradziona",
    variant: "destructive",
    badgeClassName: "rounded-full px-2 py-0.5",
  },
  Archived: {
    label: "Zarchiwizowana",
    variant: "secondary",
    badgeClassName: `bg-slate-100 text-slate-700 hover:bg-slate-200 ${BADGE_BASE}`,
  },
};

export function getFirearmStatusMeta(status: string): StatusMeta | null {
  return FIREARM_STATUS_META[status as FirearmStatus] ?? null;
}

const TRANSFER_REQUEST_STATUS_META: Record<TransferRequestStatus, StatusMeta> = {
  PendingAcceptance: {
    label: "Oczekuje akceptacji",
    variant: "secondary",
    badgeClassName: `bg-amber-100 text-amber-800 hover:bg-amber-200 ${BADGE_BASE}`,
  },
  Accepted: {
    label: "Zaakceptowany",
    variant: "default",
    badgeClassName: `bg-emerald-100 text-emerald-800 hover:bg-emerald-200 ${BADGE_BASE}`,
  },
  Rejected: {
    label: "Odrzucony",
    variant: "destructive",
    badgeClassName: "rounded-full px-2 py-0.5",
  },
  Cancelled: {
    label: "Anulowany",
    variant: "secondary",
    badgeClassName: `bg-slate-100 text-slate-700 hover:bg-slate-200 ${BADGE_BASE}`,
  },
  Completed: {
    label: "Zakończony",
    variant: "secondary",
    badgeClassName: `bg-cyan-100 text-cyan-800 hover:bg-cyan-200 ${BADGE_BASE}`,
  },
};

export function getTransferRequestStatusMeta(status: string): StatusMeta | null {
  return TRANSFER_REQUEST_STATUS_META[status as TransferRequestStatus] ?? null;
}

const PROMISE_STATUS_META: Record<PromiseStatus, StatusMeta> = {
  Draft: {
    label: "Szkic",
    variant: "secondary",
    badgeClassName: `bg-slate-100 text-slate-700 hover:bg-slate-200 ${BADGE_BASE}`,
  },
  Submitted: {
    label: "Złożona",
    variant: "secondary",
    badgeClassName: `bg-blue-100 text-blue-800 hover:bg-blue-200 ${BADGE_BASE}`,
  },
  Paid: {
    label: "Opłacona",
    variant: "secondary",
    badgeClassName: `bg-cyan-100 text-cyan-800 hover:bg-cyan-200 ${BADGE_BASE}`,
  },
  UnderReview: {
    label: "W weryfikacji",
    variant: "secondary",
    badgeClassName: `bg-amber-100 text-amber-800 hover:bg-amber-200 ${BADGE_BASE}`,
  },
  Approved: {
    label: "Zaakceptowana",
    variant: "default",
    badgeClassName: `bg-emerald-100 text-emerald-800 hover:bg-emerald-200 ${BADGE_BASE}`,
  },
  Rejected: {
    label: "Odrzucona",
    variant: "destructive",
    badgeClassName: "rounded-full px-2 py-0.5",
  },
  Active: {
    label: "Aktywna",
    variant: "default",
    badgeClassName: `bg-emerald-200 text-emerald-900 hover:bg-emerald-300 ${BADGE_BASE}`,
  },
  Used: {
    label: "Wykorzystana",
    variant: "secondary",
    badgeClassName: `bg-slate-100 text-slate-700 hover:bg-slate-200 ${BADGE_BASE}`,
  },
  Expired: {
    label: "Wygasła",
    variant: "secondary",
    badgeClassName: `bg-slate-100 text-slate-700 hover:bg-slate-200 ${BADGE_BASE}`,
  },
};

export function getPromiseStatusMeta(status: string): StatusMeta | null {
  return PROMISE_STATUS_META[status as PromiseStatus] ?? null;
}
