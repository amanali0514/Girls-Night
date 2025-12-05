import React, { useState, useEffect, useRef } from 'react';
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

// Flip Card Component
const FlipCard = ({ item, index, isFlipped, onFlip }: { 
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

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.flipCardContainer}
        onPress={() => onFlip(index)}
        activeOpacity={0.9}
      >
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
          <LinearGradient
            colors={['#1F2937', '#374151']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tapOverlay}
          >
            <Text style={styles.tapText}>👆 Tap to reveal</Text>
          </LinearGradient>
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
          <LinearGradient
            colors={['#EC4899', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promptGradient}
          >
            <Text style={styles.promptText}>{item}</Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default function GameScreen() {
  const router = useRouter();
  const { prompts, usedIndices, getNextPrompt, totalPrompts, resetGame } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({});
  const flatListRef = useRef<FlatList>(null);


  // Get all prompts loaded so far
  const allPrompts = Array.from(usedIndices).map(index => prompts[index]).filter(Boolean);

  useEffect(() => {
    // Load first prompt
    if (allPrompts.length === 0) {
      getNextPrompt();
    }
  }, []);

  const handleFlipCard = (index: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleLoadMore = () => {
    const hasMore = getNextPrompt();
    if (!hasMore) {
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

  const renderCard = ({ item, index }: { item: string; index: number }) => {
    const isFlipped = flippedCards[index] || Platform.OS === 'web';
    return (
      <FlipCard 
        item={item} 
        index={index} 
        isFlipped={isFlipped}
        onFlip={handleFlipCard}
      />
    );
  };

  const progress = totalPrompts > 0 ? allPrompts.length / totalPrompts : 0;

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
          {allPrompts.length} / {totalPrompts}
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
        decelerationRate="fast"
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(newIndex);
          
          // Load more when reaching the end
          if (newIndex === allPrompts.length - 1) {
            handleLoadMore();
          }
        }}
        contentContainerStyle={styles.flatListContent}
      />
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
    top: 60,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  flipCardContainer: {
    width: '100%',
    maxWidth: 500,
    aspectRatio: 1,
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
    fontSize: 32,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
  },
});
