# Innoledge website

The cleaned static Innoledge site, with EN/FR/ZH pages and the original seven partner links retained in a right-hand sidebar. On mobile, partners appear below the main content.

## Build and test

Requires Node.js 24. Run `npm ci`, `npm test`, then `npm run build`. Output is `dist/`. Serve that folder locally to preview the built sidebar, which is generated from `data/partners.json`.

## Deployment

Deploy this repository (`Innoledge/innoledge`) to Vercel project `akemis-dev-projects/innoledge-com`. The similarly named `Innoledge/innoledge.com` repository is the older WordPress export and must not be used as this site's deployment source.

`vercel.json` configures the static build and redirects old WordPress URLs. `api/contact.js` runs as a Vercel function alongside the static output. GitHub Actions validates the build; it no longer publishes GitHub Pages.

## Email

EN, FR and ZH contact forms POST to `/api/contact`. Set `RESEND_API_KEY` in both Vercel Preview and Production after verifying the sending domain in Resend. `MAIL_FROM` defaults to `website@innoledge.com`, and `MAIL_TO` to `info@innoledge.com`. Replies go to the visitor's email address. Keep all credentials in Vercel, never the repository.

Without the key, the endpoint returns an explicit failure; the browser preserves the message and displays the fallback address. Tests mock Resend and do not send emails. The handler checks required fields, length limits and origins, includes a honeypot, and uses a timeout. Origin checks and a honeypot are basic abuse controls, not distributed rate limiting.

Before enabling email, verify sender DNS and perform an authorized delivery test. Future traffic-based rate limiting can be configured in Vercel Firewall if needed.
