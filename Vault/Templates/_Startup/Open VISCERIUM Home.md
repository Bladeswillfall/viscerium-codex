<%*
const openHome = async () => {
  const home = tp.app.vault.getAbstractFileByPath("Home.md");
  if (!home || home.extension !== "md") return;

  const leaves = tp.app.workspace.getLeavesOfType("markdown");
  const existing = leaves.find((leaf) => leaf.view?.file?.path === home.path);
  const leaf = existing ?? tp.app.workspace.getLeaf(false);

  await leaf.setViewState({
    type: "markdown",
    state: {
      file: home.path,
      mode: "preview",
      source: false,
    },
  });
  tp.app.workspace.setActiveLeaf(leaf, { focus: true });
};

tp.app.workspace.onLayoutReady(openHome);
%>
