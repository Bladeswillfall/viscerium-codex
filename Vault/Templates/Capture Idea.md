<%*
const captured = await tp.system.prompt(
  "Capture the thought. Keep it rough; this is an inbox, not a worldbuilding form.",
  "",
  true,
);

if (!captured || !captured.trim()) {
  tR += "%% Capture cancelled. Delete this temporary note if it remains open. %%";
  return;
}

const inboxFolder = "Drafts/Inbox";
if (!tp.app.vault.getAbstractFileByPath(inboxFolder)) {
  await tp.app.vault.createFolder(inboxFolder);
}

const compact = captured
  .trim()
  .replace(/\s+/g, " ")
  .replace(/[^\p{L}\p{N}\s-]/gu, "")
  .trim()
  .slice(0, 52)
  .replace(/\s+/g, " ") || "Captured idea";
const stamp = tp.date.now("YYYY-MM-DD HHmmss");
const created = tp.date.now("YYYY-MM-DDTHH:mm:ss");
await tp.file.move(`${inboxFolder}/${stamp} - ${compact}`);

tR += `---\ntype: creator-capture\nstatus: inbox\ncreated: ${JSON.stringify(created)}\n---\n\n${captured.trim()}\n`;
%>
