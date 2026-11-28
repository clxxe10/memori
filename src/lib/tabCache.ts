export type TabName = 'home' | 'vocabulary' | 'study' | 'profile'

const store = new Map<string, unknown>()

/** `${userId ?? 'guest'}:${tab}` */
export function tabCacheKey(userId: string | null | undefined, tab: TabName): string {
  return `${userId ?? 'guest'}:${tab}`
}

export function getTabCache<T>(key: string): T | null {
  if (!store.has(key)) return null
  return store.get(key) as T
}

export function setTabCache(key: string, data: unknown): void {
  store.set(key, data)
}

/** Drop cached entries for the given tabs (any user). */
export function invalidateTabCache(tabs: TabName[]): void {
  if (tabs.length === 0) return
  const wanted = new Set<string>(tabs)
  for (const key of [...store.keys()]) {
    const tab = key.slice(key.lastIndexOf(':') + 1)
    if (wanted.has(tab)) store.delete(key)
  }
}

export function clearAllTabCache(): void {
  store.clear()
}
