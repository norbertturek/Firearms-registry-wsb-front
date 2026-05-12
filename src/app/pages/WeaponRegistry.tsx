import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Shield, Search, PlusCircle, ChevronDown, ChevronUp, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Separator } from "../components/ui/separator";

export function WeaponRegistry() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Mock data
  const weapons = [
    {
      id: "BRN-2025-001",
      manufacturer: "Glock",
      model: "Glock 17",
      caliber: "9mm",
      serialNumber: "ABC123456",
      registrationDate: "2025-03-15",
      status: "aktywna",
      permitNumber: "POZ-2025-001",
    },
    {
      id: "BRN-2024-089",
      manufacturer: "CZ",
      model: "CZ 75 SP-01",
      caliber: "9mm",
      serialNumber: "XYZ789012",
      registrationDate: "2024-11-20",
      status: "aktywna",
      permitNumber: "POZ-2024-045",
      lastInspection: "2025-01-10",
      seller: "Sklep Myśliwski DB",
    },
  ];

  const toggleExpand = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aktywna":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5 rounded-full">Aktywna</Badge>;
      case "wyrejestrowana":
        return <Badge variant="secondary" className="rounded-full">Wyrejestrowana</Badge>;
      default:
        return <Badge className="rounded-full">{status}</Badge>;
    }
  };

  const filteredWeapons = weapons.filter((weapon) => {
    return (
      weapon.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      weapon.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      weapon.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      weapon.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Rejestr broni</h1>
        <p className="text-muted-foreground">Przeglądaj zarejestrowaną broń</p>
      </div>

      {/* Search and Actions */}
      <Card className="mb-6 rounded-2xl border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="text-sm font-medium mb-2 block text-foreground">
                Wyszukaj broń
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Model, producent, numer seryjny..."
                  className="min-h-[44px] pl-10 rounded-xl"
                />
              </div>
            </div>
            <Button
              onClick={() => navigate("/weapon/register")}
              className="min-h-[44px] gap-2 rounded-xl w-full"
            >
              <PlusCircle className="h-5 w-5" />
              Zarejestruj nową broń
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weapons List */}
      <Card className="rounded-2xl border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Zarejestrowana broń ({filteredWeapons.length})</CardTitle>
          <CardDescription>
            {searchTerm
              ? `Wyniki wyszukiwania dla: "${searchTerm}"`
              : "Wszystkie egzemplarze w rejestrze"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredWeapons.length > 0 ? (
            <div className="space-y-3">
              {filteredWeapons.map((weapon) => (
                <div
                  key={weapon.id}
                  className="bg-muted/30 border border-transparent rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <div 
                    className="p-4 hover:bg-muted/50 cursor-pointer active:scale-[0.99] select-none"
                    onClick={() => toggleExpand(weapon.id)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl shrink-0 mt-1">
                          <Shield className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-base text-foreground mb-0.5">
                                {weapon.manufacturer} {weapon.model}
                              </h3>
                              <p className="text-xs font-medium text-muted-foreground">
                                Kaliber: {weapon.caliber}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mt-1 -mr-2 text-muted-foreground">
                              {expandedId === weapon.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div>
                              <span className="text-muted-foreground block">Nr seryjny:</span>
                              <span className="font-mono">{weapon.serialNumber}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block">Rejestracja:</span>
                              <span className="font-medium">{weapon.registrationDate}</span>
                            </div>
                          </div>
                          
                          {expandedId !== weapon.id && (
                            <div className="pt-1">{getStatusBadge(weapon.status)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === weapon.id && (
                    <div className="px-4 pb-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Separator className="bg-border mb-4" />
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">Dane dokumentu</p>
                            <div className="space-y-2">
                              <div>
                                <span className="text-muted-foreground text-xs block">Numer pozwolenia</span>
                                <span className="font-medium text-foreground">{weapon.permitNumber}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground text-xs block">Status</span>
                                <div>{getStatusBadge(weapon.status)}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">Historia</p>
                            <div className="space-y-2">
                              {weapon.lastInspection && (
                                <div>
                                  <span className="text-muted-foreground text-xs block flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Ostatnia kontrola
                                  </span>
                                  <span className="font-medium text-foreground">{weapon.lastInspection}</span>
                                </div>
                              )}
                              {weapon.seller && (
                                <div>
                                  <span className="text-muted-foreground text-xs block">Sprzedawca</span>
                                  <span className="font-medium text-foreground">{weapon.seller}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="bg-primary/5 rounded-xl p-3 flex gap-3 items-start border border-primary/10">
                          <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Przypominamy o obowiązku noszenia legitymacji posiadacza broni wraz z bronią palną i okazywania jej na żądanie uprawnionych organów.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-16 w-16 mx-auto mb-4 opacity-30 text-primary" />
              {searchTerm ? (
                <>
                  <p className="mb-2">Nie znaleziono broni spełniającej kryteria</p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm("")}
                    className="min-h-[44px] rounded-xl mt-2"
                  >
                    Wyczyść wyszukiwanie
                  </Button>
                </>
              ) : (
                <>
                  <p className="mb-4">Nie masz jeszcze zarejestrowanej broni</p>
                  <Button
                    onClick={() => navigate("/weapon/register")}
                    className="min-h-[44px] rounded-xl"
                  >
                    Zarejestruj pierwszą broń
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
