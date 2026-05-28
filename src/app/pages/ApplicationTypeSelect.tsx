import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { CreditCard, FileText, ChevronRight, Lock } from "lucide-react";
import { citizenService } from "../../services/citizenService";
import { canApplyForPromise } from "../utils/permitEligibility";
import { PermitRequiredForPromiseNotice } from "../components/citizen/PermitRequiredForPromiseNotice";
import { cn } from "../components/ui/utils";
import {
  CITIZEN_LIST_CARD_CONTENT_CLASS,
  CITIZEN_NAV_ICON_TONE,
  CITIZEN_NAV_ICON_TONE_DISABLED,
} from "../utils/citizenCardUi";

type TypeSelectCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  iconTone: string;
  disabled?: boolean;
  showChevron?: boolean;
  onClick: () => void;
};

function TypeSelectCard({
  title,
  description,
  icon: Icon,
  iconTone,
  disabled = false,
  showChevron = true,
  onClick,
}: TypeSelectCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border-none shadow-sm gap-0 transition-colors",
        disabled
          ? "opacity-75 cursor-not-allowed bg-muted/20"
          : "hover:bg-muted/30 cursor-pointer active:scale-[0.99]",
      )}
      onClick={() => {
        if (!disabled) onClick();
      }}
    >
      <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-2xl shrink-0", iconTone)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm leading-snug text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground leading-snug mt-0.5">{description}</p>
          </div>
          {showChevron && (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground self-center" aria-hidden />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ApplicationTypeSelect() {
  const navigate = useNavigate();
  const [permitsLoading, setPermitsLoading] = useState(true);
  const [promiseAllowed, setPromiseAllowed] = useState(false);

  useEffect(() => {
    citizenService
      .getPermits()
      .then((permits) => setPromiseAllowed(canApplyForPromise(permits)))
      .catch(() => setPromiseAllowed(false))
      .finally(() => setPermitsLoading(false));
  }, []);

  const permitOption = {
    title: "Pozwolenie na broń",
    description: "Złóż wniosek o nowe pozwolenie na broń.",
    path: "/applications/new/permit",
    icon: FileText,
    tone: CITIZEN_NAV_ICON_TONE,
  };

  const promiseOption = {
    title: "e-Promesa",
    description: promiseAllowed
      ? "Złóż wniosek o promesę na zakup broni."
      : "Wymaga wcześniejszego aktywnego pozwolenia na broń.",
    path: "/applications/new/promise",
    icon: promiseAllowed ? CreditCard : Lock,
    tone: promiseAllowed ? CITIZEN_NAV_ICON_TONE : CITIZEN_NAV_ICON_TONE_DISABLED,
  };

  return (
    <div className="pt-2 max-md:pb-2 space-y-4">
      <div className="px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">
          Nowy wniosek
        </h1>
        <p className="text-sm text-muted-foreground">Wybierz typ sprawy, którą chcesz rozpocząć.</p>
      </div>

      {!permitsLoading && !promiseAllowed && <PermitRequiredForPromiseNotice />}

      <div className="space-y-3">
        <TypeSelectCard
          title={permitOption.title}
          description={permitOption.description}
          icon={permitOption.icon}
          iconTone={permitOption.tone}
          onClick={() => navigate(permitOption.path)}
        />

        {permitsLoading ? (
          <div className="h-24 rounded-2xl bg-muted animate-pulse" />
        ) : (
          <TypeSelectCard
            title={promiseOption.title}
            description={promiseOption.description}
            icon={promiseOption.icon}
            iconTone={promiseOption.tone}
            disabled={!promiseAllowed}
            showChevron={promiseAllowed}
            onClick={() => navigate(promiseOption.path)}
          />
        )}

        <Card
          className="rounded-2xl border-none shadow-sm gap-0 hover:bg-muted/30 transition-colors cursor-pointer active:scale-[0.99]"
          onClick={() => navigate("/applications")}
        >
          <CardContent className={CITIZEN_LIST_CARD_CONTENT_CLASS}>
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-2xl shrink-0", CITIZEN_NAV_ICON_TONE)}>
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-snug text-foreground">Masz już rozpoczętą sprawę?</p>
                <p className="text-xs text-muted-foreground leading-snug mt-0.5">Przejdź do listy wniosków</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground self-center" aria-hidden />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
