function getWorkspaceSetting(configKey: string): boolean | null {
  const str = nova.workspace.config.get(configKey, "string");
  switch (str) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      return null;
  }
}

export function getOverridableBoolean(configKey: string): boolean | null {
  return (
    getWorkspaceSetting(configKey) ??
      nova.config.get(configKey, "boolean") ??
      null
  );
}
