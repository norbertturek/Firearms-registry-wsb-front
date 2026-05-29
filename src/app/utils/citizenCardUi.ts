/** Icon tile on citizen list/nav cards (dashboard, applications, weapons, exams). */
export const CITIZEN_NAV_ICON_TONE = "bg-blue-50 text-primary";

/** Disabled or blocked nav tiles only. */
export const CITIZEN_NAV_ICON_TONE_DISABLED = "bg-muted text-muted-foreground";

/** List tile Card — neutralize default Card gap-6 between sections. */
export const CITIZEN_LIST_CARD_CLASS =
  "rounded-2xl border-none shadow-sm gap-0 cursor-pointer active:scale-[0.99]";

/** Stacked e-permit cards — lift on hover to reveal deck layering. */
export const CITIZEN_PERMIT_STACK_CARD_INTERACTION =
  "cursor-pointer transition-transform hover:-translate-y-1 active:scale-[0.99]";

/**
 * List tile CardContent — uniform p-4; overrides CardContent default [&:last-child]:pb-6.
 */
export const CITIZEN_LIST_CARD_CONTENT_CLASS = "p-4 !pb-4";

/** Title on citizen list tiles and matching collapsible section headers. */
export const CITIZEN_TILE_TITLE_CLASS =
  "font-semibold text-sm leading-snug text-foreground line-clamp-2";

/** Subtitle on citizen list tiles and matching collapsible section headers. */
export const CITIZEN_TILE_SUBTITLE_CLASS = "text-xs text-muted-foreground mt-0.5 line-clamp-2";
