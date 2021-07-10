var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// nova-deno.ts
__export(exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
var client = null;
var compositeDisposable = new CompositeDisposable();
function activate() {
  client = new LanguageClient("co.gwil.deno", "Deno Language Server", {
    type: "stdio",
    path: "/usr/bin/env",
    args: ["deno", "lsp"]
  }, {
    syntaxes: ["typescript", "tsx"]
  });
  try {
    let disposed = false;
    compositeDisposable.add(client?.onDidStop((err) => {
      if (disposed && !err) {
        return;
      }
    }));
    compositeDisposable.add({
      dispose() {
        disposed = true;
      }
    });
    client.start();
    nova.subscriptions.add(compositeDisposable);
  } catch (err) {
    if (nova.inDevMode()) {
      console.error(err);
    }
  }
}
function deactivate() {
  compositeDisposable.dispose();
}
