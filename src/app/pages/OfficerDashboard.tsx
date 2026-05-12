import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";

export function OfficerDashboard() {
  const navigate = useNavigate();

  // Mock data
  const stats = {
    pendingApplications: 15,
    approvedToday: 3,
    rejectedToday: 1,
    totalApplications: 245,
  };

  const pendingApplications = [
    {
      id: "WNI-2026-001234",
      applicant: "Jan Kowalski",
      type: "Pozwolenie na broń sportową",
      submittedDate: "2026-04-10",
      priority: "normal",
    },
    {
      id: "WNI-2026-001233",
      applicant: "Anna Nowak",
      type: "Pozwolenie na broń myśliwską",
      submittedDate: "2026-04-09",
      priority: "normal",
    },
    {
      id: "WNI-2026-001232",
      applicant: "Piotr Wiśniewski",
      type: "Pozwolenie na broń sportową",
      submittedDate: "2026-04-08",
      priority: "high",
    },
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Wysoki priorytet</Badge>;
      case "normal":
        return <Badge variant="secondary">Normalny</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2">Panel urzędnika</h1>
        <p className="text-[#666666]">Rozpatrywanie wniosków i zarządzanie decyzjami administracyjnymi</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">Oczekujące</p>
                <p className="text-3xl font-semibold">{stats.pendingApplications}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">Zatwierdzone dzisiaj</p>
                <p className="text-3xl font-semibold">{stats.approvedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">Odrzucone dzisiaj</p>
                <p className="text-3xl font-semibold">{stats.rejectedToday}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">Wszystkie wnioski</p>
                <p className="text-3xl font-semibold">{stats.totalApplications}</p>
              </div>
              <FileText className="h-8 w-8 text-[#005EA5]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Wnioski do rozpatrzenia</CardTitle>
          <CardDescription>Wnioski oczekujące na Twoją decyzję</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingApplications.map((app) => (
              <div
                key={app.id}
                className="border border-[#DADADA] rounded-lg p-4 hover:border-[#005EA5] transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="flex-1">{app.type}</h3>
                      {getPriorityBadge(app.priority)}
                    </div>
                    <p className="text-sm text-[#666666]">Wnioskodawca: {app.applicant}</p>
                    <p className="text-sm text-[#666666]">Nr wniosku: {app.id}</p>
                    <p className="text-sm text-[#666666]">Data złożenia: {app.submittedDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(`/applications/${app.id}`)}
                      variant="outline"
                      className="min-h-[44px]"
                    >
                      Szczegóły
                    </Button>
                    <Button
                      onClick={() => navigate(`/decision/${app.id}`)}
                      className="min-h-[44px]"
                    >
                      Rozpatrz
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Button
              onClick={() => navigate("/applications")}
              variant="outline"
              className="min-h-[44px]"
            >
              Zobacz wszystkie wnioski
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
