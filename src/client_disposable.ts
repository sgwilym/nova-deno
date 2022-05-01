import {
  CompositeDisposable,
  getOverridableBoolean,
  LanguageClient,
  NotificationRequest,
  nova,
  wrapCommand,
} from "./nova_utils.ts";
import registerFormatDocument from "./commands/format_document.ts";
import registerCache from "./commands/cache.ts";
import registerRenameSymbol from "./commands/rename_symbol.ts";
import registerFindSymbol from "./commands/find_symbol.ts";
import syntaxes from "./syntaxes.ts";

const FORMAT_ON_SAVE_CONFIG_KEY = "co.gwil.deno.config.formatOnSave";
const TRUSTED_HOSTS_CONFIG_KEY = "co.gwil.deno.config.trustedImportHosts";
const UNTRUSTED_HOSTS_CONFIG_KEY = "co.gwil.deno.config.untrustedImportHosts";

// Deno expects a map of hosts for its autosuggestion feature, where each key is a URL and its value a bool representing whether it is trusted or not. Nova does not have a Configurable like this, so we'll have to assemble one out of two arrays.

function getHostsMap() {
  const trustedHosts = nova.config.get(TRUSTED_HOSTS_CONFIG_KEY) as string[] ||
    [];
  const untrustedHosts =
    nova.config.get(UNTRUSTED_HOSTS_CONFIG_KEY) as string[] ||
    [];

  const hostsMap: Record<string, boolean> = {};

  for (const trusted of trustedHosts) {
    hostsMap[trusted] = true;
  }

  for (const untrusted of untrustedHosts) {
    hostsMap[untrusted] = false;
  }

  return hostsMap;
}

// Indicates whether the server is being 'restarted' (replaced)
let isRestarting = false;

export function makeClientDisposable(parentDisposable: CompositeDisposable) {
  const clientDisposable = new CompositeDisposable();

  const client = new LanguageClient(
    "co.gwil.deno",
    "Deno Language Server",
    {
      type: "stdio",
      path: "/usr/bin/env",
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
          imports: {
            autoDiscover: true,
            hosts: getHostsMap(),
          },
        },
      },
    },
  );

  try {
    clientDisposable.add(registerFormatDocument(client));
    clientDisposable.add(registerCache(client));
    clientDisposable.add(registerRenameSymbol(client));
    clientDisposable.add(registerFindSymbol(client));

    nova.workspace.onDidAddTextEditor((editor) => {
      const editorDisposable = new CompositeDisposable();

      clientDisposable.add(editorDisposable);
      clientDisposable.add(
        editor.onDidDestroy(() => editorDisposable.dispose()),
      );

      // Formatting

      editorDisposable.add(
        editor.document.onDidChangeSyntax(refreshOnSaveListener),
      );

      editorDisposable.add(
        nova.workspace.config.onDidChange(
          FORMAT_ON_SAVE_CONFIG_KEY,
          refreshOnSaveListener,
        ),
      );

      editorDisposable.add(
        nova.config.onDidChange(
          FORMAT_ON_SAVE_CONFIG_KEY,
          refreshOnSaveListener,
        ),
      );

      let willSaveListener = setupOnSaveListener();
      clientDisposable.add({
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
          if (getOverridableBoolean(FORMAT_ON_SAVE_CONFIG_KEY) === false) {
            return;
          }

          await nova.commands.invoke("co.gwil.deno.commands.formatDocument");
        });
      }
    });

    // Listen for Deno detecting a registry's intellisense capabilities...
    client.onNotification(
      "deno/registryState",
      async (
        { origin, suggestions }: { origin: string; suggestions: string },
      ) => {
        const trustedHosts = nova.config.get(
          TRUSTED_HOSTS_CONFIG_KEY,
        ) as string[] || [];
        const untrustedHosts = nova.config.get(
          UNTRUSTED_HOSTS_CONFIG_KEY,
        ) as string[] || [];

        const isUntrusted = Array.isArray(untrustedHosts) &&
          untrustedHosts.includes(origin);
        const isTrusted = Array.isArray(trustedHosts) &&
          trustedHosts.includes(origin);

        if (!isUntrusted && !isTrusted) {
          if (suggestions) {
            const notificationReq = new NotificationRequest(
              "co.gwil.deno.notifications.hostIntellisenseAvailable",
            );

            notificationReq.title = "Intellisense available";
            notificationReq.body =
              `Would you like to enable import IntelliSense for ${origin}? Only do this if you trust ${origin}.`;

            notificationReq.actions = ["No", "Yes"];

            // if action idx is 0, add it to untrusted
            const { actionIdx } = await nova.notifications.add(notificationReq);

            if (actionIdx === 0) {
              nova.config.set(UNTRUSTED_HOSTS_CONFIG_KEY, [
                ...untrustedHosts,
                origin,
              ]);
            } else if (actionIdx === 1) {
              nova.config.set(TRUSTED_HOSTS_CONFIG_KEY, [
                ...trustedHosts,
                origin,
              ]);
            }
          }
        }
      },
    );

    clientDisposable.add(nova.commands.register(
      "co.gwil.deno.commands.restartServer",
      wrapCommand(() => {
        if (!isRestarting) {
          const listener = client.onDidStop(() => {
            listener.dispose();
            parentDisposable.add(makeClientDisposable(parentDisposable));
            isRestarting = false;
          });

          isRestarting = true;
          clientDisposable.dispose();
        }
      }),
    ));

    clientDisposable.add({
      dispose() {
        client.stop();
      },
    });

    client.start();
  } catch (err) {
    if (nova.inDevMode()) {
      console.error(err);
    }
  }

  return clientDisposable;
}
