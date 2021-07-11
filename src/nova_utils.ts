export function wrapCommand(
  command: (...args: any) => void | Promise<void>
): (...args: any) => void {
  return async function wrapped(...args: any) {
    try {
      await command(...args);
    } catch (err) {
      nova.workspace.showErrorMessage(err);
    }
  };
}