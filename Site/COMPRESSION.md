# Codex compression

The Codex uses [`@playform/compress`](https://github.com/PlayForm/Compress) as the final Astro integration.

## Production builds

Every normal build compresses the generated Astro output in `Site/dist/`:

```bash
cd Site
npm ci
npm run build
```

`dist/` is a generated deployment directory and is not committed. Cloudflare Pages receives the compressed build output automatically.

## Compress source assets for Git

Run the explicit source-asset workflow when you want smaller tracked raster assets:

```bash
cd Site
npm ci
npm run compress:assets
```

The command performs two builds:

1. It compresses supported source raster files under `Vault/Assets/`.
2. It rebuilds from those compressed files so `Site/public/assets/` and the final `dist/` output are synchronized.

The source pass is deliberately conservative:

- compressed losslessly: AVIF, GIF, PNG, TIFF and WebP;
- not rewritten: JPEG/JPG, because repeated JPEG encoding can degrade artwork;
- not rewritten: source SVG files, because optimization can alter IDs, masks or authored metadata;
- generated `dist/` files still receive the integration's normal CSS, HTML, JavaScript, JSON, image and SVG compression.

PlayForm Compress only writes a result when it is smaller than the original. Even so, inspect visual assets and review Git changes before committing.

```bash
git diff --stat
git status --short -- Vault/Assets Site/public/assets
```

Then commit and push the reviewed changes through the normal repository workflow.

## Notes

- Run the command from `Site/`, or use `npm --prefix Site run compress:assets` from the repository root.
- Do not manually compress files in `Site/src/content/docs/`; that directory is generated from the vault.
- A normal `npm run dev` does not mutate source assets.
- Source compression is opt-in and is enabled internally only while `compress:assets` performs its first build.
