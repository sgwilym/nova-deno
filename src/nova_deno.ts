import { CompositeDisposable, nova } from "./nova_utils.ts";
import { registerBundleTask, registerRunTask } from "./tasks.ts";
import { makeClientDisposable } from "./client_disposable.ts";

const compositeDisposable = new CompositeDisposable();

export function activate() {
<<<<<<< ours
  client = new LanguageClient(
    "co.gwil.deno",
    "Deno Language Server",
    {
      type: "stdio",
      path: "/usr/bin/env",
      //args: ["bash", "-c", `tee "${inLog}" | deno lsp | tee "${outLog}"`],
      args: ["deno", "lsp", "--quiet"],
    },
    {
      syntaxes,
      initializationOptions: {
        enable: getOverridableBoolean("co.gwil.deno.config.enableLsp"),
        lint: getOverridableBoolean("co.gwil.deno.config.enableLinting"),
        unstable: getOverridableBoolean("co.gwil.deno.config.enableUnstable"),
        importMap: nova.workspace.config.get("co.gwil.deno.config.import-map"),
        suggest: {
          names: true,
          paths: true,
          autoImports: true,
          completeFunctionCalls: true,
        },
      },
    },
  );

  try {
    let disposed = false;

    compositeDisposable.add(registerRunTask());
    compositeDisposable.add(registerBundleTask());

    compositeDisposable.add(registerFormatDocument(client));
    compositeDisposable.add(registerCache(client));
    compositeDisposable.add(registerRenameSymbol(client));

    nova.workspace.onDidAddTextEditor((editor) => {
      const editorDisposable = new CompositeDisposable();

      compositeDisposable.add(editorDisposable);
      compositeDisposable.add(
        editor.onDidDestroy(() => editorDisposable.dispose()),
      );

      // Formatting

      editorDisposable.add(
        editor.document.onDidChangeSyntax(refreshOnSaveListener),
      );

      editorDisposable.add(
        nova.workspace.config.onDidChange(
          formatOnSaveKey,
          refreshOnSaveListener,
        ),
      );
      editorDisposable.add(
        nova.config.onDidChange(formatOnSaveKey, refreshOnSaveListener),
      );
      editorDisposable.add(
        nova.workspace.config.onDidChange(
          formatOnSaveKey,
          refreshOnSaveListener,
        ),
      );

      let willSaveListener = setupOnSaveListener();
      compositeDisposable.add({
        dispose() {
          willSaveListener?.dispose();
        },
      });

      function refreshOnSaveListener() {
        willSaveListener?.dispose();
        willSaveListener = setupOnSaveListener();
      }

      function setupOnSaveListener() {
        if (
          !(syntaxes as Array<string | null>).includes(editor.document.syntax)
        ) {
          return;
        }

        return editor.onWillSave(async () => {
          if (
            getOverridableBoolean("co.gwil.deno.config.formatOnSave") === false
          ) {
            return;
          }

          await nova.commands.invoke("co.gwil.deno.commands.formatDocument");
        });
      }
=======
  function restartOnConfigChange(key: string) {
    return nova.config.onDidChange(key, () => {
      nova.commands.invoke("co.gwil.deno.commands.restartServer");
>>>>>>> theirs
    });
  }

  const clientDisposable = makeClientDisposable(compositeDisposable);

  compositeDisposable.add(clientDisposable);

  compositeDisposable.add(registerRunTask());
  compositeDisposable.add(registerBundleTask());

  compositeDisposable.add(
    restartOnConfigChange("co.gwil.deno.config.trustedImportHosts"),
  );

  compositeDisposable.add(
    restartOnConfigChange("co.gwil.deno.config.untrustedImportHosts"),
  );

  nova.subscriptions.add(compositeDisposable);
}

export function deactivate() {
  compositeDisposable.dispose();
}
