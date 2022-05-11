import { NotificationRequest, nova, wrapCommand } from "../nova_utils.ts";

export default function registerFindSymbol() {
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
