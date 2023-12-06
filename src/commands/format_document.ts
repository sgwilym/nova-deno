import { lsp } from "../../deps.ts";
import { applyLSPEdits, isWorkspace, wrapCommand } from "../nova_utils.ts";

export default function registerFormatDocument(client: LanguageClient) {
  return nova.commands.register(
    "co.gwil.deno.commands.formatDocument",
    wrapCommand(formatDocument),
  );

  async function formatDocument(
    workspace: Workspace | TextEditor,
  ) {
    const editor: TextEditor = isWorkspace(workspace)
      ? workspace.activeTextEditor
      : workspace;

    const documentFormatting = {
      textDocument: { uri: editor.document.uri },
      options: {
        // TODO: coerce editor.softTabs to number as it is returning 1, should be boolean
        insertSpaces: editor.softTabs as unknown as number === 1,
        tabSize: editor.tabLength,
      },
    };

    const changes = (await client.sendRequest(
      "textDocument/formatting",
      documentFormatting,
    )) as null | Array<lsp.TextEdit>;

    if (!changes) {
      return;
    }

    await applyLSPEdits(editor, changes);
  }
}
