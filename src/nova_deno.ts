/// <reference path="./nova_editor.d.ts" />

import registerFormatDocument from "./commands/format_document.ts";
import registerCache from "./commands/cache.ts";
import registerRenameSymbol from "./commands/rename_symbol.ts";

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
      args: ["deno", "lsp"],
    },
    {
      syntaxes,
      initializationOptions: {
        enable: true,
        lint: true,
        suggest: {
          names: true,
          paths: true,
          autoImports: true,
          completeFunctionCalls: true,
          imports: {
            autoDiscover: true,
          },
        },
        codeLens: {
          implementations: true,
          references: true,
          referencesAllFunctions: true,
        },
      },
    },
  );

  try {
    let disposed = false;

    compositeDisposable.add(registerFormatDocument(client));
    compositeDisposable.add(registerCache(client));
    compositeDisposable.add(registerRenameSymbol(client));

    nova.workspace.onDidAddTextEditor((editor) => {
      const editorDisposable = new CompositeDisposable();

      compositeDisposable.add(editorDisposable);
      compositeDisposable.add(
        editor.onDidDestroy(() => editorDisposable.dispose()),
      );

      // TODO: Only do this if syntaxes are good.
      /*
      nova.commands.invoke(
        "co.gwil.deno.commands.cache",
      );
      */

      // Caching deps

      editorDisposable.add(
        editor.document.onDidChangeSyntax(refreshDidStopChangingListener),
      );

      let didStopChangingListener = setupOnDidStopChangingListener();
      compositeDisposable.add({
        dispose() {
          didStopChangingListener?.dispose();
        },
      });

      function refreshDidStopChangingListener() {
        didStopChangingListener?.dispose();
        didStopChangingListener = setupOnDidStopChangingListener();
      }

      function setupOnDidStopChangingListener() {
        if (
          !(syntaxes as Array<string | null>).includes(editor.document.syntax)
        ) {
          return;
        }

        return editor.onDidStopChanging(async () => {
          await nova.commands.invoke(
            "co.gwil.deno.commands.cache",
          );
        });
      }

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
          await nova.commands.invoke(
            "co.gwil.deno.commands.formatDocument",
          );
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
