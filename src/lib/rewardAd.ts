import type { PluginListenerHandle } from '@capacitor/core'

export type RewardAdResult = 'rewarded' | 'dismissed' | 'failed'

/**
 * Show a rewarded video ad once.
 * Registers listeners before prepare/show and always removes them when done.
 */
export async function showRewardAd(adId: string): Promise<RewardAdResult> {
  const { Capacitor } = await import('@capacitor/core')
  if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) {
    return 'failed'
  }

  const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob')

  return new Promise(resolve => {
    let rewarded = false
    let settled = false
    const handles: PluginListenerHandle[] = []

    const cleanup = async () => {
      await Promise.all(
        handles.map(async h => {
          try {
            await h.remove()
          } catch {
            // ignore
          }
        }),
      )
    }

    const finish = (result: RewardAdResult) => {
      if (settled) return
      settled = true
      void cleanup().finally(() => resolve(result))
    }

    void (async () => {
      try {
        handles.push(
          await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
            rewarded = true
          }),
        )
        handles.push(
          await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
            finish(rewarded ? 'rewarded' : 'dismissed')
          }),
        )
        handles.push(
          await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, () => {
            finish('failed')
          }),
        )
        handles.push(
          await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => {
            finish('failed')
          }),
        )

        await AdMob.prepareRewardVideoAd({ adId })
        await AdMob.showRewardVideoAd()
        // Result is resolved from Dismissed / Failed* listeners
      } catch (e) {
        console.error('showRewardAd failed:', e)
        finish('failed')
      }
    })()
  })
}
