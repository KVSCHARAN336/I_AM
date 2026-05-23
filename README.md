# 🌸 I Am Mindset — Daily Affirmations & Motivation App

### **8xengineering Contest Submission**
A highly polished, serene, and premium mobile affirmations application built on top of the **8x React Native Mobile Template**. 

This app delivers personalized daily affirmations tailored to user goals (confidence, gratitude, success, love, health, anxiety) through a stunning, vertical-swipe full-screen card interface. It includes a dynamic local reminders engine, a habit streak tracker with an interactive calendar view, and a saved favorites vault.

🔗 **GitHub Repository**: [KVSCHARAN336/I_AM](https://github.com/KVSCHARAN336/I_AM)

---

## 🌟 Premium Features Built

### 1. Immersive Full-Screen Card Swiper (`Home`)
- **Vertical Swipe Feed**: A fluid, full-screen vertical swipe quote deck (matching the UX of the real $600K/year *I Am* reference app).
- **Parallax Background Themes**: Features 7 pre-curated linear gradients (Sunset Glow, Midnight Aurora, Emerald Peace, Rose Dream, Lavender Calm, Deep Ocean, Glass Obsidian).
- **Theme Customization**: Tap the screen background to instantly cycle themes, or open the visual editor sheet to preview and pick your colorway.
- **Card Actions**: Bouncy spring-animated heart favorites button with haptics, and instant native sharing.

### 2. Personalize Center (`Design`)
- **Motivation Filters**: Select and prioritize specific mental areas: **Confidence, Gratitude, Health, Love, Success, and Anxiety**.
- **Dynamic Catalog Engine**: The card swiper automatically filters and shuffles affirmations in real-time based on your focus goals.
- **Visual Palettes Grid**: A grid showing previews of active theme gradients.

### 3. Streak Calendar & Journal (`Streak`)
- **Flaming Progress Hero**: Pulsating animated flame counters display your current and historical check-in streaks.
- **Glowing Month Calendar**: A custom-built JSX calendar grid that automatically highlights days where you read affirmations.
- **Intention Journal**: A glassmorphism journaling space allowing users to type and save their daily mindful reflections to local storage.

### 4. Affirmation Reminders Panel (`Settings`)
- **Local Alerts Scheduler**: Custom repeating reminder schedule leveraging `expo-notifications`.
- **Timing & Frequency Configuration**: Users customize active notification frequency (e.g. 1x to 5x daily) and set precise start and end times (e.g. 9 AM to 9 PM).
- **Alert Testing Engine**: Includes a "Send Instant Alert" button, which delivers a test push alert in 5 seconds to demonstrate the notifications UX locally.

### 5. Saved Vault & Profile (`Profile`)
- **Favorites Vault**: A clean layout grid displaying all saved affirmations.
- **Actions**: Tap any favorite card to copy it to your clipboard with a confirmation toast, or tap the trash icon to purge it.
- **Premium Upgrades**: Fully wired RevenueCat entitlement indicators and manage controls.

---

## 🛠️ Stack & Clean Architecture

| Layer | Package | Purpose |
|---|---|---|
| **Core Framework** | `expo` (~55.0.14) + `react-native` (0.83.4) | Cross-platform runtime |
| **Routing** | `expo-router` (~55.0.12) | Highly organized file-based navigation |
| **Styling** | `nativewind` + `tailwindcss` | Utility-first flexible styling |
| **Persistence** | `@react-native-async-storage/async-storage` | Seamless local state caching |
| **Push Notifications**| `expo-notifications` (~55.0.23) | Local distributed cron alerts |
| **Animations** | `react-native-reanimated` | Parallax scaling and flame pulses |
| **Data Fetching** | `@tanstack/react-query` | Dynamic query caching |

---

## 📲 How to Start & Run on Your PC

### Prerequisites
Make sure you have Node.js (v20+) installed.

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Launch the Dev Server
```bash
npm start
```

### Step 3: Run the Application
- **On Your Phone**: Download **Expo Go** on iOS/Android, select "Enter URL manually" and scan your local IP link (e.g. `exp://192.168.x.x:8081`).
- **In Your PC Web Browser**: Press **`w`** in the Metro console to boot the fully web-compatible web build at `http://localhost:8081`.
- **On Mobile Emulators**: Press **`a`** to open the virtual Android Emulator, or **`i`** to open the iOS Simulator.

### 💡 Dev Skip (Bypass Auth instantly!)
When launching the app, select **"Get Started"** to reach the login screen, then tap the dashed button at the bottom: **"Skip to Home (dev only)"**. This will bypass network checks and load the affirmations home feed instantly.

---

## 🌸 Judge Review Focus Checklist
- [x] **Screenshots / Video Walkthrough**: Immersive visual layouts with active glassmorphism cards and colorful gradients.
- [x] **Card Design Quality**: Parallax animated vertical scrolls and bouncy micro-animations on favoriting.
- [x] **Personalization Logic**: Categories filter automatically recalculates active lists and updates card swipers dynamically.
- [x] **Notification UX**: Comprehensive scheduling selectors with interval spacing and one-click notification testing.
- [x] **Code Quality**: Decoupled clean architecture (`hooks/useAffirmationsState.ts`, `lib/notifications.ts`, `lib/affirmations.ts`).
