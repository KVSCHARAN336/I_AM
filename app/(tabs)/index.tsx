import React, { useMemo, useState, useRef, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Share,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated'

import { Text } from '@/components/ui/Text'
import { useAffirmationsState } from '@/hooks/useAffirmationsState'
import { CARD_THEMES, CardTheme } from '@/lib/affirmations'
import { TAB_BAR_HEIGHT } from '@/components/TabBar'

const { width: SW, height: SH } = Dimensions.get('window')

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const listRef = useRef<FlatList>(null)
  
  const {
    filteredAffirmations,
    activeTheme,
    saveThemeId,
    favorites,
    toggleFavorite,
    completeToday,
    currentStreak,
  } = useAffirmationsState()

  const [activeIndex, setActiveIndex] = useState(0)
  const [showThemeSelector, setShowThemeSelector] = useState(false)

  // Track scroll position to update active index and trigger completed read
  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y
    const index = Math.round(y / SH)
    if (index !== activeIndex && index >= 0 && index < filteredAffirmations.length) {
      setActiveIndex(index)
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync().catch(() => {})
      }
    }
  }

  // Trigger check-in when activeIndex changes
  useEffect(() => {
    if (filteredAffirmations.length > 0) {
      completeToday().catch(() => {})
    }
  }, [activeIndex, filteredAffirmations])

  const handleShare = async (text: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
      }
      await Share.share({
        message: `${text} — via I Am Mindset 🌸`,
      })
    } catch (e) {
      console.warn('Error sharing quote:', e)
    }
  }

  const handleCycleTheme = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    }
    const currentIdx = CARD_THEMES.findIndex((t) => t.id === activeTheme.id)
    const nextIdx = (currentIdx + 1) % CARD_THEMES.length
    saveThemeId(CARD_THEMES[nextIdx].id)
  }

  const handleFavoritePress = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    }
    toggleFavorite(id)
  }

  return (
    <View style={s.container}>
      {/* 🔮 Dynamic Theme Gradient Background */}
      <LinearGradient
        colors={activeTheme.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Sparkle Orbs */}
      <View style={[s.orb, { top: SH * 0.1, left: -SW * 0.2, backgroundColor: `${activeTheme.accentColor}1A` }]} pointerEvents="none" />
      <View style={[s.orb2, { bottom: SH * 0.2, right: -SW * 0.2, backgroundColor: `${activeTheme.accentColor}10` }]} pointerEvents="none" />

      {/* 🏷️ Top Float: App Header & Streak */}
      <View style={[s.header, { top: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.push('/(tabs)/activity')}
          style={({ pressed }) => [s.streakPill, pressed && s.pillPressed]}
        >
          <Text style={s.streakText}>🔥 {currentStreak} Day Streak</Text>
        </Pressable>

        <View style={s.headerActions}>
          <Pressable
            onPress={handleCycleTheme}
            style={({ pressed }) => [s.iconBtn, pressed && s.pillPressed]}
            hitSlop={12}
          >
            <Ionicons name="color-palette-outline" size={22} color={activeTheme.textColor} />
          </Pressable>

          <Pressable
            onPress={() => setShowThemeSelector(true)}
            style={({ pressed }) => [s.iconBtn, pressed && s.pillPressed]}
            hitSlop={12}
          >
            <Ionicons name="options-outline" size={22} color={activeTheme.textColor} />
          </Pressable>
        </View>
      </View>

      {/* 📑 Vertical FlatList quote cards */}
      <FlatList
        ref={listRef}
        data={filteredAffirmations}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AffirmationCard
            item={item}
            isActive={index === activeIndex}
            theme={activeTheme}
            isFavorited={favorites.includes(item.id)}
            onFavorite={() => handleFavoritePress(item.id)}
            onShare={() => handleShare(item.text)}
          />
        )}
        snapToInterval={SH}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        pagingEnabled
      />

      {/* 🎨 Theme Selector Bottom Drawer Overlay */}
      {showThemeSelector && (
        <ThemeDrawer
          activeId={activeTheme.id}
          onSelect={(id) => {
            saveThemeId(id)
            setShowThemeSelector(false)
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
            }
          }}
          onClose={() => setShowThemeSelector(false)}
        />
      )}
    </View>
  )
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

interface CardProps {
  item: { id: string; text: string; category: string }
  isActive: boolean
  theme: CardTheme
  isFavorited: boolean
  onFavorite: () => void
  onShare: () => void
}

