# Future Writing Tooling

These are deliberately **deferred**. Do not build them merely because they are listed here. Revisit them only after real drafting exposes a concrete need.

## 5. Continue Writing

Potential Home quick action that opens the most appropriate current scene in the active StoryLine project.

Questions to answer from real use before implementation:

- Should "continue" mean most recently edited scene, StoryLine's current scene, or next scene by sequence?
- Should it respect scene status such as draft/revision?
- How should it behave when StoryLine has no active project?

Do not guess this workflow in advance.

## 6. Manuscript compilation / export

Potential command that compiles ordered StoryLine scenes into a clean manuscript output such as Markdown and DOCX while omitting planning metadata.

Defer until the manuscript establishes real conventions for:

- chapters versus scenes;
- scene separators;
- front matter / back matter;
- excluded scene statuses;
- project/series ordering;
- editorial export format.

StoryLine Markdown remains the source of truth; generated manuscripts should be disposable outputs.

## 7. Story-to-canon handoff

Potential **manual review assistant**, never automatic canon promotion.

A future tool might help identify setting facts introduced in a manuscript that are worth formalising in `Lore/`, but it must preserve the boundary:

> Something appearing in a story does not automatically make it canonical database material.

Any handoff should require deliberate author review and should never rewrite Lore silently.

## 8. Optional writing analytics and planning surfaces

Potential derived views only after real writing proves them useful, for example:

- manuscript word-count summaries;
- character relationship views;
- scene/beat visualisation;
- revision-status views;
- project-level writing statistics.

Avoid progress percentages, streaks, automatically generated tasks, or dashboards that turn optional planning metadata into work debt.

## Explicitly still deferred

Do not pre-emptively build a second plot database beside StoryLine, automatic task generation from blank fields, AI-generated prose pipelines inside Obsidian, or Git workflow buttons on Home.

The rule for every future addition is:

> Build it because drafting repeatedly creates friction, not because the tooling is possible.
