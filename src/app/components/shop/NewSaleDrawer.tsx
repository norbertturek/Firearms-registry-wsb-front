import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "../ui/drawer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AlertCircle, ShieldCheck, User, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface NewSaleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewSaleDrawer({ open, onOpenChange }: NewSaleDrawerProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const initialFormData = {
    promesaNumber: "",
    pesel: "",
    customerName: "",
    manufacturer: "",
    model: "",
    caliber: "",
    serialNumber: "",
    productionYear: "",
    invoiceNumber: "",
    saleDate: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(initialFormData);

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
      setErrors({});
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.promesaNumber) newErrors.promesaNumber = "Wymagane";
    if (!formData.pesel) newErrors.pesel = "Wymagane";
    else if (formData.pesel.length !== 11) newErrors.pesel = "PESEL musi mieć 11 cyfr";
    if (!formData.customerName) newErrors.customerName = "Wymagane";
    
    if (!formData.manufacturer) newErrors.manufacturer = "Wymagane";
    if (!formData.model) newErrors.model = "Wymagane";
    if (!formData.caliber) newErrors.caliber = "Wymagane";
    if (!formData.serialNumber) newErrors.serialNumber = "Wymagane";
    if (!formData.productionYear) newErrors.productionYear = "Wymagane";
    
    if (!formData.invoiceNumber) newErrors.invoiceNumber = "Wymagane";
    if (!formData.saleDate) newErrors.saleDate = "Wymagane";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(`field-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        toast.error("Proszę uzupełnić wszystkie wymagane pola formularza.");
      }
      return;
    }

    // Success
    const generatedRegNum = "SPR-2026-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    onOpenChange(false);
    
    toast.success("Sprzedaż zgłoszona pomyślnie", {
      description: `Nr zgłoszenia: ${generatedRegNum}. System zaktualizował e-Książkę Ewidencyjną.`,
      duration: 5000,
      className: "border-emerald-200 bg-emerald-50 text-emerald-900"
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] flex flex-col px-0 rounded-t-3xl border-0 shadow-2xl">
        <DrawerHeader className="border-b px-4 py-4 shrink-0">
          <DrawerTitle className="text-xl font-bold tracking-tight text-foreground">Zgłoszenie nowej sprzedaży</DrawerTitle>
          <DrawerDescription className="text-sm">
            Wprowadź dane z e-Promesy oraz detale dotyczące zbywanej broni.
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative" id="drawer-scroll-area">
          <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-24">
            
            {/* Sekcja Nabywcy */}
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-muted/20">
              <div className="h-1.5 bg-primary/30 w-full" />
              <CardHeader className="pb-3 pt-5 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base">Dane nabywcy</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-5">
                <div id="field-promesaNumber">
                  <Label htmlFor="promesaNumber" className="font-semibold text-foreground text-sm">
                    Numer promesy e-Broń <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="promesaNumber"
                    value={formData.promesaNumber}
                    onChange={(e) => setFormData({ ...formData, promesaNumber: e.target.value })}
                    className="min-h-[52px] mt-1.5 rounded-xl text-base font-mono uppercase bg-background"
                    placeholder="PRO-2026-XXXXXX"
                  />
                  {errors.promesaNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.promesaNumber}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div id="field-pesel">
                    <Label htmlFor="pesel" className="font-semibold text-foreground text-sm">
                      PESEL <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="pesel"
                      type="number"
                      value={formData.pesel}
                      onChange={(e) => setFormData({ ...formData, pesel: e.target.value })}
                      className="min-h-[52px] mt-1.5 rounded-xl text-base font-mono bg-background"
                      placeholder="11 cyfr"
                      maxLength={11}
                    />
                    {errors.pesel && <p className="text-red-500 text-xs mt-1 font-medium">{errors.pesel}</p>}
                  </div>
                  
                  <div id="field-customerName">
                    <Label htmlFor="customerName" className="font-semibold text-foreground text-sm">
                      Imię i nazwisko <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="min-h-[52px] mt-1.5 rounded-xl text-base bg-background"
                      placeholder="Jan Kowalski"
                    />
                    {errors.customerName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.customerName}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sekcja Broni */}
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-muted/20">
              <div className="h-1.5 bg-orange-400/30 w-full" />
              <CardHeader className="pb-3 pt-5 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-orange-100 p-2 rounded-xl text-orange-600 shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base">Zbywana broń</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div id="field-manufacturer">
                    <Label htmlFor="manufacturer" className="font-semibold text-sm">
                      Producent <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      className="min-h-[52px] mt-1.5 rounded-xl text-base bg-background"
                      placeholder="Glock"
                    />
                    {errors.manufacturer && <p className="text-red-500 text-xs mt-1 font-medium">{errors.manufacturer}</p>}
                  </div>

                  <div id="field-model">
                    <Label htmlFor="model" className="font-semibold text-sm">
                      Model <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="min-h-[52px] mt-1.5 rounded-xl text-base bg-background"
                      placeholder="17 Gen 5"
                    />
                    {errors.model && <p className="text-red-500 text-xs mt-1 font-medium">{errors.model}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div id="field-caliber">
                    <Label htmlFor="caliber" className="font-semibold text-sm">
                      Kaliber <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.caliber}
                      onValueChange={(value) => setFormData({ ...formData, caliber: value })}
                    >
                      <SelectTrigger id="caliber" className="min-h-[52px] mt-1.5 rounded-xl text-base bg-background">
                        <SelectValue placeholder="Wybierz" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="9mm">9x19mm</SelectItem>
                        <SelectItem value=".45ACP">.45 ACP</SelectItem>
                        <SelectItem value=".22LR">.22 LR</SelectItem>
                        <SelectItem value="7.62mm">7.62x39mm</SelectItem>
                        <SelectItem value="5.56mm">5.56x45mm</SelectItem>
                        <SelectItem value="12GA">12 Gauge</SelectItem>
                        <SelectItem value="other">Inny</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.caliber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.caliber}</p>}
                  </div>

                  <div id="field-serialNumber">
                    <Label htmlFor="serialNumber" className="font-semibold text-sm">
                      Nr seryjny <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      className="min-h-[52px] mt-1.5 rounded-xl text-base font-mono uppercase bg-background"
                      placeholder="SN-123"
                    />
                    {errors.serialNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.serialNumber}</p>}
                  </div>
                </div>

                <div id="field-productionYear">
                  <Label htmlFor="productionYear" className="font-semibold text-sm">
                    Rok produkcji <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="productionYear"
                    type="number"
                    value={formData.productionYear}
                    onChange={(e) => setFormData({ ...formData, productionYear: e.target.value })}
                    className="min-h-[52px] mt-1.5 rounded-xl text-base bg-background"
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  {errors.productionYear && <p className="text-red-500 text-xs mt-1 font-medium">{errors.productionYear}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Sekcja Faktury/Paragonu */}
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-muted/20">
              <div className="h-1.5 bg-emerald-400/30 w-full" />
              <CardHeader className="pb-3 pt-5 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 shrink-0">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base">Transakcja</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-5">
                <div id="field-invoiceNumber">
                  <Label htmlFor="invoiceNumber" className="font-semibold text-sm">
                    Nr faktury / paragonu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="min-h-[52px] mt-1.5 rounded-xl text-base uppercase bg-background"
                    placeholder="FV/2026/04/123"
                  />
                  {errors.invoiceNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.invoiceNumber}</p>}
                </div>

                <div id="field-saleDate">
                  <Label htmlFor="saleDate" className="font-semibold text-sm">
                    Data zbycia <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="saleDate"
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                    className="min-h-[52px] mt-1.5 rounded-xl text-base bg-background"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.saleDate && <p className="text-red-500 text-xs mt-1 font-medium">{errors.saleDate}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Niewidoczny przycisk submit do formularza - prawdziwy jest w footerze */}
            <button type="submit" id="hidden-submit" className="hidden">Submit</button>
          </form>
        </div>
        
        {/* Sticky Button na dole Drawera */}
        <div className="p-4 border-t bg-background shrink-0 mt-auto">
          <Button 
            className="w-full min-h-[56px] rounded-2xl text-[17px] font-bold shadow-sm"
            onClick={() => {
              document.getElementById("hidden-submit")?.click();
            }}
          >
            Zatwierdź i zgłoś
          </Button>
          <Button 
            variant="ghost" 
            className="w-full min-h-[44px] mt-2 rounded-xl text-muted-foreground font-medium"
            onClick={() => onOpenChange(false)}
          >
            Anuluj
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}