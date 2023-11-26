import {
  LanguageClient,
  NotificationRequest,
  nova,
  wrapCommand,
} from "../nova_utils.ts";
import SymbolDataProvider from "../find_symbol/SymbolDataProvider.ts";
import { lsp } from "../../deps.ts";

export function registerPaletteFindSymbol() {
  return nova.commands.register(
    "co.gwil.deno.commands.find",
    wrapCommand(maybeFindSymbol),
  );

  async function maybeFindSymbol() {
    try {
      await nova.commands.invoke("co.gwil.deno.sidebars.symbols.commands.find");
    } catch (err) {
      // I don't think this ever happens.
      console.error(err);
    }

    const sidebarReminderNotificationRequest = new NotificationRequest(
      "co.gwil.deno.notifications.checkTheSidebar",
    );
    sidebarReminderNotificationRequest.title =
      "Symbols are shown in the Deno Symbols sidebar.";
    sidebarReminderNotificationRequest.body =
      "To see your search's results, check the Deno Symbols sidebar.";
    nova.notifications.add(sidebarReminderNotificationRequest);
  }
}

export function registerSidebarFindSymbol(
  client: LanguageClient,
  symbolDataProvider: SymbolDataProvider,
) {
  return nova.commands.register(
    "co.gwil.deno.sidebars.symbols.commands.find",
    wrapCommand(findSymbol),
  );

  async function findSymbol() {
    if (
      // @ts-expect-error: The Nova types are outdated.
      !(nova.workspace.context as Configuration).get("shouldDisplayFeatures")
    ) {
      const failureNotificationReq = new NotificationRequest(
        "co.gwil.deno.notifications.findSymbolUnavailable",
      );
      failureNotificationReq.title = "Find Symbol is unavailable.";
      failureNotificationReq.body =
        "Open a TypeScript, JavaScript, JSX or TSX file.";
      nova.notifications.add(failureNotificationReq);
      return;
    }

    const query = await new Promise((resolve) =>
      nova.workspace.showInputPalette(
        "Type the name of a variable, class or function.",
        {},
        resolve,
      )
    ) as string | null | undefined;

    // This happens if the user exits the palette, for example, by pressing Escape.
    if (!query) return;

    symbolDataProvider.displaySymbols(query, getSymbols);

    async function getSymbols(query: string) {
      const params = { query };
      const response = await client.sendRequest(
        "workspace/symbol",
        params,
      ) as lsp.SymbolInformation[] | null;
      return response;
    }
  }
}
