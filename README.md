# Girls Night 💅✨

A mobile party game for girls aged 15-25. Pass the phone around and answer fun prompts with your friends!

## Features

- 🎮 **Local Mode**: Pass-the-phone gameplay with no internet required
- 🌐 **Group Mode**: Multiplayer rooms with real-time sync via Supabase
- 🎨 **Build Your Own**: Create custom prompts for your group
- 💅 **4 Categories**: 
  - Confessions 😌 - Juicy and fun
  - Dare 💪 - PG-13 challenges
  - Toxic 😈 - Spicy and dramatic
  - Who's More Likely To ✨ - Wholesome vibes
- 📱 **Hold to Reveal**: Interactive prompt reveal mechanic
- ✨ **Beautiful UI**: Modern gradient design with haptic feedback

## Tech Stack

- **React Native** + **Expo** (managed workflow)
- **TypeScript**
- **expo-router** for navigation
- **Supabase** for real-time multiplayer
- **expo-haptics** for tactile feedback
- **React Context API** for state management

## Project Structure

```
app/
  _layout.tsx           # Root layout with providers
  index.tsx             # Welcome screen
  categories.tsx        # Category selection
  custom-input.tsx      # Build Your Own flow
  game.tsx              # Local game screen
  end.tsx               # End game screen
  group/
    host.tsx            # Create multiplayer room
    join.tsx            # Join room with code
    lobby.tsx           # Waiting room
    group-game.tsx      # Multiplayer game screen

contexts/
  GameContext.tsx       # Local game state
  GroupContext.tsx      # Multiplayer state with Supabase

data/
  prompts.ts            # 120 prompts (30 per category)

types/
  game.ts               # TypeScript definitions

utils/
  supabase.ts           # Supabase client config
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator / Android Emulator (or Expo Go app)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amanali0514/Girls-Night.git
   cd Girls-Night
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase** (for group mode)
   
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL from `SUPABASE_SETUP.md` in your SQL editor
   - Enable Realtime for the `rooms` table
   - Copy `.env.example` to `.env.local` and add your credentials:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your-project-url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

4. **Update Supabase config** (if not using env vars)
   
   Edit `utils/supabase.ts` with your credentials

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on your device**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## Game Modes

### Local Mode (Pass-the-Phone)

1. Tap **Start Local Game**
2. Choose a category or Build Your Own
3. Pass the phone around
4. Hold to reveal each prompt
5. Tap Next to continue

### Group Mode (Multiplayer)

**Host:**
1. Tap **Start Group Game**
2. Choose a category
3. Share the 6-digit room code
4. Wait for players to join
5. Tap **Start Game** when ready

**Join:**
1. Tap **Join Group Game**
2. Enter room code and your name
3. Wait in lobby for host to start
4. Everyone sees the same prompts in sync

## Build Your Own Mode

1. Select **Build Your Own** category
2. Enter number of players (2-10)
3. Each player writes one prompt
4. Prompts are **deranged** (shuffled so no one gets their own)
5. Play through custom prompts

## Key Features Explained

### Derangement Algorithm
Ensures that in Build Your Own mode, no player receives their own prompt. Uses a shuffle-and-check algorithm to create a valid permutation.

### Hold-to-Reveal Mechanic
- **Mobile**: Hold down on the prompt card to reveal it
- **Web**: Auto-reveals (long press disabled)
- Includes haptic feedback on press

### Realtime Sync (Group Mode)
- Uses Supabase Realtime channels
- Host controls game progression
- All players see updates instantly
- Auto-cleanup of old rooms (24 hours)

## Development

### Adding New Categories

1. Add category to `types/game.ts` enum
2. Add 30 prompts to `data/prompts.ts`
3. Add category button to `app/categories.tsx` and `app/group/host.tsx`

### Testing

- **Local Mode**: Works offline, no Supabase needed
- **Group Mode**: Requires Supabase setup
- **Web**: Hold-to-reveal is disabled, prompts auto-reveal

## Building for Production

### iOS
```bash
npx expo build:ios
```

### Android
```bash
npx expo build:android
```

### Web
```bash
npx expo export:web
```

## Troubleshooting

### Supabase Connection Issues
- Check your `.env.local` or `utils/supabase.ts` credentials
- Ensure Realtime is enabled in Supabase dashboard
- Verify RLS policies are set correctly

### Haptics Not Working
- Haptics only work on physical devices
- iOS Simulator doesn't support haptics
- Web platform has haptics disabled

### Room Not Found
- Room codes expire after 24 hours
- Codes are case-insensitive
- Host must create room before others join

## License

MIT License - feel free to use and modify!

## Contributing

Pull requests welcome! Please ensure:
- TypeScript types are correct
- Code follows existing style
- Test on both iOS and Android

## Credits

Built with ❤️ using Expo, React Native, and Supabase

---

**Have fun playing Girls Night! 💅✨**
