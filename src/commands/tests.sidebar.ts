import {
  FileTextMode,
  NotificationRequest,
  nova,
  Process,
  wrapCommand,
} from "../nova_utils.ts";
import TestsDataProvider, {
  TestFile,
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
    const hiddenWorkspaceDataPath = nova.path.join(
      nova.extension.workspaceStoragePath,
      "state.json",
    );

    function readState(path: string): Record<string, unknown> {
      try {
        const file = nova.fs.open(path) as FileTextMode;
        const content = file.readlines().join("\n");
        file.close();

        return JSON.parse(content);
      } catch {
        return {};
      }
    }
    function writeState(path: string, content: Record<string, unknown>) {
      let file;
      try {
        file = nova.fs.open(path, "w") as FileTextMode;
      } catch {
        try {
          nova.fs.mkdir(nova.extension.workspaceStoragePath);
        } catch (e) {
          throw new Error(
            "Could not access the extension's workspace storage path.",
            { cause: e },
          );
        }
        file = nova.fs.open(path, "w") as FileTextMode;
      }
      file.write(JSON.stringify(content));
    }

    const state = readState(hiddenWorkspaceDataPath);
    if (!state.warningWasShown) {
      const permissionsNotificationRequest = new NotificationRequest(
        "co.gwil.deno.notifications.findSymbolUnavailable",
      );
      permissionsNotificationRequest.title =
        "Tests are awarded all permissions.";
      permissionsNotificationRequest.body =
        "Test files may access environment variables, load dynamic libraries, measure time in high resolution, utilize the network, read files and write files. This is not configurable at the moment.";
      permissionsNotificationRequest.actions = ["Cancel", "Allow"];

      const response = await nova.notifications.add(
        permissionsNotificationRequest,
      );
      if (response.actionIdx == 0) {
        return;
      }

      state.warningWasShown = true;
      writeState(hiddenWorkspaceDataPath, state);
    }

    const timeoutID = setTimeout(() => {
      const stillRunningNotificationRequest = new NotificationRequest(
        "co.gwil.deno.notifications.runningTests",
      );
      stillRunningNotificationRequest.title = "The tests are still being run.";
      stillRunningNotificationRequest.body =
        "It's just taking a while. Please wait.";
      nova.notifications.add(stillRunningNotificationRequest);
    }, 3 * 1000);

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
    } finally {
      clearTimeout(timeoutID);
    }
  }
}

export function registerRun(testsDataProvider: TestsDataProvider) {
  return nova.commands.register(
    "co.gwil.deno.sidebars.tests.commands.run",
    wrapCommand(run),
  );

  async function run() {
    // This command is only available when `TestFile`s, exclusively, are selected.
    const selected = testsDataProvider.treeView.selection as TestFile[];
    await testsDataProvider.runTests(selected.map((file) => file.path));
    testsDataProvider.treeView.reload();
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
