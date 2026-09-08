# Innoledge website

The cleaned static Innoledge site, with EN/FR/ZH pages and the original seven partner links retained in a right-hand sidebar. On mobile, partners appear below the main content.

## Build and test

Requires Node.js 24. Run `npm ci`, `npm test`, then `npm run build`. Output is `dist/`. Serve that folder locally to preview the built sidebar, which is generated from `data/partners.json`.

## Deployment

Deploy this repository (`Innoledge/innoledge`) to Vercel project `akemis-dev-projects/innoledge-com`. The similarly named `Innoledge/innoledge.com` repository is the older WordPress export and must not be used as this site's deployment source.

`vercel.json` configures the static build and redirects old WordPress URLs. `api/contact.js` runs as a Vercel function alongside the static output. GitHub Actions validates the build; it no longer publishes GitHub Pages.

## Email

EN, FR and ZH contact forms POST to `/api/contact`, which sends through Google SMTP using Nodemailer. No Resend account is required.

Set these Vercel environment variables for Production and Preview:

- `SMTP_HOST`: `smtp.gmail.com`
- `SMTP_PORT`: `465` (implicit TLS; port 587 with required STARTTLS is also supported)
- `SMTP_USER`: `info@innoledge.com`
- `SMTP_PASS`: a Google app password, never the normal account password

`MAIL_FROM` defaults to the authenticated mailbox. `MAIL_TO` defaults to `info@innoledge.com`; Reply-To is the visitor. Credentials stay in Vercel, never the repository.

Without credentials, the endpoint reports an explicit failure and preserves the message in the browser. Tests mock the SMTP transport and send no mail. The handler validates fields and origins, has a honeypot, requires encrypted SMTP, and uses connection and socket timeouts. Basic abuse controls do not replace distributed rate limiting.

Before enabling email, verify SMTP authentication and perform an authorized delivery test.
