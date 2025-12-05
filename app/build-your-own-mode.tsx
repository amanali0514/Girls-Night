import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useGame } from '../contexts/GameContext';
import { Category } from '../types/game';
import * as Haptics from 'expo-haptics';

export default function BuildYourOwnModeScreen() {
  const router = useRouter();
  const { selectCategory } = useGame();

  const handleModeSelect = (mode: 'local' | 'multiplayer') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    selectCategory(Category.BuildYourOwn);

    if (mode === 'local') {
      router.push('/player-setup');
    } else {
      router.push('/group/custom-prompts-host');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <Text style={styles.emoji}>🎨</Text>
        <Text style={styles.title}>Build Your Own</Text>
        <Text style={styles.subtitle}>Choose how you want to play</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleModeSelect('local')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#EC4899', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>Play with 1 Phone 📱</Text>
              <Text style={styles.buttonSubtext}>Pass the phone around</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleModeSelect('multiplayer')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>Start a Live Game 🎉</Text>
              <Text style={styles.buttonSubtext}>Everyone uses their own phone</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 60,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  button: {
    width: '100%',
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
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  backButton: {
    alignSelf: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});
