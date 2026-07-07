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

## Community Engagement To-Dos

These are backlog items for turning the published codex into an active community hub. Keep the site as the canonical home; external platforms should distribute updates and route visitors back to the site rather than replacing it.

### Site-first engagement

- [ ] Add a `Start Here` reader path for new visitors, with routes into CITADEL, SMOG, NEARSIGHT, ENTROPY, factions, species, and core concepts.
- [ ] Add a `What's New` or changelog page that lists recently added and recently updated lore pages.
- [ ] Add strong per-page calls to action, such as lore questions, theory prompts, field-report prompts, or faction-specific discussion hooks.
- [ ] Add an `Ask the Archivist` submission route for reader questions that can become future lore articles or FAQ entries.
- [ ] Add a fanwork / field-report submission route with clear expectations for text, art, theories, and non-canon contributions.
- [ ] Add a canon policy page that defines contribution tiers such as `canon`, `semi-canon`, `apocrypha`, `rumour`, `field report`, and `heretical account`.
- [ ] Add a public roadmap or voting page for upcoming lore focus areas.
- [ ] Add simple polls for choosing future articles, faction deep-dives, creature spotlights, or design trials.
- [ ] Add a featured community response / apocrypha showcase section once submissions exist.

### Comments, discussion, and durable replies

- [ ] Configure Giscus on selected lore/devlog pages, backed by GitHub Discussions.
- [ ] Decide which page types should have comments enabled; avoid enabling comments on every page by default if moderation becomes noisy.
- [ ] Configure GitHub Discussions categories for announcements, questions, lore discussion, site feedback, and polls.
- [ ] Investigate Webmentions so posts, replies, and reviews from external personal sites can be surfaced back on relevant codex pages.
- [ ] Add moderation notes for comments, submissions, and community features before opening them publicly.

### Update distribution

- [ ] Keep RSS enabled for all published updates.
- [ ] Add an optional email newsletter or digest for readers who do not use RSS or social platforms.
- [ ] Add Open Graph / social-card generation for lore pages, including title, era, faction/species, short hook, and branded imagery.
- [ ] Add frontmatter fields needed for social cards and syndication, for example `hook`, `image`, `era`, `faction`, `spoiler_level`, and `tags`.
- [ ] Add tone-aware social-post templates that preserve the VISCERIUM voice instead of posting bland automated links.
- [ ] Auto-post new published articles to Bluesky and Mastodon/Fediverse once credentials and deployment secrets are configured.
- [ ] Treat X/Twitter as an optional mirror only; do not make it the primary community surface unless there is already meaningful traction there.

### Discord, later phase

- [ ] Do not launch Discord until there is visible momentum, such as repeat commenters, regular lore questions, fan theories, fan art, or requests for a live community space.
- [ ] Draft a small Discord launch plan before opening the server.
- [ ] Keep initial Discord channels minimal: announcements, start-here, lore-questions, theory-and-speculation, fan-art-and-field-reports, site-feedback, and spoilers.
- [ ] Add onboarding roles only after the server exists, such as reader, writer, artist, wargamer, game dev, and era/faction interests.
- [ ] Avoid creating many faction channels at launch; a tiny community split across too many rooms will look dead.

### Recurring community rituals

- [ ] Plan repeatable prompts such as Weekly Field Report, Faction Friday, Ask the Archivist, Canon or Rumour?, Design Trials, Survivor's Choice, and The Black Ledger.
- [ ] Tie each ritual back to site pages so social and Discord activity creates durable codex improvements rather than disposable chatter.

## Coding Style & Naming Conventions

JavaScript and config files in `Site/` use ES modules, two-space indentation, semicolons, and single quotes. Shared template defaults belong in `Site/site.config.mjs`.

Markdown lore files should use clear title-style names, for example `Vault/Lore/Factions/Example Faction.md`. Public notes must include `title`, `description`, `publish: true`, and `status: canon` frontmatter. Optional schema fields include `slug`, `type`, `era`, and `faction`.

## Testing Guidelines

For content changes, run `npm run sync` and inspect `Site/src/content/docs/`. For site or script changes, run `npm run build` and fix any Astro, schema, or frontmatter errors before submitting.

## Commit & Pull Request Guidelines

Recent history uses short descriptive commits such as `checkpoint before Codex setup` and `vault backup: YYYY-MM-DD HH:MM:SS`. Keep commits focused and mention the affected area when useful.

Pull requests should include a concise summary, validation steps, and screenshots for visible site changes. Link related issues or tasks when available, and call out generated content changes from the sync step.
