import {
  NotificationRequest,
  nova,
  Process,
  TextEditor,
  Transferrable,
  Workspace,
  wrapCommand,
} from "../nova_utils.ts";
import TestsDataProvider, {
  UnexpectedLogError,
} from "../tests/TestsDataProvider.ts";

export function registerLearnMore() {
  return nova.commands.register(
    "co.gwil.deno.sidebars.tests.commands.learn",
    wrapCommand(learnMore),
  );

  function learnMore() {
    const options = {
      args: ["https://deno.land/manual/testing#running-tests"],
    };
    const process = new Process("/usr/bin/open", options);
    process.start();
  }
}

export function registerRefresh(testsDataProvider: TestsDataProvider) {
  return nova.commands.register(
    "co.gwil.deno.sidebars.tests.commands.refresh",
    wrapCommand(refresh),
  );

  function refresh() {
    if (nova.workspace.path) {
      testsDataProvider.updateFiles(nova.workspace.path);
      testsDataProvider.treeView.reload();
    } else {
      const informativeNotificationRequest = new NotificationRequest(
        "co.gwil.deno.notifications.missingWorkspacePathForTests",
      );
      informativeNotificationRequest.title =
        "The tests sidebar is unavailable.";
      informativeNotificationRequest.body =
        "Open a project in which to look for tests.";
      nova.notifications.add(informativeNotificationRequest);
    }
  }
}

export function registerRunAll(testsDataProvider: TestsDataProvider) {
  return nova.commands.register(
    "co.gwil.deno.sidebars.tests.commands.runAll",
    wrapCommand(runAll),
  );

  async function runAll() {
    try {
      await testsDataProvider.runTests();
      testsDataProvider.treeView.reload();
    } catch (e) {
      if (e instanceof UnexpectedLogError) {
        const dissatisfactoryOutcomeNotificationRequest =
          new NotificationRequest(
            "co.gwil.deno.notifications.fragileTestsSidebar",
          );
        dissatisfactoryOutcomeNotificationRequest.title =
          "The tests' outcomes are unknown.";
        dissatisfactoryOutcomeNotificationRequest.body =
          "This feature is fragile, and relies on the extension's compatibility with your particular Deno version. If you're using an outdated version of Deno, or an outdated version of the extension, try updating.";
        dissatisfactoryOutcomeNotificationRequest.actions = ["OK"];
        nova.notifications.add(dissatisfactoryOutcomeNotificationRequest);
      } else {
        // shown as a Nova message regardless; doesn't produce a crash
        throw e;
      }
    }
  }
}

export function registerRun(testsDataProvider: TestsDataProvider) {
  return nova.commands.register(
    "co.gwil.deno.sidebars.tests.commands.run",
    wrapCommand(run),
  );

  function run() {
    testsDataProvider.runTests();
  }
}

// This wrapper is used by the sidebar to enable test files to be opened by double-clicking.
export function registerOpen(testsDataProvider: TestsDataProvider) {
  return nova.commands.register(
    "co.gwil.deno.sidebars.tests.commands.open",
    wrapCommand(open),
  );

  function open() {
    const selected = testsDataProvider.treeView.selection[0];
    if (selected?.path) {
      nova.workspace.openFile(selected.path);
    }
  }
}
