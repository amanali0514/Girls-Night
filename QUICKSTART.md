# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Choose Your Mode

#### Option A: Local Mode Only (No Setup Required)
Just start the app! Local mode works without any configuration.

```bash
npm start
```

Then press `i` (iOS) or `a` (Android).

#### Option B: Full Experience with Multiplayer

**Step 1:** Create a Supabase account at [supabase.com](https://supabase.com)

**Step 2:** Create a new project

**Step 3:** Run this SQL in the Supabase SQL Editor:

```sql
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  players JSONB NOT NULL DEFAULT '[]',
  category TEXT,
  current_prompt_index INTEGER DEFAULT 0,
  prompts JSONB NOT NULL DEFAULT '[]',
  started BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON rooms
  FOR UPDATE USING (true);
```

**Step 4:** Enable Realtime
- Go to Database > Replication
- Enable replication for `rooms` table

**Step 5:** Copy your credentials
- Go to Settings > API
- Copy the URL and `anon` key

**Step 6:** Create `.env.local` file:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Step 7:** Update `utils/supabase.ts` to use env vars:
```typescript
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
```

**Step 8:** Start the app
```bash
npm start
```

### 3. Test the App

#### Test Local Mode:
1. Tap "Start Local Game"
2. Choose any category
3. Play through some prompts

#### Test Group Mode:
1. Tap "Start Group Game"
2. Choose a category
3. Note the room code
4. Open app on another device (or simulator)
5. Tap "Join Group Game"
6. Enter the code
7. Start the game from host device

## 📱 Platform-Specific Notes

### iOS
- Requires macOS with Xcode
- Run: `npm run ios`
- Or use Expo Go app on physical device

### Android
- Requires Android Studio
- Run: `npm run android`
- Or use Expo Go app on physical device

### Web
- Run: `npm run web`
- Hold-to-reveal is disabled (prompts auto-show)
- No haptic feedback

## 🐛 Common Issues

### "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### Expo CLI not found
```bash
npm install -g expo-cli
```

### Supabase connection fails
- Double-check your URL and key in `.env.local`
- Make sure Realtime is enabled
- Check RLS policies are created

### Metro bundler cache issues
```bash
npx expo start --clear
```

## 🎮 How to Play

### Local Mode
1. One phone passed around the group
2. Hold screen to reveal prompt
3. Answer or perform the prompt
4. Pass to next person

### Group Mode
1. Everyone opens app on their device
2. One person hosts and shares code
3. Everyone joins the same room
4. Host controls game flow
5. All devices show same prompts

## 🎨 Customization

Want to add your own prompts? Edit `data/prompts.ts`:

```typescript
export const prompts = {
  [Category.Confessions]: [
    "Your custom prompt here",
    // ... 29 more
  ],
  // ... other categories
};
```

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Supabase Docs](https://supabase.com/docs)
- [expo-router Guide](https://docs.expo.dev/router/introduction/)

## ✨ Ready to Play!

You're all set! Grab some friends and start playing Girls Night 💅✨
