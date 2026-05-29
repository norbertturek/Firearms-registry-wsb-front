import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { cn } from "../components/ui/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { AppTabsList } from "../components/ui/AppTabsList";
import { AppTabTrigger } from "../components/ui/AppTabTrigger";
import { SearchBarWithFilters } from "../components/search/SearchBarWithFilters";
import { SearchFiltersSheet, SearchFilterField, filterSelectTriggerClass } from "../components/search/SearchFiltersSheet";
import { Shield, CreditCard, FileText, QrCode } from "lucide-react";
import { CITIZEN_NAV_ICON_TONE, CITIZEN_NAV_ICON_TONE_DISABLED } from "../utils/citizenCardUi";
import { CitizenApplicationCard } from "../components/citizen/CitizenApplicationCard";
import { toast } from "sonner";
import { citizenService } from "../../services/citizenService";
import { wpaService } from "../../services/wpaService";
import { canApplyForPromise } from "../utils/permitEligibility";
import { PermitRequiredForPromiseNotice } from "../components/citizen/PermitRequiredForPromiseNotice";
import { getPermitApplicationTypeLabel } from "../utils/permitLabels";
import { ApplicationListTile } from "../components/wpa/ApplicationListTile";
import { WpaListSectionHeader } from "../components/wpa/WpaListSectionHeader";
import { PromiseQrModal } from "../components/citizen/PromiseQrModal";
import { getPromiseQrMatchResult } from "../../lib/promiseQrAvailability";
import { getApplicationStatusMeta } from "../../lib/statusUi";
import type {
  PermitApplicationDto,
  PromiseApplicationDto,
  PromiseDto,
  WpaPermitApplicationDto,
  WpaPromiseApplicationDto,
} from "../../types/api";

const PERMIT_TYPE_LABELS: Record<string, string> = {
  "0": "Sportowe",
  "1": "Kolekcjonerskie",
  "2": "Ochrony osobistej",
  "3": "Łowieckie",
  "4": "Inne",
  Sport: "Sportowe",
  Hunting: "Łowieckie",
  Collection: "Kolekcjonerskie",
  Protection: "Ochrony osobistej",
  Other: "Inne",
};

