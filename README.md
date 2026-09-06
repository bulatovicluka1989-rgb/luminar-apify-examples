# Luminar Apify examples

Runnable, bounded JavaScript, Python, and PowerShell examples for production Luminar Actors. Every package is tied to an immutable Growth source lock and uses the public Apify API.

Examples are versioned with their release evidence. Check each example's version and recorded-data date before use.

## n8n demonstration

**[Temu → Google Sheets: product watchlist](actors/temu-product-scraper-price-monitor/n8n-demo/README.md)** — importable workflow, header CSV and setup guide. Two local credentialed tests on 6 September 2026 updated the same product row without duplicates. This standalone n8n example is separate from the JavaScript/Python/PowerShell Actor catalog below.

**[Booking.com → Google Sheets: hotel shortlist demo](actors/booking-hotels-scraper-private-v1/n8n-demo/README.md)** — five real saved hotel results, CSV, an interactive offline walkthrough, and the published n8n workflow with setup instructions. The recording is dated 26 August 2026; it does not claim current prices.

## Actors

| Example | Actor | Store |
|---|---|---|
| [Booking.com Hotel Scraper: Search & Stay Prices](actors/booking-hotels-scraper-private-v1/README.md) | `luminar/booking-hotels-scraper-private-v1` | [Open Actor](https://apify.com/luminar/booking-hotels-scraper-private-v1) |
| [GLEIF LEI Lookup & Entity Change Monitor](actors/gleif-lei-change-monitor/README.md) | `luminar/gleif-lei-change-monitor` | [Open Actor](https://apify.com/luminar/gleif-lei-change-monitor) |

## Run an example

1. Create an Apify API token with only the access you need.
2. Set it in the `APIFY_TOKEN` environment variable.
3. Open an Actor folder and run its JavaScript, Python, or PowerShell command.

All examples start the paid Actor once, have a 20-minute terminal wait, preserve the run URL, and paginate the complete dataset. They do not contain Actor source, source routes, proxy logic, credentials, Cloud logs, or internal QA evidence.

## Verify this exact tree

```powershell
node scripts/verify.mjs
```

The CI workflow performs the same allowlist, secret, source-lock, JSON, JavaScript, Python, and PowerShell checks without running an Actor or spending money.
