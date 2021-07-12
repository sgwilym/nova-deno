import { lsp } from "../../deps.ts";
import { wrapCommand } from "../nova_utils.ts";
import applyLSPEdits from "../apply_lsp_edits.ts";

export default function registerFormatDocument(client: LanguageClient) {
  return nova.commands.register(
    "co.gwil.deno.commands.formatDocument",
    wrapCommand(formatDocument),
  );

  async function formatDocument(
    workspace: Workspace,
  ) {
    const editor: TextEditor = workspace.activeTextEditor;

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

    applyLSPEdits(editor, changes);
  }
}
