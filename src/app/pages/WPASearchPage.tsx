import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsTrigger } from "../components/ui/tabs";
import { AppTabsList } from "../components/ui/AppTabsList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { SearchBarWithFilters, useDebouncedValue } from "../components/search/SearchBarWithFilters";
import { SearchFiltersSheet, SearchFilterField, filterSelectTriggerClass } from "../components/search/SearchFiltersSheet";
import type { WpaCitizenDto, WpaFirearmSearchResult, PermitType } from "../../types/api";
import { wpaService } from "../../services/wpaService";
import { getFirearmStatusMeta } from "../../lib/statusUi";
import { User, Shield, ChevronRight, AlertTriangle, ChevronLeft } from "lucide-react";
import { CitizenNavIconTile } from "../components/citizen/CitizenNavIconTile";

const PAGE_SIZE = 20;

type TabValue = "citizens" | "firearms";
type CitizenSearchBy = "all" | "name" | "pesel" | "permitNumber";
type FirearmSearchBy = "serialNumber" | "pesel" | "permitNumber" | "ownerName";

const PERMIT_TYPE_OPTIONS: { value: PermitType; label: string }[] = [
  { value: "Sport", label: "Sportowe" },
  { value: "Hunting", label: "Łowieckie" },
  { value: "Collection", label: "Kolekcjonerskie" },
  { value: "Protection", label: "Ochrona" },
  { value: "Other", label: "Inne" },
];

function getStatusBadge(status: string) {
  const meta = getFirearmStatusMeta(status);
  if (!meta) {
    return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
  }
  return <Badge variant={meta.variant} className={meta.badgeClassName}>{meta.label}</Badge>;
}

