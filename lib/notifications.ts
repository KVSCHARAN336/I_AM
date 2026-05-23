import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { AFFIRMATIONS } from './affirmations'

// Configure global notification handler
if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    })
  } catch (e) {
    console.warn('[Notifications] Failed to set global notification handler:', e)
  }
}

/**
 * Request system permissions for local notifications.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  
  try {
    const { status: existingStatus } = (await Notifications.getPermissionsAsync()) as any
    let finalStatus = existingStatus
    
    if (existingStatus !== 'granted') {
      const { status } = (await Notifications.requestPermissionsAsync()) as any
      finalStatus = status
    }
    
    return finalStatus === 'granted'
  } catch (e) {
    console.error('[Notifications] Error requesting permissions:', e)
    return false
  }
}

/**
 * Schedule repeating daily reminders loaded with randomized active affirmations.
 * 
 * @param frequency Number of notifications per day (e.g. 1 to 5)
 * @param startHour The hour to begin reminders (0-23, e.g. 9 for 9 AM)
 * @param endHour The hour to end reminders (0-23, e.g. 21 for 9 PM)
 * @param categories Active categories to select affirmations from
 */
export async function scheduleDailyReminders(
  frequency: number,
  startHour: number,
  endHour: number,
  categories: string[]
): Promise<Date[]> {
  if (Platform.OS === 'web') return []

  try {
    // 1. Clear all existing reminders
    await Notifications.cancelAllScheduledNotificationsAsync()

    const hasPermission = await requestNotificationPermissions()
    if (!hasPermission) {
      console.warn('[Notifications] No permissions to schedule reminders.')
      return []
    }

    // 2. Filter affirmations
    const activeAffs = AFFIRMATIONS.filter((a) => categories.includes(a.category))
    const affirmationsList = activeAffs.length > 0 ? activeAffs : AFFIRMATIONS

    // 3. Compute distributed time slots
    const scheduledDates: Date[] = []
    const range = endHour - startHour
    const step = frequency > 1 ? range / (frequency - 1) : 0

    for (let i = 0; i < frequency; i++) {
      const hour = frequency > 1 ? Math.round(startHour + i * step) : Math.round((startHour + endHour) / 2)
      
      const fireTime = new Date()
      fireTime.setHours(hour)
      fireTime.setMinutes(0)
      fireTime.setSeconds(0)
      
      // If the calculated time is already in the past today, move to tomorrow
      if (fireTime.getTime() <= Date.now()) {
        fireTime.setDate(fireTime.getDate() + 1)
      }

      scheduledDates.push(fireTime)

      // Get a random quote for this specific reminder
      const randomAff = affirmationsList[Math.floor(Math.random() * affirmationsList.length)]

      // 4. Schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'I Am Mindset 🌸',
          body: randomAff.text,
          sound: true,
          data: { affirmationId: randomAff.id },
        },
        trigger: {
          hour: hour,
          minute: 0,
          repeats: true,
        } as any,
      })
    }

    console.log(`[Notifications] Successfully scheduled ${frequency} daily reminders.`)
    return scheduledDates
  } catch (e) {
    console.error('[Notifications] Failed to schedule reminders:', e)
    return []
  }
}

/**
 * Schedules a single instant notification for testing purposes (fires in 5 seconds).
 */
export async function scheduleTestNotification(): Promise<string | null> {
  if (Platform.OS === 'web') return null

  try {
    const hasPermission = await requestNotificationPermissions()
    if (!hasPermission) return null

    const randomAff = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'I Am Mindset 🌸',
        body: randomAff.text,
        sound: true,
        data: { test: true },
      },
      trigger: {
        seconds: 5,
      } as any,
    })
    
    return id
  } catch (e) {
    console.error('[Notifications] Failed to schedule test notification:', e)
    return null
  }
}
