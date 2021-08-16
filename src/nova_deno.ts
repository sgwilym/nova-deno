import registerFormatDocument from "./commands/format_document.ts";
import registerCache from "./commands/cache.ts";
import registerRenameSymbol from "./commands/rename_symbol.ts";
import { getOverridableBoolean } from "./preferences.ts";
import { registerBundleTask, registerRunTask } from "./tasks.ts";

export const syntaxes = ["typescript", "tsx", "javascript", "jsx"];

const formatOnSaveKey = "co.gwil.deno.config.formatDocumentOnSave";

let client: LanguageClient | null = null;
const compositeDisposable = new CompositeDisposable();

export function activate() {
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
        config: nova.workspace.config.get("co.gwil.deno.config.tsconfig"),
        importMap: nova.workspace.config.get("co.gwil.deno.config.import-map"),
        suggest: {
          names: true,
          paths: true,
          autoImports: true,
          completeFunctionCalls: true,
        },
        codeLens: {
          test: true,
          implementations: true,
          references: true,
          referencesAllFunctions: true,
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
    });

    compositeDisposable.add(
      client?.onDidStop((err) => {
        if (disposed && !err) {
          return;
        }
      }),
    );

    compositeDisposable.add({
      dispose() {
        disposed = true;
      },
    });

    client.start();

    // Add the client to the subscriptions to be cleaned up
    nova.subscriptions.add(compositeDisposable);
  } catch (err) {
    // If the .start() method throws, it's likely because the path to the language server is invalid

    if (nova.inDevMode()) {
      console.error(err);
    }
  }
}

export function deactivate() {
  compositeDisposable.dispose();
}
