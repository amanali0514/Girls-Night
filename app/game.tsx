import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useGame } from '../contexts/GameContext';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRELOAD_BUFFER = 3; // how many cards ahead to keep ready

// Pastel color palette for cards
const PASTEL_COLORS: readonly [string, string][] = [
  ['#FF6B9D', '#FEC5E5'], // Pink
  ['#A78BFA', '#E9D5FF'], // Purple
  ['#60A5FA', '#BFDBFE'], // Blue
  ['#34D399', '#A7F3D0'], // Green
  ['#FBBF24', '#FDE68A'], // Yellow
  ['#F472B6', '#FBCFE8'], // Hot Pink
];

// Flip Card Component - Memoized for performance
const FlipCard = React.memo(({ item, index, isFlipped, onFlip }: { 
  item: string; 
  index: number; 
  isFlipped: boolean;
  onFlip: (index: number) => void;
}) => {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 180 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [0, 0, 1],
  });

  // Get colors based on card index
  const colors = PASTEL_COLORS[index % PASTEL_COLORS.length];

  return (
    <View style={styles.cardContainer}>
      <View style={styles.flipCardContainer}>
        {/* Front of card - "Tap to reveal" */}
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardFront,
            {
              opacity: frontOpacity,
              transform: [{ rotateY: frontInterpolate }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => onFlip(index)}
            activeOpacity={0.95}
            style={styles.tapArea}
          >
            <LinearGradient
              colors={colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tapOverlay}
            >
              <Text style={styles.tapText}>💕 Tap to reveal 💕</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Back of card - actual prompt */}
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardBack,
            {
              opacity: backOpacity,
              transform: [{ rotateY: backInterpolate }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => onFlip(index)}
            activeOpacity={0.95}
            style={styles.tapArea}
          >
            <LinearGradient
              colors={['#EC4899', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.promptGradient}
            >
              <Text style={styles.promptText}>{item}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
});

export default function GameScreen() {
  const router = useRouter();
  const { prompts, usedIndices, getNextPrompt, totalPrompts, resetGame } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({});
  const flatListRef = useRef<FlatList>(null);
  const lastSettledIndex = useRef(0);


  // Get all prompts loaded so far
  const allPrompts = Array.from(usedIndices).map(index => prompts[index]).filter(Boolean);

  const preloadBuffer = useCallback((visibleIndex: number) => {
    if (totalPrompts === 0) return false;

    // Ensure we always have the current card plus a few ahead loaded
    const desiredCount = Math.min(totalPrompts, visibleIndex + PRELOAD_BUFFER + 1);
    let currentCount = allPrompts.length;
    let exhausted = false;

    while (currentCount < desiredCount) {
      const hasMore = getNextPrompt();
      if (!hasMore) {
        exhausted = true;
        break;
      }
      currentCount += 1;
    }

    return exhausted;
  }, [allPrompts.length, getNextPrompt, totalPrompts]);

  useEffect(() => {
    preloadBuffer(currentIndex);
  }, [currentIndex, totalPrompts, allPrompts.length, preloadBuffer]);

  const handleFlipCard = (index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleLoadMore = (visibleIndex: number) => {
    const hitEnd = preloadBuffer(visibleIndex);
    if (hitEnd) {
      router.replace('/end');
    }
  };

  const handleGoHome = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    resetGame();
    router.replace('/');
  };

  const renderCard = React.useCallback(({ item, index }: { item: string; index: number }) => {
    const isFlipped = flippedCards[index] || Platform.OS === 'web';
    return (
      <FlipCard 
        item={item} 
        index={index} 
        isFlipped={isFlipped}
        onFlip={handleFlipCard}
      />
    );
  }, [flippedCards]);

  const handleNext = () => {
    if (currentIndex < allPrompts.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else if (allPrompts.length < totalPrompts) {
      // Only load more if we haven't reached total
      handleLoadMore(currentIndex + 1);
      // Wait a bit then scroll to the new card
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      }, 100);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    }
  };

  // Update index as soon as drag ends so the top bar reflects the next card promptly
  interface ScrollEndDragEvent {
    nativeEvent: {
      contentOffset: {
        x: number;
        y: number;
      };
    };
  }

  const handleScrollEndDrag = useCallback((event: ScrollEndDragEvent) => {
    const offsetX: number = event.nativeEvent.contentOffset.x;
    const rawIndex: number = Math.round(offsetX / SCREEN_WIDTH);
    const targetIndex: number = Math.min(Math.max(rawIndex, 0), Math.max(allPrompts.length - 1, 0));

    setCurrentIndex(targetIndex);
    lastSettledIndex.current = targetIndex;
    handleLoadMore(targetIndex);
  }, [allPrompts.length, handleLoadMore]);

  // Progress shows current card position, not total loaded
  const progress = totalPrompts > 0 ? (currentIndex + 1) / totalPrompts : 0;

  return (
      <View style={styles.container}>
      <StatusBar style="light" />

      {/* Home Button - Top Left */}
      <TouchableOpacity
        style={styles.homeButton}
        onPress={handleGoHome}
        activeOpacity={0.8}
      >
        <Text style={styles.homeButtonText}>← Home</Text>
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {totalPrompts}
        </Text>
      </View>

      {/* Cards - Horizontal Swipeable */}
      <FlatList
        ref={flatListRef}
        data={allPrompts}
        renderItem={renderCard}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate={0.988}
        snapToAlignment="center"
        scrollEventThrottle={16}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        disableIntervalMomentum={true}
        overScrollMode="never"
        bounces={false}
        scrollEnabled={true}
        nestedScrollEnabled={false}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(newIndex);
          lastSettledIndex.current = newIndex;

          // Keep a buffer ahead so fast swipes never outrun loaded cards
          handleLoadMore(newIndex);
        }}
        contentContainerStyle={styles.flatListContent}
      />

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <View style={styles.bottomButtonRow}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
            onPress={handlePrevious}
            activeOpacity={0.8}
            disabled={currentIndex === 0}
          >
            <LinearGradient
              colors={currentIndex === 0 ? ['#374151', '#1F2937'] : ['#374151', '#1F2937']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={[styles.buttonText, currentIndex === 0 && styles.disabledText]}>← Previous</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, currentIndex === allPrompts.length - 1 && allPrompts.length >= totalPrompts && styles.disabledButton]}
            onPress={handleNext}
            activeOpacity={0.8}
            disabled={currentIndex === allPrompts.length - 1 && allPrompts.length >= totalPrompts}
          >
            <LinearGradient
              colors={['#FF6B9D', '#FEC5E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={[styles.buttonText, currentIndex === allPrompts.length - 1 && allPrompts.length >= totalPrompts && styles.disabledText]}>Next →</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  homeButton: {
    position: 'absolute',
    top: 80,
    left: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    zIndex: 10,
  },
  homeButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
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
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  flatListContent: {
    paddingHorizontal: 0,
  },
  cardContainer: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  flipCardContainer: {
    width: '90%',
    height: '85%',
    maxWidth: 500,
    maxHeight: 600,
  },
  tapArea: {
    width: '100%',
    height: '100%',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  cardFront: {
    // Front side styling
  },
  cardBack: {
    // Back side styling  
  },
  tapOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapText: {
    fontSize: 38,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  promptGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  promptText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 48,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  bottomButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  fullWidth: {
    flex: 1,
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
    opacity: 0.6,
  },
});