function getStatusBadge(status: string) {
  const meta = getApplicationStatusMeta(status);
  if (meta) {
    return (
      <Badge variant={meta.variant} className={meta.badgeClassName}>
        {meta.label}
      </Badge>
    );
  }
  return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

type AnyPermit = PermitApplicationDto | WpaPermitApplicationDto;
type AnyPromise = PromiseApplicationDto | WpaPromiseApplicationDto;

function isWpaPermit(a: AnyPermit): a is WpaPermitApplicationDto {
  return "citizenName" in a;
}

function isWpaPromise(a: AnyPromise): a is WpaPromiseApplicationDto {
  return "citizenName" in a;
}

type ApplicationSearchBy = "all" | "citizen" | "pesel" | "type" | "reason";

export function ApplicationsList() {
  const navigate = useNavigate();
  const isOfficer = localStorage.getItem("userRole") === "officer";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchBy, setSearchBy] = useState<ApplicationSearchBy>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"permits" | "promises">("permits");
  const [draftStatusFilter, setDraftStatusFilter] = useState("all");
  const [draftSearchBy, setDraftSearchBy] = useState<ApplicationSearchBy>("all");
  const [permitApps, setPermitApps] = useState<AnyPermit[]>([]);
  const [promiseApps, setPromiseApps] = useState<AnyPromise[]>([]);
  const [issuedPromises, setIssuedPromises] = useState<PromiseDto[]>([]);
  const [selectedPromiseId, setSelectedPromiseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [promiseAllowed, setPromiseAllowed] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (isOfficer) {
          const [pa, pra] = await Promise.all([
            wpaService.getPermitApplications({ page: 1, pageSize: 100 }),
            wpaService.getPromiseApplications({ page: 1, pageSize: 100 }),
          ]);
          setPermitApps(pa.items);
          setPromiseApps(pra.items);
        } else {
          const [pa, pra, permits, promises] = await Promise.all([
            citizenService.getPermitApplications(),
            citizenService.getPromiseApplications(),
            citizenService.getPermits(),
            citizenService.getPromises(),
          ]);
          setPermitApps(pa);
          setPromiseApps(pra);
          setIssuedPromises(promises);
          setPromiseAllowed(canApplyForPromise(permits));
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOfficer]);

  const matchApplicationSearch = (
    search: string,
    fields: { citizenName?: string; citizenPesel?: string; typeLabel?: string; reason?: string; id?: string },
  ) => {
    if (!search) return true;
    if (searchBy === "citizen" && fields.citizenName) return fields.citizenName.toLowerCase().includes(search);
    if (searchBy === "pesel" && fields.citizenPesel) return fields.citizenPesel.includes(search);
    if (searchBy === "type" && fields.typeLabel) return fields.typeLabel.toLowerCase().includes(search);
    if (searchBy === "reason" && fields.reason) return fields.reason.toLowerCase().includes(search);
    return (
      (fields.id?.toLowerCase().includes(search) ?? false)
      || (fields.typeLabel?.toLowerCase().includes(search) ?? false)
      || (fields.citizenName?.toLowerCase().includes(search) ?? false)
      || (fields.citizenPesel?.includes(search) ?? false)
      || (fields.reason?.toLowerCase().includes(search) ?? false)
    );
  };

  const filterPermit = (apps: AnyPermit[]) =>
    apps.filter((a) => {
      const search = searchTerm.toLowerCase();
      const typeName = getPermitApplicationTypeLabel(a);
      const matchSearch = matchApplicationSearch(search, {
        id: a.id,
        typeLabel: typeName,
        citizenName: isWpaPermit(a) ? a.citizenName : undefined,
        citizenPesel: isWpaPermit(a) ? a.citizenPesel : undefined,
        reason: !isWpaPermit(a) ? a.reason : undefined,
      });
      const matchStatus = statusFilter === "all" || a.statusName === statusFilter;
      return matchSearch && matchStatus;
    });

  const filterPromise = (apps: AnyPromise[]) =>
    apps.filter((a) => {
      const search = searchTerm.toLowerCase();
      const matchSearch = matchApplicationSearch(search, {
        id: a.id,
        typeLabel: a.requestedWeaponType,
        citizenName: isWpaPromise(a) ? a.citizenName : undefined,
        citizenPesel: isWpaPromise(a) ? a.citizenPesel : undefined,
        reason: a.permitNumber,
      });
      const matchStatus = statusFilter === "all" || a.statusName === statusFilter;
      return matchSearch && matchStatus;
    });

  const filteredPermit = filterPermit(permitApps);
  const filteredPromise = filterPromise(promiseApps);
  const selectedPromise = issuedPromises.find((promise) => promise.id === selectedPromiseId) ?? null;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count += 1;
    if (searchBy !== "all") count += 1;
    return count;
  }, [statusFilter, searchBy]);

  const searchPlaceholder = isOfficer
    ? searchBy === "citizen" ? "Imię lub nazwisko wnioskodawcy..."
      : searchBy === "pesel" ? "PESEL wnioskodawcy..."
      : searchBy === "type" ? "Typ pozwolenia..."
      : "Imię, PESEL, typ, numer..."
    : searchBy === "type" ? "Typ pozwolenia..."
      : searchBy === "reason" ? "Uzasadnienie wniosku..."
      : "Typ broni, numer pozwolenia...";

  const openFilters = () => {
    setDraftStatusFilter(statusFilter);
    setDraftSearchBy(searchBy);
    setFiltersOpen(true);
  };

  const applyFilters = () => {
    setStatusFilter(draftStatusFilter);
    setSearchBy(draftSearchBy);
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setDraftStatusFilter("all");
    setDraftSearchBy("all");
  };

  const clearActiveFilters = () => {
    setStatusFilter("all");
    setSearchBy("all");
    setDraftStatusFilter("all");
    setDraftSearchBy("all");
  };

  const clearSearchAndFilters = () => {
    setSearchTerm("");
    clearActiveFilters();
  };

  const hasActiveQuery = searchTerm.length > 0 || activeFilterCount > 0;

  if (loading) {
    return (
      <div className="pt-2">
        <div className="mb-6 px-1">
          <div className="h-8 w-40 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-56 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  const isPromiseCreateTab = activeTab === "promises";
  const createTileDisabled = !isOfficer && isPromiseCreateTab && !promiseAllowed;
  const CreateTileIcon = isPromiseCreateTab ? QrCode : FileText;
  const createTileLabel = isPromiseCreateTab ? "Nowa promesa" : "Nowy wniosek";
  const createTilePath = isPromiseCreateTab ? "/applications/new/promise" : "/applications/new/permit";

  const handleCreateTileActivate = () => {
    if (createTileDisabled) return;
    navigate(createTilePath);
  };

  return (
    <div className="pt-2 max-md:pb-2">
      <div className="mb-4 px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">
          {isOfficer ? "Wnioski" : "Moje sprawy"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isOfficer ? "Wszystkie wnioski w systemie" : "Lista Twoich wniosków"}
        </p>
      </div>

      <SearchBarWithFilters
        className="mb-4"
        value={searchTerm}
        onValueChange={setSearchTerm}
        placeholder={searchPlaceholder}
        ariaLabel="Wyszukaj wnioski"
        activeFilterCount={activeFilterCount}
        onFiltersClick={openFilters}
      />

      <SearchFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        description="Ogranicz listę wniosków"
        onApply={applyFilters}
        onReset={resetFilters}
      >
        <SearchFilterField label="Szukaj w polu" htmlFor="applicationSearchBy">
          <Select value={draftSearchBy} onValueChange={(v) => setDraftSearchBy(v as ApplicationSearchBy)}>
            <SelectTrigger id="applicationSearchBy" className={filterSelectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[70] rounded-xl">
              <SelectItem value="all">Wszystkie pola</SelectItem>
              {isOfficer && <SelectItem value="citizen">Wnioskodawca</SelectItem>}
              {isOfficer && <SelectItem value="pesel">PESEL</SelectItem>}
              <SelectItem value="type">{isOfficer ? "Typ pozwolenia / broń" : "Typ pozwolenia"}</SelectItem>
              {!isOfficer && <SelectItem value="reason">Uzasadnienie / nr pozwolenia</SelectItem>}
            </SelectContent>
          </Select>
        </SearchFilterField>
        <SearchFilterField label="Status" htmlFor="statusFilter">
          <Select value={draftStatusFilter} onValueChange={setDraftStatusFilter}>
            <SelectTrigger id="statusFilter" className={filterSelectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[70] rounded-xl">
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="Submitted">Złożone</SelectItem>
              <SelectItem value="Paid">Opłacone</SelectItem>
              <SelectItem value="UnderReview">W weryfikacji</SelectItem>
              <SelectItem value="Approved">Zaakceptowane</SelectItem>
              <SelectItem value="Rejected">Odrzucone</SelectItem>
              <SelectItem value="RequiresCorrection">Wymagające uzupełnienia</SelectItem>
            </SelectContent>
          </Select>
        </SearchFilterField>
      </SearchFiltersSheet>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "permits" | "promises")} className="space-y-6">
        <AppTabsList className="grid grid-cols-2">
          <AppTabTrigger value="permits" label="Pozwolenia" icon={Shield} count={filteredPermit.length} />
          <AppTabTrigger value="promises" label="Promesy" icon={CreditCard} count={filteredPromise.length} />
        </AppTabsList>

        {!isOfficer && (
          <div className="flex justify-center -mt-2">
            <Card
              role="button"
              tabIndex={createTileDisabled ? -1 : 0}
              aria-disabled={createTileDisabled}
              aria-label={createTileLabel}
              className={cn(
                "w-full max-w-[160px] rounded-2xl border-none shadow-sm active:scale-[0.98]",
                createTileDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
              )}
              onClick={handleCreateTileActivate}
              onKeyDown={(event) => {
                if (createTileDisabled) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleCreateTileActivate();
                }
              }}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-[100px]">
                <div
                  className={cn(
                    "p-3 rounded-2xl mb-1",
                    createTileDisabled ? CITIZEN_NAV_ICON_TONE_DISABLED : CITIZEN_NAV_ICON_TONE,
                  )}
                >
                  <CreateTileIcon className="h-6 w-6" aria-hidden />
                </div>
                <span className="text-xs font-semibold leading-tight">{createTileLabel}</span>
              </CardContent>
            </Card>
          </div>
        )}

        <TabsContent value="permits" className="mt-0">
          {isOfficer ? (
            <div className="space-y-3">
              <WpaListSectionHeader
                title="Wnioski o pozwolenie"
                description="Wszyscy wnioskodawcy"
              />
              {filteredPermit.length > 0 ? (
                <div className="space-y-3">
                  {filteredPermit.map((app) => {
                    const lines = isWpaPermit(app)
                      ? [`Wnioskodawca: ${app.citizenName}`, `PESEL: ${app.citizenPesel}`]
                      : [app.reason];

                    return (
                      <ApplicationListTile
                        key={app.id}
                        icon={<Shield />}
                        title={`Pozwolenie — ${getPermitApplicationTypeLabel(app)}`}
                        lines={lines}
                        date={formatDate(app.createdAt)}
                        statusBadge={getStatusBadge(app.statusName)}
                        onClick={() => navigate(`/applications/${app.id}?type=permit`)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground rounded-2xl bg-muted/20">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" aria-hidden />
                  {hasActiveQuery ? (
                    <>
                      <p className="mb-3">Brak wniosków dla wybranych kryteriów</p>
                      <Button variant="outline" className="rounded-xl min-h-[44px]" onClick={clearSearchAndFilters} aria-label="Wyczyść filtry">
                        Wyczyść filtry
                      </Button>
                    </>
                  ) : (
                    <p className="mb-3">Brak wniosków o pozwolenie</p>
                  )}
                </div>
              )}
            </div>
          ) : filteredPermit.length > 0 ? (
            <div className="space-y-3">
              {filteredPermit.map((app) => (
                <CitizenApplicationCard
                  key={app.id}
                  variant="permit"
                  title={`Wniosek o pozwolenie — ${getPermitApplicationTypeLabel(app)}`}
                  subtitle={app.reason}
                  date={formatDate(app.createdAt)}
                  statusBadge={getStatusBadge(app.statusName)}
                  onClick={() => navigate(`/applications/${app.id}?type=permit`)}
                  footer={
                    <>
                      {app.statusName === "RequiresCorrection" && app.correctionNotes && (
                        <div className="bg-orange-50 rounded-lg p-2 text-xs text-orange-900">
                          <strong>Uwagi:</strong> {app.correctionNotes}
                        </div>
                      )}
                      {app.statusName === "RequiresCorrection" && (
                        <Button
                          size="sm"
                          className="rounded-xl"
                          onClick={() => navigate(`/applications/${app.id}/correction?type=permit`)}
                        >
                          Uzupelnij wniosek
                        </Button>
                      )}
                      {app.statusName === "Rejected" && app.rejectionReason && (
                        <div className="bg-red-50 rounded-lg p-2 text-xs text-red-900">
                          <strong>Powód odrzucenia:</strong> {app.rejectionReason}
                        </div>
                      )}
                    </>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
              {hasActiveQuery ? (
                <>
                  <p className="mb-3">Brak wniosków dla wybranych kryteriów</p>
                  <Button variant="outline" className="rounded-xl min-h-[44px]" onClick={clearSearchAndFilters} aria-label="Wyczyść filtry">
                    Wyczyść filtry
                  </Button>
                </>
              ) : (
                <>
                  <p className="mb-3">Brak wniosków o pozwolenie</p>
                  <Button className="rounded-xl" onClick={() => navigate("/applications/new/permit")}>
                    Złóż wniosek
                  </Button>
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="promises" className="mt-0 space-y-4">
          {!isOfficer && !promiseAllowed && (
            <PermitRequiredForPromiseNotice />
          )}

          {isOfficer ? (
            <div className="space-y-3">
              <WpaListSectionHeader
                title="Wnioski o e-Promesę"
                description="Wszyscy wnioskodawcy"
              />
              {filteredPromise.length > 0 ? (
                <div className="space-y-3">
                  {filteredPromise.map((app) => {
                    const lines = isWpaPromise(app)
                      ? [`Wnioskodawca: ${app.citizenName}`, `PESEL: ${app.citizenPesel}`, `Pozwolenie: ${app.permitNumber} · Ilość: ${app.requestedQuantity}`]
                      : [`Pozwolenie: ${app.permitNumber} · Ilość: ${app.requestedQuantity}`];

                    return (
                      <ApplicationListTile
                        key={app.id}
                        icon={<CreditCard />}
                        title={app.requestedWeaponType}
                        lines={lines}
                        date={formatDate(app.createdAt)}
                        statusBadge={getStatusBadge(app.statusName)}
                        onClick={() => navigate(`/applications/${app.id}?type=promise`)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground rounded-2xl bg-muted/20">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" aria-hidden />
                  {hasActiveQuery ? (
                    <>
                      <p className="mb-3">Brak wniosków dla wybranych kryteriów</p>
                      <Button variant="outline" className="rounded-xl min-h-[44px]" onClick={clearSearchAndFilters} aria-label="Wyczyść filtry">
                        Wyczyść filtry
                      </Button>
                    </>
                  ) : (
                    <p className="mb-3">Brak wniosków o promesę</p>
                  )}
                </div>
              )}
            </div>
          ) : filteredPromise.length > 0 ? (
            <div className="space-y-3">
              {filteredPromise.map((app) => {
                const qrState = getPromiseQrMatchResult(app, issuedPromises);
                return (
                  <CitizenApplicationCard
                    key={app.id}
                    variant="promise"
                    title={`Wniosek o e-Promesę — ${app.requestedWeaponType}`}
                    subtitle={`Pozwolenie: ${app.permitNumber} · Ilość: ${app.requestedQuantity}`}
                    date={formatDate(app.createdAt)}
                    statusBadge={getStatusBadge(app.statusName)}
                    onClick={() => navigate(`/applications/${app.id}?type=promise`)}
                    footer={
                      <>
                        {(qrState.canOpenQrModal && qrState.issuedPromise) || qrState.showPendingFallback ? (
                          <div className="w-full flex justify-center">
                            {qrState.canOpenQrModal && qrState.issuedPromise ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => setSelectedPromiseId(qrState.issuedPromise!.id)}
                              >
                                Pokaż kod QR
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                                onClick={() => {
                                  toast.info("Wniosek został zaakceptowany, ale QR promesy nie jest jeszcze dostępny.");
                                }}
                              >
                                QR w przygotowaniu
                              </Button>
                            )}
                          </div>
                        ) : null}
                        {app.statusName === "RequiresCorrection" && app.correctionNotes && (
                          <div className="bg-orange-50 rounded-lg p-2 text-xs text-orange-900">
                            <strong>Uwagi:</strong> {app.correctionNotes}
                          </div>
                        )}
                        {app.statusName === "RequiresCorrection" && (
                          <Button
                            size="sm"
                            className="rounded-xl"
                            onClick={() => navigate(`/applications/${app.id}/correction?type=promise`)}
                          >
                            Uzupelnij wniosek
                          </Button>
                        )}
                        {app.statusName === "Rejected" && app.rejectionReason && (
                          <div className="bg-red-50 rounded-lg p-2 text-xs text-red-900">
                            <strong>Powód odrzucenia:</strong> {app.rejectionReason}
                          </div>
                        )}
                      </>
                    }
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
              {hasActiveQuery ? (
                <>
                  <p className="mb-3">Brak wniosków dla wybranych kryteriów</p>
                  <Button variant="outline" className="rounded-xl min-h-[44px]" onClick={clearSearchAndFilters} aria-label="Wyczyść filtry">
                    Wyczyść filtry
                  </Button>
                </>
              ) : (
                <>
                  <p className="mb-3">Brak wniosków o promesę</p>
                  {promiseAllowed && (
                    <Button className="rounded-xl" onClick={() => navigate("/applications/new/promise")}>
                      Złóż wniosek o promesę
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <PromiseQrModal
        open={Boolean(selectedPromise)}
        onOpenChange={(open) => {
          if (!open) setSelectedPromiseId(null);
        }}
        promiseData={selectedPromise}
      />
    </div>
  );
}
