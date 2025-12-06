import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useGroup } from '../../contexts/GroupContext';
import { supabase } from '../../utils/supabase';
import * as Haptics from 'expo-haptics';

const TIMER_DURATION = 25; // 25 seconds

export default function SubmitPromptScreen() {
  const router = useRouter();
  const { submitPrompt, players, myPlayerId, roomId } = useGroup();
  const [prompt, setPrompt] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Find current player
  const currentPlayer = players.find(p => p.id === myPlayerId);
  const playerName = currentPlayer?.name || 'Player';

  // Timer countdown
  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit empty if time runs out
          if (!submitted) {
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted]);

  // Check if all players have submitted and compile prompts
  useEffect(() => {
    const checkAndCompilePrompts = async () => {
      const allSubmitted = players.every(p => p.promptSubmitted);
      
      if (allSubmitted && submitted) {
        // All players have submitted, compile prompts and start game
        try {
          // Derangement shuffle helper
          const derange = (list: string[]): string[] => {
            const arr = [...list];
            let attempts = 0;
            const maxAttempts = 1000;

            while (attempts < maxAttempts) {
              for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
              }
              const isValid = arr.every((item, index) => item !== list[index]);
              if (isValid) return arr;
              attempts++;
            }
            return arr;
          };

          // Get prompts in player order
          const promptsList = players.map(p => p.prompt || '').filter(Boolean);
          
          // Apply derangement
          const derangedPrompts = derange(promptsList);

          // Select random first player
          const randomIndex = Math.floor(Math.random() * players.length);
          const firstPlayerId = players[randomIndex].id;

          // Update the room with the custom prompts and first player
          await supabase
            .from('rooms')
            .update({ 
              prompts: derangedPrompts,
              prompt_submission_phase: false,
              active_player_id: firstPlayerId
            })
            .eq('id', roomId);

          // Navigate to game
          router.replace('/group/group-game');
        } catch (error) {
          console.error('Error compiling prompts:', error);
        }
      }
    };

    checkAndCompilePrompts();
  }, [players, submitted]);

  const handleSubmit = async () => {
    if (submitted) return;

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      Alert.alert('Empty Prompt', 'Please write a prompt before submitting!');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setLoading(true);

    try {
      await submitPrompt(trimmedPrompt);
      setSubmitted(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit prompt. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTimerColor = () => {
    if (timeLeft > 15) return '#10B981'; // Green
    if (timeLeft > 5) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };

  const submittedCount = players.filter(p => p.promptSubmitted).length;
  const totalPlayers = players.length;

  if (submitted) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingEmoji}>⏳</Text>
          <Text style={styles.waitingTitle}>Prompt Submitted!</Text>
          <Text style={styles.waitingSubtitle}>
            Waiting for other players...
          </Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {submittedCount} / {totalPlayers} players ready
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(submittedCount / totalPlayers) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Timer */}
          <View style={[styles.timerContainer, { borderColor: getTimerColor() }]}>
            <Text style={[styles.timerText, { color: getTimerColor() }]}>
              {timeLeft}s
            </Text>
          </View>

          <Text style={styles.emoji}>✍️</Text>
          <Text style={styles.title}>Your Turn, {playerName}!</Text>
          <Text style={styles.subtitle}>
            Write your prompt quickly
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Write your prompt here..."
            placeholderTextColor="#6B7280"
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
            maxLength={200}
            autoFocus
          />

          <Text style={styles.charCount}>
            {prompt.length} / 200 characters
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={loading || !prompt.trim()}
          >
            <LinearGradient
              colors={prompt.trim() ? ['#10B981', '#34D399'] : ['#374151', '#1F2937']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Submitting...' : 'Submit Prompt'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.info}>
            Room Code: <Text style={styles.roomCode}>{roomId}</Text>
          </Text>
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
  timerContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  emoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#6B7280',
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 24,
  },
  roomCode: {
    fontWeight: 'bold',
    color: '#10B981',
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  waitingEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  waitingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  waitingSubtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
  },
  progressText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#1F2937',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 6,
  },
});
