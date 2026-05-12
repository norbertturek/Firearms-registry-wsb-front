import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AlertCircle, CheckCircle, ShieldCheck, ArrowLeft, FileText } from "lucide-react";

export function WeaponRegistration() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registeredNumber, setRegisteredNumber] = useState("");
  const [formData, setFormData] = useState({
    promesaNumber: "",
    manufacturer: "",
    model: "",
    caliber: "",
    serialNumber: "",
    productionYear: "",
    purchaseDate: "",
    shopName: "",
    shopAddress: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.promesaNumber) newErrors.promesaNumber = "Numer promesy jest wymagany";
    if (!formData.manufacturer) newErrors.manufacturer = "Producent jest wymagany";
    if (!formData.model) newErrors.model = "Model jest wymagany";
    if (!formData.caliber) newErrors.caliber = "Kaliber jest wymagany";
    if (!formData.serialNumber) newErrors.serialNumber = "Numer seryjny jest wymagany";
    if (!formData.productionYear) newErrors.productionYear = "Rok produkcji jest wymagany";
    if (!formData.purchaseDate) newErrors.purchaseDate = "Data zakupu jest wymagana";
    if (!formData.shopName) newErrors.shopName = "Nazwa sklepu jest wymagana";
    if (!formData.shopAddress) newErrors.shopAddress = "Adres sklepu jest wymagany";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // In real app, submit to API
    const generatedRegNum = "BRN-2026-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setRegisteredNumber(generatedRegNum);
    setIsSubmitted(true);
    window.scrollTo(0, 0);
  };

  if (isSubmitted) {
    return (
      <div className="pt-8 pb-12 flex flex-col items-center text-center px-4 max-w-md mx-auto min-h-[70vh] justify-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <ShieldCheck className="h-12 w-12" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">Rejestracja udana</h1>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          Broń <span className="font-medium text-foreground">{formData.manufacturer} {formData.model}</span> została wpisana do Krajowego Rejestru Broni.
        </p>

        <Card className="w-full rounded-3xl border-none shadow-sm bg-muted/30 mb-8 p-1">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Numer Rejestracyjny</p>
            <div className="bg-background rounded-xl p-4 border shadow-sm">
              <p className="text-2xl font-mono font-bold tracking-widest text-primary">{registeredNumber}</p>
            </div>
            
            <div className="mt-6 flex flex-col gap-2 text-left">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">Nr seryjny:</span>
                <span className="font-mono text-sm font-medium">{formData.serialNumber}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-sm text-muted-foreground">Powiązana promesa:</span>
                <span className="font-mono text-sm font-medium">{formData.promesaNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-full space-y-3">
          <Button 
            className="w-full min-h-[56px] rounded-2xl text-base font-semibold"
            onClick={() => navigate("/weapons")}
          >
            Przejdź do Rejestru Broni
          </Button>
          <Button 
            variant="outline" 
            className="w-full min-h-[56px] rounded-2xl text-base font-medium border-transparent hover:bg-muted"
            onClick={() => {
              setFormData({
                promesaNumber: "",
                manufacturer: "",
                model: "",
                caliber: "",
                serialNumber: "",
                productionYear: "",
                purchaseDate: "",
                shopName: "",
                shopAddress: "",
              });
              setIsSubmitted(false);
            }}
          >
            Zarejestruj kolejną sztukę
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 pb-10">
      <div className="mb-6 px-1 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full shrink-0 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight">Rejestracja broni</h1>
          <p className="text-muted-foreground text-sm">Zarejestruj zakupioną broń w systemie</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <div className="h-2 bg-primary/20 w-full" />
          <CardHeader className="pb-3 pt-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Dane promesy</CardTitle>
            </div>
            <CardDescription>
              Wprowadź numer promesy na podstawie której dokonano zakupu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="promesaNumber" className="font-semibold text-foreground">
                Numer promesy <span className="text-red-500">*</span>
              </Label>
              <Input
                id="promesaNumber"
                value={formData.promesaNumber}
                onChange={(e) => setFormData({ ...formData, promesaNumber: e.target.value })}
                className="min-h-[52px] mt-2 rounded-xl text-base font-mono uppercase"
                placeholder="PRO-2026-XXXXXX"
              />
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Numer promesy znajduje się w lewym górnym rogu decyzji
              </p>
              {errors.promesaNumber && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-500 font-medium bg-red-50 p-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.promesaNumber}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="pb-3 pt-6">
            <CardTitle className="text-lg">Specyfikacja techniczna</CardTitle>
            <CardDescription>Szczegółowe dane z faktury zakupowej</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="manufacturer" className="font-semibold">
                  Producent <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="min-h-[52px] mt-2 rounded-xl text-base"
                  placeholder="np. Glock, CZ, Mossberg"
                />
                {errors.manufacturer && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-500 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.manufacturer}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="model" className="font-semibold">
                  Model <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="min-h-[52px] mt-2 rounded-xl text-base"
                  placeholder="np. 17 Gen 5"
                />
                {errors.model && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-500 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.model}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="caliber" className="font-semibold">
                  Kaliber główny <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.caliber}
                  onValueChange={(value) => setFormData({ ...formData, caliber: value })}
                >
                  <SelectTrigger id="caliber" className="min-h-[52px] mt-2 rounded-xl text-base">
                    <SelectValue placeholder="Wybierz kaliber z listy" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="9mm">9x19mm Parabellum</SelectItem>
                    <SelectItem value=".45ACP">.45 ACP</SelectItem>
                    <SelectItem value=".22LR">.22 LR</SelectItem>
                    <SelectItem value="7.62mm">7.62x39mm</SelectItem>
                    <SelectItem value="5.56mm">5.56x45mm NATO</SelectItem>
                    <SelectItem value="12GA">12 Gauge</SelectItem>
                    <SelectItem value="other">Inny kaliber</SelectItem>
                  </SelectContent>
                </Select>
                {errors.caliber && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-500 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.caliber}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="serialNumber" className="font-semibold">
                  Numer seryjny <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="min-h-[52px] mt-2 rounded-xl text-base font-mono uppercase"
                  placeholder="SN-123456"
                />
                {errors.serialNumber && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-500 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.serialNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="productionYear" className="font-semibold">
                Rok produkcji <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productionYear"
                type="number"
                value={formData.productionYear}
                onChange={(e) => setFormData({ ...formData, productionYear: e.target.value })}
                className="min-h-[52px] mt-2 rounded-xl text-base"
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear()}
              />
              {errors.productionYear && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-500 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.productionYear}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="pb-3 pt-6">
            <CardTitle className="text-lg">Transakcja</CardTitle>
            <CardDescription>Informacje o podmiocie zbywającym</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="purchaseDate" className="font-semibold">
                Data zakupu (z faktury/umowy) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="min-h-[52px] mt-2 rounded-xl text-base"
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.purchaseDate && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-500 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.purchaseDate}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="shopName" className="font-semibold">
                Nazwa zbywcy / koncesjonariusza <span className="text-red-500">*</span>
              </Label>
              <Input
                id="shopName"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="min-h-[52px] mt-2 rounded-xl text-base"
                placeholder="Nazwa sklepu lub imię i nazwisko"
              />
              {errors.shopName && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-500 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.shopName}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="shopAddress" className="font-semibold">
                Adres zbywcy <span className="text-red-500">*</span>
              </Label>
              <Input
                id="shopAddress"
                value={formData.shopAddress}
                onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                className="min-h-[52px] mt-2 rounded-xl text-base"
                placeholder="Miejscowość, kod pocztowy, ulica, numer"
              />
              {errors.shopAddress && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-500 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.shopAddress}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="pt-4 sticky bottom-6 z-10 mx-auto w-full">
          <Button type="submit" className="min-h-[56px] w-full rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transition-all">
            Zarejestruj broń
          </Button>
        </div>
      </form>
    </div>
  );
}
