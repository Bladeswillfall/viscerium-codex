# Contact form setup

The `/contact/` page uses Astro Actions with the Cloudflare adapter and sends email through the Resend HTTP API. Turnstile is supported through a small verification wrapper so the provider can be swapped later.

## Required runtime values

Set these values in your Cloudflare Worker environment or local `Site/.dev.vars` file:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=your-proton-address@example.com
CONTACT_FROM_EMAIL="VISCERIUM Codex <contact@mail.viscerium.co.uk>"
CONTACT_VERIFICATION_PROVIDER=turnstile
PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAAAAAAAAAAAAAAA
TURNSTILE_SECRET_KEY=0x4AAAAAAAAAAAAAAAAAAAAA
```

`CONTACT_TO_EMAIL` can be a Proton Mail address. The visitor's submitted address is used as `Reply-To`, not `From`, so SPF/DKIM/DMARC remain aligned with your verified sending domain.

## Resend

1. Verify `mail.viscerium.co.uk` as the sending domain in Resend.
2. Add the DNS records Resend provides for SPF/DKIM/domain verification.
3. Create an API key.
4. Set `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, and `CONTACT_TO_EMAIL` in the Worker environment.

For early testing, Resend's default onboarding sender may work, but production should use the verified `.co.uk` sender: `VISCERIUM Codex <contact@mail.viscerium.co.uk>`.

## Turnstile

1. Create a Turnstile widget.
2. Add the public site key as `PUBLIC_TURNSTILE_SITE_KEY`.
3. Add the secret as `TURNSTILE_SECRET_KEY`.
4. Keep `CONTACT_VERIFICATION_PROVIDER=turnstile`.

For local development only, set `CONTACT_VERIFICATION_PROVIDER=none` to bypass Turnstile.

## Local development

```bash
cp .dev.vars.example .dev.vars
npm install
npm run dev
```

`Site/.dev.vars` is ignored by Git and should not be committed.

## Portability

The form calls Resend with `fetch()` rather than the Resend Node SDK. Turnstile is isolated in `src/lib/contact/turnstile.ts`. If the site later moves away from Cloudflare, replace the environment helper and verification helper without rewriting the form UI or Astro Action shape.
