/// <reference path="./nova-editor.d.ts" />

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
      syntaxes: ["typescript", "tsx"],
      initializationOptions: {
        enable: true,
        lint: true
      }
    }
  );

  try {

    
    
    let disposed = false;

    compositeDisposable.add(
      client?.onDidStop((err) => {
        if (disposed && !err) {
          return;
        }
      })
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
  compositeDisposable.dispose()
}
