import { Stack } from 'expo-router';
import { GameProvider } from '../contexts/GameContext';
import { GroupProvider } from '../contexts/GroupContext';

export default function RootLayout() {
  return (
    <GameProvider>
      <GroupProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0A0A0F' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="categories" />
          <Stack.Screen name="custom-input" />
          <Stack.Screen name="game" />
          <Stack.Screen name="end" />
          <Stack.Screen name="group/host" />
          <Stack.Screen name="group/join" />
          <Stack.Screen name="group/lobby" />
          <Stack.Screen name="group/group-game" />
        </Stack>
      </GroupProvider>
    </GameProvider>
  );
}
