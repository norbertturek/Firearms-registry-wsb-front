import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { AlertCircle, Home } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-[#666666]" />
          <h1 className="mb-3">Strona nie została znaleziona</h1>
          <p className="text-[#666666] mb-6">
            Przepraszamy, szukana strona nie istnieje lub została przeniesiona.
          </p>
          <Button onClick={() => navigate("/")} className="min-h-[44px] gap-2">
            <Home className="h-4 w-4" />
            Wróć do strony głównej
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
