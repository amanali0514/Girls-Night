import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useGame } from '../contexts/GameContext';
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');

export default function GameScreen() {
  const router = useRouter();
  const { currentPrompt, getNextPrompt, promptsUsedCount, totalPrompts } = useGame();
  const [revealed, setRevealed] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Load first prompt
    if (!currentPrompt) {
      const hasMore = getNextPrompt();
      if (!hasMore) {
        router.replace('/end');
      }
    }
  }, []);

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

  const handlePressIn = () => {
    if (Platform.OS === 'web') return;
    setIsHolding(true);
    setRevealed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (Platform.OS === 'web') return;
    setIsHolding(false);
    setRevealed(false);
  };

  const handleNextPrompt = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setRevealed(false);
    setIsHolding(false);

    setTimeout(() => {
      const hasMore = getNextPrompt();
      if (!hasMore) {
        router.replace('/end');
      }
    }, 200);
  };

  // Auto-reveal on web
  useEffect(() => {
    if (Platform.OS === 'web' && currentPrompt) {
      setRevealed(true);
    }
  }, [currentPrompt]);

  const progress = totalPrompts > 0 ? promptsUsedCount / totalPrompts : 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {promptsUsedCount} / {totalPrompts}
        </Text>
      </View>

      {/* Prompt Area */}
      <View style={styles.promptContainer}>
        {Platform.OS !== 'web' && !revealed && (
          <Text style={styles.instruction}>Hold to reveal 👇</Text>
        )}

        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
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

          {/* Overlay for hold-to-reveal */}
          {Platform.OS !== 'web' && !revealed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>👆 Hold</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleNextPrompt}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>Next Prompt →</Text>
          </LinearGradient>
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
  button: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
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
});
