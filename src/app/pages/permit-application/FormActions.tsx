import { Button } from "../../components/ui/button";

type FormActionsProps = {
  loading: boolean;
  onCancel: () => void;
  submitLabel?: string;
  loadingLabel?: string;
  submitDisabled?: boolean;
  secondaryAction?: { label: string; onClick: () => void; disabled?: boolean };
};

export function FormActions({
  loading,
  onCancel,
  submitLabel = "Złóż wniosek",
  loadingLabel = "Składanie...",
  submitDisabled = false,
  secondaryAction,
}: FormActionsProps) {
  return (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading}
        className="min-h-[44px] flex-1 rounded-xl"
      >
        Anuluj
      </Button>
      {secondaryAction && (
        <Button
          type="button"
          variant="secondary"
          onClick={secondaryAction.onClick}
          disabled={loading || secondaryAction.disabled}
          className="min-h-[44px] flex-1 rounded-xl"
        >
          {secondaryAction.label}
        </Button>
      )}
      <Button type="submit" disabled={loading || submitDisabled} className="min-h-[52px] flex-1 rounded-xl">
        {loading ? loadingLabel : submitLabel}
      </Button>
    </div>
  );
}
