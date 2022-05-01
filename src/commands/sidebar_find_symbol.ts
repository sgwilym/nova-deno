import { NotificationRequest, nova, wrapCommand } from "../nova_utils.ts";

export default function registerFindSymbol() {
  return nova.commands.register(
    "co.gwil.deno.sidebars.symbols.commands.find",
    wrapCommand(maybeFindSymbol),
  );

  async function maybeFindSymbol() {
    try {
      const syntax = nova.workspace.activeTextEditor.document.syntax ?? "plain";
      if (!["typescript", "tsx", "javascript", "jsx"].includes(syntax)) {
        // Don't invoke the command under conditions in which it would normally not be available.
        throw new Error("Command unavailable.");
      }

      await nova.commands.invoke("co.gwil.deno.commands.find");
    } catch {
      const failureNotificationReq = new NotificationRequest(
        "co.gwil.deno.notifications.findSymbolUnavailable",
      );
      failureNotificationReq.title = "Find Symbol is unavailable.";
      failureNotificationReq.body =
        "Open a TypeScript, JavaScript, JSX or TSX file.";
      nova.notifications.add(failureNotificationReq);
    }
  }
}
