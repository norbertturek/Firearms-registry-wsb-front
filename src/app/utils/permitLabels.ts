import type { PermitDto, PermitType } from "../../types/api";

export const PERMIT_TYPE_LABELS: Record<string, string> = {
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

const PERMIT_TYPE_LABELS_BY_VALUE: Record<number, string> = {
  0: "Sportowe",
  1: "Kolekcjonerskie",
  2: "Ochrony osobistej",
  3: "Łowieckie",
  4: "Inne",
};

const PERMIT_TYPE_ENUM_NAMES: Record<number, string> = {
  0: "Sport",
  1: "Collection",
  2: "Protection",
  3: "Hunting",
  4: "Other",
};

type PermitApplicationTypeFields = {
  requestedPermitType?: PermitType | number | string;
  requestedPermitTypeName?: string | number;
};

/** Label for permit application tiles (WPA list, dashboard) — handles numeric enum from API. */
export function getPermitApplicationTypeLabel(app: PermitApplicationTypeFields) {
  const rawName = app.requestedPermitTypeName;
  if (typeof rawName === "string" && rawName.length > 0 && !/^\d+$/.test(rawName)) {
    return PERMIT_TYPE_LABELS[rawName] ?? rawName;
  }

  const permitType = app.requestedPermitType;
  if (typeof permitType === "number") {
    const enumName = PERMIT_TYPE_ENUM_NAMES[permitType];
    if (enumName) {
      return PERMIT_TYPE_LABELS[enumName] ?? enumName;
    }
    return PERMIT_TYPE_LABELS_BY_VALUE[permitType] ?? String(permitType);
  }

  if (typeof permitType === "string") {
    return PERMIT_TYPE_LABELS[permitType] ?? permitType;
  }

  if (typeof rawName === "number") {
    const enumName = PERMIT_TYPE_ENUM_NAMES[rawName];
    if (enumName) {
      return PERMIT_TYPE_LABELS[enumName] ?? enumName;
    }
    return PERMIT_TYPE_LABELS_BY_VALUE[rawName] ?? String(rawName);
  }

  return "Nieznane";
}

export function getPermitDisplayTypeLabel(permit: PermitDto) {
  if (permit.permitTypeName) {
    return PERMIT_TYPE_LABELS[permit.permitTypeName] ?? permit.permitTypeName;
  }
  const permitType = permit.permitType as unknown;
  if (typeof permitType === "number") {
    return PERMIT_TYPE_LABELS_BY_VALUE[permitType] ?? String(permitType);
  }
  if (typeof permitType === "string") {
    return PERMIT_TYPE_LABELS[permitType] ?? permitType;
  }
  return "Nieznane";
}
