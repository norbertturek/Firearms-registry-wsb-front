import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ShoppingCart, CheckCircle, FileCheck, Search } from "lucide-react";
import { NewSaleDrawer } from "../components/shop/NewSaleDrawer";

export function ShopDashboard() {
  const navigate = useNavigate();
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);

  // Mock data
  const stats = {
    salesThisMonth: 12,
    pendingVerifications: 3,
    totalSales: 156,
  };

  const recentSales = [
    {
      id: "SPR-2026-001",
      promesaId: "PRO-2026-004521",
      customer: "Jan Kowalski",
      weaponType: "Pistolet sportowy",
      date: "2026-04-12",
      status: "zarejestrowana",
    },
    {
      id: "SPR-2026-002",
      promesaId: "PRO-2026-004522",
      customer: "Anna Nowak",
      weaponType: "Karabinek myśliwski",
      date: "2026-04-11",
      status: "zarejestrowana",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "zarejestrowana":
        return <Badge className="bg-green-600 hover:bg-green-700">Zarejestrowana</Badge>;
      case "oczekująca":
        return <Badge variant="secondary">Oczekująca</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Panel sklepu</h1>
        <p className="text-muted-foreground">Weryfikacja promes i zgłaszanie sprzedaży broni</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Sprzedaż w tym miesiącu</p>
                <p className="text-3xl font-bold text-foreground">{stats.salesThisMonth}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-2xl">
                <ShoppingCart className="h-7 w-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Oczekujące weryfikacje</p>
                <p className="text-3xl font-bold text-foreground">{stats.pendingVerifications}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-2xl">
                <FileCheck className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm hidden md:block">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Całkowita sprzedaż</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalSales}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-2xl">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6 rounded-2xl border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Szybkie akcje</CardTitle>
          <CardDescription>Najczęściej wykonywane operacje</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              onClick={() => navigate("/shop/verify")}
              className="min-h-[52px] justify-start gap-3 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 border-none font-semibold"
              variant="outline"
            >
              <Search className="h-5 w-5" />
              Weryfikuj promesę e-Broń
            </Button>
            <Button
              onClick={() => setIsNewSaleOpen(true)}
              className="min-h-[52px] justify-start gap-3 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 border-none font-semibold"
              variant="outline"
            >
              <FileCheck className="h-5 w-5" />
              Zgłoś nową sprzedaż
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales */}
      <Card className="rounded-2xl border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Ostatnie sprzedaże</CardTitle>
          <CardDescription>Historia zgłoszonych sprzedaży</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1 text-foreground">{sale.weaponType}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-2">
                        <p>Klient: <span className="font-medium text-foreground">{sale.customer}</span></p>
                        <p>Nr promesy: <span className="font-mono text-foreground">{sale.promesaId}</span></p>
                        <p>Data: <span className="font-medium text-foreground">{sale.date}</span></p>
                        <p>Nr faktury: <span className="font-mono text-foreground">{sale.id}</span></p>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">{getStatusBadge(sale.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30 text-primary" />
              <p>Brak zgłoszonych sprzedaży</p>
            </div>
          )}
        </CardContent>
      </Card>

      <NewSaleDrawer open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen} />
    </div>
  );
}
