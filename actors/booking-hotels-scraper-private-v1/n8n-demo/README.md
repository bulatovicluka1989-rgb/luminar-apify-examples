# Booking.com → Google Sheets demo

Choose a destination and stay dates, collect a bounded hotel shortlist with Apify, and write the results into Google Sheets with n8n. Repeated results for the same property and search scope update existing rows.

**[Use the published n8n template](https://n8n.io/workflows/18740-create-dated-bookingcom-hotel-shortlists-with-apify-and-google-sheets/)** · [Open the Booking Actor](https://apify.com/luminar/booking-hotels-scraper-private-v1) · [Luminar on n8n](https://n8n.io/creators/luminar/)

## Preview the result

These five real results were collected on **26 August 2026**, for a **15–17 September 2026** stay in Tivat. They are historical search results, not current offers or checkout-verified prices. The result was capped at five properties, not an exhaustive market search.

| Property | Reported stay total | Guest score |
|---|---:|---:|
| Apartments Family | EUR 100.00 | 8.5 |
| Eden apartments | EUR 208.70 | 9.0 |
| Sea and Sunshine 100m to beach,free parking,centar,View | EUR 139.13 | 9.6 |
| Adriatic Dream | EUR 107.39 | 9.0 |
| Apartment Nada | EUR 86.09 | 8.8 |

[View or download the saved CSV](sample-hotels.csv). Prices remain blank when the source does not report them; this workflow does not infer missing prices.

For an interactive walkthrough, download this repository and open this folder's `index.html` in a browser. Click **Show the 5 saved hotels**. The demo reads only saved data and makes no paid API calls. GitHub displays HTML source rather than running the page.

## Run it yourself

1. Use the published template, or import [booking-workflow.json](booking-workflow.json) into a **new, empty n8n workflow**.
2. Install the verified Apify community node if required. Select your Apify credential on every Apify node and your Google Sheets credential on the Sheets node. Credentials belong in n8n, never in this repository.
3. Create a blank Google Sheets tab named `Booking Shortlist`. Import [sheet-header.csv](sheet-header.csv) as its first row.
4. Open **Shortlist settings**. Set the destination, future check-in and check-out dates, spreadsheet ID and tab name. Start with five properties and keep the existing maximum Actor charge of **$0.10 per run**.
5. Execute manually and inspect the Sheet, coverage and charge receipt. The Actor is called once without automatic retries. No schedule needs to be enabled for this demo.

The template is free to download. Apify usage and n8n hosting or plan charges may apply. The charge cap is not a price quote.

## Repeated runs and version scope

Google Sheets uses **Append or Update Row**, matched by `upsertKey`. New properties or a changed search scope can legitimately add rows. In the recorded 26 August repeat test, five rows were updated, the Sheet remained at six total data rows, and duplicate keys remained at zero.

The included JSON is the unchanged published template artifact, pinned to Booking build **0.10.1**. The recording and repeat test concern that version; this demo is not a new end-to-end test of the current Actor `latest` build. Choose future dates before a real run.

Workflow SHA-256: `c22424b222a828809b2953cdaf9ba704748105b50d6d6c6ac4fe5594cc3f44de`.

Prepared 6 September 2026 by Luminar. We maintain the linked Actor and workflow.
