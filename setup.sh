#!/bin/bash

# Girls Night Setup Script
# This script automates the initial setup process

set -e

echo "🎉 Girls Night Setup Script"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""

# Check if Expo CLI is installed globally
if ! command -v expo &> /dev/null; then
    echo "⚠️  Expo CLI not found globally"
    echo "You can install it with: npm install -g expo-cli"
    echo "Or use npx expo commands"
else
    echo "✅ Expo CLI version: $(expo --version)"
fi

echo ""
echo "================================"
echo "🎊 Setup Complete!"
echo "================================"
echo ""
echo "📱 Next Steps:"
echo ""
echo "1️⃣  Start the development server:"
echo "    npm start"
echo ""
echo "2️⃣  Run on a device:"
echo "    • Press 'i' for iOS simulator"
echo "    • Press 'a' for Android emulator"
echo "    • Press 'w' for web browser"
echo "    • Scan QR code with Expo Go app"
echo ""
echo "3️⃣  For Group Mode (optional):"
echo "    • Read SUPABASE_SETUP.md"
echo "    • Create Supabase project"
echo "    • Add credentials to .env.local"
echo ""
echo "📚 Documentation:"
echo "    • README.md - Main documentation"
echo "    • QUICKSTART.md - Quick setup guide"
echo "    • CHECKLIST.md - Development checklist"
echo "    • PROJECT_DOCS.md - Complete reference"
echo ""
echo "💅✨ Ready to build Girls Night!"
