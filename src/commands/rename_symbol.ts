import { lsp } from "../../deps.ts";
import {
  applyWorkspaceEdit,
  isWorkspace,
  rangeToLspRange,
  wrapCommand,
} from "../nova_utils.ts";

// @Panic: this is totally decoupled from typescript, so it could totally be native to Nova

export default function registerRename(client: LanguageClient) {
  return nova.commands.register(
    "co.gwil.deno.commands.rename",
    wrapCommand(rename),
  );

  async function rename(workspaceOrEditor: Workspace | TextEditor) {
    // Select full word. It will be shown in a palette so the user can review it

    const editor = isWorkspace(workspaceOrEditor)
      ? workspaceOrEditor.activeTextEditor
      : workspaceOrEditor;

    editor.selectWordsContainingCursors();

    const selectedRange = editor.selectedRange;
    const selectedPosition = rangeToLspRange(
      editor.document,
      selectedRange,
    )?.start;
    if (!selectedPosition) {
      nova.workspace.showErrorMessage(
        "Couldn't figure out what you've selected.",
      );
      return;
    }

    const newName = await new Promise<string | null>((resolve) => {
      nova.workspace.showInputPalette(
        "Type a new name for this symbol.",
        { placeholder: editor.selectedText, value: editor.selectedText },
        resolve,
      );
    });
    if (!newName || newName == editor.selectedText) {
      return;
    }

    const params = {
      textDocument: { uri: editor.document.uri },
      position: selectedPosition,
      newName,
    };
    const response = (await client.sendRequest(
      "textDocument/rename",
      params,
    )) as lsp.WorkspaceEdit | null;
    if (response == null) {
      nova.workspace.showWarningMessage("Couldn't rename symbol.");
      return;
    }

    await applyWorkspaceEdit(response);

    // go back to original document
    await nova.workspace.openFile(editor.document.uri);
    editor.scrollToCursorPosition();
  }
}
