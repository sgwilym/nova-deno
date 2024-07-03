import { applyLSPEdits, isWorkspace, wrapCommand } from "nova-utils";
import * as lsp from "lsp";

export default function registerFormatDocument(client: LanguageClient) {
  return nova.commands.register(
    "co.gwil.deno.commands.formatDocument",
    wrapCommand(formatDocument),
  );

  async function formatDocument(
    workspace: Workspace | TextEditor,
  ) {
    const editor: TextEditor = isWorkspace(workspace)
      ? workspace.activeTextEditor!
      : workspace;

    const documentFormatting = {
      textDocument: { uri: editor.document.uri },
      options: {
        insertSpaces: editor.softTabs,
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
