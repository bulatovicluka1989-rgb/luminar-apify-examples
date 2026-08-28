# Luminar Apify examples

Runnable, bounded JavaScript, Python, and PowerShell examples for production Luminar Actors. Every package is tied to an immutable Growth source lock and uses the public Apify API.

This tree is a local, hash-locked publication candidate. No GitHub repository, commit, release, or public link is claimed until a separately approved push and remote read-back succeed.

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
