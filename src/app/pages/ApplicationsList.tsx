import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search } from "lucide-react";

export function ApplicationsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Determine user role based on local storage
  const userRole = localStorage.getItem("userRole") || "citizen";
  const isOfficer = userRole === "officer";
  const isShop = userRole === "shop";

  const getPageTitle = () => {
    if (isOfficer) return "Wnioski do rozpatrzenia";
    if (isShop) return "Zgłoszenia sprzedaży";
    return "Moje sprawy";
  };

  const getPageDescription = () => {
    if (isOfficer) return "Przeglądaj i rozpatruj wnioski o wydanie pozwolenia";
    if (isShop) return "Historia zarejestrowanych transakcji sprzedaży";
    return "Lista Twoich wniosków i zgłoszeń";
  };

  // Mock data
  const applications = [
    {
      id: "WNI-2026-001234",
      applicant: "Jan Kowalski",
      type: "Pozwolenie na broń sportową",
      status: "w trakcie",
      submittedDate: "2026-04-10",
      priority: "normal",
    },
    {
      id: "WNI-2026-001233",
      applicant: "Anna Nowak",
      type: "Pozwolenie na broń myśliwską",
      status: "zaakceptowany",
      submittedDate: "2026-04-05",
      priority: "normal",
    },
    {
      id: "WNI-2026-001232",
      applicant: "Piotr Wiśniewski",
      type: "Rejestracja broni",
      status: "w trakcie",
      submittedDate: "2026-04-08",
      priority: "high",
    },
    {
      id: "WNI-2026-001231",
      applicant: "Maria Kowalczyk",
      type: "Pozwolenie na broń kolekcjonerską",
      status: "odrzucony",
      submittedDate: "2026-04-01",
      priority: "normal",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "w trakcie":
        return <Badge variant="secondary">W trakcie weryfikacji</Badge>;
      case "zaakceptowany":
        return <Badge className="bg-green-600 hover:bg-green-700">Zaakceptowany</Badge>;
      case "odrzucony":
        return <Badge variant="destructive">Odrzucony</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "high") {
      return <Badge variant="destructive" className="ml-2">Wysoki priorytet</Badge>;
    }
    return null;
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
          {getPageTitle()}
        </h1>
        <p className="text-muted-foreground">
          {getPageDescription()}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6 rounded-2xl border-none shadow-sm">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="search" className="text-sm font-medium mb-2 block">
                Wyszukaj wniosek
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Numer wniosku, nazwisko..."
                  className="min-h-[44px] pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="statusFilter" className="text-sm font-medium mb-2 block">
                Filtruj po statusie
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="statusFilter" className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="w trakcie">W trakcie</SelectItem>
                  <SelectItem value="zaakceptowany">Zaakceptowane</SelectItem>
                  <SelectItem value="odrzucony">Odrzucone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card className="rounded-2xl border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Wnioski ({filteredApplications.length})
          </CardTitle>
          <CardDescription>
            {statusFilter === "all"
              ? "Wszystkie wnioski"
              : `Wnioski ze statusem: ${statusFilter}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplications.length > 0 ? (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.99]"
                  onClick={() => navigate(`/applications/${app.id}`)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-1">
                        <h3 className="flex-1 font-semibold text-base">{app.type}</h3>
                        {isOfficer && getPriorityBadge(app.priority)}
                      </div>
                      {isOfficer && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Wnioskodawca: {app.applicant}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">Nr wniosku: {app.id} • Data: {app.submittedDate}</p>
                      <div className="mt-3">{getStatusBadge(app.status)}</div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      {isOfficer && app.status === "w trakcie" && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/decision/${app.id}`);
                          }}
                          className="min-h-[44px] rounded-xl"
                        >
                          Rozpatrz
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nie znaleziono wniosków spełniających kryteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
