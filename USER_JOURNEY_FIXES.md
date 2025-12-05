# User Journey Fixes - Girls Night App

## Issues Fixed

### 1. **Added Player Setup for Local Mode**
**Problem**: Local mode went directly to categories without collecting player names, making the "Build Your Own" derangement feature pointless since we didn't know who the players were.

**Solution**: 
- Created new `player-setup.tsx` screen that collects:
  - Number of players (2-10)
  - Individual player names
  - Validates for duplicate names
- Updated the welcome screen to route to player setup instead of categories

**New Flow**:
```
Welcome → Player Setup (count + names) → Categories → Game/Custom Input
```

### 2. **Improved Build Your Own with Player Names**
**Problem**: The custom input screen asked for player count again and showed generic "Player 1", "Player 2" labels, making it confusing and redundant.

**Solution**:
- Updated `custom-input.tsx` to use player names from context
- Now shows actual player names (e.g., "Sarah", "Emma") instead of "Player 1"
- Removed redundant player count input
- Better UX with personalized prompts like "Sarah, write your prompt..."

### 3. **Added Build Your Own to Group Mode**
**Problem**: Group mode was missing the Build Your Own option, limiting gameplay to only preset categories.

**Solution**:
- Added Build Your Own to the host screen categories
- Created new `group/custom-prompts.tsx` screen for multiplayer custom prompts
- Implemented derangement algorithm for group mode
- Shows room code so players can still join while prompts are being created

**Group Build Your Own Flow**:
```
Host Screen → Select "Build Your Own" → Custom Prompts Screen → Lobby → Game
```

### 4. **Updated Context Management**
**Problem**: GameContext didn't track player names, making personalized features impossible.

**Solution**:
- Added `players: string[]` to GameContextType
- Added `setPlayers()` method
- Updated resetGame to clear player names
- Now properly maintains player state throughout the game

## Updated User Journeys

### Local Mode Journey (Complete)
```
1. Welcome Screen
2. Player Setup
   - Enter number of players
   - Enter each player's name
3. Category Selection
   - Confessions / Dare / Toxic / Chill / Build Your Own
4a. Preset Category → Game Screen
4b. Build Your Own → Custom Input (with player names) → Game Screen
5. End Screen
```

### Group Mode Journey (Complete)

**Host**:
```
1. Welcome Screen
2. Host Screen → Select Category
3a. Preset Category → Lobby → Game
3b. Build Your Own → Custom Prompts → Lobby → Game
```

**Joiner**:
```
1. Welcome Screen
2. Join Screen → Enter code & name
3. Lobby → Wait for host
4. Game Screen
```

## Files Modified

1. **Created**: `app/player-setup.tsx` - New player setup screen
2. **Created**: `app/group/custom-prompts.tsx` - Group mode custom prompts
3. **Modified**: `app/index.tsx` - Routes to player-setup instead of categories
4. **Modified**: `app/custom-input.tsx` - Uses player names from context
5. **Modified**: `app/group/host.tsx` - Added Build Your Own option
6. **Modified**: `app/_layout.tsx` - Added new screen routes
7. **Modified**: `contexts/GameContext.tsx` - Added player names management
8. **Modified**: `types/game.ts` - Updated GameContextType interface

## Benefits

✅ **Clear User Journey**: Players now go through logical setup steps
✅ **Personalized Experience**: Player names are used throughout the app
✅ **Feature Parity**: Both local and group modes support Build Your Own
✅ **Better UX**: No redundant inputs, clearer labels
✅ **Derangement Works**: Now meaningful with actual player identities
✅ **Consistent Flow**: Similar patterns in both game modes

## Testing Recommendations

1. **Local Mode**:
   - Test with 2 players minimum
   - Test with 10 players maximum
   - Verify duplicate name validation
   - Check Build Your Own with player names
   - Ensure derangement works correctly

2. **Group Mode**:
   - Test Build Your Own with multiple devices
   - Verify room creation with custom prompts
   - Check that prompts sync to all players
   - Test derangement in multiplayer context

3. **Edge Cases**:
   - Back navigation from each screen
   - Player name validation (empty, duplicates)
   - Missing player names in custom input
   - Room code sharing with Build Your Own
