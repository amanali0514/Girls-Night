import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useGroup } from '../../contexts/GroupContext';
import * as Haptics from 'expo-haptics';

export default function LobbyScreen() {
  const router = useRouter();
  const { roomId, players, isHost, started, startGame, leaveRoom } = useGroup();

  useEffect(() => {
    if (started) {
      router.replace('/group/group-game');
    }
  }, [started]);

  const handleStartGame = async () => {
    if (!isHost) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    try {
      await startGame();
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleShare = async () => {
    if (!roomId) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await Share.share({
        message: `Join my Girls Night game! 💅✨\nRoom Code: ${roomId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLeave = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    await leaveRoom();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Waiting Room</Text>
          <Text style={styles.subtitle}>
            {isHost ? "You're the host" : 'Waiting for host to start'}
          </Text>
        </View>

        {/* Room Code Display */}
        <View style={styles.roomCodeContainer}>
          <Text style={styles.roomCodeLabel}>Room Code</Text>
          <View style={styles.roomCodeBox}>
            <Text style={styles.roomCode}>{roomId}</Text>
          </View>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={styles.shareButtonText}>Share Code 📱</Text>
          </TouchableOpacity>
        </View>

        {/* Players List */}
        <View style={styles.playersContainer}>
          <Text style={styles.playersTitle}>
            Players ({players.length})
          </Text>
          <View style={styles.playersList}>
            {players.map((player, index) => (
              <View key={player.id} style={styles.playerCard}>
                <View style={styles.playerAvatar}>
                  <Text style={styles.playerAvatarText}>
                    {player.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.playerName}>{player.name}</Text>
                {player.id === players[0]?.id && (
                  <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeText}>HOST</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Start Button (Host Only) */}
        {isHost && (
          <TouchableOpacity
            style={[styles.button, players.length < 2 && styles.buttonDisabled]}
            onPress={handleStartGame}
            activeOpacity={0.8}
            disabled={players.length < 2}
          >
            <LinearGradient
              colors={players.length < 2 ? ['#4B5563', '#4B5563'] : ['#EC4899', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>
                {players.length < 2 ? 'Need 2+ Players' : 'Start Game'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Leave Button */}
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={handleLeave}
          activeOpacity={0.8}
        >
          <Text style={styles.leaveButtonText}>Leave Room</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  roomCodeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  roomCodeLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  roomCodeBox: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  roomCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EC4899',
    letterSpacing: 4,
  },
  shareButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  shareButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  playersContainer: {
    marginBottom: 32,
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  playersList: {
    gap: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  hostBadge: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  button: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    marginBottom: 16,
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
  buttonDisabled: {
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
  leaveButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  leaveButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
