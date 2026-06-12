// Centralised pricing config. All amounts are MONTHLY in local currency.
// Yearly = monthly * 10 (≈17% off, matching mockup).

export type PlanKey = "free" | "basic" | "pro" | "business";

export interface PlanFeature {
  label: string;
  free: string | boolean;
  basic: string | boolean;
  pro: string | boolean;
  business: string | boolean;
}

export interface RegionPricing {
  code: string;          // matches CountrySelector code, or "default"
  label: string;
  currency: string;
  symbol: string;
  countries: string[];   // country codes mapped to this region
  prices: Record<PlanKey, number>; // monthly price
}

export const REGIONS: RegionPricing[] = [
  {
    code: "IN",
    label: "India",
    currency: "INR",
    symbol: "₹",
    countries: ["IN"],
    prices: { free: 0, basic: 149, pro: 399, business: 799 },
  },
  {
    code: "US",
    label: "USA / Canada",
    currency: "USD",
    symbol: "$",
    countries: ["US", "CA"],
    prices: { free: 0, basic: 9, pro: 24, business: 49 },
  },
  {
    code: "GB",
    label: "UK / Australia / NZ",
    currency: "GBP",
    symbol: "£",
    countries: ["GB", "AU", "NZ", "IE"],
    prices: { free: 0, basic: 7, pro: 19, business: 39 },
  },
  {
    code: "EU",
    label: "Europe (EU)",
    currency: "EUR",
    symbol: "€",
    countries: [
      "DE","FR","ES","IT","NL","BE","AT","PT","GR","CZ","RO","HU","PL",
      "SE","CH","NO","DK","FI",
    ],
    prices: { free: 0, basic: 8, pro: 19, business: 42 },
  },
  {
    code: "BR",
    label: "Brazil / LatAm",
    currency: "BRL",
    symbol: "R$",
    countries: ["BR", "MX", "AR", "CL", "CO", "PE"],
    prices: { free: 0, basic: 19, pro: 49, business: 99 },
  },
  {
    code: "SG",
    label: "SEA",
    currency: "USD",
    symbol: "$",
    countries: ["SG", "MY", "PH", "TH", "VN", "ID", "HK", "TW", "KR", "JP"],
    prices: { free: 0, basic: 5, pro: 15, business: 32 },
  },
  {
    code: "ZA",
    label: "Africa / South Asia",
    currency: "USD",
    symbol: "$",
    countries: [
      "ZA","NG","KE","GH","EG","PK","BD","LK","NP","AE","SA","IL","TR","RU",
    ],
    prices: { free: 0, basic: 2, pro: 5, business: 12 },
  },
];

export const DEFAULT_REGION = REGIONS[1]; // USA pricing as global fallback

export const getRegionForCountry = (countryCode?: string | null): RegionPricing => {
  if (!countryCode) return DEFAULT_REGION;
  return REGIONS.find((r) => r.countries.includes(countryCode)) ?? DEFAULT_REGION;
};

export interface Plan {
  key: PlanKey;
  name: string;
  tagline: string;
  popular?: boolean;
  ctaLabel: string;
  highlights: string[];
}

export const PLANS: Plan[] = [
  {
    key: "free",
    name: "Free",
    tagline: "Try before you commit",
    ctaLabel: "Start free",
    highlights: [
      "5 tools access",
      "2 agents (preview)",
      "10 uses / day hard cap",
      "No file uploads",
      "No history",
    ],
  },
  {
    key: "basic",
    name: "Basic",
    tagline: "Students & freelancers",
    ctaLabel: "Choose Basic",
    highlights: [
      "40 tools access",
      "2 agents (limited)",
      "100 uses / day",
      "File uploads (5 MB)",
      "7-day history",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "Power users & creators",
    popular: true,
    ctaLabel: "Go Pro",
    highlights: [
      "All 120 tools",
      "5 agents (500 runs/mo)",
      "Unlimited daily use",
      "File uploads (50 MB)",
      "90-day history",
      "PDF / CSV export",
    ],
  },
  {
    key: "business",
    name: "Business",
    tagline: "Startups & small teams",
    ctaLabel: "Choose Business",
    highlights: [
      "All 120 tools",
      "All 16 agents",
      "Unlimited runs",
      "Shared dashboard",
      "Admin dashboard",
      "Priority queue",
      "Slack / Notion sync",
    ],
  },
];

export const FEATURE_MATRIX: PlanFeature[] = [
  { label: "Tools access (of 120)", free: "5", basic: "40", pro: "120", business: "120" },
  { label: "Agents (of 16)", free: "2", basic: "2", pro: "5", business: "16" },
  { label: "Agent runs / month", free: "10", basic: "50", pro: "500", business: "Unlimited" },
  { label: "Daily tool usage", free: "10", basic: "100", pro: "Unlimited", business: "Unlimited" },
  { label: "File upload size", free: false, basic: "5 MB", pro: "50 MB", business: "500 MB" },
  { label: "Export (PDF / CSV)", free: false, basic: false, pro: true, business: true },
  { label: "Team workspace", free: false, basic: false, pro: false, business: true },
  { label: "API access", free: false, basic: false, pro: false, business: "Enterprise-only" },
];

// Enterprise enquiry mailto
export const ENTERPRISE_EMAIL = "cartooninverse5@gmail.com";

export const buildEnterpriseMailto = () => {
  const subject = "Enterprise Plan Enquiry – InQuo";
  const body = [
    "Hi InQuo Team,",
    "",
    "I'm interested in the InQuo Enterprise plan for my organisation.",
    "",
    "Company name:",
    "Team size:",
    "Use case:",
    "Preferred start date:",
    "Country:",
    "",
    "Please share custom pricing and a demo slot.",
    "",
    "Thanks,",
    "",
  ].join("\n");
  return `mailto:${ENTERPRISE_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
};

export const YEARLY_DISCOUNT_PCT = 17;
export const yearlyPrice = (monthly: number) => monthly * 10;

export const formatPrice = (region: RegionPricing, amount: number) =>
  amount === 0 ? "0" : `${amount.toLocaleString()}`;
