
## Goal
Replace the current single-token Pricing page with the new tiered model from the uploaded mockup, while keeping the UX clean and contextual — not a wall of pricing.

## New Pricing Structure

### India (INR) — Monthly
- **Free** ₹0 — 5 tools, 2 agents (preview), 10 uses/day hard cap, no file uploads, no history, no exports
- **Basic** ₹149/mo (₹1,490/yr save 17%) — 40 tools, 2 agents (limited), 100 uses/day, file uploads (5MB), 7-day history, no team
- **Pro** ⭐ Most popular — ₹399/mo (₹3,990/yr save 17%) — All 120 tools, 5 agents, 500 uses/day, unlimited daily use, file uploads (50MB), 90-day history, PDF/CSV export, no team
- **Business** ₹799/mo (₹7,990/yr save) — All 120 tools, All 16 agents, unlimited runs, shared dashboard, admin dashboard, priority queue, Slack/Notion sync
- **Enterprise** — hidden as card, only a "Contact us" CTA → opens mailto with template

### International (USD) by purchasing power
Auto-detect region from existing CountrySelector and show the matching column:
- USA/Canada — Free $0 / Basic $9 / Pro $24 / Business $49 (premium)
- UK/AU/NZ — £0 / £7 / £19 / £39 (£0/A$0 etc shown)
- Europe EU — €0 / €8 / €19 / €42
- Brazil/LatAm — R$0 / R$19 / R$49 / R$99
- SEA (SG/MY/PH/TH) — $0 / $5 / $15 / $32
- Africa/Pakistan/BD — $0 / $2 / $5 / $12

(Pulled directly from mockup. Stored in a single config map.)

### Yearly toggle
Single toggle "Monthly / Yearly (save 17%)". One click switches every card. Yearly price = monthly × 10 (≈17% off). Same toggle drives all currencies.

### Top-up (existing token system) — kept but de-emphasized
Token packs are now shown:
1. As a small "Need extra capacity? Top-up tokens" section at the bottom of Pricing.
2. **Contextually** in the Dashboard / tool pages when user's monthly use is ≥ 80% of their plan limit (low-credit banner with one-click "Top up" → opens the existing buy-tokens dialog).

## Files to change

### Modified
- **`src/pages/Pricing.tsx`** — full rewrite:
  - Monthly/Yearly toggle
  - 4 plan cards (Free / Basic / Pro / Business) with country-aware prices
  - Enterprise = single horizontal banner with "Contact Sales" button (mailto)
  - Feature comparison table (from mockup)
  - Collapsed token top-up section at bottom (re-uses existing UPI dialog)
  - Keeps CountrySelector + PromoPopup + SEOHead

### New
- **`src/lib/pricingPlans.ts`** — config: plans, regional prices, feature matrix, mailto template
- **`src/components/LowCreditBanner.tsx`** — small banner that reads user's `use_words`/`use_images` vs plan limit and shows "Top up" + "Switch to yearly" CTA. Mounted in `Dashboard.tsx` and `AgentChat.tsx` (top, dismissible).

### Mailto template for Enterprise
```
to: cartooninverse5@gmail.com
subject: Enterprise Plan Enquiry – InQuo
body:
Hi InQuo Team,

I'm interested in the InQuo Enterprise plan for my organisation.

Company name:
Team size:
Use case:
Preferred start date:
Country:

Please share custom pricing and a demo slot.

Thanks,
[Your name]
```
Opens via `window.location.href = "mailto:..."`.

## Out of scope
- Actual subscription billing/checkout (UPI manual flow stays the only payment method per project rules). Plan "Subscribe" CTA opens the same UPI dialog pre-filled with the plan's price + plan name (admin manually credits).
- No third-party gateway (Stripe etc.) — explicitly forbidden per project memory.
- No DB migrations; plan metadata lives client-side for now.

Confirm and I'll implement.
