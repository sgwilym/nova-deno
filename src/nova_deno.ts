import {
  CompositeDisposable,
  Configuration,
  nova,
  TextDocument,
  TextEditor,
} from "./nova_utils.ts";
import {
  configFilenames,
  registerBundleTask,
  registerDenoTasks,
  registerRunTask,
} from "./tasks.ts";
import {
  CanNotEnsureError,
  makeClientDisposable,
} from "./client_disposable.ts";

const compositeDisposable = new CompositeDisposable();
const taskDisposable = new CompositeDisposable();

const configRestartKeys = [
  "co.gwil.deno.config.enableLsp",
  "co.gwil.deno.config.enableLinting",
  "co.gwil.deno.config.enableUnstable",
  "co.gwil.deno.config.trustedImportHosts",
  "co.gwil.deno.config.untrustedImportHosts",
];

const workspaceConfigRestartKeys = [
  "co.gwil.deno.config.enableLsp",
  "co.gwil.deno.config.enableLinting",
  "co.gwil.deno.config.enableUnstable",
  "co.gwil.deno.config.import-map",
];

export async function activate() {
  let clientDisposable;
  try {
    clientDisposable = await makeClientDisposable(compositeDisposable);
  } catch (e) {
    if (e instanceof CanNotEnsureError) {
      // This happens if the user clicks on 'Ignore' after they are requested to install Deno.
      return;
    }
    throw e;
  }
  compositeDisposable.add(clientDisposable);

  compositeDisposable.add(registerDenoTasks());
  compositeDisposable.add(registerRunTask());
  compositeDisposable.add(registerBundleTask());

  compositeDisposable.add(registerEditorWatcher());

  const configFileWatchingDisposables = watchConfigFiles(
    nova.workspace.path,
    configFilenames,
  );

  const configRestartDisposables = restartServerOnConfigChanges(
    configRestartKeys,
  );

  const workspaceRestartDisposables = restartServerOnWorkspaceConfigChanges(
    workspaceConfigRestartKeys,
  );

  [
    ...configFileWatchingDisposables,
    ...configRestartDisposables,
    ...workspaceRestartDisposables,
  ].forEach(
    (disposable) => {
      compositeDisposable.add(disposable);
    },
  );

  nova.subscriptions.add(compositeDisposable);
  nova.subscriptions.add(taskDisposable);
}

export function deactivate() {
  compositeDisposable.dispose();
}

function watchConfigFiles(workspacePath: string | null, filenames: string[]) {
  if (!workspacePath) return [];

  return filenames.map((filename) => {
    const denoConfigPath = nova.path.join(workspacePath, filename);
    return nova.fs.watch(denoConfigPath, () => {
      taskDisposable.dispose();
      taskDisposable.add(registerDenoTasks());
      nova.commands.invoke("co.gwil.deno.commands.restartServer");
    });
  });
}

function restartServerOnConfigChanges(keys: string[]) {
  return keys.map((key) => {
    return nova.config.onDidChange(key, () => {
      nova.commands.invoke("co.gwil.deno.commands.restartServer");
    });
  });
}

function restartServerOnWorkspaceConfigChanges(keys: string[]) {
  return keys.map((key) => {
    return nova.workspace.config.onDidChange(key, () => {
      nova.commands.invoke("co.gwil.deno.commands.restartServer");
    });
  });
}

/**
 * This is used to determine whether certain features, like the "Find Symbol"
 * command, are available.
 */
function registerEditorWatcher() {
  // This callback is called immediately and once. Then, it is called every time the user opens a text editor.
  const disposable = new CompositeDisposable();

  const compatibleSyntaxes = ["typescript", "tsx", "javascript", "jsx"];
  function checkFeatureAvailability(
    documents: readonly TextDocument[],
  ) {
    const syntaxes = documents.map((document) => document.syntax ?? "plain");
    const isCompatible = compatibleSyntaxes.some((syntax) =>
      syntaxes.includes(syntax)
    );

    // @ts-expect-error: The Nova types are outdated. This feature was added in version 5.
    (nova.workspace.context as Configuration).set(
      "shouldDisplayFeatures",
      isCompatible,
    );
  }

  disposable.add(
    nova.workspace.onDidAddTextEditor((editor) => {
      checkFeatureAvailability(nova.workspace.textDocuments);

      disposable.add(editor.document.onDidChangeSyntax(() => {
        checkFeatureAvailability(nova.workspace.textDocuments);
      }));

      disposable.add(editor.onDidDestroy((deletedEditor) => {
        const editors: (TextEditor | null)[] = [...nova.workspace.textEditors];

        // remove one editor whose URI is the same as this editor's
        const index = (editors as TextEditor[]).findIndex((editor) =>
          editor.document.uri == deletedEditor.document.uri
        );
        editors[index] = null;
        const remainingEditors = editors.filter((editor) =>
          editor !== null
        ) as TextEditor[];
        const remainingDocuments = remainingEditors.map((editor) =>
          editor.document
        );

        checkFeatureAvailability(remainingDocuments);
      }));
    }),
  );

  return disposable;
}
