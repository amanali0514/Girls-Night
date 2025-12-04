# Development Checklist

## ✅ Initial Setup
- [x] Project scaffolding
- [x] TypeScript configuration
- [x] Expo configuration
- [x] Dependencies installed
- [ ] Run `npm install` to install all packages

## ✅ Core Implementation
- [x] Type definitions (game.ts)
- [x] Prompt data (120 prompts total)
- [x] GameContext for local mode
- [x] GroupContext for multiplayer
- [x] Derangement algorithm
- [x] Supabase client setup

## ✅ Screens - Local Mode
- [x] Welcome screen
- [x] Categories screen
- [x] Custom input screen
- [x] Game screen with hold-to-reveal
- [x] End screen

## ✅ Screens - Group Mode
- [x] Host screen
- [x] Join screen
- [x] Lobby screen
- [x] Group game screen

## ✅ UI/UX Features
- [x] Gradient buttons
- [x] Animations (fade, scale)
- [x] Haptic feedback
- [x] Progress indicators
- [x] Loading states
- [x] Dark theme
- [x] Responsive layouts

## 🔧 Required Before Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase (for Group Mode)

**Option A: Skip for now (Local Mode only)**
- Just run the app, local mode will work perfectly

**Option B: Enable Group Mode**
1. Create Supabase account & project
2. Run SQL from `SUPABASE_SETUP.md`
3. Enable Realtime on `rooms` table
4. Copy `.env.example` to `.env.local`
5. Add your Supabase URL and key
6. Update `utils/supabase.ts` if needed

### 3. Create Placeholder Assets (Optional)
```bash
mkdir -p assets
# Add these files (or use defaults):
# - icon.png (1024x1024)
# - splash.png (1284x2778)
# - adaptive-icon.png (1024x1024)
# - favicon.png (48x48)
```

For now, Expo will use default placeholders.

### 4. Start Development Server
```bash
npm start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator  
- Press `w` for Web
- Scan QR code with Expo Go app

## 🧪 Testing Checklist

### Local Mode Testing
- [ ] App launches successfully
- [ ] Welcome screen displays
- [ ] Can select each category
- [ ] Prompts load correctly
- [ ] Hold-to-reveal works (mobile)
- [ ] Auto-reveal works (web)
- [ ] Progress bar updates
- [ ] Next prompt works
- [ ] End screen appears
- [ ] Play again resets game
- [ ] Back navigation works

### Build Your Own Testing
- [ ] Player count input validates (2-10)
- [ ] Prompt inputs appear
- [ ] All prompts required before start
- [ ] Derangement works (no self-assignment)
- [ ] Custom prompts display correctly

### Group Mode Testing
- [ ] Can create room
- [ ] Room code generates (6 chars)
- [ ] Room code displays
- [ ] Can join with code
- [ ] Players appear in lobby
- [ ] Host badge shows
- [ ] Share code works
- [ ] Start game syncs to all
- [ ] Prompts sync in real-time
- [ ] Only host can advance
- [ ] End game works
- [ ] Leave room cleans up

### Cross-Platform Testing
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Works on Web
- [ ] Haptics on iOS
- [ ] Haptics on Android
- [ ] No haptics on Web (expected)

## 🎨 Customization Tasks

### Prompts
- [ ] Review all 120 prompts for appropriateness
- [ ] Add more prompts if desired
- [ ] Adjust prompt wording
- [ ] Add new categories

### Branding
- [ ] Add app icon
- [ ] Add splash screen
- [ ] Customize colors
- [ ] Adjust fonts
- [ ] Update app name in app.json

### Features
- [ ] Add sound effects (optional)
- [ ] Add confetti animations (optional)
- [ ] Add user profiles (optional)
- [ ] Add game history (optional)

## 🚀 Pre-Launch Checklist

### Code Quality
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Clean code review
- [ ] Comments on complex logic
- [ ] Remove debug logs

### Configuration
- [ ] Update app.json with correct info
- [ ] Set proper bundle identifiers
- [ ] Configure app versions
- [ ] Set up app store metadata

### Security
- [ ] Environment variables secured
- [ ] Supabase RLS policies reviewed
- [ ] No hardcoded secrets
- [ ] API keys in .env files

### Performance
- [ ] App loads quickly
- [ ] Animations are smooth (60fps)
- [ ] No memory leaks
- [ ] Supabase connections clean up

### Testing
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Test with poor internet
- [ ] Test with no internet (local mode)
- [ ] Test edge cases (0 players, 100 players, etc.)

## 📱 Deployment Checklist

### App Store (iOS)
- [ ] Apple Developer account
- [ ] App Store Connect setup
- [ ] Screenshots prepared
- [ ] Privacy policy written
- [ ] Age rating determined
- [ ] Build uploaded via EAS

### Play Store (Android)
- [ ] Google Play Console account
- [ ] App listing created
- [ ] Screenshots prepared
- [ ] Privacy policy uploaded
- [ ] Content rating determined
- [ ] Build uploaded

### Web Deployment
- [ ] Hosting provider chosen
- [ ] Domain configured
- [ ] SSL certificate
- [ ] Build optimized
- [ ] Deployed

## 📚 Documentation Checklist

- [x] README.md comprehensive
- [x] QUICKSTART.md for new users
- [x] SUPABASE_SETUP.md for database
- [x] PROJECT_DOCS.md for developers
- [ ] API documentation (if applicable)
- [ ] Troubleshooting guide
- [ ] FAQ section

## 🎯 Next Steps

1. **Run the app locally**
   ```bash
   npm install
   npm start
   ```

2. **Test local mode** (no setup needed)

3. **Set up Supabase** (for group mode)

4. **Customize prompts & branding**

5. **Test on physical devices**

6. **Deploy to app stores**

---

## 🆘 If You Run Into Issues

### Common Problems

**"Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Expo CLI not found"**
```bash
npm install -g expo-cli
```

**Metro bundler issues**
```bash
npx expo start --clear
```

**Supabase connection fails**
- Check .env.local file exists
- Verify Supabase URL and key
- Ensure Realtime is enabled
- Check RLS policies

**TypeScript errors**
```bash
npx tsc --noEmit
```

### Getting Help
- Read QUICKSTART.md for setup
- Check PROJECT_DOCS.md for details
- Review Expo documentation
- Check GitHub Issues
- Ask in Expo Discord

---

**You're ready to build! 🎉**
