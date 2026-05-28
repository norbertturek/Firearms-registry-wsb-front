type WpaListSectionHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

/** Section title outside list cards — matches citizen dashboard section headers. */
export function WpaListSectionHeader({ title, description, action }: WpaListSectionHeaderProps) {
  return (
    <div className="flex justify-between items-baseline gap-3 px-0.5">
      <div className="min-w-0">
        <h3 className="text-base md:text-lg font-bold text-foreground leading-tight">{title}</h3>
        {description && (
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