function AffirmationCard({
  item,
  isActive,
  theme,
  isFavorited,
  onFavorite,
  onShare,
}: CardProps) {
  const insets = useSafeAreaInsets()

  const textScale = useSharedValue(0.92)
  const textOpacity = useSharedValue(0)
  const heartScale = useSharedValue(1)

  useEffect(() => {
    if (isActive) {
      textScale.value = withSpring(1, { damping: 14, stiffness: 80 })
      textOpacity.value = withTiming(1, { duration: 500 })
    } else {
      textScale.value = 0.92
      textOpacity.value = 0
    }
  }, [isActive])

  useEffect(() => {
    heartScale.value = withSpring(isFavorited ? 1.25 : 1, { damping: 10, stiffness: 200 }, () => {
      heartScale.value = withSpring(1)
    })
  }, [isFavorited])

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }))

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }))

  return (
    <View style={s.cardOuter}>
      {/* Immersive centered container */}
      <Animated.View style={[s.cardContent, textStyle]}>
        <View style={s.glowWrapper}>
          <Text style={[s.cardQuote, { color: theme.textColor }]}>
            {item.text}
          </Text>
        </View>

        <Text style={[s.categoryLabel, { color: theme.textColor, opacity: 0.65 }]}>
          # {item.category.toUpperCase()}
        </Text>
      </Animated.View>

      {/* Bottom side bar controls */}
      <View style={[s.controls, { bottom: TAB_BAR_HEIGHT + insets.bottom + 16 }]}>
        <Pressable
          onPress={onFavorite}
          style={({ pressed }) => [s.actionBtn, { backgroundColor: 'rgba(0,0,0,0.22)', borderColor: `${theme.accentColor}2E` }, pressed && s.btnPressed]}
        >
          <Animated.View style={heartStyle}>
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={26}
              color={isFavorited ? '#f43f5e' : theme.textColor}
            />
          </Animated.View>
        </Pressable>

        <Pressable
          onPress={onShare}
          style={({ pressed }) => [s.actionBtn, { backgroundColor: 'rgba(0,0,0,0.22)', borderColor: `${theme.accentColor}2E` }, pressed && s.btnPressed]}
        >
          <Ionicons name="paper-plane-outline" size={24} color={theme.textColor} />
        </Pressable>
      </View>
    </View>
  )
}

// ─── Theme Selector Panel ───────────────────────────────────────────────────

function ThemeDrawer({
  activeId,
  onSelect,
  onClose,
}: {
  activeId: string
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const insets = useSafeAreaInsets()

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={StyleSheet.absoluteFill}>
      <Pressable onPress={onClose} style={s.drawerBackdrop} />
      <Animated.View entering={FadeIn.duration(300)} style={[s.drawer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={s.drawerHeader}>
          <Text style={s.drawerTitle}>Select Theme Background</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color="#aaa" />
          </Pressable>
        </View>

        <View style={s.drawerGrid}>
          {CARD_THEMES.map((theme) => {
            const isActive = theme.id === activeId
            return (
              <Pressable
                key={theme.id}
                onPress={() => onSelect(theme.id)}
                style={[s.themeItem, isActive && s.themeItemActive]}
              >
                <LinearGradient
                  colors={theme.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.themeColorPreview}
                >
                  {isActive && (
                    <View style={s.themeItemCheck}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </LinearGradient>
                <Text style={s.themeName} numberOfLines={1}>{theme.name}</Text>
              </Pressable>
            )
          })}
        </View>
      </Animated.View>
    </Animated.View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  orb: { position: 'absolute', width: SW * 0.8, height: SW * 0.8, borderRadius: 999 },
  orb2: { position: 'absolute', width: SW * 0.6, height: SW * 0.6, borderRadius: 999 },
  
  // Header
  header: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakPill: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pillPressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  streakText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  // Cards swiper
  cardOuter: {
    width: SW,
    height: SH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    maxWidth: SW * 0.8,
  },
  glowWrapper: {
    // Elegant lighting drop shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  cardQuote: {
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.4,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  // Floating controls inside card
  controls: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 16,
    zIndex: 10,
  },
  actionBtn: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnPressed: { opacity: 0.75, transform: [{ scale: 0.94 }] },

  // Drawer styles
  drawerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#161616',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 24,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  drawerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  drawerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 12 },
  themeItem: { width: (SW - 68) / 3, gap: 6, alignItems: 'center', marginBottom: 12 },
  themeColorPreview: { width: '100%', height: 64, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  themeItemActive: { transform: [{ scale: 1.02 }] },
  themeItemCheck: { width: 24, height: 24, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  themeName: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '500', textAlign: 'center' },
})
