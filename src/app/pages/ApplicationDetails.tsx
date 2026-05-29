import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { User, Shield, AlertCircle, Clock, CreditCard, Paperclip } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { wpaService } from "../../services/wpaService";
import { citizenService } from "../../services/citizenService";
import { WpaApplicationReviewBar } from "../components/wpa/WpaApplicationReviewBar";
import { PermitApplicationAttachmentsCard } from "../components/wpa/PermitApplicationAttachmentsCard";
import { ReviewCollapsibleCard } from "../components/wpa/ReviewCollapsibleCard";
import { ApplicationDetailField, applicationSectionIcon } from "../components/wpa/ApplicationDetailField";
import { PromiseQrModal } from "../components/citizen/PromiseQrModal";
import { formatApplicationId } from "../../lib/registryNumbers";
import { getPromiseQrMatchResult, getPromiseQrUnavailableMessage } from "../../lib/promiseQrAvailability";
import { getApplicationStatusMeta } from "../../lib/statusUi";
import type {
  WpaPermitApplicationDto,
  WpaPromiseApplicationDto,
  PermitApplicationDto,
  PromiseApplicationDto,
  CitizenProfileDto,
  PermitDto,
  PromiseDto,
} from "../../types/api";
import { getPermitApplicationTypeLabel } from "../utils/permitLabels";

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

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(s: string) {
  return new Date(s).toLocaleString("pl-PL");
}

