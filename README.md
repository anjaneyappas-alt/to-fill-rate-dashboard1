# TO Fill-Rate Dashboard

Tracks Transfer Order (TO) fulfillment from Zoho Inventory: how much qty was
raised vs. sent per DS (distributor / dark store), fill-rate %, and an RCA tag
(Short vs. Not Picked) for every SKU that wasn't fully sent.

Since this session didn't have live Zoho API credentials, it works from two
**exports** instead of a live API call:

1. **Stock export** — Zoho Inventory → Reports → Stock Summary (or an Items
   export) with current stock on hand per SKU (per warehouse ideally).
2. **Transfer Order export** — Zoho Inventory → Transfer Orders, exported as a
   line-item list (needs destination DS, SKU, qty raised, and either a qty
   sent/transferred column or a status column).

Upload both as `.csv` or `.xlsx` on the page. Column names are auto-detected
from common Zoho headers, and you can correct the mapping if your export uses
different names — nothing is hardcoded to one schema. All parsing and
computation happens **in the browser**; no file is uploaded to a server.

## RCA logic (Short vs. Not Picked)

Zoho doesn't track *why* a line wasn't sent, so this is inferred per SKU/DS
line, comparing the still-pending qty against stock on hand at the TO's
source warehouse at the time of the export:

- **Short** — stock on hand at the source warehouse is *less than* the
  pending qty. Real inventory shortage.
- **Not Picked** — stock on hand covers the pending qty. The stock was there;
  it just wasn't picked/dispatched — an operational/fulfillment gap, not a
  stock gap.
- **Unknown (no stock data)** — the SKU wasn't found in the stock export.

This is a heuristic based on a point-in-time stock snapshot, not Zoho's own
classification — treat it as a starting point for RCA, not a final verdict.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploying to Vercel

**Option A — via GitHub (recommended):**
1. Push this folder to a new GitHub repo.
2. Go to https://vercel.com/new, import that repo.
3. Framework preset auto-detects "Next.js" — no environment variables needed.
4. Click Deploy.

**Option B — via Vercel CLI:**
```bash
npm install -g vercel
vercel          # first deploy, follow prompts
vercel --prod   # promote to production
```

No database or API keys are required for this version — it's a pure
client-side computation tool. When live Zoho API access is available, the
upload step can be swapped for a scheduled API pull (see "Next steps" below)
without changing the dashboard/RCA logic.

## Next steps (when Zoho API access is available)

- Replace the file-upload step with a Zoho Inventory API client (OAuth
  self-client) that pulls current stock and transfer orders directly.
- Add a persistence layer (Vercel Postgres / KV) to keep history over time
  (today's version recomputes fresh from whatever you upload each time).
- Add a real "picked at" / "shipped at" timestamp from Zoho if available, to
  replace the Short/Not-Picked heuristic with an actual picking-delay signal.
