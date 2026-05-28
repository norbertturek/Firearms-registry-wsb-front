import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { AlertCircle } from "lucide-react";

export function ApplicationForm() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    permitType: "",
    firstName: "",
    lastName: "",
    pesel: "",
    idNumber: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "",
    weaponType: "",
    purpose: "",
    medicalCertificate: false,
    psychologicalTest: false,
    training: false,
    consent: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.permitType) newErrors.permitType = "Wybierz rodzaj pozwolenia";
    if (!formData.firstName) newErrors.firstName = "Imię jest wymagane";
    if (!formData.lastName) newErrors.lastName = "Nazwisko jest wymagane";
    if (!formData.pesel || formData.pesel.length !== 11) {
      newErrors.pesel = "PESEL musi składać się z 11 cyfr";
    }
    if (!formData.idNumber) newErrors.idNumber = "Numer dowodu osobistego jest wymagany";
    if (!formData.address) newErrors.address = "Adres jest wymagany";
    if (!formData.city) newErrors.city = "Miasto jest wymagane";
    if (!formData.postalCode) newErrors.postalCode = "Kod pocztowy jest wymagany";
    if (!formData.phone) newErrors.phone = "Numer telefonu jest wymagany";
    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "Podaj prawidłowy adres e-mail";
    }
    if (!formData.weaponType) newErrors.weaponType = "Wybierz rodzaj broni";
    if (!formData.purpose) newErrors.purpose = "Cel posiadania jest wymagany";
    if (!formData.medicalCertificate) newErrors.medicalCertificate = "Zaświadczenie lekarskie jest wymagane";
    if (!formData.psychologicalTest) newErrors.psychologicalTest = "Test psychologiczny jest wymagany";
    if (!formData.training) newErrors.training = "Szkolenie z zakresu broni jest wymagane";
    if (!formData.consent) newErrors.consent = "Musisz wyrazić zgodę na przetwarzanie danych";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // In real app, submit to API
    alert("Wniosek został złożony pomyślnie! Nr wniosku: WNI-2026-001235");
    navigate("/citizen");
  };

  return (
    <div className="pt-2">
      <div className="mb-6 px-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-1">Wniosek o pozwolenie</h1>
        <p className="text-muted-foreground">Wypełnij formularz, aby złożyć wniosek</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Rodzaj pozwolenia</CardTitle>
            <CardDescription>Wybierz typ pozwolenia, o które wnioskujesz</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="permitType">
                Rodzaj pozwolenia <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.permitType}
                onValueChange={(value) => setFormData({ ...formData, permitType: value })}
              >
                <SelectTrigger id="permitType" className="min-h-[44px] mt-2">
                  <SelectValue placeholder="Wybierz rodzaj pozwolenia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sport">Pozwolenie na broń sportową</SelectItem>
                  <SelectItem value="hunting">Pozwolenie na broń myśliwską</SelectItem>
                  <SelectItem value="collecting">Pozwolenie na broń kolekcjonerską</SelectItem>
                  <SelectItem value="protection">Pozwolenie na broń do ochrony osobistej</SelectItem>
                </SelectContent>
              </Select>
              {errors.permitType && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.permitType}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Dane osobowe</CardTitle>
            <CardDescription>Wprowadź swoje dane osobowe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">
                  Imię <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="min-h-[44px] mt-2"
                  placeholder="Wprowadź imię"
                />
                {errors.firstName && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errors.firstName}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">
                  Nazwisko <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="min-h-[44px] mt-2"
                  placeholder="Wprowadź nazwisko"
                />
                {errors.lastName && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errors.lastName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pesel">
                  PESEL <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="pesel"
                  value={formData.pesel}
                  onChange={(e) => setFormData({ ...formData, pesel: e.target.value })}
                  className="min-h-[44px] mt-2"
                  placeholder="11 cyfr"
                  maxLength={11}
                />
                <p className="text-xs text-[#666666] mt-1">Dane wrażliwe - będą zabezpieczone</p>
                {errors.pesel && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errors.pesel}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="idNumber">
                  Numer dowodu osobistego <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="min-h-[44px] mt-2"
                  placeholder="ABC123456"
                />
                {errors.idNumber && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errors.idNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Adres zamieszkania</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">
                Ulica i numer <span className="text-red-600">*</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="min-h-[44px] mt-2"
                placeholder="ul. Przykładowa 123/45"
              />
              {errors.address && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.address}</span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">
                  Miasto <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="min-h-[44px] mt-2"
                  placeholder="Warszawa"
                />
                {errors.city && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errors.city}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="postalCode">
                  Kod pocztowy <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="min-h-[44px] mt-2"
                  placeholder="00-000"
                />
                {errors.postalCode && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errors.postalCode}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Dane kontaktowe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">
                Numer telefonu <span className="text-red-600">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="min-h-[44px] mt-2"
                placeholder="+48 123 456 789"
              />
              {errors.phone && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="email">
                Adres e-mail <span className="text-red-600">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="min-h-[44px] mt-2"
                placeholder="przyklad@email.pl"
              />
              {errors.email && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Informacje o broni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="weaponType">
                Rodzaj broni <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.weaponType}
                onValueChange={(value) => setFormData({ ...formData, weaponType: value })}
              >
                <SelectTrigger id="weaponType" className="min-h-[44px] mt-2">
                  <SelectValue placeholder="Wybierz rodzaj broni" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pistol">Pistolet</SelectItem>
                  <SelectItem value="rifle">Karabinek</SelectItem>
                  <SelectItem value="shotgun">Strzelba</SelectItem>
                  <SelectItem value="revolver">Rewolwer</SelectItem>
                </SelectContent>
              </Select>
              {errors.weaponType && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.weaponType}</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="purpose">
                Cel posiadania broni <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="min-h-[100px] mt-2"
                placeholder="Opisz cel, w jakim chcesz posiadać broń"
              />
              {errors.purpose && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.purpose}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Wymagane dokumenty i oświadczenia</CardTitle>
            <CardDescription>Załącz skany wymaganych dokumentów (PDF, JPG, PNG)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="medicalCertificateFile">
                Zaświadczenie lekarskie o braku przeciwwskazań zdrowotnych <span className="text-red-600">*</span>
              </Label>
              <Input
                id="medicalCertificateFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setFormData({ ...formData, medicalCertificate: e.target.files && e.target.files.length > 0 ? true : false })
                }
                className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {errors.medicalCertificate && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.medicalCertificate}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="psychologicalTestFile">
                Aktualne badanie psychologiczne <span className="text-red-600">*</span>
              </Label>
              <Input
                id="psychologicalTestFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setFormData({ ...formData, psychologicalTest: e.target.files && e.target.files.length > 0 ? true : false })
                }
                className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {errors.psychologicalTest && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.psychologicalTest}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainingFile">
                Zaświadczenie o ukończeniu szkolenia <span className="text-red-600">*</span>
              </Label>
              <Input
                id="trainingFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setFormData({ ...formData, training: e.target.files && e.target.files.length > 0 ? true : false })
                }
                className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {errors.training && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errors.training}</span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 pt-4 border-t border-border">
              <Checkbox
                id="consent"
                checked={formData.consent}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, consent: checked as boolean })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="consent" className="cursor-pointer">
                  Wyrażam zgodę na przetwarzanie moich danych osobowych w celu rozpatrzenia wniosku zgodnie z RODO <span className="text-red-600">*</span>
                </Label>
                {errors.consent && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errors.consent}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" className="min-h-[52px] flex-1 rounded-xl">
            Złóż wniosek
          </Button>
        </div>
      </form>
    </div>
  );
}
