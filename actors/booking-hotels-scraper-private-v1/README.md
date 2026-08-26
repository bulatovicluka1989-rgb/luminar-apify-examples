# Booking.com Hotel Scraper: Search & Stay Prices API examples

These bounded examples run `luminar/booking-hotels-scraper-private-v1` once, wait for a terminal status, preserve the Apify run URL, and retrieve every dataset page. They never retry the paid Actor automatically.

## Setup

Set `APIFY_TOKEN` in your environment. The token is sent only in the Apify API Authorization header and is never saved in the input files.

From this Actor folder, run one implementation:

```powershell
node javascript/run.mjs
python python/run.py
powershell -File powershell/run.ps1
```

The input in `inputs/quick-start.json` is deliberately small. Review the complete buyer price in the [Actor page](https://apify.com/luminar/booking-hotels-scraper-private-v1) before increasing its limits.

## Outcome

Create a fast, deduplicated hotel-search dataset with explicit stay-price context.

The row in `outputs/sample.json` is illustrative and bound to the canonical Actor README hash recorded in `manifest.json`. The Store README remains the product contract; this guide covers only the API examples.
