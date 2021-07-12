import { wrapCommand } from "../nova_utils.ts";

export default function cache(client: LanguageClient) {
  return nova.commands.register(
    "co.gwil.deno.commands.cache",
    wrapCommand(cache),
  );

  async function cache(
    workspace: Workspace,
  ) {
    const referrer = {
      uri: workspace.activeTextEditor.document.uri,
    };

    await client.sendRequest("deno/cache", {
      referrer,
      uris: [],
    });
  }
}
