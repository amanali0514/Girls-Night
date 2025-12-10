# 🎉 Girls Night - Getting Started

## You've Got Everything You Need!

Your complete mobile party game is ready. Here's how to get it running in the next 5 minutes.

---

## 🚀 Quick Start (Choose One)

### Option A: Automated Setup ⚡
```bash
# Make script executable (first time only)
chmod +x setup.sh

# Run setup
./setup.sh

# Start the app
npm start
```

### Option B: Manual Setup 🛠
```bash
# Install dependencies
npm install

# Start development server
npm start
```

That's it! The app will open, showing you a QR code.

---

## 📱 Running on Your Device

### iOS (Mac required)
1. Start the server: `npm start`
2. Press `i` to open iOS Simulator
   - Or download "Expo Go" from App Store
   - Scan the QR code with Camera app

### Android
1. Start the server: `npm start`
2. Press `a` to open Android Emulator
   - Or download "Expo Go" from Play Store
   - Scan the QR code in Expo Go app

### Web Browser
1. Start the server: `npm start`
2. Press `w` to open in browser
   - Note: Hold-to-reveal doesn't work on web (prompts auto-show)

---

## 🎮 Testing the App

### Test Local Mode (No Setup Required!)

1. **Start the app**
2. Tap **"Start Local Game"**
3. Choose any category (try "Would You Rather ✨")
4. **Hold down** on the screen to reveal the prompt
5. Tap **"Next Prompt"**
6. Play through a few prompts
7. See the end screen

✅ **If this works, your app is fully functional for local mode!**

### Test Build Your Own

1. Tap **"Start Local Game"**
2. Choose **"Build Your Own 🎨"**
3. Enter number of players (try 3)
4. Enter 3 prompts
5. Tap **"Start Game"**
6. Notice how prompts are shuffled (derangement)

---

## 🌐 Setting Up Group Mode (Optional)

Group mode requires a Supabase backend. **Skip this if you just want local mode.**

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up (free tier is fine)

### Step 2: Create Project
1. Click "New Project"
2. Fill in:
   - Name: `girls-night`
   - Database Password: (save this!)
   - Region: Choose closest to you
3. Wait 2-3 minutes for setup

### Step 3: Set Up Database
1. Click **SQL Editor** in sidebar
2. Click **New Query**
3. Copy & paste from `SUPABASE_SETUP.md`:

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

4. Click **Run** (bottom right)
5. Should see "Success. No rows returned"

### Step 4: Enable Realtime
1. Click **Database** > **Replication** in sidebar
2. Find the `rooms` table
3. Toggle it **ON**
4. Check all columns

### Step 5: Get Your Credentials
1. Click **Settings** > **API** in sidebar
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string)

### Step 6: Add to Your App
1. In your project, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
   ```

3. **Restart your dev server** (Ctrl+C, then `npm start`)

### Step 7: Test Group Mode
1. Tap **"Start Group Game 🎉"**
2. Choose a category
3. You'll see a 6-digit room code
4. Open app on another device (or in browser)
5. Tap **"Join Group Game"**
6. Enter the code
7. Both devices should sync!

✅ **If you see both players in the lobby, group mode works!**

---

## 🎨 What's Included

Your app has **everything** working:

### ✅ Features
- 4 categories with 30 prompts each (120 total)
- Build Your Own custom prompts
- Hold-to-reveal mechanic
- Haptic feedback
- Smooth animations
- Progress tracking
- Beautiful gradients
- Dark theme

### ✅ Game Modes
- **Local Mode**: Pass-the-phone (works offline)
- **Group Mode**: Multiplayer rooms (needs Supabase)

### ✅ All Screens
- Welcome screen
- Category selection
- Custom input flow
- Game screen
- End screen
- Host screen
- Join screen
- Lobby
- Group game screen

---

## 📁 Project Files Explained

```
Girls-Night/
├── app/                    # All screens (10 files)
├── contexts/              # State management (2 files)
├── data/                  # Prompts (120 prompts)
├── types/                 # TypeScript types
├── utils/                 # Supabase config
├── assets/                # App icons (add yours)
├── README.md              # Main docs
├── QUICKSTART.md          # This file expanded
├── CHECKLIST.md           # Testing checklist
├── PROJECT_DOCS.md        # Technical reference
└── SUPABASE_SETUP.md      # Database setup
```

---

## 🔧 Customizing Your App

### Change Prompts
Edit `data/prompts.ts`:
```typescript
[Category.Confessions]: [
  "Your new prompt here",
  // ... 29 more
],
```

### Change Colors
Edit any screen file:
- Background: `#0A0A0F`
- Pink: `#EC4899`
- Purple: `#8B5CF6`

### Add Category
1. Edit `types/game.ts` - add to enum
2. Edit `data/prompts.ts` - add 30 prompts
3. Edit `app/categories.tsx` - add button

---

## 🐛 Troubleshooting

### "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### "Expo not found"
```bash
npm install -g expo-cli
# Or use: npx expo start
```

### "Port already in use"
```bash
# Kill the process on port 8081
lsof -ti:8081 | xargs kill
npm start
```

### Supabase Not Working
1. Check `.env.local` exists
2. Verify URL and key are correct
3. Restart dev server (Ctrl+C, `npm start`)
4. Check Realtime is enabled in Supabase
5. Verify RLS policies in database

### App Won't Load
```bash
# Clear cache
npx expo start --clear

# Or reset metro bundler
rm -rf .expo
npm start
```

---

## 📱 Building for Production

### Using EAS (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build
eas build --platform ios
eas build --platform android
```

### Classic Build
```bash
expo build:ios
expo build:android
```

---

## ✨ You're Ready!

**Your app is complete and working.** 

Just run:
```bash
npm start
```

And start playing! 🎉

### What Works Right Now:
- ✅ Local mode (pass-the-phone)
- ✅ All 4 categories
- ✅ Build Your Own
- ✅ Beautiful UI
- ✅ Animations & haptics
- ⚠️ Group mode (after Supabase setup)

### Next Steps:
1. Test the app
2. Customize prompts
3. Add your branding
4. Set up Supabase (optional)
5. Deploy to app stores

---

## 💡 Tips

- **Start simple**: Test local mode first
- **Add Supabase later**: Group mode is optional
- **Customize prompts**: Make it your own
- **Test on real devices**: Simulators don't show everything
- **Have fun**: This is a party game! 🎉

---

## 📚 More Help

- **Setup issues?** → Read QUICKSTART.md
- **Testing?** → Check CHECKLIST.md
- **Technical details?** → See PROJECT_DOCS.md
- **Supabase?** → Follow SUPABASE_SETUP.md

---

**Enjoy building Girls Night! 💅✨**

Questions? Check the docs or review the code comments.
