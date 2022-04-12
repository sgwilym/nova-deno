import { CompositeDisposable, nova } from "./nova_utils.ts";
import {
  registerBundleTask,
  registerDenoTasks,
  registerRunTask,
} from "./tasks.ts";
import { makeClientDisposable } from "./client_disposable.ts";

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

export function activate() {
  const workspacePath = nova.workspace.path as string;
  const denoConfigPath = nova.path.join(workspacePath, "deno.json");
  const configWatcher = nova.fs.watch(denoConfigPath, () => {
    taskDisposable.dispose();
    taskDisposable.add(registerDenoTasks());
    nova.commands.invoke("co.gwil.deno.commands.restartServer");
  });
  compositeDisposable.add(configWatcher);

  const clientDisposable = makeClientDisposable(compositeDisposable);

  compositeDisposable.add(clientDisposable);

  compositeDisposable.add(registerDenoTasks());
  compositeDisposable.add(registerRunTask());
  compositeDisposable.add(registerBundleTask());

  const configRestartDisposables = restartServerOnConfigChanges(
    configRestartKeys,
  );

  const workspaceRestartDisposables = restartServerOnWorkspaceConfigChanges(
    workspaceConfigRestartKeys,
  );

  [...configRestartDisposables, ...workspaceRestartDisposables].forEach(
    (disposable) => {
      compositeDisposable.add(disposable);
    },
  );

  nova.subscriptions.add(compositeDisposable);
}

export function deactivate() {
  compositeDisposable.dispose();
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
