import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { AlertCircle, CheckCircle, XCircle, FileWarning } from "lucide-react";
import { Separator } from "../components/ui/separator";

export function DecisionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [decision, setDecision] = useState<"approve" | "reject" | "supplement" | null>(null);
  const [justification, setJustification] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data
  const application = {
    id: id || "WNI-2026-001234",
    type: "Wniosek o pozwolenie na broń sportową",
    applicant: "Jan Kowalski",
    submittedDate: "2026-04-10",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!decision) {
      newErrors.decision = "Musisz podjąć decyzję";
    }

    if (!justification || justification.length < 20) {
      newErrors.justification = "Uzasadnienie musi zawierać minimum 20 znaków";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // In real app, submit to API
    const decisionMap = {
      approve: "zaakceptowany",
      reject: "odrzucony",
      supplement: "skierowany do uzupełnienia braków"
    };
    const decisionText = decisionMap[decision as keyof typeof decisionMap];
    alert(`Decyzja została zapisana. Wniosek został ${decisionText}.`);
    navigate("/officer");
  };

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Rozpatrz wniosek</h1>
        <p className="text-muted-foreground">Wydaj decyzję administracyjną lub wezwij do uzupełnienia</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Application Summary */}
            <Card className="rounded-2xl border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Dane wniosku</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Rodzaj wniosku</p>
                  <p className="font-medium text-foreground">{application.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wnioskodawca</p>
                  <p className="font-medium text-foreground">{application.applicant}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Numer wniosku</p>
                  <p className="font-medium text-foreground">{application.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data złożenia</p>
                  <p className="font-medium text-foreground">{application.submittedDate}</p>
                </div>
                <div className="pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/applications/${application.id}`)}
                    className="min-h-[44px] w-full rounded-xl"
                  >
                    Przeglądaj załączniki i szczegóły
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Decision */}
            <Card className="rounded-2xl border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Działanie</CardTitle>
                <CardDescription>
                  Wybierz akcję i podaj uzasadnienie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <RadioGroup
                    value={decision || ""}
                    onValueChange={(value) => setDecision(value as "approve" | "reject" | "supplement")}
                    className="grid gap-3"
                  >
                    <Label
                      htmlFor="approve"
                      className={`flex items-start space-x-3 border rounded-xl p-4 cursor-pointer transition-colors ${decision === 'approve' ? 'bg-emerald-50/50 border-emerald-200' : 'border-border hover:bg-muted/50'}`}
                    >
                      <RadioGroupItem value="approve" id="approve" className="mt-1" />
                      <div className="flex-1 flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-base text-foreground mb-0.5">Zatwierdź wniosek</p>
                          <p className="text-sm text-muted-foreground">
                            Wydaj pozytywną decyzję i wygeneruj promesę
                          </p>
                        </div>
                      </div>
                    </Label>

                    <Label
                      htmlFor="supplement"
                      className={`flex items-start space-x-3 border rounded-xl p-4 cursor-pointer transition-colors ${decision === 'supplement' ? 'bg-orange-50/50 border-orange-200' : 'border-border hover:bg-muted/50'}`}
                    >
                      <RadioGroupItem value="supplement" id="supplement" className="mt-1" />
                      <div className="flex-1 flex items-start gap-3">
                        <FileWarning className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-base text-foreground mb-0.5">Wezwij do uzupełnienia</p>
                          <p className="text-sm text-muted-foreground">
                            Wniosek posiada braki formalne lub dokumentacyjne
                          </p>
                        </div>
                      </div>
                    </Label>

                    <Label
                      htmlFor="reject"
                      className={`flex items-start space-x-3 border rounded-xl p-4 cursor-pointer transition-colors ${decision === 'reject' ? 'bg-red-50/50 border-red-200' : 'border-border hover:bg-muted/50'}`}
                    >
                      <RadioGroupItem value="reject" id="reject" className="mt-1" />
                      <div className="flex-1 flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-base text-foreground mb-0.5">Odrzuć wniosek</p>
                          <p className="text-sm text-muted-foreground">
                            Wydaj negatywną decyzję z uzasadnieniem
                          </p>
                        </div>
                      </div>
                    </Label>
                  </RadioGroup>
                  {errors.decision && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.decision}</span>
                    </div>
                  )}
                </div>

                <Separator className="bg-border" />

                <div className="space-y-2">
                  <Label htmlFor="justification">
                    Uzasadnienie decyzji / Treść wezwania <span className="text-red-600">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Podaj szczegóły swojej decyzji lub wskaż braki do uzupełnienia (minimum 20 znaków).
                  </p>
                  <Textarea
                    id="justification"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    className="min-h-[150px] rounded-xl"
                    placeholder="Treść uzasadnienia..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.justification ? (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.justification}</span>
                      </div>
                    ) : <span />}
                    <span className="text-xs text-muted-foreground">
                      Znaków: {justification.length} / 20
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="min-h-[52px] w-full rounded-xl text-base font-semibold">
              Zatwierdź i wyślij
            </Button>
          </form>
        </div>

        {/* Sidebar - Guidelines */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Wytyczne operacyjne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold mb-1">Weryfikacja załączników:</h3>
                  <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                    <li>Czytelność skanu zaświadczenia medycznego</li>
                    <li>Ważność badania psychologicznego (3 miesiące)</li>
                    <li>Zgodność danych na certyfikacie</li>
                  </ul>
                </div>

                <Separator className="bg-border" />

                <div>
                  <h3 className="font-semibold mb-1">Postępowanie przy brakach:</h3>
                  <p className="text-muted-foreground text-sm">
                    Wybierz "Wezwij do uzupełnienia", wymień brakujące dokumenty i wskaż 7-dniowy termin odczytania powiadomienia w aplikacji.
                  </p>
                </div>

                <Separator className="bg-border" />

                <div className="bg-muted/50 p-3 rounded-xl">
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Decyzja o odrzuceniu musi być szczegółowo uargumentowana zgodnie z art. 107 § 1 pkt 6 k.p.a. z uwzględnieniem podstawy faktycznej i prawnej z uobia.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
