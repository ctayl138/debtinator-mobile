const store: Record<string, string> = {};

export const MMKV = jest.fn().mockImplementation(() => ({
  getString: (key: string) => store[key] ?? undefined,
  set: (key: string, value: string) => {
    store[key] = value;
  },
  delete: (key: string) => {
    delete store[key];
  },
  clearAll: () => {
    Object.keys(store).forEach((k) => delete store[k]);
  },
}));

export function __clearStore(): void {
  Object.keys(store).forEach((k) => delete store[k]);
}
