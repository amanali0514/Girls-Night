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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Build Your Own</Text>
          <Text style={styles.subtitle}>
            Each player writes a prompt for someone else
          </Text>

          <View style={styles.promptsContainer}>
            {prompts.map((prompt: string, index: number) => (
              <View key={index} style={styles.promptWrapper}>
                <Text style={styles.promptLabel}>{players[index]}</Text>
                <TextInput
                  style={styles.promptInput}
                  placeholder={`${players[index]}, write your prompt...`}
                  placeholderTextColor="#6B7280"
                  value={prompt}
                  onChangeText={(text: string) => handlePromptChange(index, text)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleStartGame}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#34D399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>Start Game</Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
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
    marginBottom: 40,
    textAlign: 'center',
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
  },
  button: {
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    borderRadius: 16,
    marginTop: 'auto',
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
