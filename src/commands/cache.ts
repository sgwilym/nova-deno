import { wrapCommand } from "../nova_utils.ts";
import { isWorkspace } from "../nova_utils.ts";

export default function cache(client: LanguageClient) {
  return nova.commands.register(
    "co.gwil.deno.commands.cache",
    wrapCommand(cache),
  );

  async function cache(
    workspaceOrEditor: Workspace | TextEditor,
  ) {
    const editor = isWorkspace(workspaceOrEditor)
      ? workspaceOrEditor.activeTextEditor
      : workspaceOrEditor;

    const referrer = {
      uri: editor.document.uri,
    };

    await client.sendRequest("deno/cache", {
      referrer,
      uris: [],
    });
  }
}
