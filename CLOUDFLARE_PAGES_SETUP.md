# Cloudflare Pages setup

This project is currently connected through Cloudflare's **Pages configuration** UI. The deployment should use Cloudflare dashboard build settings and dashboard environment variables, not a committed Wrangler config.

## Current deployment settings

Use these settings in **Workers & Pages → viscerium-codex → Settings → Build**:

```text
Root directory: Site
Build command: npm run build
Build output directory: dist
Node version: 24
```

The build still runs the Obsidian sync and generated-data scripts during `npm run build`, so `Site/src/content/docs/` is regenerated from `Vault/Lore/` before Astro builds.

## Important retry note

Cloudflare's **Retry deployment** action retries the exact same commit that failed. It does not automatically switch that failed deployment to a newer commit on `main`.

If a deployment log shows an older commit SHA, push a new commit to `main` or start a fresh deployment from the latest commit rather than retrying the old failed deployment.

## Canonical URL

Set the canonical site URL:

```text
SITE_URL=https://codex.viscerium.co.uk
```

## Contact form secrets

At minimum, the project needs these values before the contact form can send mail:

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

After enabling GitHub Discussions, installing the giscus GitHub app, and choosing the repository/category at `https://giscus.app/`, add these Cloudflare environment variables:

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
