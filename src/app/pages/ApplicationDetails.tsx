import { useParams, useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { FileText, User, MapPin, Phone, Mail, Shield, Download, AlertCircle } from "lucide-react";

export function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Sprawdź czy to jest panel oficera (na potrzeby przycisków akcji)
  const isOfficer = localStorage.getItem("userRole") === "officer";

  // Mock data - in real app this would come from API
  const application = {
    id: id || "WNI-2026-001234",
    type: "Wniosek o pozwolenie na broń sportową",
    status: "w trakcie",
    submittedDate: "2026-04-10",
    lastUpdate: "2026-04-12",
    applicant: {
      firstName: "Jan",
      lastName: "Kowalski",
      pesel: "***********",
      idNumber: "ABC123456",
      address: "ul. Przykładowa 123/45",
      city: "Warszawa",
      postalCode: "00-001",
      phone: "+48 123 456 789",
      email: "jan.kowalski@example.com",
    },
    weaponInfo: {
      type: "Pistolet",
      purpose: "Sport strzelecki - uczestnictwo w zawodach sportowych",
    },
    documents: {
      medicalCertificate: true,
      psychologicalTest: true,
      training: true,
    },
    rejectionReason: id === "WNI-2026-001231" ? "Stwierdzono nieprawidłowości w dokumentacji medycznej oraz brak wystarczającego uzasadnienia do posiadania broni w celach kolekcjonerskich w przedstawionym wymiarze." : null,
    timeline: [
      {
        date: "2026-04-10 10:30",
        event: "Wniosek został złożony",
        status: "completed",
      },
      {
        date: "2026-04-10 14:15",
        event: "Wniosek przekazany do weryfikacji",
        status: "completed",
      },
      {
        date: "2026-04-12 09:00",
        event: "Weryfikacja dokumentów w toku",
        status: "in-progress",
      },
    ],
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "w trakcie":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-2 py-0.5 rounded-full">W weryfikacji</Badge>;
      case "wymaga uzupełnienia":
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none px-2 py-0.5 rounded-full">Wymaga uzupełnienia</Badge>;
      case "zaakceptowany":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Zaakceptowany</Badge>;
      case "odrzucony":
        return <Badge variant="destructive" className="rounded-full px-2 py-0.5">Odrzucony</Badge>;
      default:
        return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
    }
  };

  const getTimelineStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600";
      case "in-progress":
        return "bg-primary";
      default:
        return "bg-border";
    }
  };

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex-1 pr-4">{application.type}</h1>
          <div className="mt-1">{getStatusBadge(application.status)}</div>
        </div>
        <p className="text-muted-foreground">Nr wniosku: {application.id}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Rejection Reason (if rejected) */}
          {application.status === "odrzucony" && application.rejectionReason && (
            <Card className="rounded-2xl border-none shadow-sm bg-red-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-xl text-red-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg text-red-900">Powód odrzucenia wniosku</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-red-800 text-sm">{application.rejectionReason}</p>
              </CardContent>
            </Card>
          )}

          {/* Applicant Info */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <User className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Dane wnioskodawcy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Imię i nazwisko</p>
                  <p className="font-medium text-foreground">
                    {application.applicant.firstName} {application.applicant.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">PESEL</p>
                  <p className="font-medium text-foreground">{application.applicant.pesel}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Dane ukryte ze względów bezpieczeństwa</p>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Numer dowodu osobistego</p>
                  <p className="font-medium text-foreground">{application.applicant.idNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Dane kontaktowe</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Adres zamieszkania</p>
                  <p className="font-medium text-foreground">{application.applicant.address}</p>
                  <p className="font-medium text-foreground">
                    {application.applicant.postalCode} {application.applicant.city}
                  </p>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Telefon</p>
                    <p className="font-medium text-foreground">{application.applicant.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">E-mail</p>
                    <p className="font-medium text-foreground">{application.applicant.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weapon Info */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Informacje o broni</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rodzaj broni</p>
                <p className="font-medium text-foreground">{application.weaponInfo.type}</p>
              </div>

              <Separator className="bg-border" />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Cel posiadania</p>
                <p className="font-medium text-foreground">{application.weaponInfo.purpose}</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Dokumenty</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-medium text-sm block">Zaświadczenie lekarskie</span>
                      <span className="text-xs text-muted-foreground">zaswiadczenie_lekarskie_skan.pdf</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {application.documents.medicalCertificate ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Dostarczone</Badge>
                    ) : (
                      <Badge variant="destructive" className="rounded-full">Brak</Badge>
                    )}
                    {isOfficer && application.documents.medicalCertificate && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary rounded-full hover:bg-primary/10">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-medium text-sm block">Badanie psychologiczne</span>
                      <span className="text-xs text-muted-foreground">badanie_psycho_skan.pdf</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {application.documents.psychologicalTest ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Dostarczone</Badge>
                    ) : (
                      <Badge variant="destructive" className="rounded-full">Brak</Badge>
                    )}
                    {isOfficer && application.documents.psychologicalTest && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary rounded-full hover:bg-primary/10">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-medium text-sm block">Szkolenie z zakresu broni</span>
                      <span className="text-xs text-muted-foreground">certyfikat_szkolenie.pdf</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {application.documents.training ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Ukończone</Badge>
                    ) : (
                      <Badge variant="destructive" className="rounded-full">Brak</Badge>
                    )}
                    {isOfficer && application.documents.training && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary rounded-full hover:bg-primary/10">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status Card */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Status wniosku</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Aktualny status</p>
                {getStatusBadge(application.status)}
              </div>

              <Separator className="bg-border" />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Data złożenia</p>
                <p className="font-medium text-foreground">{application.submittedDate}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Ostatnia aktualizacja</p>
                <p className="font-medium text-foreground">{application.lastUpdate}</p>
              </div>

              {isOfficer && application.status === "w trakcie" && (
                <>
                  <Separator className="bg-border" />
                  <Button 
                    className="w-full rounded-xl mt-2" 
                    onClick={() => navigate(`/decision/${application.id}`)}
                  >
                    Przejdź do decyzji
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Historia wniosku</CardTitle>
              <CardDescription>Śledzenie postępu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.timeline.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <div
                        className={`w-3 h-3 rounded-full ${getTimelineStatusColor(
                          item.status
                        )}`}
                      />
                      {index < application.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-border my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="font-medium text-sm text-foreground mb-0.5">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
