import { Platform } from 'react-native'
import Constants from 'expo-constants'
import type PurchasesType from 'react-native-purchases'
import type {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases'

// RevenueCat requires native store APIs — not available in Expo Go or Web.
const IS_EXPO_GO = Constants.appOwnership === 'expo' || Platform.OS === 'web'

let Purchases: typeof PurchasesType | null = null
let LOG_LEVEL: any = {}

if (Platform.OS !== 'web' && !IS_EXPO_GO) {
  try {
    const RC = require('react-native-purchases')
    Purchases = RC.default || RC
    LOG_LEVEL = RC.LOG_LEVEL
  } catch (e) {
    console.warn('[RevenueCat] Failed to load native purchases module:', e)
  }
}

// 🔑 REVENUECAT: Set your entitlement identifier to match your RC dashboard.
// Default is 'premium'. Create this entitlement in RevenueCat → Entitlements.
export const ENTITLEMENT_ID = 'premium'

export function configureRevenueCat() {
  if (IS_EXPO_GO || !Purchases) return
  const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY
  if (!apiKey || apiKey.startsWith('REPLACE_')) {
    console.warn(
      '[RevenueCat] API key not set. Add EXPO_PUBLIC_REVENUECAT_*_API_KEY to your env.'
    )
    return
  }
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR)
  Purchases.configure({ apiKey })
}

const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? ''
const IOS_API_KEY     = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? ''

/** Call after Supabase auth to tie purchases to the logged-in account. */
export async function loginRevenueCat(userId: string) {
  if (IS_EXPO_GO || !Purchases) return
  try {
    await Purchases.logIn(userId)
  } catch (e) {
    console.warn('[RevenueCat] logIn error:', e)
  }
}

/** Call on logout to dissociate purchases from the account. */
export async function logoutRevenueCat() {
  if (IS_EXPO_GO || !Purchases) return
  try {
    await Purchases.logOut()
  } catch (e) {
    console.warn('[RevenueCat] logOut error:', e)
  }
}

/** Returns true if customerInfo has an active entitlement. */
export function isRCPremium(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) return false
  return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined'
}

export async function fetchOfferings(): Promise<PurchasesOfferings | null> {
  if (IS_EXPO_GO || !Purchases) return null
  try {
    return await Purchases.getOfferings()
  } catch (e) {
    console.warn('[RevenueCat] getOfferings error:', e)
    return null
  }
}

export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  if (IS_EXPO_GO || !Purchases) return null
  try {
    return await Purchases.getCustomerInfo()
  } catch (e) {
    console.warn('[RevenueCat] getCustomerInfo error:', e)
    return null
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  if (!Purchases) return null
  const { customerInfo } = await Purchases.purchasePackage(pkg)
  return customerInfo
}

export async function restorePurchases(): Promise<CustomerInfo> {
  if (!Purchases) throw new Error('Purchases not initialized')
  return Purchases.restorePurchases()
}

export { CustomerInfo, PurchasesOfferings, PurchasesPackage }
