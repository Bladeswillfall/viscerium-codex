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
```

5. Deploy. Cloudflare runs the sync script during `npm run build`, so `Site/src/content/docs/` is regenerated from `Vault/Lore/`.

No secrets are required for the default template.

## Optional giscus comments environment variables

If you want the collapsible comments section to load GitHub Discussions comments, add these Cloudflare Pages environment variables after configuring giscus:

```text
PUBLIC_GISCUS_REPO
PUBLIC_GISCUS_REPO_ID
PUBLIC_GISCUS_CATEGORY
PUBLIC_GISCUS_CATEGORY_ID
```

Leave them unset to keep the comments accordion as a setup placeholder.
