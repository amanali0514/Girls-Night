import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useGroup } from '../../contexts/GroupContext';
import * as Haptics from 'expo-haptics';

export default function GroupEndScreen() {
  const router = useRouter();
  const { isHost, playAgain, leaveRoom, started, gameFinished } = useGroup();

  // Navigate non-hosts back to lobby when host plays again
  useEffect(() => {
    if (!isHost && !started && !gameFinished) {
      router.replace('/group/lobby');
    }
  }, [started, gameFinished, isHost]);

  const handlePlayAgain = async () => {
    if (!isHost) {
      Alert.alert('Host Only', 'Only the host can start a new game!');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    try {
      await playAgain();
      router.replace('/group/lobby');
    } catch (error) {
      Alert.alert('Error', 'Failed to start new game. Please try again.');
      console.error(error);
    }
  };

  const handleEndSession = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      'End Session',
      'Are you sure you want to end the session? This will close the room for everyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            await leaveRoom();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <Text style={styles.emoji}>👑</Text>
        <Text style={styles.title}>Game Complete!</Text>
        <Text style={styles.subtitle}>
          {isHost 
            ? "Great job hosting! Want to play again?" 
            : "Hope you had fun! Waiting for the host..."}
        </Text>

        <View style={styles.buttonContainer}>
          {isHost && (
            <TouchableOpacity
              style={styles.button}
              onPress={handlePlayAgain}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10B981', '#34D399']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>Play Again 🎮</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.endButton]}
            onPress={handleEndSession}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#DC2626', '#EF4444']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>
                {isHost ? 'End Session' : 'Leave Session'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {!isHost && (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>
                ⏳ Waiting for host to start a new game or end session...
              </Text>
            </View>
          )}
        </View>
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
    fontSize: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  button: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  endButton: {
    marginTop: 8,
  },
  gradient: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  waitingContainer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    marginTop: 16,
  },
  waitingText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
