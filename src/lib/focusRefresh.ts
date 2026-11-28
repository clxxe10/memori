/** Debounced focus/visibility refresh. Mount fetches stay separate and always run. */
export function attachDebouncedFocusRefresh(
  refresh: () => void,
  debounceMs = 30_000,
): () => void {
  // Treat attach time as last refresh so remount+immediate focus doesn't double-fetch
  let lastRefreshAt = Date.now()

  const run = () => {
    const now = Date.now()
    if (now - lastRefreshAt < debounceMs) return
    lastRefreshAt = now
    refresh()
  }

  const onFocus = () => run()
  const onVisibility = () => {
    if (document.visibilityState === 'visible') run()
  }

  window.addEventListener('focus', onFocus)
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    window.removeEventListener('focus', onFocus)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
