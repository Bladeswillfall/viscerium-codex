<%*
const viewTypes = [
  { type: "outline", name: "Outline" },
  { type: "backlink", name: "Backlinks" },
  { type: "localgraph", name: "Local Graph" },
];
for (const view of viewTypes) {
  try {
    let leaf = tp.app.workspace.getLeavesOfType(view.type)[0];
    if (!leaf) {
      leaf = tp.app.workspace.getRightLeaf(true);
      if (leaf) await leaf.setViewState({ type: view.type, active: false });
    }
  } catch (error) {
    console.warn(`Could not open ${view.name} in the creator sidebar.`, error);
  }
}
%>