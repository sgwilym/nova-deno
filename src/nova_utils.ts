export function wrapCommand(
  command: (
    workspaceOrEditor: Workspace | TextEditor,
    ...args: Transferrable[]
  ) => void | Promise<void>,
): (workspace: Workspace, ...args: Transferrable[]) => void {
  return async function wrapped(
    workspaceOrEditor: Workspace | TextEditor,
    ...args: Transferrable[]
  ) {
    try {
      await command(workspaceOrEditor, ...args);
    } catch (err) {
      nova.workspace.showErrorMessage(err);
    }
  };
}

export async function openFile(uri: string) {
  const newEditor = await nova.workspace.openFile(uri);
  if (newEditor) {
    return newEditor;
  }
  console.warn("failed first open attempt, retrying once", uri);
  // try one more time, this doesn't resolve if the file isn't already open. Need to file a bug
  return await nova.workspace.openFile(uri);
}

export function isWorkspace(val: Workspace | TextEditor): val is Workspace {
  if ("activeTextEditor" in val) {
    return true;
  }

  return false;
}
