# Codex compression

The build does not rewrite source assets or run a second minifier over Astro's output.

## Images

The checked-in Obsidian Image Converter settings provide a WebP 75 preset for artwork as it is added to the vault. Use that preset before publishing an image, and keep the original outside the repository when an archival copy is needed.

The sync step copies only referenced vault assets into `Site/public/assets/`. It does not re-encode them, avoiding repeated lossy conversion and a Sharp dependency in the site build.

## Delivery

Astro and Vite produce the static CSS and JavaScript bundles. Cloudflare Pages applies supported transfer compression when serving those files, so committed `.gz` or `.br` copies are unnecessary.

Run the normal production check from `Site/`:

```bash
npm ci
npm run build
```
