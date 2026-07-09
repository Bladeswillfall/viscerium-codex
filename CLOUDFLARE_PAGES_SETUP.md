# Cloudflare Workers setup

The Codex now uses `@astrojs/cloudflare` because the contact form depends on Astro Actions and a server island. Cloudflare Pages-only deployment is no longer the preferred target for this branch; use a Cloudflare Worker project instead.

## Recommended deployment

1. Push this repository to GitHub.
2. In Cloudflare, choose **Workers & Pages → Create application → Workers → Import a repository**.
3. Select this repository.
4. Use these build settings:

```text
Root directory: Site
Build command: npm run build
Deploy command: npx wrangler deploy
Node version: 24
```

5. Set the canonical site URL:

```text
SITE_URL=https://codex.viscerium.co.uk
```

6. Add the contact form runtime values described in `Site/CONTACT_FORM_SETUP.md`.
7. Attach the custom domain `codex.viscerium.co.uk` to the Worker once the nameservers and DNS zone are active in Cloudflare.

The build still runs the Obsidian sync and generated-data scripts during `npm run build`, so `Site/src/content/docs/` is regenerated from `Vault/Lore/` before Astro builds.

## Contact form secrets

At minimum, the Worker needs these values before the contact form can send mail:

```text
RESEND_API_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
CONTACT_VERIFICATION_PROVIDER
PUBLIC_TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
```

Use Cloudflare secrets for `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY`.

## Optional giscus comments environment variables

The comments component renders on every Starlight page. It will show a setup warning until giscus is configured.

After enabling GitHub Discussions, installing the giscus GitHub app, and choosing the repository/category at `https://giscus.app/`, add these Worker environment variables:

```text
PUBLIC_GISCUS_REPO_ID
PUBLIC_GISCUS_CATEGORY_ID
```

The project defaults to `PUBLIC_GISCUS_REPO=Bladeswillfall/viscerium-codex`, `PUBLIC_GISCUS_CATEGORY=General`, and `PUBLIC_GISCUS_MAPPING=pathname`. You can override any of them if needed:

```text
PUBLIC_GISCUS_REPO
PUBLIC_GISCUS_CATEGORY
PUBLIC_GISCUS_MAPPING
PUBLIC_GISCUS_STRICT
PUBLIC_GISCUS_REACTIONS_ENABLED
PUBLIC_GISCUS_EMIT_METADATA
PUBLIC_GISCUS_INPUT_POSITION
PUBLIC_GISCUS_THEME
PUBLIC_GISCUS_LANG
PUBLIC_GISCUS_LOADING
```

Leave the giscus ID variables unset to keep the comments accordion as a setup placeholder.
