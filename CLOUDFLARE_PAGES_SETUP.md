# Cloudflare Pages setup

1. Push this repository to GitHub.
2. In Cloudflare, choose **Workers & Pages → Create application → Pages → Connect to Git**.
3. Select your repository.
4. Use these build settings:

```text
Root directory: Site
Build command: npm run build
Build output directory: dist
Node version: 22.12.0
Environment variable: SITE_URL=https://your-production-domain.example (also committed in `.node-version`, `.nvmrc`, `Site/.node-version`, and `Site/.nvmrc`)
```

5. Deploy. Cloudflare runs the sync script during `npm run build`, so `Site/src/content/docs/` is regenerated from `Vault/Lore/`.

No secrets are required for the default template. Set `SITE_URL` to your Cloudflare Pages or custom domain so the sitemap and generated robots.txt use the correct canonical URL.

## Optional giscus comments environment variables

The comments component renders on every Starlight page. It will show a setup warning until giscus is configured.

After enabling GitHub Discussions, installing the giscus GitHub app, and choosing the repository/category at `https://giscus.app/`, add these Cloudflare Pages environment variables:

```text
PUBLIC_GISCUS_REPO_ID
PUBLIC_GISCUS_CATEGORY_ID
```

The project defaults to `PUBLIC_GISCUS_REPO=Bladeswillfall/viscerium-codex`, `PUBLIC_GISCUS_CATEGORY=General`, and `PUBLIC_GISCUS_MAPPING=pathname`. You can override any of them in Cloudflare Pages if needed:

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
