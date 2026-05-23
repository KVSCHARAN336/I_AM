import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Dimensions,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated'

import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAffirmationsState } from '@/hooks/useAffirmationsState'
import { useToast } from '@/contexts/ToastContext'
import { ACCENT, BG, BORDER, TEXT_SECONDARY, TEXT_TERTIARY, SURFACE } from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'

const { width: SW } = Dimensions.get('window')

export default function StreakCalendarScreen() {
  const insets = useSafeAreaInsets()
  const { showToast } = useToast()

  const {
    completedDates,
    currentStreak,
    bestStreak,
    completeToday,
  } = useAffirmationsState()

  const [reflection, setReflection] = useState('')
  const [saving, setSaving] = useState(false)
  const [reflectionDates, setReflectionDates] = useState<Record<string, string>>({})

  const todayStr = getLocalDateString(new Date())

  // Pulsating Flame animation
  const flameScale = useSharedValue(1)
  const flameGlow = useSharedValue(0.15)

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    )
    flameGlow.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 1600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    )
  }, [])

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: flameGlow.value,
  }))

  // Load reflections on mount
  useEffect(() => {
    async function loadReflections() {
      try {
        const stored = await AsyncStorage.getItem('@iam_mindset/reflections')
        if (stored) {
          const parsed = JSON.parse(stored)
          setReflectionDates(parsed)
          if (parsed[todayStr]) setReflection(parsed[todayStr])
        }
      } catch (e) {
        console.error('Failed to load reflections:', e)
      }
    }
    loadReflections()
  }, [todayStr])

  const handleSaveReflection = async () => {
    if (!reflection.trim()) return
    setSaving(true)
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    }

    try {
      const nextReflections = { ...reflectionDates, [todayStr]: reflection.trim() }
      setReflectionDates(nextReflections)
      await AsyncStorage.setItem('@iam_mindset/reflections', JSON.stringify(nextReflections))
      
      // Auto complete today's streak check-in too!
      await completeToday()
      
      showToast('Reflection saved! Intentions aligned. ✨', 'success')
    } catch (e) {
      console.error(e)
      showToast('Could not save intention. Try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Generate Custom Calendar Days
  const calendarDays = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    const firstDay = new Date(year, month, 1).getDay() // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    
    // Empty cells for alignment before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push({ key: `empty-${i}`, dayNum: null, dateStr: null })
    }

    // Days in current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({ key: `day-${i}`, dayNum: i, dateStr: dStr })
    }

    return days
  }, [])

  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.container, { paddingTop: insets.top + 20, paddingBottom: TAB_BAR_CLEARANCE + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Streak Tracker</Text>
          <Text style={s.sub}>Track your daily check-in habits and map your mental growth.</Text>
        </View>

        {/* 🔥 Mindset Streak Hero Card */}
        <Card style={s.heroCard}>
          <View style={s.flameContainer}>
            <Animated.View style={[s.flameGlow, glowStyle]} />
            <Animated.View style={[s.flameIconWrap, flameStyle]}>
              <Ionicons name="flame" size={48} color={ACCENT} />
            </Animated.View>
          </View>

          <View style={s.streakTextGroup}>
            <Text style={s.streakNum}>{currentStreak}</Text>
            <Text style={s.streakDesc}>Consecutive Days Mindful</Text>
          </View>

          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={s.statLabel}>Best Streak</Text>
              <Text style={s.statVal}>{bestStreak} Days</Text>
            </View>
            <View style={s.divider} />
            <View style={s.statBox}>
              <Text style={s.statLabel}>Total Completed</Text>
              <Text style={s.statVal}>{completedDates.length} Session{completedDates.length === 1 ? '' : 's'}</Text>
            </View>
          </View>
        </Card>

        {/* 📅 Beautiful Glowing Month Calendar Grid */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Reflection Calendar</Text>
          <Text style={s.monthTitle}>{monthName}</Text>

          <Card style={s.calendarCard}>
            {/* Week Headers */}
            <View style={s.weekHeaderRow}>
              {WEEKDAYS.map((day) => (
                <Text key={day} style={s.weekDayLabel}>{day}</Text>
              ))}
            </View>

            {/* Month Day Grid */}
            <View style={s.calendarGrid}>
              {calendarDays.map((cell: any) => {
                if (cell.dayNum === null || cell.dateStr === null) {
                  return <View key={cell.key} style={s.gridCell} />
                }

                const isCompleted = completedDates.includes(cell.dateStr)
                const isToday = cell.dateStr === todayStr

                return (
                  <View key={cell.key} style={s.gridCell}>
                    <View
                      style={[
                        s.dayBubble,
                        isToday && s.dayTodayBorder,
                        isCompleted && s.dayCompleted,
                      ]}
                    >
                      <Text
                        style={[
                          s.dayNumText,
                          isToday && { color: ACCENT, fontWeight: '800' },
                          isCompleted && { color: '#fff', fontWeight: '700' },
                        ]}
                      >
                        {cell.dayNum}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </Card>
        </View>

        {/* 📝 Intention Journaling Box */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Daily Reflection Journal</Text>
          <Card style={s.reflectionCard}>
            <Text style={s.reflectionPrompt}>What is your primary focus or intention for today?</Text>
            
            <TextInput
              value={reflection}
              onChangeText={setReflection}
              placeholder="I choose to focus my energy on..."
              placeholderTextColor="rgba(255,255,255,0.22)"
              multiline
              maxLength={400}
              style={s.refInput}
              blurOnSubmit
            />

            <Button
              label={saving ? '' : 'Save Daily Intention'}
              loading={saving}
              onPress={handleSaveReflection}
              disabled={!reflection.trim() || saving}
              style={StyleSheet.flatten([s.saveBtn, { backgroundColor: ACCENT }])}
            />
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ─── Format stable Date String ────────────────────────────────────────────────
function getLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 24 },
  header: { gap: 4, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.6 },
  sub: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 20 },

  // Hero Card
  heroCard: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#151515',
    borderColor: BORDER,
  },
  flameContainer: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  flameGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: ACCENT,
    opacity: 0.15,
  },
  flameIconWrap: {
    zIndex: 2,
  },
  streakTextGroup: { alignItems: 'center', gap: 2 },
  streakNum: { fontSize: 44, fontWeight: '900', color: '#fff', letterSpacing: -0.8 },
  streakDesc: { fontSize: 13, color: TEXT_SECONDARY, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 16,
    marginTop: 8,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statLabel: { fontSize: 11, color: TEXT_TERTIARY, fontWeight: '600', textTransform: 'uppercase' },
  statVal: { fontSize: 14, color: '#fff', fontWeight: '700' },
  divider: { width: 1, height: '80%', backgroundColor: 'rgba(255,255,255,0.08)', alignSelf: 'center' },

  // Calendar
  section: { gap: 12 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  monthTitle: { fontSize: 16, fontWeight: '700', color: '#fff', paddingLeft: 2 },
  calendarCard: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#151515',
    borderColor: BORDER,
    gap: 16,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDayLabel: {
    width: (SW - 64) / 7,
    textAlign: 'center',
    color: TEXT_TERTIARY,
    fontSize: 12,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
  },
  gridCell: {
    width: (SW - 64) / 7,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBubble: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTodayBorder: {
    borderWidth: 1.5,
    borderColor: ACCENT,
  },
  dayCompleted: {
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  dayNumText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '500',
  },

  // Reflection Journal
  reflectionCard: {
    padding: 16,
    backgroundColor: '#151515',
    borderColor: BORDER,
    gap: 14,
  },
  reflectionPrompt: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  refInput: {
    height: 110,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14.5,
    textAlignVertical: 'top',
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
})
