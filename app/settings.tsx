import React, { useState, useEffect } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Switch, ActivityIndicator, Platform } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'

import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import SettingsRow from '@/components/ui/SettingsRow'
import { useAffirmationsState } from '@/hooks/useAffirmationsState'
import {
  scheduleDailyReminders,
  scheduleTestNotification,
} from '@/lib/notifications'
import { useToast } from '@/contexts/ToastContext'
import { BG, BORDER, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_TERTIARY, ACCENT } from '@/lib/theme'

const REMINDERS_KEY = '@iam_mindset/notification_settings'

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const { showToast } = useToast()
  
  const { categories: activeCategories } = useAffirmationsState()

  // Scheduler states
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [frequency, setFrequency] = useState(3) // 3 reminders daily
  const [startHour, setStartHour] = useState(9) // 9 AM
  const [endHour, setEndHour] = useState(21) // 9 PM
  const [scheduling, setScheduling] = useState(false)

  // Load scheduler config on mount
  useEffect(() => {
    async function loadRemindersConfig() {
      try {
        const raw = await AsyncStorage.getItem(REMINDERS_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed.remindersEnabled !== undefined) setRemindersEnabled(parsed.remindersEnabled)
          if (parsed.frequency !== undefined) setFrequency(parsed.frequency)
          if (parsed.startHour !== undefined) setStartHour(parsed.startHour)
          if (parsed.endHour !== undefined) setEndHour(parsed.endHour)
        }
      } catch (e) {
        console.warn('Failed to load notification settings:', e)
      }
    }
    loadRemindersConfig()
  }, [])

  // Reschedule reminders on config change
  const handleUpdateReminder = async (
    enabled: boolean,
    freq: number,
    start: number,
    end: number
  ) => {
    setRemindersEnabled(enabled)
    setFrequency(freq)
    setStartHour(start)
    setEndHour(end)

    const next = { remindersEnabled: enabled, frequency: freq, startHour: start, endHour: end }
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(next))

    if (!enabled) {
      // Clear notifications if disabled
      if (Platform.OS !== 'web') {
        const Notifications = require('expo-notifications')
        await Notifications.cancelAllScheduledNotificationsAsync()
      }
      return
    }

    // Trigger rescheduling in the background
    setScheduling(true)
    try {
      await scheduleDailyReminders(freq, start, end, activeCategories)
    } catch (e) {
      console.warn(e)
    } finally {
      setScheduling(false)
    }
  }

  const handleSendTestNotification = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    }
    
    showToast('Sending test notification in 5 seconds... 🌸', 'info')
    
    const id = await scheduleTestNotification()
    if (!id && Platform.OS !== 'web') {
      showToast('Notifications permission required.', 'error')
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.6)" />
        </Pressable>
        <Text style={s.headerTitle}>Affirmation Reminders</Text>
        {scheduling ? (
          <ActivityIndicator size="small" color={ACCENT} />
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.sectionTitle}>Daily Motivation Alerts</Text>
        <Card compact style={s.groupCard}>
          <SwitchRow
            label="Enable daily alerts"
            subtitle="Deliver motivational affirmations"
            value={remindersEnabled}
            onValueChange={(v) => handleUpdateReminder(v, frequency, startHour, endHour)}
          />
        </Card>

        {remindersEnabled && (
          <>
            <Text style={s.sectionTitle}>Frequency & timing</Text>
            <Card compact style={s.groupCard}>
              <AdjustableRow
                label="Frequency"
                subtitle="Alerts delivered per day"
                value={`${frequency} times`}
                onIncrement={() => {
                  if (frequency < 5) handleUpdateReminder(remindersEnabled, frequency + 1, startHour, endHour)
                }}
                onDecrement={() => {
                  if (frequency > 1) handleUpdateReminder(remindersEnabled, frequency - 1, startHour, endHour)
                }}
              />

              <AdjustableRow
                label="Start time"
                subtitle="Earliest time alerts begin"
                value={`${startHour === 12 ? 12 : startHour % 12} ${startHour >= 12 ? 'PM' : 'AM'}`}
                onIncrement={() => {
                  if (startHour < endHour - 1) handleUpdateReminder(remindersEnabled, frequency, startHour + 1, endHour)
                }}
                onDecrement={() => {
                  if (startHour > 0) handleUpdateReminder(remindersEnabled, frequency, startHour - 1, endHour)
                }}
              />

              <AdjustableRow
                label="End time"
                subtitle="Latest time alerts stop"
                value={`${endHour === 12 ? 12 : endHour % 12} ${endHour >= 12 ? 'PM' : 'AM'}`}
                onIncrement={() => {
                  if (endHour < 23) handleUpdateReminder(remindersEnabled, frequency, startHour, endHour + 1)
                }}
                onDecrement={() => {
                  if (endHour > startHour + 1) handleUpdateReminder(remindersEnabled, frequency, startHour, endHour - 1)
                }}
                last
              />
            </Card>

            <Text style={s.sectionTitle}>Test remind engine</Text>
            <Card style={s.testCard}>
              <Text style={s.testDesc}>
                Trigger an immediate test push alert to experience the premium notification interface locally.
              </Text>
              <Button
                label="Send Instant Alert"
                onPress={handleSendTestNotification}
                style={s.testBtn}
              />
            </Card>
          </>
        )}

        <Text style={s.sectionTitle}>Legal & resources</Text>
        <Card compact style={s.groupCard}>
          <SettingsRow label="Privacy Policy" icon="document-text-outline" onPress={() => router.push('/privacy')} />
          <SettingsRow label="Terms of Service" icon="shield-checkmark-outline" onPress={() => router.push('/terms')} last={true} />
        </Card>
      </ScrollView>
    </View>
  )
}

