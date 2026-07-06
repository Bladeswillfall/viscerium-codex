# Repository Guidelines

## Project Structure & Module Organization

This repository has two main areas:

- `Vault/` is the Obsidian vault. Publishable source notes live in `Vault/Lore/`; drafts, private notes, and templates stay outside that folder.
- `Site/` is the Astro + Starlight site. Generated docs are written to `Site/src/content/docs/`; styles live in `Site/src/styles/`, static files in `Site/public/`, and sync logic in `Site/scripts/`.

Treat `Vault/Lore/` as the source of truth. The site publishes only notes with `publish: true` and `status: canon`.

## Build, Test, and Development Commands

Run site commands from `Site/`:

- `npm install` installs Astro, Starlight, and sync-script dependencies.
- `npm run sync` regenerates docs from canon vault notes.
- `npm run dev` syncs notes and starts the Astro development server.
- `npm run build` syncs notes and builds the production site.
- `npm test` runs the build validation.
- `npm run preview` previews the built site locally.

Use `npm test` or `npm run build` as the primary validation command.

## Coding Style & Naming Conventions

JavaScript and config files in `Site/` use ES modules, two-space indentation, semicolons, and single quotes. Shared template defaults belong in `Site/site.config.mjs`.

Markdown lore files should use clear title-style names, for example `Vault/Lore/Factions/Example Faction.md`. Public notes must include `title`, `description`, `publish: true`, and `status: canon` frontmatter. Optional schema fields include `slug`, `type`, `era`, and `faction`.

## Testing Guidelines

For content changes, run `npm run sync` and inspect `Site/src/content/docs/`. For site or script changes, run `npm run build` and fix any Astro, schema, or frontmatter errors before submitting.

## Commit & Pull Request Guidelines

Recent history uses short descriptive commits such as `checkpoint before Codex setup` and `vault backup: YYYY-MM-DD HH:MM:SS`. Keep commits focused and mention the affected area when useful.

Pull requests should include a concise summary, validation steps, and screenshots for visible site changes. Link related issues or tasks when available, and call out generated content changes from the sync step.
