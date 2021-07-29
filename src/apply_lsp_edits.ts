import { lsp } from '../deps.ts'
import { lspRangeToRange } from "./lsp_nova_conversions.ts";

export default function applyLSPEdits(
  editor: TextEditor,
  edits: Array<lsp.TextEdit>
) {
  editor.edit((textEditorEdit) => {
    for (const change of edits.reverse()) {
      const range = lspRangeToRange(editor.document, change.range);
      textEditorEdit.replace(range, change.newText);
    }
  });
}