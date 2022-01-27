import { CompositeDisposable, nova } from "./nova_utils.ts";
import { registerBundleTask, registerRunTask } from "./tasks.ts";
import { makeClientDisposable } from "./client_disposable.ts";

const compositeDisposable = new CompositeDisposable();

export function activate() {
  function restartOnConfigChange(key: string) {
    return nova.config.onDidChange(key, () => {
      nova.commands.invoke("co.gwil.deno.commands.restartServer");
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
