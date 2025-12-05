import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useGroup } from '../../contexts/GroupContext';
import { Category } from '../../types/game';

export default function CustomPromptsHostScreen() {
  const router = useRouter();
  const { createRoom } = useGroup();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupRoom = async () => {
      try {
        await createRoom(Category.BuildYourOwn);
        router.replace('/group/custom-prompts');
      } catch (error) {
        Alert.alert('Error', 'Failed to create room. Please try again.');
        console.error(error);
        router.back();
      }
    };

    setupRoom();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Creating room...</Text>
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
    gap: 16,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});
