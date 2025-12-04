# Girls Night 💅✨ - Complete Project Documentation

## 📋 Project Overview

**Girls Night** is a mobile party game built with React Native and Expo, designed for groups of girls aged 15-25. The app features both local pass-the-phone gameplay and real-time multiplayer mode with Supabase.

---

## 🎯 Core Features

### 1. **Local Mode (Pass-the-Phone)**
- ✅ No internet required
- ✅ No backend/database needed
- ✅ In-memory state management
- ✅ 4 pre-made categories with 30 prompts each (120 total)
- ✅ Build Your Own with derangement algorithm
- ✅ Hold-to-reveal mechanic with haptics
- ✅ Progress tracking

### 2. **Group Mode (Multiplayer)**
- ✅ Real-time sync via Supabase Realtime
- ✅ 6-character room codes
- ✅ Host-controlled game flow
- ✅ Multiple players see same prompts simultaneously
- ✅ Player lobby with join notifications
- ✅ Auto room cleanup (24 hours)

### 3. **Build Your Own**
- ✅ Custom player count (2-10)
- ✅ Personalized prompts
- ✅ Derangement shuffle (no one gets own prompt)
- ✅ Works in both local and group modes

---

## 📁 Complete File Structure

```
Girls-Night/
├── app/
│   ├── _layout.tsx              # Root layout with Context providers
│   ├── index.tsx                # Welcome screen
│   ├── categories.tsx           # Category selection
│   ├── custom-input.tsx         # Build Your Own input flow
│   ├── game.tsx                 # Local game screen
│   ├── end.tsx                  # End game screen
│   └── group/
│       ├── host.tsx             # Create room & select category
│       ├── join.tsx             # Join room with code
│       ├── lobby.tsx            # Waiting room with players list
│       └── group-game.tsx       # Multiplayer game screen
│
├── contexts/
│   ├── GameContext.tsx          # Local game state management
│   └── GroupContext.tsx         # Multiplayer state with Supabase
│
├── data/
│   └── prompts.ts               # 120 prompts (30 per category)
│
├── types/
│   └── game.ts                  # TypeScript interfaces & enums
│
├── utils/
│   └── supabase.ts              # Supabase client configuration
│
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── app.json                     # Expo configuration
├── babel.config.js              # Babel configuration
├── .gitignore                   # Git ignore rules
├── .env.example                 # Environment variables template
├── README.md                    # Main documentation
├── QUICKSTART.md                # Quick setup guide
└── SUPABASE_SETUP.md            # Supabase database setup
```

---

## 🔧 Technology Stack

| Technology | Purpose |
|------------|---------|
| **React Native** | Cross-platform mobile framework |
| **Expo (Managed)** | Development tooling & SDK |
| **TypeScript** | Type safety |
| **expo-router** | File-based navigation |
| **React Context API** | State management |
| **Supabase** | Real-time database & sync |
| **expo-haptics** | Tactile feedback |
| **expo-linear-gradient** | UI gradients |
| **Animated API** | Animations |

---

## 🎮 Game Flow

### Local Mode Flow
```
Welcome Screen
    ↓
Categories Screen → Build Your Own Input (if selected)
    ↓                      ↓
    └──────────────────────┘
              ↓
         Game Screen
              ↓
         End Screen
```

### Group Mode Flow
```
Welcome Screen
    ↓
Host Screen → Select Category → Lobby
    ↓                              ↓
Join Screen → Enter Code ──────→ Lobby
                                   ↓
                            Group Game Screen
                                   ↓
                              End Screen
```

---

## 🎨 UI/UX Features

### Visual Design
- **Dark theme**: `#0A0A0F` background
- **Gradient buttons**: Pink (`#EC4899`) to Purple (`#8B5CF6`)
- **Rounded corners**: Modern, feminine aesthetic
- **Shadow effects**: Depth and polish
- **Smooth animations**: Fade-in, scale, and slide

### Interaction Design
- **Hold-to-reveal**: Long-press mechanic on mobile
- **Auto-reveal**: On web (no long-press support)
- **Haptic feedback**: Tactile responses on button presses
- **Progress indicators**: Visual game progression
- **Loading states**: Activity indicators during async ops

---

## 🧠 State Management

### GameContext (Local Mode)
```typescript
{
  selectedCategory: Category | null
  prompts: string[]
  customPrompts: string[]
  playerCount: number
  currentPrompt: string | null
  usedIndices: Set<number>
  totalPrompts: number
  promptsUsedCount: number
  
  selectCategory()
  setCustomPrompts()
  getNextPrompt()
  resetGame()
}
```

### GroupContext (Multiplayer)
```typescript
{
  roomId: string | null
  players: Player[]
  hostId: string | null
  isHost: boolean
  category: Category | null
  currentPromptIndex: number
  prompts: string[]
  started: boolean
  
  createRoom()
  joinRoom()
  startGame()
  nextPrompt()
  leaveRoom()
  resetGroup()
}
```

