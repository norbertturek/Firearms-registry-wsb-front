import { useNavigate } from "react-router";
import { Badge } from "../components/ui/badge";
import { FileCheck, Info, ShieldAlert, ClipboardList, QrCode } from "lucide-react";
import { ReviewCollapsibleCard } from "../components/wpa/ReviewCollapsibleCard";
import { applicationSectionIcon } from "../components/wpa/ApplicationDetailField";
import { WpaQuickToolCard } from "../components/wpa/WpaQuickToolCard";

const CATEGORY_RULES: Array<{ permit: string; categories: string[]; color: string }> = [
  { permit: "Sportowe", categories: ["A", "B"], color: "bg-blue-50 text-blue-900" },
  { permit: "Kolekcjonerskie", categories: ["A", "B", "C"], color: "bg-emerald-50 text-emerald-900" },
  { permit: "Ochrony osobistej", categories: ["B"], color: "bg-purple-50 text-purple-900" },
  { permit: "Łowieckie", categories: ["C"], color: "bg-orange-50 text-orange-900" },
  { permit: "Inne", categories: ["A", "B", "C"], color: "bg-muted text-foreground" },
];

export function ShopDashboard() {
  const navigate = useNavigate();

  return (
    <div className="pt-1 md:pt-2">
      <div className="mb-4 md:mb-6 px-0.5">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-0.5 md:mb-1">Panel sklepu</h1>
        <p className="text-sm md:text-base text-muted-foreground leading-snug">
          Stanowisko sprzedaży: zweryfikuj promesę, uzupełnij dane broni i zarejestruj transakcję.
        </p>
      </div>

      <div className="mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-bold mb-2 md:mb-3 px-0.5 text-foreground">Narzędzia sklepu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          <WpaQuickToolCard
            title="Nowa sprzedaż"
            description="Jeden flow: skan/token/numer, potem dane broni i zatwierdzenie."
            icon={FileCheck}
            onClick={() => navigate("/shop/sale")}
          />
        </div>
      </div>

      <div className="mb-4 md:mb-6">
        <ReviewCollapsibleCard
          title="Procedura sprzedaży"
          description="Krokowy przebieg zgodny z resztą aplikacji"
          defaultOpen
          icon={applicationSectionIcon(<ClipboardList />)}
        >
          <div className="space-y-2 text-sm">
            <div className="rounded-xl bg-muted/30 p-3 flex items-start gap-3">
              <QrCode className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p>1. Zweryfikuj promesę (najlepiej skan QR; numer/token jako fallback).</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 flex items-start gap-3">
              <ShieldAlert className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p>2. Uzupełnij dane broni zgodnie z dokumentem sprzedaży.</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 flex items-start gap-3">
              <FileCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p>3. Zatwierdź. Backend ponownie waliduje promesę i zapisuje transakcję atomowo.</p>
            </div>
          </div>
        </ReviewCollapsibleCard>
      </div>

      <div className="mb-4 md:mb-6">
        <ReviewCollapsibleCard
          title="Ważne informacje operacyjne"
          description="Ograniczenia i zasady działania panelu sklepu"
          icon={applicationSectionIcon(<Info />)}
        >
          <div className="text-sm text-blue-900 space-y-2">
            <p className="text-blue-800">
              Panel sklepu służy do bieżącej rejestracji sprzedaży. Backend finalnie waliduje promesę, pozwolenie i badania przy zapisie.
            </p>
            <p className="text-xs text-blue-700">
              Historia sprzedaży i statystyki nie są dostępne w panelu sklepu (dane audytowe po stronie WPA).
            </p>
          </div>
        </ReviewCollapsibleCard>
      </div>

      {/* Category-permit matrix */}
      <div className="mb-6">
        <ReviewCollapsibleCard
          title="Dopuszczalne kategorie broni wg pozwolenia"
          description="Sprzedaż zostanie odrzucona, jeśli kategoria nie pasuje do typu pozwolenia."
          icon={applicationSectionIcon(<ShieldAlert />)}
        >
          <div className="space-y-2">
            {CATEGORY_RULES.map((rule) => (
              <div key={rule.permit} className={`rounded-xl p-3 flex items-center justify-between ${rule.color}`}>
                <p className="font-medium text-sm">Pozwolenie {rule.permit}</p>
                <div className="flex gap-1">
                  {rule.categories.map((cat) => (
                    <Badge key={cat} className="bg-background/80 text-foreground border border-current/20 rounded-full px-2 py-0.5 text-xs font-mono">
                      Kat. {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ReviewCollapsibleCard>
      </div>

    </div>
  );
}
