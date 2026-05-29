import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Shield, ShoppingBag, Users, AlertCircle } from "lucide-react";
import { authService } from "../../services/authService";
import { AppLogo } from "../components/AppLogo";

const ROLE_CREDENTIALS = {
  citizen: { email: "citizen@example.com", password: "Citizen123!", route: "/citizen" },
  joanna: { email: "joanna.dymna@example.com", password: "Citizen123!", route: "/citizen" },
  officer: { email: "officer@example.com", password: "Officer123!" },
  shop:    { email: "shop@example.com",    password: "Shop123!" },
};

const ROLE_ROUTES: Record<string, string> = {
  citizen: "/citizen",
  officer: "/officer",
  shop: "/shop",
};

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showQuickLogin = import.meta.env.VITE_SHOW_QUICK_LOGIN === "true";

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login({ email: loginEmail, password: loginPassword });
      const route = ROLE_ROUTES[localStorage.getItem("userRole") ?? ""] ?? "/citizen";
      navigate(route);
    } catch {
      setError("Nieprawidłowy email lub hasło");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Podaj email i hasło");
      return;
    }
    doLogin(email, password);
  };

  const handleTestLogin = (role: keyof typeof ROLE_CREDENTIALS) => {
    const creds = ROLE_CREDENTIALS[role];
    setEmail(creds.email);
    setPassword(creds.password);
    doLogin(creds.email, creds.password);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8 flex flex-col items-center">
          <AppLogo size="xl" className="mb-4" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-2">e-Broń</h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Cyfrowy system pozwoleń i rejestracji broni
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 mb-6">
          <Card className="rounded-3xl border-none shadow-md overflow-hidden">
            <div className="bg-primary p-6 text-center text-white">
              <h2 className="text-xl font-semibold mb-1">Zaloguj się</h2>
              <p className="text-white/80 text-sm">Uzyskaj dostęp do swoich danych</p>
            </div>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="twoj@email.pl"
                  className="mt-1.5 min-h-[44px] rounded-xl"
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="password">Hasło</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 min-h-[44px] rounded-xl"
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </p>
              )}
            </CardContent>
          </Card>
          <Button
            type="submit"
            className="w-full min-h-[52px] text-base rounded-xl font-semibold"
            disabled={loading}
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </form>

        {showQuickLogin && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-4 text-center uppercase tracking-wider">
              Środowisko testowe — szybkie logowanie
            </p>

            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              <Card
                className="cursor-pointer border-none shadow-sm rounded-2xl active:scale-[0.98]"
                onClick={() => handleTestLogin("citizen")}
              >
                <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                  <Users className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="text-sm font-semibold mb-1">Jan</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Pozwolenia i rejestr
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border-none shadow-sm rounded-2xl active:scale-[0.98]"
                onClick={() => handleTestLogin("joanna")}
              >
                <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                  <Users className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="text-sm font-semibold mb-1">Joanna</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Puste konto
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border-none shadow-sm rounded-2xl active:scale-[0.98]"
                onClick={() => handleTestLogin("officer")}
              >
                <CardContent className="p-4 text-center flex flex-col items-center justify-center h-full">
                  <Shield className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="text-sm font-semibold mb-1">Policja WPA</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Rozpatrywanie wniosków
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer border-none shadow-sm rounded-2xl active:scale-[0.98]"
                onClick={() => handleTestLogin("shop")}
              >
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
        )}
      </div>
    </div>
  );
}
