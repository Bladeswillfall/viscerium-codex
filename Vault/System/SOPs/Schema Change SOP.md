# Schema Change SOP

Use this SOP before adding a shared property, expanding a template, or adding another column to an Obsidian Base.

## Objective

Keep the creator system small, comprehensible and cheap to maintain.

## Property admission test

A proposed property should pass all of the following:

1. **Decision test** — it helps place, distinguish, use, compare or review the subject.
2. **Recurrence test** — the question applies usefully to several entries, not only one exceptional subject.
3. **Structure test** — filtering, grouping, sorting or public generation benefits from structured data. If not, prose may be better.
4. **Non-duplication test** — the same fact is not already captured more clearly elsewhere.
5. **Maintenance test** — stale values would be detectable and worth correcting.

Reject or defer the property if it fails any test.

## Three-entry trial

Before adding a field to a shared template:

1. Test it against three real entries of different importance or form.
2. Write the values that would actually be stored.
3. Confirm that the field improves a Base view, Storyteller output or a recurring authoring decision.

Do not expand a schema using hypothetical examples alone.

## Field budget

Treat the visible size of a new note as a limited budget.

- Keep the initial common core to roughly five to eight useful properties.
- Put specialist questions behind optional Templater modules.
- Prefer one concise summary property over several narrow properties until filtering or generation proves the split necessary.
- Allow complex subjects such as Myrkild constructs to carry more structure than ordinary background entities.

The budget is a pressure against bloat, not a rigid numerical rule.

## Template synchronization

`Templates/_Internals/Story Entity Core.md` and [[Add Storyteller Fields]] deliberately describe the same optional field families from two different workflows: initial creation and later development.

[[New Story Entity]] is only the creator-facing routing wrapper. It should not become a second copy of the schema.

When an optional property is added, renamed or removed:

1. update the internal Story Entity Core and `Add Storyteller Fields` in the same change, unless the field is explicitly creation-only or injection-only;
2. update the relevant Base table when the field needs comparison or bulk editing;
3. update [[Story Entities.base]] only when the property belongs in the cross-entity navigation surface;
4. keep the creator card view compact — a field does not belong on a card merely because it exists in the schema;
5. update `New Story Entity` only when routing, folder inference or workflow behaviour changes;
6. update Vault Doctor when the change introduces or alters an objective structural invariant worth checking;
7. update the Storyteller View SOP only when the public interpretation changes;
8. update [[Creator Command Reference]] when a creator-facing command or terminal script changes.

A schema change is incomplete if one workflow can create a property that the other workflow no longer understands.

## Naming rules

- Use plain, reusable names such as `signs_of_presence` or `human_relevance`.
- Avoid rules-system language such as armour class, hit points or damage dice in shared canon properties.
- Use a type-specific name where a generic name would obscure meaning.
- Do not create synonyms for an existing property.
- Keep property values fiction-first and understandable without consulting a game system.

## Empty, false and absent

These states are different:

- **Property absent:** not established or not currently useful.
- **Blank or null:** reserved property awaiting a known value; use sparingly.
- **False or none:** a deliberate canonical statement that the feature does not apply.

Do not use `false` merely to clear a perceived checklist.

## Migration check

Before changing or renaming an existing shared property:

1. Search the vault for current usage.
2. Check templates, Bases, Dataview scripts, Vault Doctor and site code.
3. Decide whether old notes need migration or compatibility support.
4. Update the relevant guide and SOP if creator behaviour changes.
5. Test at least one existing note and one newly created note.
6. Run `cd Site && npm run doctor:vault` and address structural errors before merging.

## Removal rule

Remove a property from a template or Base when it repeatedly remains empty, duplicates prose, produces no useful filtering or generation, or causes creators to invent low-value facts merely to fill it.

Deleting bad structure is maintenance, not loss of worldbuilding.
