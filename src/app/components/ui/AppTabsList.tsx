import type React from "react";
import { TabsList } from "./tabs";
import { cn } from "./utils";

/** Use on TabsTrigger when AppTabsList has embedded (white card background) */
export const embeddedTabsTriggerClass =
  "data-[state=active]:bg-muted data-[state=active]:shadow-none data-[state=inactive]:hover:bg-muted/50";

type AppTabsListProps = React.ComponentProps<typeof TabsList> & {
  /** Tabs inside Card/Collapsible — no outer track; pair triggers with embeddedTabsTriggerClass */
  embedded?: boolean;
};

export function AppTabsList({ className, embedded, ...props }: AppTabsListProps) {
  return (
    <TabsList
      className={cn(
        "grid w-full rounded-2xl p-1",
        embedded ? "bg-transparent gap-1.5 p-0" : "bg-muted/50",
        className,
      )}
      {...props}
    />
  );
}
