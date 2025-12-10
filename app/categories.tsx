import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useGame } from '../contexts/GameContext';
import { Category } from '../types/game';
import * as Haptics from 'expo-haptics';

const categories = [
  { id: Category.Confessions, name: 'Confessions', emoji: '😌', colors: ['#EC4899', '#F472B6'] as const },
  { id: Category.Dare, name: 'Dare', emoji: '💪', colors: ['#8B5CF6', '#A78BFA'] as const },
  { id: Category.Toxic, name: 'Toxic', emoji: '😈', colors: ['#EF4444', '#F87171'] as const },
  { id: Category.Chill, name: 'Would You Rather', emoji: '✨', colors: ['#3B82F6', '#60A5FA'] as const },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const { selectCategory } = useGame();

  const handleCategorySelect = (category: Category) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    selectCategory(category);
    router.push('/game');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Choose Your Vibe</Text>
        <Text style={styles.subtitle}>Pick a category to start</Text>

        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryButton}
              onPress={() => handleCategorySelect(category.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={category.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.categoryGradient}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Back</Text>
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
  categoriesContainer: {
    gap: 16,
    marginBottom: 32,
  },
  categoryButton: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 20,
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
  categoryGradient: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  categoryEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  backButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});
