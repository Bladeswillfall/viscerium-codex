# Relationship Authoring SOP

The Codex relationship explorer is generated from explicit `relationships:` frontmatter on published notes. Use it only when the relationship itself matters to navigation, continuity, politics, lineage, command, ownership or story logic.

Ordinary contextual links still belong in prose or `related:`. Do not turn every wikilink into a semantic relationship.

## Simple relationships

Character and faction templates already provide simple relationship lists:

```yaml
relationships:
  allies:
    - "[[Republic of Askalia]]"
  rivals:
    - "[[TCSC]]"
```

Any relationship key is accepted. Use short, stable names and prefer kebab-case for multi-word types:

```yaml
relationships:
  member-of:
    - "[[Aquillan Seas Trade Union]]"
  located-in:
    - "[[Krass Dominion]]"
```

The build turns the key into a reader-facing label automatically.

## Rich relationship entries

When chronology or explanation matters, replace a string with an object:

```yaml
relationships:
  allied-with:
    - target: "[[Republic of Askalia]]"
      since: "412 EC"
      until:
      era: NEARSIGHT
      description: "A defensive compact created after the western border crisis."
      directed: false
```

Supported metadata:

- `target` — required note reference
- `label` — optional display label overriding the generated relationship name
- `since` — optional start date/text
- `until` — optional end date/text
- `era` — optional era context
- `description` or `note` — optional short explanation
- `directed` — optional boolean controlling arrow direction

The compiler also accepts `to`, `ref`, `article` or `title` in place of `target`, but `target` is the house style.

## Directed versus reciprocal relationships

Common hierarchy/location relations such as `member-of`, `located-in`, `capital-of`, `parent-of`, `reports-to` and `owned-by` are treated as directed by default.

Most other relationship types are treated as reciprocal unless `directed: true` is supplied. Reciprocal duplicates are collapsed in the generated graph, so two factions may each record the same alliance without producing two public edges.

The compiler does not write reverse relationships back into notes. If the reverse fact matters to creator navigation, record it explicitly where useful.

## Good uses

Use structured relationships for questions such as:

- Who is this nation allied with or hostile to?
- Which organisation does this person belong to?
- Who commands this formation?
- Which dynasty or parent entity produced this successor?
- Which region contains this settlement?
- Which company owns this subsidiary?
- Which Myrkild strain/construct or Naranor structure descends from another?

## Bad uses

Do not add a relationship merely because two subjects are mentioned together. Keep incidental references in prose or `related:`.

The goal is a useful diplomacy/lineage/organisation graph, not a second version of the generic site graph.

## Breadcrumbs

Breadcrumbs remains useful inside Obsidian for creator navigation and hierarchy work. The public relationship explorer is separate: it reads canonical note properties during the site build and does not depend on Breadcrumbs' plugin database.

## Build behaviour

`npm run dev` and `npm run build` regenerate `Site/src/data/relationships.json`. Unresolved relationship targets are reported as build warnings so spelling mistakes and unpublished targets can be corrected without inventing replacement canon.

Do not hand-edit the generated relationship JSON.
