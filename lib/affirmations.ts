/**
 * 🌸 Database of Affirmation Quotes & Immersive Visual Themes.
 */

export interface Affirmation {
  id: string
  text: string
  author?: string
  category: string
}

export interface CardTheme {
  id: string
  name: string
  colors: [string, string, ...string[]]
  textColor: string
  accentColor: string
  isDark: boolean
}

// ─── Visual Themes ───────────────────────────────────────────────────────────
export const CARD_THEMES: CardTheme[] = [
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    colors: ['#ff7e5f', '#feb47b'],
    textColor: '#ffffff',
    accentColor: '#ffe4e6',
    isDark: true,
  },
  {
    id: 'midnight-aurora',
    name: 'Midnight Aurora',
    colors: ['#0f172a', '#1e1b4b', '#311042'],
    textColor: '#f8fafc',
    accentColor: '#fda4af',
    isDark: true,
  },
  {
    id: 'emerald-peace',
    name: 'Emerald Peace',
    colors: ['#065f46', '#064e3b', '#022c22'],
    textColor: '#f0fdf4',
    accentColor: '#a7f3d0',
    isDark: true,
  },
  {
    id: 'rose-dream',
    name: 'Rose Dream',
    colors: ['#fb7185', '#fda4af', '#f43f5e'],
    textColor: '#ffffff',
    accentColor: '#ffe4e6',
    isDark: true,
  },
  {
    id: 'lavender-calm',
    name: 'Lavender Calm',
    colors: ['#6366f1', '#8b5cf6', '#d946ef'],
    textColor: '#ffffff',
    accentColor: '#f5f3ff',
    isDark: true,
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    colors: ['#075985', '#0c4a6e', '#082f49'],
    textColor: '#f0f9ff',
    accentColor: '#bae6fd',
    isDark: true,
  },
  {
    id: 'glass-dark',
    name: 'Glass Obsidian',
    colors: ['#121212', '#1a1a1a', '#0a0a0a'],
    textColor: '#ffffff',
    accentColor: '#fda4af',
    isDark: true,
  }
]

// ─── Affirmations Database ───────────────────────────────────────────────────
export const AFFIRMATIONS: Affirmation[] = [
  // ── CONFIDENCE ──
  {
    id: 'conf-1',
    text: 'I am entirely comfortable in my own skin.',
    category: 'confidence'
  },
  {
    id: 'conf-2',
    text: 'I belong in any room I walk into.',
    category: 'confidence'
  },
  {
    id: 'conf-3',
    text: 'My potential to succeed is limitless.',
    category: 'confidence'
  },
  {
    id: 'conf-4',
    text: 'I choose to let go of self-doubt and embrace my unique power.',
    category: 'confidence'
  },
  {
    id: 'conf-5',
    text: 'I am resilient, strong, and capable of achieving everything I set my mind to.',
    category: 'confidence'
  },
  {
    id: 'conf-6',
    text: 'Every challenge is an opportunity for me to grow in confidence and capability.',
    category: 'confidence'
  },

  // ── GRATITUDE ──
  {
    id: 'grat-1',
    text: 'I am deeply grateful for the abundance overflowing in my life.',
    category: 'gratitude'
  },
  {
    id: 'grat-2',
    text: 'I find joy in the simple, beautiful moments of today.',
    category: 'gratitude'
  },
  {
    id: 'grat-3',
    text: 'I appreciate the wonderful people who support and love me.',
    category: 'gratitude'
  },
  {
    id: 'grat-4',
    text: 'My heart is open to receiving the gifts this day has to offer.',
    category: 'gratitude'
  },
  {
    id: 'grat-5',
    text: 'I am thankful for my past, excited for my future, and fully present in this moment.',
    category: 'gratitude'
  },

  // ── HEALTH ──
  {
    id: 'heal-1',
    text: 'Every cell in my body is vibrating with health, energy, and life.',
    category: 'health'
  },
  {
    id: 'heal-2',
    text: 'I respect my body and feed it with nurturing, nutritious elements.',
    category: 'health'
  },
  {
    id: 'heal-3',
    text: 'My mind is calm, my heart is peaceful, and my body is strong.',
    category: 'health'
  },
  {
    id: 'heal-4',
    text: 'I grant myself the rest and rejuvenation my body deserves.',
    category: 'health'
  },
  {
    id: 'heal-5',
    text: 'Healing energy flows through me with every breath I take.',
    category: 'health'
  },

  // ── LOVE ──
  {
    id: 'love-1',
    text: 'I am worthy of deep, unconditional, and fulfilling love.',
    category: 'love'
  },
  {
    id: 'love-2',
    text: 'I radiate love, kindness, and positive energy to everyone around me.',
    category: 'love'
  },
  {
    id: 'love-3',
    text: 'I attract loving and supportive relationships that nurture my soul.',
    category: 'love'
  },
  {
    id: 'love-4',
    text: 'I love and accept myself fully and unconditionally, just as I am.',
    category: 'love'
  },
  {
    id: 'love-5',
    text: 'My heart is a magnet for genuine, mutual affection and understanding.',
    category: 'love'
  },

  // ── SUCCESS ──
  {
    id: 'succ-1',
    text: 'I am highly focused, motivated, and aligned with my ultimate vision.',
    category: 'success'
  },
  {
    id: 'succ-2',
    text: 'Wealth, success, and incredible opportunities flow naturally to me.',
    category: 'success'
  },
  {
    id: 'succ-3',
    text: 'I have the courage to take bold action and manifest my dreams.',
    category: 'success'
  },
  {
    id: 'succ-4',
    text: 'I am the architect of my life; I build its foundation and choose its contents.',
    category: 'success'
  },
  {
    id: 'succ-5',
    text: 'My work is meaningful, productive, and rewarded with success and appreciation.',
    category: 'success'
  },

  // ── ANXIETY / CALM ──
  {
    id: 'anx-1',
    text: 'I inhale peace, and I exhale all tension and worry.',
    category: 'anxiety'
  },
  {
    id: 'anx-2',
    text: 'I am safe in this very moment. I let go of what I cannot control.',
    category: 'anxiety'
  },
  {
    id: 'anx-3',
    text: 'This feeling is temporary, and it will pass. I am strong enough to ride it out.',
    category: 'anxiety'
  },
  {
    id: 'anx-4',
    text: 'I slow my breath and anchor myself in the quiet space within.',
    category: 'anxiety'
  },
  {
    id: 'anx-5',
    text: 'I trust the unfolding of my life. Everything is working out for my highest good.',
    category: 'anxiety'
  }
]

export const CATEGORIES = [
  { id: 'confidence', name: 'Confidence', icon: 'sparkles-outline' },
  { id: 'gratitude', name: 'Gratitude', icon: 'heart-half-outline' },
  { id: 'health', name: 'Health & Vitality', icon: 'fitness-outline' },
  { id: 'love', name: 'Self-Love & Relationships', icon: 'rose-outline' },
  { id: 'success', name: 'Success & Prosperity', icon: 'trophy-outline' },
  { id: 'anxiety', name: 'Anxiety & Calm', icon: 'leaf-outline' }
]
