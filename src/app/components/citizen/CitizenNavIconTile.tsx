import { cn } from "../ui/utils";
import { CITIZEN_NAV_ICON_TONE } from "../../utils/citizenCardUi";

type CitizenNavIconTileProps = {
  children: React.ReactNode;
  className?: string;
};

/** Canonical icon tile for citizen list tiles and collapsible section headers. */
export function CitizenNavIconTile({ children, className }: CitizenNavIconTileProps) {
  return (
    <div
      className={cn("p-3 rounded-2xl shrink-0 [&_svg]:h-6 [&_svg]:w-6", CITIZEN_NAV_ICON_TONE, className)}
    >
      {children}
    </div>
  );
}
