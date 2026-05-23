import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AFFIRMATIONS, Affirmation, CARD_THEMES, CardTheme } from '@/lib/affirmations'

const KEYS = {
  CATEGORIES: '@iam_mindset/selected_categories',
  THEME_ID: '@iam_mindset/active_theme_id',
  FAVORITES: '@iam_mindset/favorites',
  COMPLETED_DATES: '@iam_mindset/completed_dates',
  BEST_STREAK: '@iam_mindset/best_streak',
}

export function useAffirmationsState() {
  const [categories, setCategories] = useState<string[]>(['confidence', 'gratitude'])
  const [themeId, setThemeId] = useState<string>('sunset-glow')
  const [favorites, setFavorites] = useState<string[]>([])
  const [completedDates, setCompletedDates] = useState<string[]>([])
  const [bestStreak, setBestStreak] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  // Load state from AsyncStorage on mount
  useEffect(() => {
    async function loadData() {
      try {
        const storedCats = await AsyncStorage.getItem(KEYS.CATEGORIES)
        const storedTheme = await AsyncStorage.getItem(KEYS.THEME_ID)
        const storedFavs = await AsyncStorage.getItem(KEYS.FAVORITES)
        const storedDates = await AsyncStorage.getItem(KEYS.COMPLETED_DATES)
        const storedBest = await AsyncStorage.getItem(KEYS.BEST_STREAK)

        if (storedCats) setCategories(JSON.parse(storedCats))
        if (storedTheme) setThemeId(storedTheme)
        if (storedFavs) setFavorites(JSON.parse(storedFavs))
        if (storedDates) setCompletedDates(JSON.parse(storedDates))
        if (storedBest) setBestStreak(parseInt(storedBest, 10) || 0)
      } catch (err) {
        console.error('Failed to load affirmations state:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Helper: Get active theme object
  const activeTheme = CARD_THEMES.find((t) => t.id === themeId) || CARD_THEMES[0]

  // Helper: Save helpers
  const saveCategories = async (newCats: string[]) => {
    setCategories(newCats)
    await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(newCats))
  }

  const saveThemeId = async (id: string) => {
    setThemeId(id)
    await AsyncStorage.setItem(KEYS.THEME_ID, id)
  }

  const toggleFavorite = async (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter((fid) => fid !== id)
      : [...favorites, id]
    setFavorites(next)
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(next))
  }

  // Calculate streaks dynamically
  const getStreakStats = () => {
    if (completedDates.length === 0) {
      return { current: 0, best: bestStreak }
    }

    // Sort unique dates ascending
    const sorted = Array.from(new Set(completedDates)).sort()
    
    let current = 0
    const todayStr = getLocalDateString(new Date())
    const yesterdayStr = getLocalDateString(new Date(Date.now() - 86400000))

    const hasToday = sorted.includes(todayStr)
    const hasYesterday = sorted.includes(yesterdayStr)

    // Calculate current streak
    if (hasToday || hasYesterday) {
      let checkDate = new Date(hasToday ? todayStr : yesterdayStr)
      while (true) {
        const checkStr = getLocalDateString(checkDate)
        if (sorted.includes(checkStr)) {
          current++
          // Go to previous day
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
    }

    // Calculate best streak historically
    let maxStreak = 0
    let tempStreak = 0
    let lastDate: Date | null = null

    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i])
      if (lastDate === null) {
        tempStreak = 1
      } else {
        const diffTime = Math.abs(d.getTime() - lastDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          tempStreak++
        } else if (diffDays > 1) {
          if (tempStreak > maxStreak) maxStreak = tempStreak
          tempStreak = 1
        }
      }
      lastDate = d
    }
    if (tempStreak > maxStreak) maxStreak = tempStreak

    const finalBest = Math.max(maxStreak, bestStreak, current)

    return { current, best: finalBest }
  }

  const { current: currentStreak, best: calculatedBest } = getStreakStats()

  // Update best streak persistent store if calculated is higher
  useEffect(() => {
    if (calculatedBest > bestStreak) {
      setBestStreak(calculatedBest)
      AsyncStorage.setItem(KEYS.BEST_STREAK, String(calculatedBest))
    }
  }, [calculatedBest])

  // Log a read check-in for today
  const completeToday = async () => {
    const todayStr = getLocalDateString(new Date())
    if (completedDates.includes(todayStr)) return

    const next = [...completedDates, todayStr]
    setCompletedDates(next)
    await AsyncStorage.setItem(KEYS.COMPLETED_DATES, JSON.stringify(next))
  }

  // Get matching affirmations based on categories
  const filteredAffirmations = AFFIRMATIONS.filter((item) =>
    categories.includes(item.category)
  )

  const finalAffirmations = filteredAffirmations.length > 0 ? filteredAffirmations : AFFIRMATIONS

  return {
    categories,
    saveCategories,
    themeId,
    saveThemeId,
    activeTheme,
    favorites,
    toggleFavorite,
    completedDates,
    completeToday,
    currentStreak,
    bestStreak: calculatedBest,
    filteredAffirmations: finalAffirmations,
    loading,
  }
}

// Format local date stably
function getLocalDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
