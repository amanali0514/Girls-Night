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
  const { setCustomPrompts } = useGame();
  const [playerCount, setPlayerCountState] = useState<string>('');
  const [prompts, setPrompts] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'count' | 'prompts'>('count');

  const handlePlayerCountSubmit = () => {
    const count = parseInt(playerCount);
    
    if (isNaN(count) || count < 2 || count > 10) {
      Alert.alert('Invalid Number', 'Please enter a number between 2 and 10');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setPrompts(Array(count).fill(''));
    setCurrentStep('prompts');
  };

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

  if (currentStep === 'count') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <Text style={styles.emoji}>🎨</Text>
            <Text style={styles.title}>Build Your Own</Text>
            <Text style={styles.subtitle}>How many players?</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter number (2-10)"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
              value={playerCount}
              onChangeText={setPlayerCountState}
              maxLength={2}
              autoFocus
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handlePlayerCountSubmit}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10B981', '#34D399']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>Next</Text>
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
          <Text style={styles.title}>Enter Prompts</Text>
          <Text style={styles.subtitle}>
            Each player writes a prompt for someone else
          </Text>

          <View style={styles.promptsContainer}>
            {prompts.map((prompt, index) => (
              <View key={index} style={styles.promptWrapper}>
                <Text style={styles.promptLabel}>Player {index + 1}</Text>
                <TextInput
                  style={styles.promptInput}
                  placeholder="Type your prompt..."
                  placeholderTextColor="#6B7280"
                  value={prompt}
                  onChangeText={(text) => handlePromptChange(index, text)}
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
            onPress={() => setCurrentStep('count')}
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
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
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 24,
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
