import { useEffect, useId, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";

export type SearchBarWithFiltersProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  label?: string;
  activeFilterCount?: number;
  onFiltersClick: () => void;
  className?: string;
  disabled?: boolean;
};

export function SearchBarWithFilters({
  value,
  onValueChange,
  placeholder = "Szukaj...",
  ariaLabel = "Wyszukaj",
  label,
  activeFilterCount = 0,
  onFiltersClick,
  className,
  disabled = false,
}: SearchBarWithFiltersProps) {
  const inputId = useId();
  const fieldLabel = label ?? ariaLabel;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {fieldLabel}
      </Label>
      <div className={cn("flex gap-2", disabled && "pointer-events-none opacity-50")}>
        <div className="relative flex-1 min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id={inputId}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            className={cn(
              "min-h-[44px] rounded-xl border-0 bg-card dark:bg-card shadow-sm ring-1 ring-border/80 pl-10",
              "focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              value ? "pr-11" : "pr-3",
            )}
            aria-label={fieldLabel}
          />
          {value && (
            <button
              type="button"
              onClick={() => onValueChange("")}
              disabled={disabled}
              aria-label="Wyczyść wyszukiwanie"
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "min-h-[44px] shrink-0 rounded-xl gap-2 px-3.5 bg-card dark:bg-card shadow-sm relative",
            hasActiveFilters && "border-primary text-primary bg-primary/5 ring-2 ring-primary/25",
          )}
          onClick={onFiltersClick}
          aria-label={`Filtry wyszukiwania${hasActiveFilters ? `, aktywne: ${activeFilterCount}` : ""}`}
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-sm font-medium">Filtry</span>
          {hasActiveFilters && (
            <span
              className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
              aria-hidden
            >
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
