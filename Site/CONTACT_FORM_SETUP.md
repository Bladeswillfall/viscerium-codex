# Contact form setup

The live `/contact/` page is currently static so the Codex can remain on Cloudflare Pages without the Cloudflare adapter, Astro Actions, or server islands.

The Resend + Turnstile form work is deferred until it can be hosted as a separate Worker endpoint or moved into a full Cloudflare Workers deployment without disrupting the main Codex build.

## Current Pages deployment

The main Codex deployment should use Cloudflare dashboard settings and dashboard environment variables only:

```text
Root directory: Site
Build command: npm run build
Build output directory: dist
Node version: 24
```

No committed Wrangler file is required for the current Pages deployment.

## Future Worker contact form values

When the contact form is reintroduced as a Worker-backed endpoint, use these values in that Worker environment, not in the static Codex build unless the Worker requires them:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=your-proton-address@example.com
CONTACT_FROM_EMAIL="VISCERIUM Codex <contact@mail.viscerium.co.uk>"
CONTACT_VERIFICATION_PROVIDER=turnstile
PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAAAAAAAAAAAAAAA
TURNSTILE_SECRET_KEY=0x4AAAAAAAAAAAAAAAAAAAAA
```

`CONTACT_TO_EMAIL` can be a Proton Mail address. The visitor's submitted address should be used as `Reply-To`, not `From`, so SPF/DKIM/DMARC remain aligned with the verified sending domain.

## Resend

1. Verify `mail.viscerium.co.uk` as the sending domain in Resend.
2. Add the DNS records Resend provides for SPF/DKIM/domain verification.
3. Create an API key.
4. Use the verified `.co.uk` sender: `VISCERIUM Codex <contact@mail.viscerium.co.uk>`.

## Turnstile

1. Create a Turnstile widget.
2. Add the public site key as `PUBLIC_TURNSTILE_SITE_KEY`.
3. Add the secret as `TURNSTILE_SECRET_KEY`.
4. Validate Turnstile tokens server-side in the Worker endpoint.
