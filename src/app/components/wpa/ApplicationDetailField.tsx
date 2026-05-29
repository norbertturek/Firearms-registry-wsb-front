import { CitizenNavIconTile } from "../citizen/CitizenNavIconTile";
import { cn } from "../ui/utils";

type ApplicationDetailFieldProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
};

export function ApplicationDetailField({
  label,
  children,
  className,
  labelClassName,
  valueClassName,
}: ApplicationDetailFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className={cn("text-[11px] md:text-xs text-muted-foreground leading-snug", labelClassName)}>{label}</p>
      <div className={cn("font-medium text-xs md:text-sm text-foreground leading-snug mt-0.5", valueClassName)}>
        {children}
      </div>
    </div>
  );
}

export function applicationSectionIcon(node: React.ReactNode, tileClassName?: string) {
  return <CitizenNavIconTile className={tileClassName}>{node}</CitizenNavIconTile>;
}
