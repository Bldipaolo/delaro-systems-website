# Delaro Systems homepage

This is the public Delaro Systems website. It uses the approved Delaro brand system and locked logo assets with semantic HTML, responsive CSS, a small accessible JavaScript layer, and a Vercel-compatible contact endpoint.

## Run locally

Serve the directory with any static server, for example:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Routes

- `/` — homepage
- `/approach` — diagnosis-led methodology
- `/capabilities` — possible interventions
- `/work` — verified work index and evidence standard
- `/company` — operating philosophy
- `/contact` — operational inquiry form

## Checks

```sh
npm run check
```

This runs link/structure linting, JavaScript syntax checks, and a static production build into `dist/`.

## Contact delivery

The contact form posts to the Vercel Function at `/api/contact`. It includes server-side validation, same-origin checks, a honeypot, minimum-completion timing, request throttling, and Resend delivery.

Copy `.env.example` into the deployment environment and configure:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL` — must use a sender domain verified with Resend
- `CONTACT_ALLOWED_ORIGINS` — comma-separated production origins

Without these values, the endpoint intentionally returns `503 CONTACT_NOT_CONFIGURED` and the form does not claim success.

## Implementation notes

- Public pages are intentionally framework-free; there is no runtime client dependency.
- Navigation, the mobile menu, active-section state, reduced motion, reduced transparency, and increased contrast preferences are supported.
- No Client Login is shown because no functioning portal route exists.
- No privacy or terms routes are published because approved legal content was not supplied.
- No public case studies are shown because no verified public engagements were supplied.
