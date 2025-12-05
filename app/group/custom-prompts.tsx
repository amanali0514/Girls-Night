import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useGroup } from '../../contexts/GroupContext';
import { supabase } from '../../utils/supabase';
import * as Haptics from 'expo-haptics';

// Derangement shuffle: ensures no player gets their own prompt
function derange(list: string[]): string[] {
  const arr = [...list];
  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts < maxAttempts) {
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    // Check if it's a valid derangement
    const isValid = arr.every((item, index) => item !== list[index]);
    if (isValid) return arr;

    attempts++;
  }

  // Fallback: just shuffle if we can't find a valid derangement
  return arr;
}

export default function GroupCustomPromptsScreen() {
  const router = useRouter();
  const { roomId, players, isHost } = useGroup();
  const [prompts, setPrompts] = useState<{ [playerId: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [allPromptsSubmitted, setAllPromptsSubmitted] = useState(false);

  useEffect(() => {
    if (!roomId || !isHost) {
      Alert.alert('Error', 'Only the host can set up Build Your Own mode');
      router.back();
    }
  }, [roomId, isHost]);

  const handlePromptChange = (playerId: string, text: string) => {
    setPrompts((prev: { [playerId: string]: string }) => ({ ...prev, [playerId]: text }));
  };

  const handleContinue = async () => {
    // Check if all players have submitted prompts
    const submittedCount = Object.keys(prompts).filter(
      id => prompts[id]?.trim().length > 0
    ).length;

    if (submittedCount < players.length) {
      Alert.alert(
        'Incomplete Prompts', 
        `${submittedCount} of ${players.length} prompts submitted. Please fill in all prompts.`
      );
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setLoading(true);

    try {
      // Get prompts in player order
      const promptsList = players.map(player => prompts[player.id] || '');
      
      // Apply derangement
      const derangedPrompts = derange(promptsList);

      // Update the room with the custom prompts
      const { error } = await supabase
        .from('rooms')
        .update({ prompts: derangedPrompts })
        .eq('id', roomId);

      if (error) throw error;

      router.push('/group/lobby');
    } catch (error) {
      Alert.alert('Error', 'Failed to save prompts. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Setting up custom game...</Text>
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.emoji}>🎨</Text>
          <Text style={styles.title}>Build Your Own</Text>
          <Text style={styles.subtitle}>
            Each player writes a prompt
          </Text>
          <Text style={styles.info}>
            Room Code: <Text style={styles.roomCode}>{roomId}</Text>
          </Text>

          <View style={styles.promptsContainer}>
            {players.map((player) => (
              <View key={player.id} style={styles.promptWrapper}>
                <Text style={styles.promptLabel}>
                  {player.name} {player.id === players[0]?.id && '(Host)'}
                </Text>
                <TextInput
                  style={styles.promptInput}
                  placeholder={`${player.name}, write your prompt...`}
                  placeholderTextColor="#6B7280"
                  value={prompts[player.id] || ''}
                  onChangeText={(text: string) => handlePromptChange(player.id, text)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={loading}
          >
            <LinearGradient
              colors={['#10B981', '#34D399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>Continue to Lobby</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 32,
    textAlign: 'center',
  },
  roomCode: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 16,
  },
  promptsContainer: {
    width: '100%',
    gap: 20,
    marginBottom: 32,
  },
  promptWrapper: {
    width: '100%',
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  promptInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 2,
    borderColor: '#374151',
  },
  button: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
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
  backButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});
