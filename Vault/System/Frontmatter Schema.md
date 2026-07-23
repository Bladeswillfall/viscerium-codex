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

## Location properties

`location_kind` is a deliberately broad semantic classification for `type: location` notes. Supported values are `region`, `settlement`, `wilderness`, `route` and `site`.

It does **not** replace Atlas `map.marker`. A fortress-city can be a `settlement` in canon while using a more specific fortification-style marker on a map.

Optional location field families are injected progressively through [[Templates/Lore/Add Location Fields|Add Location Fields]]:

- settlement — `settlement_scale`, `population_band`, `governance_summary`, `economic_role`, `local_services`, `defences`;
- wilderness — `terrain_summary`, `climate_summary`, `natural_resources`, `wilderness_travel`, `environmental_hazards`;
- site — `site_origin`, `site_condition`, `current_use`, `access_conditions`, `notable_features`;
- route — `route_connections`, `normal_traffic`, `route_conditions`, `seasonal_changes`, `route_dangers`.

These fields record world facts. They remain optional and should not be populated merely because a location belongs to one of the broad kinds.

## Storyteller properties

Storyteller properties are concise creator data intended to support future story-facing presentation. They do not replace Lore prose.

Locations may use fields such as `approach_signs`, `first_impression`, `sensory_signature`, `why_people_come`, `ordinary_activity`, `outsider_knowledge`, `local_knowledge`, `local_tension` and `story_complication`.

Factions may use fields such as `recognisable_presence`, `encounter_context`, `public_reputation`, `current_wants`, `current_pressures`, `preferred_methods`, `resources_and_reach`, `operational_limits`, `internal_tensions` and `story_complication`.

See [[Storyteller View SOP]] for the admission test and public interpretation rules.

## Creator maturity

`development_level: stub` means an intentionally incomplete creator record. It is not a publication state. Generated relationship stubs belong under `Drafts/Inbox/` until developed and deliberately promoted.

Specialist databases may retain provenance/import fields when those fields answer a real workflow question. For example, Myrkild `source_*` fields remain distinct from public metadata.

## Artwork provenance

`artist` identifies the maker where known. `credit` is the display/rights-holder credit and may differ from the artist. `source`, `sourceUrl`, `license`, `rights`, and `usage` remain provenance/permission fields rather than synonyms.
