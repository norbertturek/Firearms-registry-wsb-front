import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Shield, AlertCircle, X } from "lucide-react";

type Props = {
  variant?: "card" | "inline";
};

export function PermitRequiredForPromiseNotice({ variant = "card" }: Props) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const closeButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 h-8 w-8 rounded-full text-amber-700 hover:text-amber-950 hover:bg-amber-100/80 shrink-0"
      aria-label="Zamknij"
      onClick={() => setDismissed(true)}
    >
      <X className="h-4 w-4" />
    </Button>
  );

  const content = (
    <>
      {closeButton}
      <div className="flex gap-3 text-left pr-8">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-950 mb-1">
            Najpierw potrzebujesz pozwolenia na broń
          </p>
          <p className="text-sm text-amber-800/90 leading-snug mb-3">
            e-Promesa jest wydawana tylko w ramach aktywnego pozwolenia z wolnymi miejscami na broń.
            Złóż wniosek o pozwolenie i poczekaj na decyzję WPA.
          </p>
          <Button
            type="button"
            size="sm"
            className="rounded-xl min-h-[40px]"
            onClick={() => navigate("/applications/new/permit")}
          >
            <Shield className="h-4 w-4 mr-2" />
            Wniosek o pozwolenie
          </Button>
        </div>
      </div>
    </>
  );

  if (variant === "inline") {
    return (
      <div className="relative rounded-xl bg-amber-50 border border-amber-100 p-4">
        {content}
      </div>
    );
  }

  return (
    <Card className="relative rounded-2xl border border-amber-100 bg-amber-50/80 shadow-sm">
      <CardContent className="p-4">{content}</CardContent>
    </Card>
  );
}
