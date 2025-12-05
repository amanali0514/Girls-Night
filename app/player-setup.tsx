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

export default function PlayerSetupScreen() {
  const router = useRouter();
  const { setPlayers } = useGame();
  const [playerCount, setPlayerCountState] = useState<string>('');
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'count' | 'names'>('count');

  const handlePlayerCountSubmit = () => {
    const count = parseInt(playerCount);
    
    if (isNaN(count) || count < 2 || count > 10) {
      Alert.alert('Invalid Number', 'Please enter a number between 2 and 10');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setPlayerNames(Array(count).fill(''));
    setCurrentStep('names');
  };

  const handleNameChange = (index: number, text: string) => {
    const newNames = [...playerNames];
    newNames[index] = text;
    setPlayerNames(newNames);
  };

  const handleContinue = () => {
    const filledNames = playerNames.filter((name: string) => name.trim().length > 0);
    
    if (filledNames.length < playerNames.length) {
      Alert.alert('Incomplete Names', 'Please fill in all player names before continuing');
      return;
    }

    // Check for duplicate names
    const uniqueNames = new Set(filledNames.map((name: string) => name.trim().toLowerCase()));
    if (uniqueNames.size !== filledNames.length) {
      Alert.alert('Duplicate Names', 'Please use unique names for each player');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setPlayers(filledNames.map((name: string) => name.trim()));
    router.push('/custom-input');
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
            <Text style={styles.emoji}>👯‍♀️</Text>
            <Text style={styles.title}>Player Setup</Text>
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
                colors={['#EC4899', '#8B5CF6']}
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
          <Text style={styles.title}>Enter Names</Text>
          <Text style={styles.subtitle}>
            So we know who's playing!
          </Text>

          <View style={styles.namesContainer}>
            {playerNames.map((name: string, index: number) => (
              <View key={index} style={styles.nameWrapper}>
                <Text style={styles.nameLabel}>Player {index + 1}</Text>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Enter name..."
                  placeholderTextColor="#6B7280"
                  value={name}
                  onChangeText={(text: string) => handleNameChange(index, text)}
                  autoCapitalize="words"
                />
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#EC4899', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>Continue</Text>
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
    fontSize: 36,
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
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#374151',
  },
  namesContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  nameWrapper: {
    width: '100%',
  },
  nameLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
    fontWeight: '600',
  },
  nameInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#374151',
  },
  button: {
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#EC4899',
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
    padding: 18,
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});
