import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { CITIZEN_TILE_SUBTITLE_CLASS, CITIZEN_TILE_TITLE_CLASS } from "../../utils/citizenCardUi";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { cn } from "../ui/utils";

type Props = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  titleAddon?: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  priority?: boolean;
  locked?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export function ReviewCollapsibleCard({
  title,
  description,
  icon,
  titleAddon,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  priority = false,
  locked = false,
  children,
  className,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card
        className={cn(
          "gap-0 rounded-2xl border-0 shadow-sm overflow-hidden",
          priority && "shadow-md",
          className,
        )}
      >
        <CollapsibleTrigger asChild>
          <button
            type="button"
            disabled={locked}
            className="w-full text-left active:bg-muted/30 transition-colors"
            aria-expanded={open}
            aria-label={
              locked
                ? `Sekcja zablokowana: ${title}`
                : open
                  ? `Zwiń sekcję: ${title}`
                  : `Rozwiń sekcję: ${title}`
            }
          >
            <CardHeader className="px-3 pt-2.5 pb-2 md:px-6 md:pt-4 md:pb-3">
              <div className="flex items-center gap-3">
                {icon}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className={CITIZEN_TILE_TITLE_CLASS}>{title}</h4>
                    {titleAddon}
                  </div>
                  {description && <p className={CITIZEN_TILE_SUBTITLE_CLASS}>{description}</p>}
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground self-center transition-transform duration-200",
                    open && "rotate-180",
                  )}
                  aria-hidden
                />
              </div>
            </CardHeader>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden">
          <CardContent className="px-3 pb-3 pt-0 md:px-6 md:pb-5 text-sm md:text-base leading-snug">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

