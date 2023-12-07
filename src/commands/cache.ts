import { isWorkspace, wrapCommand } from "nova-utils";

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
      uri: editor!.document.uri,
    };

    await client.sendRequest("deno/cache", {
      referrer,
      uris: [],
    });
  }
}
