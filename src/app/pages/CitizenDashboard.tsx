import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { FileText, Shield, PlusCircle, AlertCircle, ChevronRight, CreditCard, Crosshair } from "lucide-react";

export function CitizenDashboard() {
  const navigate = useNavigate();

  // Mock data
  const permitData = {
    active: true,
    number: "P-12345/2025",
    type: "Sportowe",
    validUntil: "Bezterminowo"
  };

  const recentApplications = [
    {
      id: "WNI-2026-001234",
      type: "Wniosek o pozwolenie na broń",
      status: "w trakcie",
      date: "10 kwi 2026",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "w trakcie":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-2 py-0.5 rounded-full">W weryfikacji</Badge>;
      case "zaakceptowany":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Zaakceptowany</Badge>;
      case "odrzucony":
        return <Badge variant="destructive" className="rounded-full px-2 py-0.5">Odrzucony</Badge>;
      default:
        return <Badge className="rounded-full px-2 py-0.5">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Cześć, Jan</h1>
        <p className="text-muted-foreground mt-1">Twój panel zarządzania bronią</p>
      </div>

      {/* Main Permit Card (mObywatel style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#003b6b] p-6 text-white shadow-md cursor-pointer transition-transform active:scale-[0.98]" onClick={() => navigate("/weapons")}>
        <div className="absolute -right-6 -top-6 opacity-10">
          <Crosshair className="h-40 w-40" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">e-Pozwolenie</p>
              <h2 className="text-2xl font-bold">{permitData.type}</h2>
            </div>
            <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-sm">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-6 flex justify-between items-end">
            <div>
              <p className="text-white/80 text-xs mb-0.5">Numer dokumentu</p>
              <p className="font-mono text-lg tracking-wider">{permitData.number}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-xs mb-0.5">Ważność</p>
              <p className="font-medium text-sm">{permitData.validUntil}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-lg font-bold mb-3 px-1 text-foreground">Usługi</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="rounded-2xl border-none shadow-sm hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.98]" onClick={() => navigate("/application/new")}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-[100px]">
              <div className="bg-blue-50 p-3 rounded-full text-primary mb-1">
                <PlusCircle className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold leading-tight">Nowy wniosek</span>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-none shadow-sm hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.98]" onClick={() => navigate("/applications")}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-[100px]">
              <div className="bg-blue-50 p-3 rounded-full text-primary mb-1">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold leading-tight">Moje sprawy</span>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.98]" onClick={() => navigate("/weapon/register")}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-[100px]">
              <div className="bg-blue-50 p-3 rounded-full text-primary mb-1">
                <Crosshair className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold leading-tight">Rejestracja broni</span>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.98]" onClick={() => navigate("/weapons")}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-[100px]">
              <div className="bg-blue-50 p-3 rounded-full text-primary mb-1">
                <CreditCard className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold leading-tight">Promesy</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Required Actions Alert (if any) */}
      <Card className="rounded-2xl border-none shadow-sm bg-orange-50/50 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => navigate("/applications/WNI-2026-001234")}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-full text-orange-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-900">Uzupełnij braki</p>
              <p className="text-xs text-orange-700">Wniosek WNI-2026-001234 wymaga uwagi</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full text-orange-700 h-8 w-8 hover:bg-orange-100">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Recent Applications List */}
      <div>
        <div className="flex justify-between items-end mb-3 px-1">
          <h3 className="text-lg font-bold text-foreground">Ostatnie wnioski</h3>
          <Button variant="link" className="text-primary text-sm h-auto p-0 font-medium" onClick={() => navigate("/applications")}>
            Wszystkie
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentApplications.map((app) => (
            <Card 
              key={app.id}
              className="rounded-2xl border-none shadow-sm hover:bg-muted/30 transition-colors cursor-pointer active:scale-[0.99]"
              onClick={() => navigate(`/applications/${app.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-muted p-3 rounded-2xl text-muted-foreground">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate text-foreground">{app.type}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{app.date} • {app.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(app.status)}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
