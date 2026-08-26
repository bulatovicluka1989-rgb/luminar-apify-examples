# Security

Never commit Apify tokens, cookies, request headers, private endpoints, credential IDs, user datasets, Cloud run logs, or private implementation details to this repository.

The examples read `APIFY_TOKEN` from the process environment and send it only in the Apify API Authorization header. They do not accept a token in a saved input or URL. Rotate the token immediately if it is ever exposed.

Report a suspected secret or unsafe example privately to the repository owner. Do not open a public issue containing credentials, personal data, or sensitive reproduction logs.