export function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = (searchParams.get("type") as "permit" | "promise") || "permit";
  const isOfficer = localStorage.getItem("userRole") === "officer";

  const [permitApp, setPermitApp] = useState<WpaPermitApplicationDto | PermitApplicationDto | null>(null);
  const [promiseApp, setPromiseApp] = useState<WpaPromiseApplicationDto | PromiseApplicationDto | null>(null);
  const [profile, setProfile] = useState<CitizenProfileDto | null>(null);
  const [linkedPermit, setLinkedPermit] = useState<PermitDto | null>(null);
  const [issuedPromises, setIssuedPromises] = useState<PromiseDto[]>([]);
  const [selectedPromiseId, setSelectedPromiseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLinkedPermit(null);
    setPermitApp(null);
    setPromiseApp(null);
    setProfile(null);

    const load = async () => {
      try {
        if (isOfficer) {
          if (type === "permit") {
            const d = await wpaService.getPermitApplicationById(id);
            setPermitApp(d);
          } else {
            const d = await wpaService.getPromiseApplicationById(id);
            setPromiseApp(d);
            try {
              const citizen = await wpaService.getCitizenById(d.citizenId);
              setLinkedPermit(citizen.permits.find((p) => p.id === d.permitId) ?? null);
            } catch {
              // optional context for review bar
            }
          }
        } else if (type === "permit") {
          const [apps, citizenProfile] = await Promise.all([
            citizenService.getPermitApplications(),
            citizenService.getProfile(),
          ]);
          setPermitApp(apps.find((item) => item.id === id) ?? null);
          setProfile(citizenProfile);
        } else {
          const [apps, citizenProfile] = await Promise.all([
            citizenService.getPromiseApplications(),
            citizenService.getProfile(),
          ]);
          setPromiseApp(apps.find((item) => item.id === id) ?? null);
          setProfile(citizenProfile);
        }
      } catch {
        // not found — leave app null
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, type, isOfficer]);

  useEffect(() => {
    if (isOfficer) return;
    citizenService
      .getPromises()
      .then(setIssuedPromises)
      .catch(() => setIssuedPromises([]));
  }, [isOfficer]);

  const app = permitApp ?? promiseApp;
  const selectedPromise = issuedPromises.find((promise) => promise.id === selectedPromiseId) ?? null;

  const applicantName =
    app && "citizenName" in app
      ? app.citizenName
      : profile
        ? `${profile.firstName} ${profile.lastName}`.trim()
        : "—";
  const applicantPesel =
    app && "citizenPesel" in app ? app.citizenPesel : profile?.peselMasked ?? "—";

  useEffect(() => {
    if (loading || !app || !id || !isOfficer) return;
    if (["Submitted", "UnderReview", "Paid"].includes(app.statusName)) {
      navigate(`/decision/${id}?type=${type}`, { replace: true });
    }
  }, [loading, app, id, type, isOfficer, navigate]);

  if (loading) {
    return (
      <div className="pt-2 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 rounded-2xl bg-muted animate-pulse" />
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="pt-2">
        <p className="text-muted-foreground">Nie znaleziono wniosku.</p>
      </div>
    );
  }

  const title = permitApp
    ? `Wniosek o pozwolenie — ${getPermitApplicationTypeLabel(permitApp)}`
    : promiseApp
      ? `Wniosek o promesę — ${promiseApp.requestedWeaponType}`
      : "Wniosek";

  return (
    <>
      <div className="pt-2">
      {isOfficer ? (
        <WpaApplicationReviewBar
          type={type}
          permitApp={permitApp as WpaPermitApplicationDto | null}
          promiseApp={promiseApp as WpaPromiseApplicationDto | null}
          linkedPermit={linkedPermit}
        />
      ) : (
        <div className="mb-6 px-1">
          <div className="flex items-start justify-between mb-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex-1 pr-4">{title}</h1>
            <div className="mt-1">{getStatusBadge(app.statusName)}</div>
          </div>
          <p className="text-sm text-muted-foreground">
            Nr wniosku: <span className="font-mono text-foreground">{formatApplicationId(app.id)}</span>
          </p>
        </div>
      )}

      <div className="grid gap-2.5 md:gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-2.5 md:gap-4">
          {app.statusName === "Rejected" && app.rejectionReason && (
            <ReviewCollapsibleCard
              title="Powód odrzucenia"
              description="Decyzja negatywna WPA"
              icon={applicationSectionIcon(<AlertCircle />)}
              defaultOpen
              priority
              className="bg-red-50/50"
            >
              <p className="text-xs md:text-sm text-red-800 leading-relaxed whitespace-pre-wrap">{app.rejectionReason}</p>
            </ReviewCollapsibleCard>
          )}

          {app.statusName === "RequiresCorrection" && app.correctionNotes && (
            <ReviewCollapsibleCard
              title="Wezwanie do uzupełnienia"
              description="Uwagi urzędnika do poprawy wniosku"
              icon={applicationSectionIcon(<AlertCircle />)}
              defaultOpen
              priority
              className="bg-orange-50/50"
            >
              <p className="text-xs md:text-sm text-orange-900 leading-relaxed whitespace-pre-wrap">{app.correctionNotes}</p>
            </ReviewCollapsibleCard>
          )}

          {isOfficer && (
            <ReviewCollapsibleCard
              title="Dane wnioskodawcy"
              description="Identyfikacja osoby składającej wniosek"
              icon={applicationSectionIcon(<User />)}
              defaultOpen={false}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-4">
                <ApplicationDetailField label="Imię i nazwisko">{applicantName}</ApplicationDetailField>
                <ApplicationDetailField label="PESEL" valueClassName="font-mono">
                  {applicantPesel}
                </ApplicationDetailField>
              </div>
            </ReviewCollapsibleCard>
          )}

          {permitApp && (
            <ReviewCollapsibleCard
              title="Informacje o pozwoleniu"
              description="Rodzaj pozwolenia, uzasadnienie i ważność badań"
              icon={applicationSectionIcon(<Shield />)}
              defaultOpen
            >
              <div className="space-y-3 md:space-y-4">
                <ApplicationDetailField label="Rodzaj pozwolenia">
                  {getPermitApplicationTypeLabel(permitApp)}
                </ApplicationDetailField>
                <Separator className="bg-border" />
                <ApplicationDetailField label="Uzasadnienie" valueClassName="font-normal">
                  <p className="text-xs md:text-sm bg-muted/30 rounded-lg p-2.5 md:p-3 leading-relaxed whitespace-pre-wrap">
                    {permitApp.reason}
                  </p>
                </ApplicationDetailField>
                <Separator className="bg-border" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-4">
                  <ApplicationDetailField label="Ważność bad. lekarskiego">
                    {permitApp.medicalExamExpiryDate ? formatDate(permitApp.medicalExamExpiryDate) : "—"}
                  </ApplicationDetailField>
                  <ApplicationDetailField label="Ważność bad. psychologicznego">
                    {permitApp.psychologicalExamExpiryDate ? formatDate(permitApp.psychologicalExamExpiryDate) : "—"}
                  </ApplicationDetailField>
                </div>
              </div>
            </ReviewCollapsibleCard>
          )}

          {isOfficer && permitApp && (
            <ReviewCollapsibleCard
              title="Załączniki"
              description="Zaświadczenia lekarskie i psychologiczne dołączone przez obywatela"
              icon={applicationSectionIcon(<Paperclip />)}
              defaultOpen={false}
            >
              <PermitApplicationAttachmentsCard
                bare
                applicationId={permitApp.id}
                attachments={(permitApp.attachments ?? []) as WpaPermitApplicationDto["attachments"]}
              />
            </ReviewCollapsibleCard>
          )}

          {promiseApp && (
            <ReviewCollapsibleCard
              title="Informacje o promesie"
              description="Pozwolenie bazowe, broń i kod QR po wydaniu"
              icon={applicationSectionIcon(<CreditCard />)}
              defaultOpen
            >
              <div className="space-y-3 md:space-y-4">
                <ApplicationDetailField label="Pozwolenie bazowe" valueClassName="font-mono">
                  {promiseApp.permitNumber}
                  {"permitType" in promiseApp && promiseApp.permitType && (
                    <span className="block font-sans text-[11px] md:text-xs text-muted-foreground font-normal mt-0.5">
                      ({promiseApp.permitType})
                    </span>
                  )}
                </ApplicationDetailField>
                <Separator className="bg-border" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-4">
                  <ApplicationDetailField label="Wnioskowana broń">{promiseApp.requestedWeaponType}</ApplicationDetailField>
                  <ApplicationDetailField label="Ilość">{promiseApp.requestedQuantity} szt.</ApplicationDetailField>
                </div>
                {!isOfficer && (
                  <>
                    <Separator className="bg-border" />
                    <div className="space-y-2 md:space-y-3">
                      {(() => {
                        const qrState = getPromiseQrMatchResult(promiseApp, issuedPromises);
                        if (qrState.canOpenQrModal && qrState.issuedPromise) {
                          return (
                            <>
                              <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">
                                Kod QR promesy jest gotowy. Możesz otworzyć go bez przechodzenia do innego widoku.
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto rounded-xl min-h-[44px]"
                                onClick={() => setSelectedPromiseId(qrState.issuedPromise!.id)}
                              >
                                Pokaż kod QR
                              </Button>
                            </>
                          );
                        }
                        if (qrState.showPendingFallback) {
                          return (
                            <>
                              <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">
                                Wniosek jest zaakceptowany, ale wydana promesa z kodem QR nie jest jeszcze dostępna.
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto rounded-xl min-h-[44px]"
                                onClick={() =>
                                  toast.info("Wniosek został zaakceptowany, ale QR promesy nie jest jeszcze dostępny.")
                                }
                              >
                                QR w przygotowaniu
                              </Button>
                            </>
                          );
                        }
                        return (
                          <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">
                            {getPromiseQrUnavailableMessage(promiseApp.statusName)}
                          </p>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            </ReviewCollapsibleCard>
          )}
        </div>

        <div className="flex flex-col gap-2.5 md:gap-4">
          <ReviewCollapsibleCard
            title="Status"
            description="Postęp rozpatrzenia wniosku"
            icon={applicationSectionIcon(<Clock />)}
            defaultOpen
          >
            <div className="space-y-3 md:space-y-4">
              <ApplicationDetailField label="Aktualny status">
                <div className="mt-0.5">{getStatusBadge(app.statusName)}</div>
              </ApplicationDetailField>
              <Separator className="bg-border" />
              <ApplicationDetailField label="Data złożenia">{formatDateTime(app.createdAt)}</ApplicationDetailField>
              {app.reviewedAt && (
                <ApplicationDetailField label="Data rozpatrzenia">{formatDateTime(app.reviewedAt)}</ApplicationDetailField>
              )}
              {"reviewedByOfficerName" in app && app.reviewedByOfficerName && (
                <ApplicationDetailField label="Urzędnik">{app.reviewedByOfficerName}</ApplicationDetailField>
              )}
            </div>
          </ReviewCollapsibleCard>
        </div>
      </div>
      </div>
      <PromiseQrModal
        open={Boolean(selectedPromise)}
        onOpenChange={(open) => {
          if (!open) setSelectedPromiseId(null);
        }}
        promiseData={selectedPromise}
      />
    </>
  );
}

// Required so the ID interpolation has access to the discriminated app variant.
// (kept above; nothing to do here)
