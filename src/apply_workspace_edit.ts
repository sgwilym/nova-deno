import { lsp } from "../deps.ts";
import applyLSPEdits from "./apply_lsp_edits.ts";
import { openFile } from "./nova_utils.ts";

// @Deprecated I want to replace this with a call to Nova's client with workspace/applyEdit, but that's currently not possible.
// I've requested this feature.
export default async function applyWorkspaceEdit(
  workspaceEdit: lsp.WorkspaceEdit,
) {
  for (const change of workspaceEdit.documentChanges || []) {
    if (change.edits.length === 0) {
      continue;
    }

    const editor = await openFile(change.textDocument.uri);

    if (!editor) {
      nova.workspace.showWarningMessage(`Failed to open ${uri}`);
      continue;
    }

    applyLSPEdits(editor, change.edits);
  }
}
