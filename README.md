# Obsidian Starlight Codex Template

This repository is a starter template for publishing selected Obsidian lore notes as an Astro/Starlight documentation site.

## Layout

- `Vault/` is the Obsidian vault.
- `Vault/Lore/` contains source notes eligible for publishing.
- `Vault/Drafts/`, `Vault/Private/`, and `Vault/Templates/` are not published.
- `Site/` contains the Astro/Starlight app.
- `Site/src/content/docs/` is generated from canon public notes.

## Workflow

1. Write notes in `Vault/Lore/`.
2. Add required frontmatter to notes that should publish:

   ```yaml
   title: Example Page
   description: "A short page summary."
   publish: true
   status: canon
   ```

3. From `Site/`, run `npm run sync` to regenerate Starlight docs.
4. Run `npm run build` before committing changes.

## Note Templates

Starter templates live in `Vault/Templates/`:

- `Character.md`
- `Faction.md`
- `Location.md`
- `Event.md`

Templates default to `publish: false` and `status: draft`. Change both fields only when a copied note is ready for the public site.

## Site Commands

Run these from `Site/`:

- `npm install` installs dependencies.
- `npm run sync` copies public canon notes into Starlight.
- `npm run dev` syncs notes and starts local development.
- `npm run build` syncs notes and builds production output.
- `npm test` runs the build validation.

## Reusing The Template

Update `Site/site.config.mjs` or set environment variables for the site title, description, production URL, and lore source path. Keep project-specific lore in a generated repository and keep this template focused on the publishing pipeline.
