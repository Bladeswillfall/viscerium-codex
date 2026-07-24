# Storyteller Editor Test

Use this short checklist while PR development is active. Delete this note before merge if the workflow is accepted.

## Recommended test target

Open the published [[Okse Dominion]] note, because it already has populated faction Storyteller fields.

1. Run **Templater: Insert template** → `Add Storyteller Fields`.
2. Confirm every faction module appears, including modules already fully populated.
3. Confirm each module label shows a populated count such as `3/3 populated`.
4. Select **Agenda** only.
5. Confirm `current_wants`, `current_pressures` and `preferred_methods` appear pre-filled rather than blank.
6. Change one harmless piece of punctuation or wording, submit the other prompts unchanged, and confirm only the changed property is rewritten.
7. Run the workflow again, select a populated free-text field, delete its contents and submit. Confirm that YAML property is removed entirely.
8. Restore the removed value afterwards.
9. For any controlled-choice Storyteller field on a suitable fauna/flora/fungi/item note, confirm a populated field offers **Keep current** and **Clear value**.
10. Cancel a prompt and confirm its current property remains untouched.

The public `storyteller:` object is generated during site build and should never appear as the authoring target in the vault.
