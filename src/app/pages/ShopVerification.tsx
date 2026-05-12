import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { AlertCircle, CheckCircle, Search, FileText } from "lucide-react";
import { Separator } from "../components/ui/separator";

export function ShopVerification() {
  const navigate = useNavigate();
  const [promesaNumber, setPromesaNumber] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerificationResult(null);

    if (!promesaNumber) {
      setError("Wprowadź numer promesy");
      return;
    }

    // Simulate API call - in real app this would verify against database
    setTimeout(() => {
      // Mock successful verification
      setVerificationResult({
        promesaNumber: promesaNumber,
        status: "ważna",
        validUntil: "2026-10-10",
        customer: {
          firstName: "Jan",
          lastName: "Kowalski",
          pesel: "***********",
          idNumber: "ABC123456",
        },
        permitDetails: {
          type: "Pozwolenie na broń sportową",
          weaponType: "Pistolet",
          caliber: "9mm",
          issueDate: "2026-04-11",
        },
      });
    }, 500);
  };

  const handleReportSale = () => {
    alert("Przekierowanie do formularza zgłoszenia sprzedaży...");
    // In real app, navigate to sale report form
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-2">Weryfikacja promesy</h1>
        <p className="text-[#666666]">Sprawdź ważność promesy przed sprzedażą broni</p>
      </div>

      {/* Verification Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Weryfikuj promesę</CardTitle>
          <CardDescription>Wprowadź numer promesy do weryfikacji</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify}>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="promesaNumber" className="mb-2 block">
                  Numer promesy <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="promesaNumber"
                  value={promesaNumber}
                  onChange={(e) => setPromesaNumber(e.target.value)}
                  placeholder="PRO-2026-XXXXXX"
                  className="min-h-[44px]"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="min-h-[44px] gap-2 w-full md:w-auto">
                  <Search className="h-4 w-4" />
                  Weryfikuj
                </Button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card className="mb-6 border-green-600 border-2">
          <CardHeader className="bg-green-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle className="text-green-900">Promesa jest ważna</CardTitle>
                <CardDescription className="text-green-700">
                  Możesz dokonać sprzedaży broni
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Promesa Details */}
            <div>
              <h3 className="mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#005EA5]" />
                Dane promesy
              </h3>
              <div className="bg-[#F5F5F5] p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#666666]">Numer promesy:</span>
                  <span className="font-medium">{verificationResult.promesaNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Status:</span>
                  <Badge className="bg-green-600 hover:bg-green-700">
                    {verificationResult.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666666]">Ważna do:</span>
                  <span className="font-medium">{verificationResult.validUntil}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Customer Details */}
            <div>
              <h3 className="mb-3">Dane nabywcy</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#666666] mb-1">Imię i nazwisko</p>
                  <p className="font-medium">
                    {verificationResult.customer.firstName}{" "}
                    {verificationResult.customer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#666666] mb-1">PESEL</p>
                  <p className="font-medium">{verificationResult.customer.pesel}</p>
                  <p className="text-xs text-[#666666]">Dane ukryte</p>
                </div>
                <div>
                  <p className="text-sm text-[#666666] mb-1">Numer dowodu</p>
                  <p className="font-medium">{verificationResult.customer.idNumber}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Permit Details */}
            <div>
              <h3 className="mb-3">Szczegóły pozwolenia</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#666666] mb-1">Rodzaj pozwolenia</p>
                  <p className="font-medium">{verificationResult.permitDetails.type}</p>
                </div>
                <div>
                  <p className="text-sm text-[#666666] mb-1">Data wydania</p>
                  <p className="font-medium">{verificationResult.permitDetails.issueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-[#666666] mb-1">Dopuszczalny rodzaj broni</p>
                  <p className="font-medium">{verificationResult.permitDetails.weaponType}</p>
                </div>
                <div>
                  <p className="text-sm text-[#666666] mb-1">Kaliber</p>
                  <p className="font-medium">{verificationResult.permitDetails.caliber}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="mb-2 text-blue-900">Następne kroki</h3>
              <p className="text-sm text-blue-700 mb-4">
                Po weryfikacji tożsamości nabywcy możesz dokonać sprzedaży. Pamiętaj o
                obowiązku zgłoszenia sprzedaży do systemu w ciągu 3 dni roboczych.
              </p>
              <Button onClick={handleReportSale} className="min-h-[44px] w-full">
                Zgłoś sprzedaż broni
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      {!verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Informacje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium mb-2">Jak weryfikować promesę:</h3>
                <ol className="space-y-2 text-[#666666] list-decimal list-inside">
                  <li>Wprowadź numer promesy podany przez klienta</li>
                  <li>System sprawdzi ważność i szczegóły pozwolenia</li>
                  <li>Zweryfikuj tożsamość klienta (dowód osobisty)</li>
                  <li>Sprawdź zgodność danych z systemem</li>
                  <li>Po sprzedaży zgłoś transakcję w systemie</li>
                </ol>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Ważne informacje:</h3>
                <ul className="space-y-2 text-[#666666] list-disc list-inside">
                  <li>Promesa jest ważna przez 6 miesięcy</li>
                  <li>Sprzedaż musi być zgodna z danymi w promesie</li>
                  <li>Zgłoszenie sprzedaży jest obowiązkowe</li>
                  <li>Termin zgłoszenia: 3 dni robocze</li>
                </ul>
              </div>

              <Separator />

              <div className="bg-[#F5F5F5] p-3 rounded-lg">
                <p className="text-[#666666] text-xs">
                  Podstawa prawna: Ustawa o broni i amunicji z dnia 21 maja 1999 r.,
                  Art. 10 ust. 3
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
