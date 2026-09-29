import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor'

export const REVENUECAT_API_KEY = 'appl_qfIBYsFFaQbkXSDGaBrkBQKBJLA'

export async function initRevenueCat(userId?: string) {
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG })
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId,
    })
  } catch (e) {
    console.error('RevenueCat 초기화 실패:', e)
  }
}

export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings()
    return offerings.current
  } catch (e) {
    console.error('Offerings 로드 실패:', e)
    return null
  }
}

export async function purchasePackage(pkg: any) {
  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })
    return customerInfo
  } catch (e) {
    console.error('구매 실패:', e)
    return null
  }
}

export async function restorePurchases() {
  try {
    const { customerInfo } = await Purchases.restorePurchases()
    return customerInfo
  } catch (e) {
    console.error('복원 실패:', e)
    return null
  }
}

export async function checkPremium() {
  try {
    const { customerInfo } = await Purchases.getCustomerInfo()
    return customerInfo.entitlements.active['memori_premium'] !== undefined
  } catch (e) {
    console.error('프리미엄 확인 실패:', e)
    return false
  }
}
