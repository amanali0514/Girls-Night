import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useGroup } from '../../contexts/GroupContext';
import { Category } from '../../types/game';
import * as Haptics from 'expo-haptics';

const categories = [
  { id: Category.Confessions, name: 'Confessions', emoji: '😌', colors: ['#EC4899', '#F472B6'] as const },
  { id: Category.Dare, name: 'Dare', emoji: '💪', colors: ['#8B5CF6', '#A78BFA'] as const },
  { id: Category.Toxic, name: 'Toxic', emoji: '😈', colors: ['#EF4444', '#F87171'] as const },
  { id: Category.Chill, name: 'Chill', emoji: '✨', colors: ['#3B82F6', '#60A5FA'] as const },
  { id: Category.BuildYourOwn, name: 'Build Your Own', emoji: '🎨', colors: ['#10B981', '#34D399'] as const },
];

export default function HostScreen() {
  const router = useRouter();
  const { createRoom } = useGroup();
  const [loading, setLoading] = useState(false);

  const handleCategorySelect = async (category: Category) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (category === Category.BuildYourOwn) {
      // For Build Your Own, we need to create the room first, then go to custom input
      setLoading(true);
      try {
        const roomCode = await createRoom(category);
        router.push('/group/custom-prompts');
      } catch (error) {
        Alert.alert('Error', 'Failed to create room. Please try again.');
        console.error(error);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);

    try {
      const roomCode = await createRoom(category);
      router.push('/group/lobby');
    } catch (error) {
      Alert.alert('Error', 'Failed to create room. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4899" />
          <Text style={styles.loadingText}>Creating room...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Host a Group Game</Text>
        <Text style={styles.subtitle}>Choose a category to start</Text>

        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryButton}
              onPress={() => handleCategorySelect(category.id)}
              activeOpacity={0.8}
              disabled={loading}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
    textAlign: 'center',
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
