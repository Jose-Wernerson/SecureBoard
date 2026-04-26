type ExpiryRecord = {
  expiresAt: number;
};

export function createRedisMock() {
  const store = new Map<string, string>();
  const expirations = new Map<string, ExpiryRecord>();

  function purgeIfExpired(key: string) {
    const expiration = expirations.get(key);

    if (!expiration) {
      return;
    }

    if (expiration.expiresAt <= Date.now()) {
      expirations.delete(key);
      store.delete(key);
    }
  }

  return {
    isOpen: true,
    on() {
      return undefined;
    },
    async connect() {
      return undefined;
    },
    async get(key: string) {
      purgeIfExpired(key);
      return store.get(key) ?? null;
    },
    async incr(key: string) {
      purgeIfExpired(key);
      const nextValue = Number(store.get(key) ?? 0) + 1;
      store.set(key, String(nextValue));
      return nextValue;
    },
    async expire(key: string, seconds: number) {
      expirations.set(key, {
        expiresAt: Date.now() + seconds * 1000,
      });
      return 1;
    },
    async del(key: string) {
      expirations.delete(key);
      return store.delete(key) ? 1 : 0;
    },
    reset() {
      store.clear();
      expirations.clear();
    },
  };
}