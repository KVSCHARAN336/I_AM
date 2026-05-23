import React, { useMemo } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import { useAffirmationsState } from '@/hooks/useAffirmationsState'
import { CATEGORIES, CARD_THEMES } from '@/lib/affirmations'
import { ACCENT, BG, BORDER, TEXT_SECONDARY, TEXT_TERTIARY } from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'

const { width: SW } = Dimensions.get('window')

export default function ExploreScreen() {
  const insets = useSafeAreaInsets()
  
  const {
    categories: activeCategories,
    saveCategories,
    themeId: activeThemeId,
    saveThemeId,
    activeTheme,
  } = useAffirmationsState()

  const handleToggleCategory = (catId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    }
    
    let next: string[]
    if (activeCategories.includes(catId)) {
      // Keep at least one category selected
      if (activeCategories.length <= 1) return
      next = activeCategories.filter((c) => c !== catId)
    } else {
      next = [...activeCategories, catId]
    }
    saveCategories(next)
  }

  const handleSelectTheme = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    }
    saveThemeId(id)
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[s.container, { paddingTop: insets.top + 20, paddingBottom: TAB_BAR_CLEARANCE + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* 🔮 App header */}
      <View style={s.header}>
        <Text style={s.title}>Personalize</Text>
        <Text style={s.sub}>Customize your mindset focus and visual experience.</Text>
      </View>

      {/* 🌸 Motivation Categories Grid */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Affirmation Categories</Text>
        <Text style={s.sectionDesc}>Select the areas you wish to prioritize today. We will prioritize these on your home feed.</Text>
        
        <View style={s.grid}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategories.includes(cat.id)
            return (
              <Pressable
                key={cat.id}
                onPress={() => handleToggleCategory(cat.id)}
                style={({ pressed }) => [
                  s.catCard,
                  isActive && { borderColor: ACCENT, backgroundColor: 'rgba(244,63,94,0.06)' },
                  pressed && { transform: [{ scale: 0.98 }] }
                ]}
              >
                <View style={[s.catIconWrap, isActive && { backgroundColor: `${ACCENT}22` }]}>
                  <Ionicons
                    name={cat.icon as any}
                    size={22}
                    color={isActive ? ACCENT : TEXT_SECONDARY}
                  />
                </View>
                
                <Text style={[s.catName, isActive && { color: '#fff', fontWeight: '700' }]}>
                  {cat.name}
                </Text>

                {isActive && (
                  <View style={s.activeBadge}>
                    <Ionicons name="checkmark-circle" size={18} color={ACCENT} />
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* 🎨 Theme palettes grid */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Visual Themes</Text>
        <Text style={s.sectionDesc}>Choose a visual colorway that matches your current energy and vibe.</Text>
        
        <View style={s.themeGrid}>
          {CARD_THEMES.map((theme) => {
            const isActive = theme.id === activeThemeId
            return (
              <Pressable
                key={theme.id}
                onPress={() => handleSelectTheme(theme.id)}
                style={s.themeCardContainer}
              >
                <LinearGradient
                  colors={theme.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[s.themeGradientPreview, isActive && s.themeGradientActive]}
                >
                  {isActive && (
                    <View style={s.checkPill}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </LinearGradient>
                <Text style={[s.themeLabel, isActive && { color: '#fff', fontWeight: '600' }]}>
                  {theme.name}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    </ScrollView>
  )
}

// ─── Alias hook locally for clean name compilation ───────────────────────────
function useAffAffState() {
  return useAffirmationsState()
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 24 },
  header: { gap: 4, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.6 },
  sub: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 20 },
  
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionDesc: { fontSize: 13, color: TEXT_SECONDARY, lineHeight: 18, marginBottom: 6 },
  
  // Categories Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: {
    width: (SW - 52) / 2,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    position: 'relative',
  },
  catIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: { color: TEXT_SECONDARY, fontSize: 14, fontWeight: '600' },
  activeBadge: { position: 'absolute', top: 12, right: 12 },
  
  // Themes Grid
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  themeCardContainer: { width: (SW - 52) / 2, gap: 6, marginBottom: 6 },
  themeGradientPreview: {
    width: '100%',
    height: 96,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  themeGradientActive: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  checkPill: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeLabel: { color: TEXT_SECONDARY, fontSize: 12.5, fontWeight: '500', paddingLeft: 4 },
})
