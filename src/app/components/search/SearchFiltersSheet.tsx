import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";

export const filterSelectTriggerClass =
  "min-h-[44px] md:min-h-[48px] w-full rounded-xl border-0 bg-card dark:bg-card shadow-sm ring-1 ring-border/80 hover:bg-card hover:shadow-sm dark:hover:bg-card active:bg-card";

function useMobileFiltersLayout() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : true,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return isMobile;
}

export type SearchFilterFieldProps = {
  label: string;
  htmlFor?: string;
  description?: string;
  children: React.ReactNode;
};

export function SearchFilterField({ label, htmlFor, description, children }: SearchFilterFieldProps) {
  return (
    <section className="rounded-xl bg-muted/25 p-2.5 space-y-1.5 md:p-3 md:space-y-2">
      <div>
        <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {description && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export type SearchFiltersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onApply: () => void;
  onReset: () => void;
  children: React.ReactNode;
};

export function SearchFiltersSheet({
  open,
  onOpenChange,
  title = "Filtry",
  description,
  onApply,
  onReset,
  children,
}: SearchFiltersSheetProps) {
  const isMobile = useMobileFiltersLayout();

  const handleApply = () => {
    onApply();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "z-[60] flex flex-col gap-0 border-none bg-card p-0 shadow-xl [&>button]:hidden",
          isMobile
            ? "max-h-[min(90dvh,780px)] rounded-t-[1.25rem]"
            : "h-full w-full sm:max-w-[400px]",
        )}
      >
        {isMobile && (
          <div className="flex shrink-0 justify-center pt-2.5 pb-0.5" aria-hidden>
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>
        )}

        <SheetHeader className="shrink-0 space-y-0 border-b border-border/80 p-0 px-4 py-2.5 text-left md:px-6 md:py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-base font-semibold leading-snug md:text-lg">{title}</SheetTitle>
                {description && (
                  <SheetDescription className="mt-0.5 text-xs leading-relaxed md:text-sm">
                    {description}
                  </SheetDescription>
                )}
              </div>
            </div>
            <SheetClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground"
                aria-label="Zamknij filtry"
              >
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-4 py-2.5 md:space-y-2 md:px-6 md:py-3">
          {children}
        </div>

        <SheetFooter className="mt-0 shrink-0 flex-row gap-2 border-t border-border/80 bg-card p-0 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:mt-auto md:px-6 md:pb-4 md:pt-3.5">
          <Button
            type="button"
            variant="outline"
            className="min-h-[44px] flex-1 rounded-xl bg-card px-3 text-sm dark:bg-card md:min-h-[48px] md:text-base"
            onClick={onReset}
          >
            Resetuj
          </Button>
          <Button
            type="button"
            className="min-h-[44px] flex-1 rounded-xl px-3 text-sm font-semibold md:min-h-[48px] md:text-base"
            onClick={handleApply}
          >
            Zastosuj filtry
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
