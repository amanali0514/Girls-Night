# Assets Directory

This directory contains app icons and splash screens.

## Required Assets

For a production app, you'll need:

### App Icon
- **icon.png** (1024x1024 px)
  - Main app icon
  - Should be square with no transparency
  - Used for iOS and Android

### Splash Screen
- **splash.png** (1284x2778 px)
  - Loading screen
  - Background color: #0A0A0F (matches app theme)
  - Can include logo/branding

### Android Adaptive Icon
- **adaptive-icon.png** (1024x1024 px)
  - Android-specific adaptive icon
  - Keep important content in center 66% circle

### Web Favicon
- **favicon.png** (48x48 px)
  - Web browser icon

## Temporary Setup

For development, Expo will use default placeholder images. You can:

1. **Use online tools**:
   - [Figma](https://figma.com) - Design custom icons
   - [Canva](https://canva.com) - Quick icon creation
   - [AppIcon](https://appicon.co) - Generate all sizes

2. **Quick placeholder** (for testing):
   ```bash
   # macOS/Linux - create simple colored squares
   # (requires ImageMagick)
   convert -size 1024x1024 xc:#EC4899 icon.png
   convert -size 1284x2778 xc:#0A0A0F splash.png
   ```

3. **Skip for now**: Expo handles missing assets gracefully during development

## Design Guidelines

### Colors (from app theme)
- Background: `#0A0A0F` (dark)
- Pink: `#EC4899`
- Purple: `#8B5CF6`
- White: `#FFFFFF`

### Style
- Modern and feminine
- Clean and minimal
- Fun but sophisticated
- Age appropriate (15-25)

### Suggested Icon Ideas
- 💅 Nail polish emoji style
- ✨ Sparkle/star pattern
- 👑 Crown motif
- 🎀 Ribbon/bow design
- Combined elements with gradient background

## Production Checklist

Before app store submission:
- [ ] All asset sizes created
- [ ] High resolution (no pixelation)
- [ ] Proper margins/safe areas
- [ ] Consistent branding
- [ ] No copyrighted elements
- [ ] Tested on all devices
- [ ] Approved by design team

## Tools & Resources

- **Icon Generators**:
  - https://www.appicon.co
  - https://www.makeappicon.com
  - https://romannurik.github.io/AndroidAssetStudio/

- **Design Tools**:
  - Figma (free)
  - Adobe Illustrator
  - Sketch
  - Canva

- **Expo Guidelines**:
  - https://docs.expo.dev/develop/user-interface/app-icons/
  - https://docs.expo.dev/develop/user-interface/splash-screen/
