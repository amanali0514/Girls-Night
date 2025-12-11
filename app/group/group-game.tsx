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
import { Category } from '../../types/game';
import * as Haptics from 'expo-haptics';

export default function GroupGameScreen() {
  const router = useRouter();
  const { 
    prompts, 
    currentPromptIndex, 
    isHost, 
    nextPrompt, 
    previousPrompt, 
    leaveRoom, 
    roomId,
    activePlayerId,
    myPlayerId,
    players,
    setNextPlayer,
    gameFinished,
    finishGame,
    revealed,
    revealCard,
    sessionEndedReason,
  } = useGroup();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const [sessionAlerted, setSessionAlerted] = useState(false);

  const currentPrompt = prompts[currentPromptIndex];
  const isLastPrompt = currentPromptIndex >= prompts.length - 1;
  const isFirstPrompt = currentPromptIndex === 0;
  const progress = prompts.length > 0 ? (currentPromptIndex + 1) / prompts.length : 0;
  const isMyTurn = activePlayerId === myPlayerId;
  const activePlayer = players.find(p => p.id === activePlayerId);

  // Handle room deletion (when host leaves/deletes room)
  useEffect(() => {
    if (!roomId && !isHost) {
      // Room was deleted by host, navigate to end screen
      router.replace('/group/group-end');
    }
  }, [roomId, isHost]);

  // Handle game finished (navigate all players to end screen)
  useEffect(() => {
    if (gameFinished) {
      router.replace('/group/group-end');
    }
  }, [gameFinished]);

  // Notify non-hosts when host ends session mid-game
  useEffect(() => {
    if (!roomId && !isHost && sessionEndedReason === 'host-ended' && !sessionAlerted) {
      setSessionAlerted(true);
      Alert.alert('Host ended session', 'Returning to home.');
      router.replace('/');
    }
  }, [roomId, isHost, sessionEndedReason, sessionAlerted]);

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

  // Auto-reveal on web
  useEffect(() => {
    if (Platform.OS === 'web' && currentPrompt) {
      revealCard();
    }
  }, [currentPrompt]);

  const handleFlipCard = () => {
    // Only the active player can flip
    if (!isMyTurn) {
      Alert.alert('Not Your Turn', `It's ${activePlayer?.name || 'another player'}'s turn!`);
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    revealCard();
  };

  const handleNextPlayer = async () => {
    if (!isMyTurn) {
      Alert.alert('Not Your Turn', `Only the active player can select the next person!`);
      return;
    }

    // If it's the last prompt, mark game as finished
    if (isLastPrompt) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      await finishGame();
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    await setNextPlayer();
  };

  const handleEndGame = async () => {
    if (!isHost) {
      Alert.alert('Host Only', 'Only the host can end the game!');
      return;
    }

    Alert.alert(
      'End Game',
      'Are you sure you want to end the game? This will end it for everyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Game',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
            await finishGame();
          },
        },
      ]
    );
  };

  const handleBack = () => {
    Alert.alert(
      'Leave Game',
      'Go back to lobby? This will end the game for everyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go Back',
          style: 'default',
          onPress: async () => {
            await leaveRoom();
            router.replace('/group/lobby');
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

      {/* Current Turn Indicator */}
      <View style={styles.turnIndicator}>
        {isMyTurn ? (
          <Text style={styles.turnText}>🎯 Your Turn!</Text>
        ) : (
          <Text style={styles.turnText}>{activePlayer?.name || 'Player'}'s Turn</Text>
        )}
      </View>

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
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={handleFlipCard}
          style={styles.promptTouchArea}
          disabled={!isMyTurn}
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
          {!revealed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                {isMyTurn ? '💕 Tap to Reveal 💕' : '🔒 Waiting 🔒'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {isMyTurn ? (
          <>
            {/* Next Person Button */}
            {revealed && (
              <TouchableOpacity
                style={styles.nextPersonButton}
                onPress={handleNextPlayer}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isLastPrompt ? ['#10B981', '#34D399'] : ['#10B981', '#34D399']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                >
                  <Text style={styles.buttonText}>
                    {isLastPrompt ? 'Finish Game 🎉' : 'Next Person →'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>
              Waiting for {activePlayer?.name || 'player'} to reveal...
            </Text>
          </View>
        )}

        {/* End Game Button - Host Only */}
        {isHost && (
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
  turnIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    marginTop: 80,
  },
  turnText: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: 'bold',
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
  nextPersonButton: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    marginBottom: 12,
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