function getCategoryBadge(category: string) {
  const config: Record<string, { label: string; color: string }> = {
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

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

function PaginationControls({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPrev,
  onNext,
  loading,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
  loading: boolean;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  return (
    <div className="flex items-center justify-between pt-3 border-t border-border">
      <span className="text-sm text-muted-foreground">
        {from}–{to} z {totalCount}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 1 || loading} className="rounded-lg h-8 px-3">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[60px] text-center">
          {page} / {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages || loading} className="rounded-lg h-8 px-3">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function getSearchPlaceholder(tab: TabValue, citizenSearchBy: CitizenSearchBy, firearmSearchBy: FirearmSearchBy) {
  if (tab === "citizens") {
    switch (citizenSearchBy) {
      case "name": return "Imię lub nazwisko...";
      case "pesel": return "Numer PESEL...";
      case "permitNumber": return "Numer pozwolenia...";
      default: return "Imię, nazwisko, PESEL, nr pozwolenia...";
    }
  }
  switch (firearmSearchBy) {
    case "pesel": return "PESEL właściciela...";
    case "permitNumber": return "Numer pozwolenia...";
    case "ownerName": return "Imię i nazwisko właściciela...";
    default: return "Numer seryjny...";
  }
}

function tabFromSearchParam(value: string | null): TabValue {
  return value === "firearms" ? "firearms" : "citizens";
}

export function WPASearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabValue>(() => tabFromSearchParam(searchParams.get("tab")));

  useEffect(() => {
    setActiveTab(tabFromSearchParam(searchParams.get("tab")));
  }, [searchParams]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery.trim());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [citizenSearchBy, setCitizenSearchBy] = useState<CitizenSearchBy>("all");
  const [firearmSearchBy, setFirearmSearchBy] = useState<FirearmSearchBy>("serialNumber");
  const [permitTypeFilter, setPermitTypeFilter] = useState<PermitType | "all">("all");
  const [onlyWithAlerts, setOnlyWithAlerts] = useState(false);

  const [draftCitizenSearchBy, setDraftCitizenSearchBy] = useState<CitizenSearchBy>("all");
  const [draftFirearmSearchBy, setDraftFirearmSearchBy] = useState<FirearmSearchBy>("serialNumber");
  const [draftPermitTypeFilter, setDraftPermitTypeFilter] = useState<PermitType | "all">("all");
  const [draftOnlyWithAlerts, setDraftOnlyWithAlerts] = useState(false);

  const [citizens, setCitizens] = useState<WpaCitizenDto[]>([]);
  const [citizensLoading, setCitizensLoading] = useState(true);
  const [citizensPage, setCitizensPage] = useState(1);
  const [citizensTotalCount, setCitizensTotalCount] = useState(0);
  const [citizensTotalPages, setCitizensTotalPages] = useState(0);

  const [firearms, setFirearms] = useState<WpaFirearmSearchResult[]>([]);
  const [firearmsLoading, setFirearmsLoading] = useState(false);
  const [firearmsPage, setFirearmsPage] = useState(1);
  const [firearmsTotalCount, setFirearmsTotalCount] = useState(0);
  const [firearmsTotalPages, setFirearmsTotalPages] = useState(0);
  const [firearmsSearched, setFirearmsSearched] = useState(false);

  useEffect(() => {
    setCitizensPage(1);
    setFirearmsPage(1);
  }, [debouncedQuery, citizenSearchBy, firearmSearchBy, permitTypeFilter, onlyWithAlerts, activeTab]);

  const fetchCitizens = useCallback((page: number) => {
    setCitizensLoading(true);
    wpaService
      .getCitizens({
        page,
        pageSize: PAGE_SIZE,
        q: debouncedQuery || undefined,
        searchBy: citizenSearchBy,
        permitType: permitTypeFilter !== "all" ? permitTypeFilter : undefined,
        hasAlerts: onlyWithAlerts || undefined,
      })
      .then((r) => {
        setCitizens(r.items);
        setCitizensTotalCount(r.totalCount);
        setCitizensTotalPages(r.totalPages);
      })
      .catch(() => {
        setCitizens([]);
        setCitizensTotalCount(0);
        setCitizensTotalPages(0);
      })
      .finally(() => setCitizensLoading(false));
  }, [debouncedQuery, citizenSearchBy, permitTypeFilter, onlyWithAlerts]);

  const doFirearmSearch = useCallback(async (page: number) => {
    setFirearmsLoading(true);
    try {
      const params: Parameters<typeof wpaService.searchFirearms>[0] = { page, pageSize: PAGE_SIZE };
      if (debouncedQuery) {
        if (firearmSearchBy === "serialNumber") params!.serialNumber = debouncedQuery;
        else if (firearmSearchBy === "pesel") params!.pesel = debouncedQuery;
        else if (firearmSearchBy === "permitNumber") params!.permitNumber = debouncedQuery;
      }
      if (permitTypeFilter !== "all") params!.permitType = permitTypeFilter;
      const r = await wpaService.searchFirearms(params);
      let items = r.items;
      if (debouncedQuery && firearmSearchBy === "ownerName") {
        const q = debouncedQuery.toLowerCase();
        items = items.filter((f) => f.ownerName.toLowerCase().includes(q));
      }
      setFirearms(items);
      setFirearmsTotalCount(firearmSearchBy === "ownerName" && debouncedQuery ? items.length : r.totalCount);
      setFirearmsTotalPages(firearmSearchBy === "ownerName" && debouncedQuery ? 1 : r.totalPages);
      setFirearmsPage(page);
      setFirearmsSearched(true);
    } catch {
      setFirearms([]);
      setFirearmsTotalCount(0);
      setFirearmsTotalPages(0);
      setFirearmsSearched(true);
    } finally {
      setFirearmsLoading(false);
    }
  }, [debouncedQuery, firearmSearchBy, permitTypeFilter]);

  useEffect(() => {
    if (activeTab === "citizens") fetchCitizens(citizensPage);
  }, [activeTab, citizensPage, fetchCitizens]);

  useEffect(() => {
    if (activeTab === "firearms") doFirearmSearch(firearmsPage);
  }, [activeTab, firearmsPage, doFirearmSearch]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeTab === "citizens") {
      if (citizenSearchBy !== "all") count += 1;
      if (onlyWithAlerts) count += 1;
    } else if (firearmSearchBy !== "serialNumber") {
      count += 1;
    }
    if (permitTypeFilter !== "all") count += 1;
    return count;
  }, [activeTab, citizenSearchBy, firearmSearchBy, permitTypeFilter, onlyWithAlerts]);

  const openFilters = () => {
    setDraftCitizenSearchBy(citizenSearchBy);
    setDraftFirearmSearchBy(firearmSearchBy);
    setDraftPermitTypeFilter(permitTypeFilter);
    setDraftOnlyWithAlerts(onlyWithAlerts);
    setFiltersOpen(true);
  };

  const applyFilters = () => {
    setCitizenSearchBy(draftCitizenSearchBy);
    setFirearmSearchBy(draftFirearmSearchBy);
    setPermitTypeFilter(draftPermitTypeFilter);
    setOnlyWithAlerts(draftOnlyWithAlerts);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setDraftCitizenSearchBy("all");
    setDraftFirearmSearchBy("serialNumber");
    setDraftPermitTypeFilter("all");
    setDraftOnlyWithAlerts(false);
  };

  const clearActiveFilters = () => {
    setCitizenSearchBy("all");
    setFirearmSearchBy("serialNumber");
    setPermitTypeFilter("all");
    setOnlyWithAlerts(false);
    setDraftCitizenSearchBy("all");
    setDraftFirearmSearchBy("serialNumber");
    setDraftPermitTypeFilter("all");
    setDraftOnlyWithAlerts(false);
    setFirearmsSearched(false);
  };

  const clearAll = () => {
    setSearchQuery("");
    setCitizenSearchBy("all");
    setFirearmSearchBy("serialNumber");
    setPermitTypeFilter("all");
    setOnlyWithAlerts(false);
    setFirearmsSearched(false);
  };

  const searchPlaceholder = getSearchPlaceholder(activeTab, citizenSearchBy, firearmSearchBy);

  return (
    <div className="pt-2">
      <div className="mb-4 px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">Wyszukiwarka WPA</h1>
        <p className="text-sm text-muted-foreground">Przeszukaj rejestr obywateli i broni</p>
      </div>

      <SearchBarWithFilters
        className="mb-4"
        value={searchQuery}
        onValueChange={setSearchQuery}
        placeholder={searchPlaceholder}
        ariaLabel="Wyszukaj w rejestrze"
        activeFilterCount={activeFilterCount}
        onFiltersClick={openFilters}
      />

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          const tab = v as TabValue;
          setActiveTab(tab);
          setSearchParams(tab === "firearms" ? { tab: "firearms" } : {}, { replace: true });
        }}
        className="space-y-4"
      >
        <AppTabsList className="grid grid-cols-2">
          <TabsTrigger value="citizens" className="flex items-center gap-2 text-xs md:text-sm">
            <User className="h-4 w-4 shrink-0" />
            <span>Obywatele{citizensTotalCount > 0 ? ` (${citizensTotalCount})` : ""}</span>
          </TabsTrigger>
          <TabsTrigger value="firearms" className="flex items-center gap-2 text-xs md:text-sm">
            <Shield className="h-4 w-4 shrink-0" />
            <span>Broń{firearmsSearched && firearmsTotalCount > 0 ? ` (${firearmsTotalCount})` : ""}</span>
          </TabsTrigger>
        </AppTabsList>

        <TabsContent value="citizens" className="mt-0">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-2 px-4 pt-4 md:px-6">
              <CardTitle className="text-base md:text-lg">Obywatele</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                {debouncedQuery
                  ? `Wyniki dla „${debouncedQuery}”`
                  : citizensTotalCount > 0
                    ? `${citizensTotalCount} obywateli w rejestrze`
                    : "Ładowanie..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
              {citizensLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-20 md:h-24 rounded-2xl bg-muted animate-pulse" />)}
                </div>
              ) : citizens.length > 0 ? (
                <>
                  <div className="space-y-2.5 md:space-y-3">
                    {citizens.map((citizen) => (
                      <div
                        key={citizen.id}
                        className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.99]"
                        onClick={() => navigate(`/wpa/citizens/${citizen.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <CitizenNavIconTile>
                            <User />
                          </CitizenNavIconTile>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm leading-snug text-foreground truncate">
                              {citizen.firstName} {citizen.lastName}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{citizen.pesel}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] md:text-xs">
                                {citizen.totalFirearms} {citizen.totalFirearms === 1 ? "egz." : "egz."}
                              </Badge>
                              {citizen.activeAlerts > 0 && (
                                <Badge variant="destructive" className="rounded-full px-2 py-0.5 text-[10px] md:text-xs flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {citizen.activeAlerts} alert{citizen.activeAlerts === 1 ? "" : "y"}
                                </Badge>
                              )}
                              {citizen.permits.map((permit, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none rounded-full px-2 py-0.5 text-[10px] md:text-xs">
                                  {permit.permitTypeName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground self-center" aria-hidden />
                        </div>
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    page={citizensPage}
                    totalPages={citizensTotalPages}
                    totalCount={citizensTotalCount}
                    pageSize={PAGE_SIZE}
                    onPrev={() => setCitizensPage((p) => p - 1)}
                    onNext={() => setCitizensPage((p) => p + 1)}
                    loading={citizensLoading}
                  />
                </>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{debouncedQuery ? "Brak wyników dla podanych kryteriów" : "Brak obywateli w rejestrze"}</p>
                  {(debouncedQuery || activeFilterCount > 0) && (
                    <Button variant="outline" size="sm" className="mt-3 rounded-lg" onClick={clearAll}>
                      Wyczyść wyszukiwanie
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="firearms" className="mt-0">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-2 px-4 pt-4 md:px-6">
              <CardTitle className="text-base md:text-lg">Broń</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                {debouncedQuery ? `Wyniki dla „${debouncedQuery}”` : "Wpisz frazę lub ustaw filtry"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
              {firearmsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="h-24 md:h-28 rounded-2xl bg-muted animate-pulse" />)}
                </div>
              ) : firearms.length > 0 ? (
                <>
                  <div className="space-y-2.5 md:space-y-3">
                    {firearms.map((f) => (
                      <div key={f.id} className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <CitizenNavIconTile>
                            <Shield />
                          </CitizenNavIconTile>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h3 className="font-semibold text-sm md:text-base text-foreground">{f.brand} {f.model}</h3>
                              {getCategoryBadge(f.category)}
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs md:text-sm mb-2">
                              <div>
                                <span className="text-muted-foreground block text-[10px] md:text-xs">Właściciel</span>
                                <span className="font-medium">{f.ownerName}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px] md:text-xs">PESEL</span>
                                <span className="font-mono">{f.ownerPesel}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px] md:text-xs">Nr seryjny</span>
                                <span className="font-mono">{f.serialNumber}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px] md:text-xs">Kaliber</span>
                                <span className="font-medium">{f.caliber}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px] md:text-xs">Pozwolenie</span>
                                <span className="font-medium truncate block">{f.permitNumber}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px] md:text-xs">Rejestracja</span>
                                <span className="font-medium">{formatDate(f.registeredAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {getStatusBadge(f.status)}
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none rounded-full px-2 py-0.5 text-[10px] md:text-xs">
                                {f.permitType}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    page={firearmsPage}
                    totalPages={firearmsTotalPages}
                    totalCount={firearmsTotalCount}
                    pageSize={PAGE_SIZE}
                    onPrev={() => doFirearmSearch(firearmsPage - 1)}
                    onNext={() => doFirearmSearch(firearmsPage + 1)}
                    loading={firearmsLoading}
                  />
                </>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    {firearmsSearched ? "Brak wyników dla podanych kryteriów" : "Wpisz frazę w wyszukiwarce powyżej"}
                  </p>
                  {(debouncedQuery || activeFilterCount > 0) && (
                    <Button variant="outline" size="sm" className="mt-3 rounded-lg" onClick={clearAll}>
                      Wyczyść wyszukiwanie
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SearchFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        description={activeTab === "citizens" ? "Ogranicz wyszukiwanie obywateli" : "Ogranicz wyszukiwanie broni"}
        onApply={applyFilters}
        onReset={resetFilters}
      >
            {activeTab === "citizens" ? (
              <SearchFilterField label="Szukaj w polu" htmlFor="citizenSearchBy">
                <Select value={draftCitizenSearchBy} onValueChange={(v) => setDraftCitizenSearchBy(v as CitizenSearchBy)}>
                  <SelectTrigger id="citizenSearchBy" className={filterSelectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[70] rounded-xl">
                    <SelectItem value="all">Wszystkie pola</SelectItem>
                    <SelectItem value="name">Imię i nazwisko</SelectItem>
                    <SelectItem value="pesel">PESEL</SelectItem>
                    <SelectItem value="permitNumber">Numer pozwolenia</SelectItem>
                  </SelectContent>
                </Select>
              </SearchFilterField>
            ) : (
              <SearchFilterField label="Szukaj w polu" htmlFor="firearmSearchBy">
                <Select value={draftFirearmSearchBy} onValueChange={(v) => setDraftFirearmSearchBy(v as FirearmSearchBy)}>
                  <SelectTrigger id="firearmSearchBy" className={filterSelectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[70] rounded-xl">
                    <SelectItem value="serialNumber">Numer seryjny</SelectItem>
                    <SelectItem value="pesel">PESEL właściciela</SelectItem>
                    <SelectItem value="permitNumber">Numer pozwolenia</SelectItem>
                    <SelectItem value="ownerName">Imię i nazwisko właściciela</SelectItem>
                  </SelectContent>
                </Select>
              </SearchFilterField>
            )}

            <SearchFilterField label="Typ pozwolenia" htmlFor="permitTypeFilter">
              <Select value={draftPermitTypeFilter} onValueChange={(v) => setDraftPermitTypeFilter(v as typeof draftPermitTypeFilter)}>
                <SelectTrigger id="permitTypeFilter" className={filterSelectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[70] rounded-xl">
                  <SelectItem value="all">Wszystkie typy</SelectItem>
                  {PERMIT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SearchFilterField>

            {activeTab === "citizens" && (
              <SearchFilterField label="Alerty medyczne" htmlFor="onlyWithAlerts">
                <div className="flex items-start gap-2.5 rounded-xl bg-card px-2.5 py-2 ring-1 ring-border/80">
                  <Checkbox
                    id="onlyWithAlerts"
                    checked={draftOnlyWithAlerts}
                    onCheckedChange={(v) => setDraftOnlyWithAlerts(v === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="onlyWithAlerts" className="text-sm font-normal leading-snug cursor-pointer">
                    Tylko obywatele z aktywnymi alertami medycznymi
                  </Label>
                </div>
              </SearchFilterField>
            )}
      </SearchFiltersSheet>
    </div>
  );
}
