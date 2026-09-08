# Review Google Play feedback and developer replies with Apify and Google Sheets

![Workflow canvas](https://raw.githubusercontent.com/bulatovicluka1989-rgb/luminar-apify-examples/main/actors/google-play-reviews-change-monitor/n8n-feedback-review/workflow.png)

### Who this is for
App and support teams reviewing public Google Play feedback alongside app versions and published developer replies.

### How it works
Collect up to 100 review slots for one app and locale. Verify source coverage, scan charges and the complete bounded dataset before updating Google Sheets. Only review records become rows; paid scan receipts remain verification evidence.

Filter reviewAction for ratings 1–2, then read the review and any public reply. Priority is a transparent rating rule, not sentiment analysis. No replies are posted. Missing version or reply fields remain unknown.

Stable keys update observed reviews. Older unobserved rows remain, so check observedAt. CAPPED is a limited window, not every review. Partial or failed source results stop delivery. Verified empty results add no rows.

### Setup and requirements
Import into an empty n8n canvas. Connect Apify Header Auth on all five HTTP nodes and Google Sheets OAuth2 on Upsert review register. Create an App Feedback tab with the exact [CSV header](https://raw.githubusercontent.com/bulatovicluka1989-rgb/luminar-apify-examples/main/actors/google-play-reviews-change-monitor/n8n-feedback-review/sheet-header.csv). Set spreadsheetId and appId in Review settings.

The template is free; Apify scans are paid, including repeated reviews. The $1 cap is a ceiling, not the run price. Only Sheets delivery retries automatically.

### Customization
Choose country, language, helpful or newest sort and a 1–100 slot limit. Run sequentially. Changed source results can add legitimate new rows. [Setup guide](https://raw.githubusercontent.com/bulatovicluka1989-rgb/luminar-apify-examples/main/actors/google-play-reviews-change-monitor/n8n-feedback-review/README.md).

## Import and configure

1. Download workflow.json and import it into a new empty n8n workflow. Leave it inactive.
2. Create an Apify Header Auth credential with header name Authorization and value Bearer followed by your token. Select it on all five HTTP nodes. Never paste a token into workflow JSON.
3. Connect your Google Sheets OAuth2 credential. Create a spreadsheet tab named App Feedback and import sheet-header.csv into its first row. Paste the spreadsheet ID into Review settings.
4. Start with com.spotify.music, US storefront, English, helpful sort and 100 review slots. Execute manually.
5. Filter REVIEW_LOW_RATING_NO_REPLY for ratings 1–2 without an observed reply. LOW_RATING_REPLY_PRESENT indicates a published reply, not that the customer's issue is resolved. STANDARD_REVIEW covers other ratings. Do not add manual columns without adapting the mapping and testing preservation.

## Limits and cost

One app and one source page, up to 100 scanned review slots. A maximum is never a promised minimum. COMPLETE means the source ended for that requested window; CAPPED means continuation remained. No global coverage or deletion inference. Request country/language describe the storefront request, not the reviewer's location.

The released Actor charges $0.0095 per batch of up to 100 scanned reviews for this bounded nonempty workload; verified empty scans cost $0.003. Effective run pricing and native charged counts are checked at runtime. estimatedActorChargeUsd is a per-run amount repeated on every row; do not sum that column as if each review had that charge. It is not infrastructure usage or an invoice.

One paid start, polling bounded to six minutes, workflow timeout eight minutes. If a paid start fails ambiguously, inspect existing Apify runs before trying again. If Sheets alone fails, retry destination delivery from preserved verified rows instead of starting paid collection again.

## Validation

Tested on local n8n Community Edition 2.37.10 with pinned Actor build gplay-release-20260907e. Two successful credentialed executions wrote 100 unique rows and retained 100 on repeat. All 22 columns were read back and compared, with zero duplicate keys. Coverage was CAPPED and CAPPED. These are owner QA results, not customer adoption or performance guarantees.
