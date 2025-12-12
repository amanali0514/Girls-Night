import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useGroup } from '../../contexts/GroupContext';
import { Category } from '../../types/game';

export default function VoteScreen() {
  const router = useRouter();
  const {
    prompts,
    currentPromptIndex,
    players,
    myPlayerId,
    category,
    revealed,
    activePlayerId,
    isHost,
    setNextPlayer,
    finishGame,
    submitVote,
    gameFinished,
  } = useGroup();

  const isWhosMoreLikely = category === Category.WhosMoreLikely;
  const currentPrompt = prompts[currentPromptIndex];
  const orderedPlayers = [...players].sort((a, b) => a.joinedAt - b.joinedAt);
  const currentVotes = players.filter(
    (p) => p.votePromptIndex === currentPromptIndex && !!p.voteFor
  );
  const myVoteForId =
    players.find(
      (p) => p.id === myPlayerId && p.votePromptIndex === currentPromptIndex
    )?.voteFor || null;
  const voteCounts = currentVotes.reduce<Record<string, number>>((acc, p) => {
    if (p.voteFor) {
      acc[p.voteFor] = (acc[p.voteFor] || 0) + 1;
    }
    return acc;
  }, {});
  const winningPlayerId = Object.keys(voteCounts).reduce<string | null>((best, candidate) => {
    if (best === null) return candidate;
    if (voteCounts[candidate] > voteCounts[best]) return candidate;
    if (voteCounts[candidate] === voteCounts[best]) {
      const candidateIndex = orderedPlayers.findIndex((p) => p.id === candidate);
      const bestIndex = orderedPlayers.findIndex((p) => p.id === best);
      if (bestIndex === -1 || (candidateIndex !== -1 && candidateIndex < bestIndex)) {
        return candidate;
      }
    }
    return best;
  }, null);
  const winningPlayer = orderedPlayers.find((p) => p.id === winningPlayerId) || null;
  const everyoneVoted =
    isWhosMoreLikely && players.length > 0 && currentVotes.length >= players.length;
  const votesRemaining = Math.max(players.length - currentVotes.length, 0);
  const isMyTurn = activePlayerId === myPlayerId;
  const isLastPrompt = currentPromptIndex >= prompts.length - 1;

  // If not the right state, bounce back to the main game screen
  useEffect(() => {
    if (!isWhosMoreLikely || !revealed || !currentPrompt || gameFinished) {
      router.replace('/group/group-game');
    }
  }, [isWhosMoreLikely, revealed, currentPrompt, gameFinished, router]);

  const handleVote = async (voteForId: string) => {
    if (!isWhosMoreLikely || !revealed) return;
    if (myVoteForId === voteForId) return;

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await submitVote(voteForId);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not submit vote. Please try again.');
    }
  };

  const handleNext = async () => {
    if (!everyoneVoted) {
      Alert.alert('Vote First', 'Wait for everyone to vote before moving on.');
      return;
    }

    if (!isMyTurn) {
      Alert.alert('Not Your Turn', 'Only the active player can advance.');
      return;
    }

    if (isLastPrompt) {
      await finishGame();
      return;
    }

    await setNextPlayer();
    router.replace('/group/group-game');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Who&apos;s More Likely?</Text>
        <Text style={styles.subtitle}>Vote for the player that fits best</Text>
      </View>

      <View style={styles.promptCard}>
        <LinearGradient
          colors={['#EC4899', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promptGradient}
        >
          <Text style={styles.promptText}>{currentPrompt}</Text>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={styles.voteContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.voteTitle}>Tap to vote</Text>
        <View style={styles.voteGrid}>
          {orderedPlayers.map((player) => {
            const isSelected = myVoteForId === player.id;
            const voteCount = voteCounts[player.id] || 0;
            return (
              <TouchableOpacity
                key={player.id}
                style={[
                  styles.voteButton,
                  isSelected && styles.voteButtonSelected,
                  myVoteForId && !isSelected && styles.voteButtonDisabled,
                ]}
                onPress={() => handleVote(player.id)}
                disabled={!!myVoteForId && !isSelected}
                activeOpacity={0.85}
              >
                <Text style={styles.voteButtonName}>{player.name}</Text>
                {voteCount > 0 && (
                  <Text style={styles.voteCount}>
                    {voteCount} vote{voteCount === 1 ? '' : 's'}
                  </Text>
                )}
                {isSelected && <Text style={styles.voteBadge}>Voted</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.voteStatus}>
          {everyoneVoted
            ? 'Everyone voted!'
            : myVoteForId
              ? `Waiting on ${votesRemaining} vote${votesRemaining === 1 ? '' : 's'}...`
              : 'Tap a player to cast your vote.'}
        </Text>

        {everyoneVoted && (
          <View style={styles.winnerCard}>
            <Text style={styles.winnerLabel}>Most Votes</Text>
            <Text style={styles.winnerName}>
              {winningPlayer
                ? `${winningPlayer.name} (${voteCounts[winningPlayer.id]} vote${voteCounts[winningPlayer.id] === 1 ? '' : 's'})`
                : 'Tie'}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!everyoneVoted || !isMyTurn) && styles.disabledButton,
          ]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={!everyoneVoted || !isMyTurn}
        >
          <LinearGradient
            colors={isLastPrompt ? ['#10B981', '#34D399'] : ['#3B82F6', '#60A5FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextGradient}
          >
            <Text style={styles.nextText}>
              {isLastPrompt ? 'Finish Game' : 'Next Prompt'}
            </Text>
            {!isMyTurn && <Text style={styles.nextHint}>Waiting for active player</Text>}
            {isMyTurn && !everyoneVoted && (
              <Text style={styles.nextHint}>Wait for everyone to vote</Text>
            )}
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#9CA3AF',
    marginTop: 6,
  },
  promptCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#EC4899',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  promptGradient: {
    padding: 20,
  },
  promptText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 32,
  },
  voteContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  voteTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  voteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  voteButton: {
    minWidth: 140,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  voteButtonSelected: {
    borderColor: '#10B981',
    backgroundColor: '#0F172A',
  },
  voteButtonDisabled: {
    opacity: 0.65,
  },
  voteButtonName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  voteCount: {
    color: '#9CA3AF',
    marginTop: 4,
  },
  voteBadge: {
    color: '#10B981',
    fontWeight: '700',
    marginTop: 4,
  },
  voteStatus: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
  winnerCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
  },
  winnerLabel: {
    color: '#10B981',
    fontWeight: '700',
    marginBottom: 4,
  },
  winnerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  nextButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextHint: {
    color: '#D1D5DB',
    fontSize: 12,
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
