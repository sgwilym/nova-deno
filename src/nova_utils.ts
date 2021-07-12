export function wrapCommand(
  command: (
    workspace: Workspace,
    ...args: Transferrable[]
  ) => void | Promise<void>,
): (workspace: Workspace, ...args: Transferrable[]) => void {
  return async function wrapped(
    workspace: Workspace,
    ...args: Transferrable[]
  ) {
    try {
      await command(workspace, ...args);
    } catch (err) {
      nova.workspace.showErrorMessage(err);
    }
  };
}
