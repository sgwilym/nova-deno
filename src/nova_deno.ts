/// <reference path="./nova_editor.d.ts" />

import registerFormatDocument from "./commands/format_document.ts";

const syntaxes = ["typescript", "tsx"];

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

    nova.workspace.onDidAddTextEditor((editor) => {
      const editorDisposable = new CompositeDisposable();
      compositeDisposable.add(editorDisposable);
      compositeDisposable.add(
        editor.onDidDestroy(() => editorDisposable.dispose()),
      );

      // watch things that might change if this needs to happen or not
      editorDisposable.add(editor.document.onDidChangeSyntax(refreshListener));

      editorDisposable.add(
        nova.workspace.config.onDidChange(
          formatOnSaveKey,
          refreshListener,
        ),
      );
      editorDisposable.add(
        nova.config.onDidChange(formatOnSaveKey, refreshListener),
      );
      editorDisposable.add(
        nova.workspace.config.onDidChange(formatOnSaveKey, refreshListener),
      );

      let willSaveListener = setupListener();
      compositeDisposable.add({
        dispose() {
          willSaveListener?.dispose();
        },
      });

      function refreshListener() {
        willSaveListener?.dispose();
        willSaveListener = setupListener();
      }

      function setupListener() {
        if (
          !(syntaxes as Array<string | null>).includes(editor.document.syntax)
        ) {
          return;
        }

        return editor.onWillSave(async (editor) => {
          await nova.commands.invoke(
            "co.gwil.deno.commands.formatDocument",
            editor,
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
