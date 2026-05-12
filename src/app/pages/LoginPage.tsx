import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Shield, ShoppingBag, Users } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (role: string) => {
    // In a real application, this would authenticate via login.gov.pl
    localStorage.setItem("userRole", role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-primary/10 p-4 rounded-3xl mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">e-Broń</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Cyfrowy system pozwoleń i rejestracji broni
          </p>
        </div>

        <Card className="mb-8 rounded-3xl border-none shadow-md overflow-hidden">
          <div className="bg-primary p-6 text-center text-white">
            <h2 className="text-xl font-semibold mb-1">Zaloguj się</h2>
            <p className="text-white/80 text-sm">Uzyskaj dostęp do swoich danych</p>
          </div>
          <CardContent className="p-8">
            <Button
              onClick={() => handleLogin("citizen")}
              className="w-full min-h-[52px] text-base rounded-xl font-semibold"
              size="lg"
            >
              Zaloguj przez mObywatel
            </Button>
            <p className="mt-4 text-sm text-muted-foreground text-center">
              Bezpieczne logowanie z wykorzystaniem tożsamości cyfrowej
            </p>
          </CardContent>
        </Card>

        <div className="mt-8">
          <p className="text-xs font-semibold text-muted-foreground mb-4 text-center uppercase tracking-wider">
            Środowisko testowe - Wybierz rolę
          </p>
          
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-none shadow-sm rounded-2xl active:scale-[0.98]" onClick={() => handleLogin("citizen")}>
              <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                <Users className="h-8 w-8 mb-2 text-primary" />
                <h3 className="text-sm font-semibold mb-1">Obywatel</h3>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Wnioski i rejestr
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-none shadow-sm rounded-2xl active:scale-[0.98]" onClick={() => handleLogin("officer")}>
              <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                <Shield className="h-8 w-8 mb-2 text-primary" />
                <h3 className="text-sm font-semibold mb-1">Policja</h3>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Rozpatrywanie wniosków
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-none shadow-sm rounded-2xl active:scale-[0.98]" onClick={() => handleLogin("shop")}>
              <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                <ShoppingBag className="h-8 w-8 mb-2 text-primary" />
                <h3 className="text-sm font-semibold mb-1">Sklep</h3>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Weryfikacja promes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
