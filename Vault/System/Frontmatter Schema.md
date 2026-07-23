# Frontmatter Schema

VISCERIUM properties have one authoritative meaning. Templates may omit properties that are irrelevant to a subject; absence means the fact is not established or not useful yet.

## Publication

`status` is the publication workflow field. Use `draft`, `review`, `published`, or `archived`. Only notes beneath `Lore/` with `status: published` are public Codex sources. Folder placement remains the second safety boundary.

Do not add a second `publish` boolean. Canon/continuity truth is a separate concept from whether a note is publicly released.

## Relationship fields

- `era` / `eras`: controlled VISCERIUM era identifiers.
- `faction`: references faction entity titles.
- `location` / `locations`: references location entity titles.
- `species`: references species entity titles.
- `participants`: event participant titles, normally characters.
- `related`: deliberately loose cross-entity references.

Use arrays where a field can genuinely hold several values. Do not create self-reference fields merely to repeat the note title; `title` already identifies the entity.

## Creator maturity

`development_level: stub` means an intentionally incomplete creator record. It is not a publication state. Generated relationship stubs belong under `Drafts/Inbox/` until developed and deliberately promoted.

Specialist databases may retain provenance/import fields when those fields answer a real workflow question. For example, Myrkild `source_*` fields remain distinct from public metadata.

## Artwork provenance

`artist` identifies the maker where known. `credit` is the display/rights-holder credit and may differ from the artist. `source`, `sourceUrl`, `license`, `rights`, and `usage` remain provenance/permission fields rather than synonyms.
