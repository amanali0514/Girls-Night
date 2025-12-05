import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useGame } from '../contexts/GameContext';
import * as Haptics from 'expo-haptics';

export default function CustomInputScreen() {
  const router = useRouter();
  const { setCustomPrompts, players } = useGame();
  const [prompts, setPrompts] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState('');

  // Initialize prompts array when component mounts
  React.useEffect(() => {
    if (players.length > 0) {
      setPrompts(Array(players.length).fill(''));
    } else {
      // If no players, redirect back to player setup
      Alert.alert('Error', 'Please set up players first');
      router.back();
    }
  }, [players.length]);

  const handleNextPlayer = () => {
    if (currentPrompt.trim().length === 0) {
      Alert.alert('Empty Prompt', 'Please write a prompt before continuing');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Save current prompt
    const newPrompts = [...prompts];
    newPrompts[currentPlayerIndex] = currentPrompt.trim();
    setPrompts(newPrompts);
    setCurrentPrompt('');

    // Move to next player or start game
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      // All prompts collected, start game
      setCustomPrompts(newPrompts, players.length);
      router.push('/game');
    }
  };

  const currentPlayer = players[currentPlayerIndex] || 'Player';
  const isLastPlayer = currentPlayerIndex === players.length - 1;

  const handlePromptChange = (index: number, text: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = text;
    setPrompts(newPrompts);
  };

  const handleStartGame = () => {
    const filledPrompts = prompts.filter((p) => p.trim().length > 0);
    
    if (filledPrompts.length < prompts.length) {
      Alert.alert('Incomplete Prompts', 'Please fill in all prompts before starting');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setCustomPrompts(filledPrompts, prompts.length);
    router.push('/game');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>🤫</Text>
          <Text style={styles.title}>Secret Prompt</Text>
          <Text style={styles.playerName}>{currentPlayer}'s Turn</Text>
          <Text style={styles.subtitle}>
            Write your prompt secretly!{'\n'}
            Player {currentPlayerIndex + 1} of {players.length}
          </Text>

          <TextInput
            style={styles.promptInput}
            placeholder="Write your prompt here..."
            placeholderTextColor="#6B7280"
            value={currentPrompt}
            onChangeText={setCurrentPrompt}
            multiline
            numberOfLines={6}
            autoFocus
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleNextPlayer}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isLastPlayer ? ['#10B981', '#34D399'] : ['#FF6B9D', '#FEC5E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>
                {isLastPlayer ? 'Start Game 🎉' : 'Next Player →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  promptInput: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#374151',
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 32,
  },
  button: {
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B9D',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  gradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});
