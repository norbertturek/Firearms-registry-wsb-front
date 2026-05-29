import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { CitizenFirearmCard } from "../components/citizen/CitizenFirearmCard";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Shield, AlertTriangle, ArrowRightLeft, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { SearchBarWithFilters } from "../components/search/SearchBarWithFilters";
import { SearchFiltersSheet, SearchFilterField, filterSelectTriggerClass } from "../components/search/SearchFiltersSheet";
import { toast } from "sonner";
import { citizenService, translateTransferError } from "../../services/citizenService";
import { getApiErrorMessage } from "../../lib/apiErrors";
import type { FirearmDto, TransferType } from "../../types/api";
import { getFirearmStatusMeta } from "../../lib/statusUi";
import { StatusBadge } from "../components/StatusBadge";

function getStatusBadge(status: string) {
  return <StatusBadge meta={getFirearmStatusMeta(status)} />;
}

function getCategoryBadge(category: "A" | "B" | "C") {
  const config = {
    A: { label: "Kat. A", color: "bg-red-100 text-red-800" },
    B: { label: "Kat. B", color: "bg-blue-100 text-blue-800" },
    C: { label: "Kat. C", color: "bg-green-100 text-green-800" },
  };
  const c = config[category] ?? { label: `Kat. ${category}`, color: "bg-muted text-muted-foreground" };
  return (
    <Badge className={`${c.color} hover:${c.color} border-none px-2 py-0.5 rounded-full text-xs`}>
      {c.label}
    </Badge>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

type WeaponSearchBy = "all" | "brand" | "model" | "serial" | "caliber";
type WeaponCategoryFilter = "all" | "A" | "B" | "C";

export function WeaponRegistry() {
  const navigate = useNavigate();
  const isOfficer = localStorage.getItem("userRole") === "officer";

  useEffect(() => {
    if (isOfficer) {
      navigate("/officer/search?tab=firearms", { replace: true });
    }
  }, [isOfficer, navigate]);

  const [firearms, setFirearms] = useState<FirearmDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<WeaponSearchBy>("all");
  const [categoryFilter, setCategoryFilter] = useState<WeaponCategoryFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftSearchBy, setDraftSearchBy] = useState<WeaponSearchBy>("all");
  const [draftCategoryFilter, setDraftCategoryFilter] = useState<WeaponCategoryFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reportLostId, setReportLostId] = useState<string | null>(null);
  const [lostDescription, setLostDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [transferForm, setTransferForm] = useState<{ buyerPesel: string; transferType: TransferType }>({
    buyerPesel: "",
    transferType: "Sale",
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferErrors, setTransferErrors] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    citizenService
      .getFirearms()
      .then(setFirearms)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isOfficer) load();
  }, [isOfficer]);

  const filtered = firearms.filter((f) => {
    const s = searchTerm.toLowerCase();
    const matchCategory = categoryFilter === "all" || f.categoryName === categoryFilter;
    if (!matchCategory) return false;
    if (!searchTerm) return true;
    if (searchBy === "brand") return f.brand.toLowerCase().includes(s);
    if (searchBy === "model") return f.model.toLowerCase().includes(s);
    if (searchBy === "serial") return f.serialNumber.toLowerCase().includes(s);
    if (searchBy === "caliber") return f.caliber.toLowerCase().includes(s);
    return (
      f.brand.toLowerCase().includes(s)
      || f.model.toLowerCase().includes(s)
      || f.serialNumber.toLowerCase().includes(s)
      || f.caliber.toLowerCase().includes(s)
    );
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchBy !== "all") count += 1;
    if (categoryFilter !== "all") count += 1;
    return count;
  }, [searchBy, categoryFilter]);

  const searchPlaceholder =
    searchBy === "brand" ? "Marka..."
    : searchBy === "model" ? "Model..."
    : searchBy === "serial" ? "Numer seryjny..."
    : searchBy === "caliber" ? "Kaliber..."
    : "Marka, model, numer seryjny, kaliber...";

  const openFilters = () => {
    setDraftSearchBy(searchBy);
    setDraftCategoryFilter(categoryFilter);
    setFiltersOpen(true);
  };

  const applyFilters = () => {
    setSearchBy(draftSearchBy);
    setCategoryFilter(draftCategoryFilter);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setDraftSearchBy("all");
    setDraftCategoryFilter("all");
  };

  const clearActiveFilters = () => {
    setSearchBy("all");
    setCategoryFilter("all");
    setDraftSearchBy("all");
    setDraftCategoryFilter("all");
  };

  const clearSearchAndFilters = () => {
    setSearchTerm("");
    clearActiveFilters();
  };

  const hasActiveQuery = searchTerm.length > 0 || activeFilterCount > 0;

  const handleReportLost = async () => {
    if (!reportLostId) return;
    setReportLoading(true);
    try {
      await citizenService.reportLost(reportLostId, { description: lostDescription || undefined });
      toast.success("Utrata broni zgłoszona", {
        description: "Broń została oznaczona jako zgubiona/skradziona.",
      });
      setReportLostId(null);
      setLostDescription("");
      load();
    } catch (err: any) {
      toast.error("Błąd zgłoszenia", { description: getApiErrorMessage(err) });
    } finally {
      setReportLoading(false);
    }
  };

  const reportLostFirearm = firearms.find((f) => f.id === reportLostId);
  const transferFirearm = firearms.find((f) => f.id === transferId);

  const openTransfer = (firearmId: string) => {
    setTransferId(firearmId);
    setTransferForm({ buyerPesel: "", transferType: "Sale" });
    setTransferErrors({});
  };

  const handleCreateTransfer = async () => {
    if (!transferId) return;
    const errors: Record<string, string> = {};
    if (!/^\d{11}$/.test(transferForm.buyerPesel)) {
      errors.buyerPesel = "PESEL musi składać się z 11 cyfr";
    }
    if (Object.keys(errors).length > 0) {
      setTransferErrors(errors);
      return;
    }
    setTransferErrors({});
    setTransferLoading(true);
    try {
      await citizenService.createTransferRequest({
        firearmId: transferId,
        buyerPesel: transferForm.buyerPesel,
        transferType: transferForm.transferType,
      });
      toast.success("Transfer zainicjowany", {
        description: "Nabywca otrzyma powiadomienie i będzie musiał zaakceptować transfer.",
      });
      setTransferId(null);
      load();
    } catch (err: any) {
      toast.error("Nie można zainicjować transferu", {
        description: translateTransferError(getApiErrorMessage(err)) || "Spróbuj ponownie.",
        duration: 7000,
      });
    } finally {
      setTransferLoading(false);
    }
  };

  if (isOfficer) {
    return null;
  }

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="px-1">
          <div className="h-8 w-40 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-56 bg-muted animate-pulse rounded" />
        </div>
        {[1, 2].map((i) => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="pt-2 max-md:pb-2">
      <div className="mb-4 px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">Rejestr broni</h1>
        <p className="text-sm text-muted-foreground">Twoje zarejestrowane egzemplarze</p>
      </div>

      <SearchBarWithFilters
        className="mb-4"
        value={searchTerm}
        onValueChange={setSearchTerm}
        placeholder={searchPlaceholder}
        ariaLabel="Wyszukaj broń"
        activeFilterCount={activeFilterCount}
        onFiltersClick={openFilters}
      />

      <SearchFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        description="Ogranicz listę broni"
        onApply={applyFilters}
        onReset={resetFilters}
      >
        <SearchFilterField label="Szukaj w polu" htmlFor="weaponSearchBy">
          <Select value={draftSearchBy} onValueChange={(v) => setDraftSearchBy(v as WeaponSearchBy)}>
            <SelectTrigger id="weaponSearchBy" className={filterSelectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[70] rounded-xl">
              <SelectItem value="all">Wszystkie pola</SelectItem>
              <SelectItem value="brand">Marka</SelectItem>
              <SelectItem value="model">Model</SelectItem>
              <SelectItem value="serial">Numer seryjny</SelectItem>
              <SelectItem value="caliber">Kaliber</SelectItem>
            </SelectContent>
          </Select>
        </SearchFilterField>
        <SearchFilterField label="Kategoria" htmlFor="categoryFilter">
          <Select value={draftCategoryFilter} onValueChange={(v) => setDraftCategoryFilter(v as WeaponCategoryFilter)}>
            <SelectTrigger id="categoryFilter" className={filterSelectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[70] rounded-xl">
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="A">Kat. A</SelectItem>
              <SelectItem value="B">Kat. B</SelectItem>
              <SelectItem value="C">Kat. C</SelectItem>
            </SelectContent>
          </Select>
        </SearchFilterField>
      </SearchFiltersSheet>

      {filtered.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-3 px-1">
            {searchTerm ? `Wyniki dla „${searchTerm}”` : `${filtered.length} egzemplarzy w rejestrze`}
          </p>
          <div className="space-y-3">
            {filtered.map((firearm) => {
              const isExpanded = expandedId === firearm.id;
              return (
                <CitizenFirearmCard
                  key={firearm.id}
                  firearm={firearm}
                  expanded={isExpanded}
                  onToggle={() => setExpandedId(isExpanded ? null : firearm.id)}
                  statusBadge={getStatusBadge(firearm.statusName)}
                  categoryBadge={getCategoryBadge(firearm.categoryName as "A" | "B" | "C")}
                  formatDate={formatDate}
                >
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">Dane dokumentu</p>
                        <div className="space-y-2">
                          {firearm.productionYear && (
                            <div>
                              <span className="text-muted-foreground text-xs block">Rok produkcji</span>
                              <span className="font-medium text-foreground">{firearm.productionYear}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">Identyfikacja</p>
                        <div className="space-y-2">
                          <div>
                            <span className="text-muted-foreground text-xs block">Nr seryjny</span>
                            <span className="font-mono font-medium text-foreground">{firearm.serialNumber}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/5 rounded-xl p-3 flex gap-3 items-start border border-primary/10">
                      <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Przypominamy o obowiązku posiadania legitymacji broni podczas jej noszenia.
                      </p>
                    </div>

                    {firearm.statusName === "Registered" && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => openTransfer(firearm.id)}
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-2" />
                          Transferuj
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => {
                            setReportLostId(firearm.id);
                            setLostDescription("");
                          }}
                        >
                          Zgłoś utratę / kradzież
                        </Button>
                      </div>
                    )}
                  </div>
                </CitizenFirearmCard>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="h-16 w-16 mx-auto mb-4 opacity-30 text-primary" />
          {hasActiveQuery ? (
            <>
              <p className="mb-2">Brak broni dla wybranych kryteriów wyszukiwania</p>
              <Button variant="outline" onClick={clearSearchAndFilters} className="min-h-[44px] rounded-xl mt-2" aria-label="Wyczyść filtry">
                Wyczyść filtry
              </Button>
            </>
          ) : (
            <p className="mb-4">Nie masz jeszcze zarejestrowanej broni. Broń pojawi się tutaj po zakupie w sklepie.</p>
          )}
        </div>
      )}

      {/* Report Lost Dialog */}
      <Dialog open={!!reportLostId} onOpenChange={(open) => !open && setReportLostId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Zgłoś utratę / kradzież</DialogTitle>
            <DialogDescription>
              {reportLostFirearm && `${reportLostFirearm.brand} ${reportLostFirearm.model} (SN: ${reportLostFirearm.serialNumber})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-red-50 rounded-xl p-3 text-xs text-red-900">
              Zgłoszenie utraty zwolni miejsce w pozwoleniu. Operacja jest nieodwracalna.
            </div>
            <div>
              <Label htmlFor="lostDesc">Opis okoliczności (opcjonalnie)</Label>
              <Textarea
                id="lostDesc"
                value={lostDescription}
                onChange={(e) => setLostDescription(e.target.value)}
                className="mt-1.5 rounded-xl"
                placeholder="Np. kradzież w dniu 12.05.2026 z samochodu..."
                maxLength={500}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReportLostId(null)} className="rounded-xl">Anuluj</Button>
            <Button variant="destructive" onClick={handleReportLost} disabled={reportLoading} className="rounded-xl">
              {reportLoading ? "Zgłaszanie..." : "Zgłoś utratę"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={!!transferId} onOpenChange={(open) => !open && setTransferId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Transferuj broń</DialogTitle>
            <DialogDescription>
              {transferFirearm && `${transferFirearm.brand} ${transferFirearm.model} (SN: ${transferFirearm.serialNumber})`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-900 space-y-1">
              <p><strong>Nabywca musi już mieć:</strong> aktywne pozwolenie obejmujące tę kategorię broni, wolne miejsce w pozwoleniu, aktualne badania medyczne.</p>
              <p>System sprawdza wymagania od razu przy inicjacji — bez spełnienia warunków transfer nie powstanie. Po inicjacji broń pozostaje u Ciebie do akceptacji przez nabywcę.</p>
            </div>
            <div>
              <Label htmlFor="buyerPesel">PESEL nabywcy <span className="text-red-600">*</span></Label>
              <Input
                id="buyerPesel"
                inputMode="numeric"
                maxLength={11}
                value={transferForm.buyerPesel}
                onChange={(e) => setTransferForm({ ...transferForm, buyerPesel: e.target.value.replace(/\D/g, "") })}
                placeholder="11-cyfrowy PESEL"
                className="mt-1.5"
              />
              {transferErrors.buyerPesel && <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"><AlertCircle className="h-4 w-4 shrink-0" />{transferErrors.buyerPesel}</p>}
            </div>
            <div>
              <Label htmlFor="transferType">Rodzaj transferu <span className="text-red-600">*</span></Label>
              <Select
                value={transferForm.transferType}
                onValueChange={(v) => setTransferForm({ ...transferForm, transferType: v as TransferType })}
              >
                <SelectTrigger id="transferType" className="mt-1.5 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sale">Sprzedaż</SelectItem>
                  <SelectItem value="Donation">Darowizna</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Dziedziczenie wymaga osobnej procedury z udziałem policji (depozyt, 6 miesięcy na uzyskanie pozwolenia — Ustawa o broni i amunicji, art. 14 ust. 1).
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTransferId(null)} className="rounded-xl">Anuluj</Button>
            <Button onClick={handleCreateTransfer} disabled={transferLoading} className="rounded-xl">
              {transferLoading ? "Inicjowanie..." : "Inicjuj transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