// ─── Rows ─────────────────────────────────────────────────────────────────────

function SwitchRow({
  label,
  subtitle,
  value,
  onValueChange,
  last,
}: {
  label: string
  subtitle: string
  value: boolean
  onValueChange: (next: boolean) => void
  last?: boolean
}) {
  return (
    <View style={[s.row, !last && s.rowDivider]}>
      <View style={{ flex: 1 }}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowSub}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255,255,255,0.2)', true: `${ACCENT}66` }}
        thumbColor={value ? ACCENT : '#f4f4f5'}
      />
    </View>
  )
}

function AdjustableRow({
  label,
  subtitle,
  value,
  onIncrement,
  onDecrement,
  last,
}: {
  label: string
  subtitle: string
  value: string
  onIncrement: () => void
  onDecrement: () => void
  last?: boolean
}) {
  return (
    <View style={[s.row, !last && s.rowDivider]}>
      <View style={{ flex: 1 }}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowSub}>{subtitle}</Text>
      </View>
      
      <View style={s.adjusterGroup}>
        <Pressable
          onPress={onDecrement}
          style={({ pressed }) => [s.adjBtn, pressed && s.pressed]}
          hitSlop={8}
        >
          <Ionicons name="remove" size={16} color="#fff" />
        </Pressable>
        
        <Text style={s.adjusterVal}>{value}</Text>
        
        <Pressable
          onPress={onIncrement}
          style={({ pressed }) => [s.adjBtn, pressed && s.pressed]}
          hitSlop={8}
        >
          <Ionicons name="add" size={16} color="#fff" />
        </Pressable>
      </View>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: { color: TEXT_PRIMARY, fontSize: 17, fontWeight: '700' },
  body: { padding: 20, gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 10,
  },
  groupCard: { padding: 0, overflow: 'hidden', backgroundColor: '#151515', borderColor: BORDER },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  rowLabel: { color: TEXT_PRIMARY, fontSize: 14.5, fontWeight: '600' },
  rowSub: { color: TEXT_SECONDARY, fontSize: 12, marginTop: 2 },

  // Adjusters
  adjusterGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adjBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },
  adjusterVal: { color: '#fff', fontSize: 14, fontWeight: '700', minWidth: 64, textAlign: 'center' },

  // Test push card
  testCard: {
    padding: 16,
    backgroundColor: '#151515',
    borderColor: BORDER,
    gap: 12,
  },
  testDesc: { color: TEXT_SECONDARY, fontSize: 12.5, lineHeight: 18 },
  testBtn: {
    backgroundColor: ACCENT,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
  },
  testBtnText: { color: '#fff', fontSize: 13.5, fontWeight: '700' },
})
