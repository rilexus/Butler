const getByPath = (obj: unknown, path: string): unknown => {
  if (path === "") return obj;
  return path.split(".").reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj);
};

export { getByPath };
