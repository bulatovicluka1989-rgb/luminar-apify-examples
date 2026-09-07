# Review SEC 8-K events and amendments with Apify and Google Sheets

Help a company researcher review official SEC 8-K and 8-K/A filings in one spreadsheet. Keep item classifications, company names, amendment evidence and original document links together without requiring an AI service.

[Actor](https://apify.com/luminar/sec-8k-material-event-monitor) · [Workflow JSON](./workflow.json) · [Header CSV](./sheet-header.csv)

![Workflow canvas](./workflow.png)

## Setup

1. Import workflow.json into an empty n8n workflow. Keep it inactive until configured.
2. Create an Apify Header Auth credential with header name Authorization and value Bearer followed by your own token. Select it on all five HTTP Request nodes. Never put the token in the JSON.
3. Connect Google Sheets OAuth2 to Upsert review register.
4. Create a spreadsheet with a **SEC Events** tab. Import sheet-header.csv into row 1 exactly. Preserve every header; only upsertKey is a matching column.
5. Enter the spreadsheet ID in Review settings. Leave tickers empty for a market sample or enter up to five comma-separated tickers. Choose a 1–31 day lookback and at most 50 filings.
6. Run manually and review the source links. Repeat sequentially with the same settings to update current observations.

## Reading the register

Each accession and registrant CIK identifies one filing. An amendment is a separate filing, with its source-supported link when available. Event categories describe official item codes, not investment recommendations. Empty ticker cells remain empty. A rolling-window disappearance never means a filing was withdrawn.

Each key combines the selected source scope with a canonical source identity. Changed source filters create separate keys. A larger result limit retains the same keys. Rows not observed on a later run remain as their earlier observation: check observedAt and runUrl. No row is automatically deleted and no notification or outbound message is sent.

COMPLETE means the Actor completed the declared source window, not that it collected every result available on the service. CAPPED is an explicitly limited sample. The result cap is never a promised minimum. PARTIAL, BLOCKED, failed runs, identity mismatches and dataset-count drift stop before Sheets. Verified empty results produce no data rows.

## Cost and recovery

Use your own Apify account. The template includes no credits. The default $1 charge cap is a ceiling, not a run price. estimatedActorChargeUsd is calculated from the run's effective event prices and authoritative, non-simulated Actor charge receipts (plus any native platform-start charge); it is not a platform infrastructure-cost measurement or invoice. Repeated source results can be charged again.

Only Sheets delivery retries automatically. If a paid start returns a network or HTTP error, inspect recent runs and their input in Apify before attempting another start; a run may already exist. If Sheets alone fails, preserve the verified rows and retry destination delivery without starting another Actor. The workflow bounds polling to six minutes and execution to eight minutes.

## Validation

Tested on local n8n Community Edition 2.37.10 with pinned Actor build rel-sec8k-20260904v. Two successful credentialed executions wrote 25 unique rows and retained 25 on repeat. All 20 columns were read back and compared, with zero duplicate keys. Coverage was CAPPED and CAPPED. These are owner QA results, not customer adoption or performance guarantees.
