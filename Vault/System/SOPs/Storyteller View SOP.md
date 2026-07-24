# Storyteller View SOP

Use this SOP when deciding what structured creator data should become public Storyteller content on the Codex.

## Purpose

The Lore view explains what a subject is in VISCERIUM.

The Storyteller view explains how somebody can use that subject to create a tale, scene, encounter, location or complication.

The Obsidian Base card is not a public view. It is an authoring interface and may remain terse, technical and incomplete.

## Admission test

A field belongs in Storyteller output when it helps a consumer answer at least one of these questions:

- Where and when can this plausibly appear?
- How might characters notice or identify it?
- What does it do when encountered or used?
- Why would people care about it?
- What consequence, choice or problem can it create?
- What established relationship connects it to the wider setting?

If a fact only rewards encyclopaedic completeness, leave it in Lore or omit it.

## Generation rules

1. Treat structured note properties as source data, not polished public prose.
2. Hide absent properties rather than displaying empty headings.
3. Translate internal labels into natural, type-appropriate headings.
4. Combine closely related values where that improves readability.
5. Do not expose creator-only fields such as `development_level`, `review_status`, import sources or internal IDs.
6. Do not infer negative canon from absent properties.
7. Do not fabricate connective prose that changes the meaning of a field.

## Author and edit Storyteller data

Storyteller content is deliberately authored in the canonical note rather than generated from ordinary Lore prose.

1. Open the note you want to develop.
2. Run **Templater: Insert template** → `Add Storyteller Fields`.
3. Select one or more Storyteller modules. The picker shows how many supported fields in each module are currently populated.
4. Existing free-text answers are pre-filled. Edit and submit to replace them.
5. Submit a blank free-text value to remove that property. Cancel that prompt to leave the existing value unchanged.
6. Controlled-choice fields explicitly offer **Keep current** and **Clear value** when a value already exists.

The template name is retained for compatibility with existing Templater references, but the workflow supports both initial population and later editing.

Clearing a field deletes that property rather than writing an empty value. If the final supported Storyteller property is removed, the next site build produces no Storyteller projection and the public Lore / Storyteller switch disappears for that note.

Direct editing in Obsidian Properties/frontmatter remains valid. The guided workflow exists so creators do not need to remember internal property names.

## Public view behaviour

Published notes keep their ordinary Lore article as the default view.

The build projects populated Storyteller properties into generated public metadata. The nested generated `storyteller` object is a site projection and must not be authored manually in vault notes.

- Show the **Lore / Storyteller** switch only when at least one supported Storyteller field is populated.
- Default to **Lore** on page load. Do not surprise readers by replacing the canonical article with the concise view.
- Storyteller mode replaces the article body for that view; it does not create another route or another canonical article.
- Keep the normal article sidebar visible in Storyteller mode; this is another view of the same subject rather than a different page shell.
- Hide the Lore table of contents while Storyteller mode is active because its headings no longer describe the visible panel.
- Do not manufacture a Storyteller tab from ordinary Lore prose. A creator must deliberately establish the source fields first.
- Pages with no Storyteller data must render exactly like ordinary Codex articles.

## Type-appropriate presentation

The same concept may require different public language.

- Fauna may show **Signs of presence**, **Encounter behaviour** and **Why people care**.
- Flora may show **Identification**, **Growth conditions**, **Use** and **Hazards**.
- Fungi may show **Fruiting and spread**, **Exposure risks** and **Practical value**.
- Items may show **Use**, **Limitations**, **Availability** and **Common users**.
- Myrkild units may show **Signs**, **Tactics**, **Counterplay** and **Consequences beyond combat**.
- Locations may show **Approach**, **First impression**, **Why people come**, **Local knowledge** and **Local tensions**.
- Factions may show **Recognisable presence**, **Current agenda**, **Preferred methods**, **Reach and limits** and **Internal tensions**.

Do not force every type through identical headings merely because the underlying site component is shared.

## World facts versus Storyteller facts

Storyteller fields should not become a shadow copy of Lore or location structure.

- A location's `economic_role`, `defences` or `route_conditions` describe the world itself.
- `why_people_come`, `first_impression` or `story_complication` explain how that established world fact becomes useful at the table, on the page or in a scene.
- A faction's formal government, membership and history remain Lore.
- `current_wants`, `preferred_methods`, `operational_limits` and `internal_tensions` are concise present-tense handles for using that faction in a story.

Where one field can be derived safely from existing canon, public Storyteller presentation may combine or summarise rather than demand duplicate authoring.

## Numbers and rules systems

Shared Storyteller output should remain fiction-first and system-agnostic.

Acceptable:

> Dangerous to an isolated armed traveller, but reluctant to confront an organised group.

Avoid in the shared layer:

> Armour Class 16; 42 hit points; Challenge Rating 4.

System-specific adapters may be added later, but they must sit on top of canon rather than define it.

## Lore relationship

Structured Storyteller summaries may overlap with Lore, but they should not become a second competing article.

- Lore may be evocative, historical, cultural and detailed.
- Storyteller content should be concise, actionable and scannable.
- Where the two disagree, resolve the canon rather than preserving both versions.

## Publication threshold

A Storyteller view does not require every supported field. Publish the useful sections that exist and hide the rest.

A short, accurate Storyteller panel is better than a comprehensive one padded with invented detail.
