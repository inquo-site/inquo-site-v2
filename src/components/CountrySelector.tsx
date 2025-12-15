import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const COUNTRIES = [
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR" },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "USD" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "USD" },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "USD" },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "USD" },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "USD" },
  { code: "JP", name: "Japan", flag: "🇯🇵", currency: "USD" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", currency: "USD" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", currency: "USD" },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "USD" },
  { code: "IT", name: "Italy", flag: "🇮🇹", currency: "USD" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", currency: "USD" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", currency: "USD" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", currency: "USD" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", currency: "USD" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", currency: "USD" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", currency: "USD" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", currency: "USD" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", currency: "USD" },
  { code: "PL", name: "Poland", flag: "🇵🇱", currency: "USD" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", currency: "USD" },
  { code: "AT", name: "Austria", flag: "🇦🇹", currency: "USD" },
  { code: "NO", name: "Norway", flag: "🇳🇴", currency: "USD" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", currency: "USD" },
  { code: "FI", name: "Finland", flag: "🇫🇮", currency: "USD" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", currency: "USD" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", currency: "USD" },
  { code: "GR", name: "Greece", flag: "🇬🇷", currency: "USD" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", currency: "USD" },
  { code: "RO", name: "Romania", flag: "🇷🇴", currency: "USD" },
  { code: "HU", name: "Hungary", flag: "🇭🇺", currency: "USD" },
  { code: "IL", name: "Israel", flag: "🇮🇱", currency: "USD" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", currency: "USD" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", currency: "USD" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", currency: "USD" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", currency: "USD" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", currency: "USD" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", currency: "USD" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", currency: "USD" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", currency: "USD" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", currency: "USD" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", currency: "USD" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", currency: "USD" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", currency: "USD" },
  { code: "RU", name: "Russia", flag: "🇷🇺", currency: "USD" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", currency: "USD" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", currency: "USD" },
  { code: "CL", name: "Chile", flag: "🇨🇱", currency: "USD" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", currency: "USD" },
  { code: "PE", name: "Peru", flag: "🇵🇪", currency: "USD" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", currency: "USD" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", currency: "USD" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", currency: "USD" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", currency: "USD" },
].sort((a, b) => a.name.localeCompare(b.name));

interface CountrySelectorProps {
  onSelect?: (country: typeof COUNTRIES[0]) => void;
}

export const getSelectedCountry = () => {
  const stored = localStorage.getItem("user_country");
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};

export const isIndianUser = () => {
  const country = getSelectedCountry();
  return country?.code === "IN";
};

export const CountrySelector = ({ onSelect }: CountrySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const hasSelected = localStorage.getItem("user_country");
    if (!hasSelected) {
      setOpen(true);
    }
  }, []);

  const handleSelect = (country: typeof COUNTRIES[0]) => {
    localStorage.setItem("user_country", JSON.stringify(country));
    setOpen(false);
    onSelect?.(country);
    window.location.reload(); // Refresh to apply pricing
  };

  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <Globe className="w-8 h-8 text-accent" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Select Your Country</DialogTitle>
          <DialogDescription className="text-center">
            Choose your country to see pricing in your local currency
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-1">
            {filteredCountries.map((country) => (
              <Button
                key={country.code}
                variant="ghost"
                className="w-full justify-start gap-3 h-12 text-left"
                onClick={() => handleSelect(country)}
              >
                <span className="text-2xl">{country.flag}</span>
                <span className="flex-1">{country.name}</span>
                <span className="text-sm text-muted-foreground">{country.currency}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>

        <p className="text-xs text-center text-muted-foreground mt-4">
          This helps us show you the right pricing and payment methods
        </p>
      </DialogContent>
    </Dialog>
  );
};