---

## 🔐 Supabase Schema

### `rooms` Table
```sql
id                    TEXT PRIMARY KEY
host_id               TEXT NOT NULL
players               JSONB NOT NULL DEFAULT '[]'
category              TEXT
current_prompt_index  INTEGER DEFAULT 0
prompts               JSONB NOT NULL DEFAULT '[]'
started               BOOLEAN DEFAULT FALSE
created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

### RLS Policies
- ✅ Public read access
- ✅ Public insert access
- ✅ Public update access
- ⚠️ Note: In production, consider stricter policies

---

## 🧪 Testing Checklist

### Local Mode
- [ ] Start game from welcome screen
- [ ] Select each category
- [ ] Hold-to-reveal works on mobile
- [ ] Auto-reveal works on web
- [ ] Progress bar updates correctly
- [ ] All 30 prompts load
- [ ] End screen appears after last prompt
- [ ] Play again resets state
- [ ] Build Your Own flow works
- [ ] Derangement prevents self-assignment
- [ ] Haptics trigger on interactions

### Group Mode
- [ ] Host can create room
- [ ] Room code displays correctly
- [ ] Join screen accepts code
- [ ] Players appear in lobby
- [ ] Host badge shows correctly
- [ ] Share code works
- [ ] Game starts for all players
- [ ] Prompts sync across devices
- [ ] Only host can advance prompts
- [ ] Non-hosts see "waiting" message
- [ ] End game cleans up room
- [ ] Leave room works properly

---

## 🚀 Deployment

### Development
```bash
npm start          # Start Metro bundler
npm run ios        # Run on iOS
npm run android    # Run on Android
npm run web        # Run on web
```

### Production Build

#### EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

#### Classic Build
```bash
expo build:ios
expo build:android
```

### Environment Variables
Create `.env.local`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔧 Customization Guide

### Adding New Categories

**1. Update types** (`types/game.ts`):
```typescript
export enum Category {
  // ... existing
  NewCategory = 'new-category',
}
```

**2. Add prompts** (`data/prompts.ts`):
```typescript
[Category.NewCategory]: [
  "Prompt 1",
  // ... 29 more
],
```

**3. Update UI** (`app/categories.tsx` & `app/group/host.tsx`):
```typescript
{ 
  id: Category.NewCategory, 
  name: 'New Category', 
  emoji: '🎯', 
  colors: ['#HEX1', '#HEX2'] 
}
```

### Changing Colors

Edit these values in screen files:
- Background: `#0A0A0F`
- Primary Pink: `#EC4899`
- Primary Purple: `#8B5CF6`
- Secondary Text: `#9CA3AF`
- Card Background: `#1F2937`

### Adjusting Animations

Modify timing in `game.tsx`:
```typescript
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 400,  // ← Change this
  useNativeDriver: true,
})
```

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Web**: Hold-to-reveal disabled (auto-reveals instead)
2. **Supabase**: Public RLS policies (tighten for production)
3. **Room Expiry**: 24 hours (requires cron job or manual cleanup)
4. **No Authentication**: Anonymous rooms (add auth for persistence)

### Future Enhancements
- [ ] User accounts & saved games
- [ ] Custom category creation
- [ ] Voting/reactions system
- [ ] Game statistics & history
- [ ] Push notifications
- [ ] Sound effects
- [ ] Dark/light theme toggle
- [ ] Accessibility improvements
- [ ] Localization (i18n)

---

## 📊 Performance Considerations

### Optimization Tips
1. **Prompts**: Loaded once per category (efficient)
2. **Realtime**: Subscribes only to current room
3. **Animations**: Uses `useNativeDriver` for 60fps
4. **Memory**: Cleans up subscriptions on unmount
5. **Bundle Size**: Uses Expo's automatic code splitting

### Best Practices
- Keep prompts array in memory (not re-rendered)
- Use `Set` for O(1) lookup of used indices
- Debounce Supabase updates if needed
- Lazy load group screens

---

## 🤝 Contributing

### Code Style
- Use TypeScript strict mode
- Follow React hooks best practices
- Keep components under 300 lines
- Use functional components only
- Comment complex logic

### Pull Request Process
1. Fork the repo
2. Create feature branch
3. Write clean, typed code
4. Test on iOS & Android
5. Update documentation
6. Submit PR with description

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@girlsnight.app (if applicable)

---

## 🎉 Acknowledgments

Built with:
- [Expo](https://expo.dev)
- [React Native](https://reactnative.dev)
- [Supabase](https://supabase.com)
- Community packages & contributors

---

**Made with ❤️ for late-night fun with friends! 💅✨**
