import stripJSONcomments from "strip-json";

export const configFilenames = [
  "deno.json",
  "deno.jsonc",
];

class DenoTaskAssistant implements TaskAssistant {
  provideTasks() {
    return configFilenames.map((filename) =>
      this.getTasksFromFilename(filename)
    ).flat();
  }

  private getTasksFromFilename(filename: string) {
    const workspacePath = nova.workspace.path;

    if (!workspacePath) {
      return [];
    }

    const denoConfigPath = nova.path.join(workspacePath, filename);
    const denoConfigStat = nova.fs.stat(denoConfigPath);

    if (denoConfigStat?.isFile()) {
      try {
        const config = JSON.parse(
          stripJSONcomments(
            nova.fs.open(denoConfigPath).read() as string,
          ),
        );

        const tasks = config["tasks"];

        if (tasks) {
          return Object.keys(tasks).map((key) => {
            const task = new Task(key);

            task.setAction(
              Task.Run,
              new TaskProcessAction("deno", {
                args: ["task", key],
                shell: true,
                cwd: workspacePath,
              }),
            );

            return task;
          });
        }

        return [];
      } catch (err) {
        console.error(err);
        return [];
      }
    }

    return [];
  }
}

export function registerDenoTasks() {
  return nova.assistants.registerTaskAssistant(new DenoTaskAssistant(), {
    identifier: "co.gwil.deno.tasks.auto",
    name: "Deno tasks",
  });
}
