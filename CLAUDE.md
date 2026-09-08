# Project guidance

This is the cleaned static site in `Innoledge/innoledge`, not the legacy `Innoledge/innoledge.com` export. Preserve the original seven partners in the right sidebar, their order and links. On small screens the sidebar moves below content.

Build with `npm run build`; test with `npm test`. Node 24; no dependencies. HTML source is `index.html`, `en/`, `fr/`, `zh/`. The build adds a sidebar from `data/partners.json` and writes `dist/`. Modify source and rebuild; do not edit generated HTML alone.

Vercel project: `akemis-dev-projects/innoledge-com`. Output: `dist`. Email: `api/contact.js` via Resend, configured in Vercel environment variables. Never commit credentials. GitHub Actions validates changes; hosting is Vercel.
