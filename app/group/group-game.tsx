import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useGroup } from '../../contexts/GroupContext';
import * as Haptics from 'expo-haptics';

export default function GroupGameScreen() {
  const router = useRouter();
  const { prompts, currentPromptIndex, isHost, nextPrompt, previousPrompt, leaveRoom } = useGroup();
  const [revealed, setRevealed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const currentPrompt = prompts[currentPromptIndex];
  const isLastPrompt = currentPromptIndex >= prompts.length - 1;
  const isFirstPrompt = currentPromptIndex === 0;
  const progress = prompts.length > 0 ? (currentPromptIndex + 1) / prompts.length : 0;

  useEffect(() => {
    if (revealed || Platform.OS === 'web') {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [revealed]);

  // Reset revealed state when prompt changes
  useEffect(() => {
    setRevealed(false);
  }, [currentPromptIndex]);

  // Auto-reveal on web
  useEffect(() => {
    if (Platform.OS === 'web' && currentPrompt) {
      setRevealed(true);
    }
  }, [currentPrompt]);

  const handleFlipCard = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRevealed(!revealed);
  };

  const handlePreviousPrompt = async () => {
    if (!isHost) {
      Alert.alert('Host Only', 'Only the host can navigate prompts');
      return;
    }

    if (isFirstPrompt) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setRevealed(false);
    await previousPrompt();
  };

  const handleNextPrompt = async () => {
    if (!isHost) {
      Alert.alert('Host Only', 'Only the host can navigate prompts');
      return;
    }

    if (isLastPrompt) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setRevealed(false);
    await nextPrompt();
  };

  const handleEndGame = async () => {
    Alert.alert(
      'End Game',
      'Are you sure you want to end the game? This will end it for everyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Game',
          style: 'destructive',
          onPress: async () => {
            await leaveRoom();
            router.replace('/end');
          },
        },
      ]
    );
  };

  const handleBack = () => {
    Alert.alert(
      'Leave Game',
      'Go back to category selection? This will end the game for everyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go Back',
          style: 'default',
          onPress: async () => {
            await leaveRoom();
            router.back();
          },
        },
      ]
    );
  };

  if (!currentPrompt) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Back Button - Top Left (Host Only) */}
      {isHost && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentPromptIndex + 1} / {prompts.length}
        </Text>
      </View>

      {/* Prompt Area */}
      <View style={styles.promptContainer}>
        {Platform.OS !== 'web' && !revealed && (
          <Text style={styles.instruction}>💕 Tap to reveal 💕</Text>
        )}

        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handleFlipCard}
          style={styles.promptTouchArea}
        >
          <Animated.View
            style={[
              styles.promptCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#EC4899', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promptGradient}
            >
              <Text style={styles.promptText}>{currentPrompt}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Overlay for tap-to-reveal */}
          {Platform.OS !== 'web' && !revealed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>💕 Tap 💕</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {isHost ? (
          <>
            {/* End Game Button - Red */}
            <TouchableOpacity
              style={styles.endGameButton}
              onPress={handleEndGame}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#DC2626', '#EF4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>End Game</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Previous and Next Buttons */}
            <View style={styles.bottomButtonRow}>
              <TouchableOpacity
                style={[styles.navButton, isFirstPrompt && styles.disabledButton]}
                onPress={handlePreviousPrompt}
                activeOpacity={0.8}
                disabled={isFirstPrompt}
              >
                <LinearGradient
                  colors={isFirstPrompt ? ['#374151', '#1F2937'] : ['#374151', '#1F2937']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                >
                  <Text style={[styles.buttonText, isFirstPrompt && styles.disabledText]}>← Previous</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.navButton, isLastPrompt && styles.disabledButton]}
                onPress={handleNextPrompt}
                activeOpacity={0.8}
                disabled={isLastPrompt}
              >
                <LinearGradient
                  colors={['#FF6B9D', '#FEC5E5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                >
                  <Text style={[styles.buttonText, isLastPrompt && styles.disabledText]}>Next →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>Waiting for host...</Text>
          </View>
        )}
      </View>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  backButton: {
    position: 'absolute',
    top: 80,
    left: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#EC4899',
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#1F2937',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#EC4899',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instruction: {
    fontSize: 18,
    color: '#9CA3AF',
    marginBottom: 20,
    textAlign: 'center',
  },
  promptTouchArea: {
    width: '100%',
    maxWidth: 500,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptCard: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#EC4899',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  promptGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  promptText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  overlayText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  endGameButton: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabledButton: {
    opacity: 0.5,
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
  disabledText: {
    color: '#6B7280',
  },
  waitingContainer: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
