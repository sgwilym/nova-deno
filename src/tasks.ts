import {
  Configuration,
  nova,
  TaskActionResolveContext,
  TaskAssistant,
  TaskProcessAction,
  Transferrable,
} from "./nova_utils.ts";

class DenoRunTaskAssistant implements TaskAssistant {
  provideTasks() {
    return [];
  }

  resolveTaskAction(ctx: TaskActionResolveContext<Transferrable>) {
    const config = ctx.config as Configuration;

    const configToMaybeFlag = (
      configKey: string,
      flag: string,
    ): string | undefined => {
      const bool = config.get(configKey, "boolean");
      return bool ? flag : undefined;
    };

    const scriptPath =
      config.get("co.gwil.deno.tasks.run.config.script", "string") || "";

    const allowAll = config.get(
      "co.gwil.deno.tasks.run.config.allow.all",
      "boolean",
    );

    const permissionTuples = ([
      ["co.gwil.deno.tasks.run.config.allow.read", "--allow-read"],
      ["co.gwil.deno.tasks.run.config.allow.write", "--allow-write"],
      ["co.gwil.deno.tasks.run.config.allow.net", "--allow-net"],
      ['"co.gwil.deno.tasks.run.config.allow.run"', "--allow-run"],
      ["co.gwil.deno.tasks.run.config.allow.env", "allow-env"],
    ] as [string, string][]).map(([key, flag]) => configToMaybeFlag(key, flag))
      .filter((maybeFlag): maybeFlag is string => maybeFlag !== undefined);

    const permissionArgs = allowAll ? ["--allow-all"] : permissionTuples;

    const tsconfig = config.get(
      "co.gwil.deno.tasks.run.config.config",
      "string",
    );

    const tsconfigFlag = tsconfig ? [`--config ${tsconfig}`] : [];

    const importMap = config.get(
      "co.gwil.deno.tasks.run.config.import-map",
      "string",
    );

    const importMapFlag = importMap ? [`--import-map ${importMap}`] : [];

    const cert = config.get("co.gwil.deno.tasks.run.config.cert", "string");

    const certFlag = cert ? [`--cert ${cert}`] : [];

    const customOptions =
      config.get("co.gwil.deno.tasks.run.config.custom-options", "array") || [];

    const userArgs =
      config.get("co.gwil.deno.tasks.run.config.user-args", "array") || [];

    return new TaskProcessAction(
      "deno",
      {
        args: [
          "run",
          ...permissionArgs,
          ...tsconfigFlag,
          ...importMapFlag,
          ...certFlag,
          ...customOptions,
          scriptPath,
          ...userArgs,
        ],
        shell: true,
      },
    );
  }
}

export function registerRunTask() {
  return nova.assistants.registerTaskAssistant(new DenoRunTaskAssistant(), {
    identifier: "co.gwil.deno.tasks.run",
    name: "Run",
  });
}

class DenoBundleTaskAssistant implements TaskAssistant {
  provideTasks() {
    return [];
  }

  resolveTaskAction<T extends Transferrable>(ctx: TaskActionResolveContext<T>) {
    const config = (ctx).config as Configuration;

    const sourceFile =
      config.get("co.gwil.deno.tasks.bundle.config.source-file", "string") ||
      "";

    const outFileDir =
      config.get("co.gwil.deno.tasks.run.config.out-file-dir", "string") || "";

    const outFileName =
      config.get("co.gwil.deno.tasks.run.config.out-file-name", "string") || "";

    const outFilePath = `${outFileDir}/${outFileName}`;

    const tsconfig = config.get(
      "co.gwil.deno.tasks.bundle.config.config",
      "string",
    );

    const tsconfigFlag = tsconfig ? [`--config ${tsconfig}`] : [];

    const importMap = config.get(
      "co.gwil.deno.tasks.bundle.config.import-map",
      "string",
    );

    const importMapFlag = importMap ? [`--import-map ${importMap}`] : [];

    const cert = config.get("co.gwil.deno.tasks.bundle.config.cert", "string");

    const certFlag = cert ? [`--cert ${cert}`] : [];

    const customOptions =
      config.get("co.gwil.deno.tasks.bundle.config.custom-options", "array") ||
      [];

    return new TaskProcessAction(
      "deno",
      {
        args: [
          "bundle",

          ...tsconfigFlag,
          ...importMapFlag,
          ...certFlag,
          ...customOptions,
          sourceFile,
          outFilePath,
        ],
        shell: true,
      },
    );
  }
}

export function registerBundleTask() {
  return nova.assistants.registerTaskAssistant(new DenoBundleTaskAssistant(), {
    identifier: "co.gwil.deno.tasks.bundle",
    name: "Bundle",
  });
}
