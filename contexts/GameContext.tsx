import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { Category, GameContextType } from '../types/game';
import { prompts as promptsData } from '../data/prompts';

const GameContext = createContext<GameContextType | undefined>(undefined);

// Derangement shuffle: ensures no player gets their own prompt
function derange(list: string[]): string[] {
  const arr = [...list];
  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts < maxAttempts) {
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    // Check if it's a valid derangement
    const isValid = arr.every((item, index) => item !== list[index]);
    if (isValid) return arr;

    attempts++;
  }

  // Fallback: just shuffle if we can't find a valid derangement
  return arr;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [customPrompts, setCustomPromptsState] = useState<string[]>([]);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [players, setPlayersState] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [totalPrompts, setTotalPrompts] = useState<number>(0);
  const [promptsUsedCount, setPromptsUsedCount] = useState<number>(0);
  const usedIndicesRef = useRef<Set<number>>(new Set());

  const setPlayers = (names: string[]) => {
    setPlayersState(names);
    setPlayerCount(names.length);
  };

  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    
    if (category === Category.BuildYourOwn) {
      // Custom prompts will be set separately
      setPrompts([]);
      setTotalPrompts(0);
    } else {
      const categoryPrompts = promptsData[category as Exclude<Category, Category.BuildYourOwn>];
      setPrompts(categoryPrompts);
      setTotalPrompts(categoryPrompts.length);
    }
    
    setUsedIndices(new Set());
    usedIndicesRef.current = new Set();
    setPromptsUsedCount(0);
    setCurrentPrompt(null);
  };

  const setCustomPrompts = (customPromptsList: string[], count: number) => {
    // Apply derangement to custom prompts
    const derangedPrompts = derange(customPromptsList);
    
    setCustomPromptsState(customPromptsList);
    setPlayerCount(count);
    setPrompts(derangedPrompts);
    setTotalPrompts(derangedPrompts.length);
    setUsedIndices(new Set());
    usedIndicesRef.current = new Set();
    setPromptsUsedCount(0);
    setCurrentPrompt(null);
  };

  const getNextPrompt = (): boolean => {
    if (prompts.length === 0) return false;

    const currentUsed = usedIndicesRef.current;
    const unusedIndices = prompts
      .map((_, index) => index)
      .filter((index) => !currentUsed.has(index));

    if (unusedIndices.length === 0) {
      return false; // No more prompts
    }

    const randomIndex = unusedIndices[Math.floor(Math.random() * unusedIndices.length)];
    const nextUsed = new Set(currentUsed);
    nextUsed.add(randomIndex);

    usedIndicesRef.current = nextUsed;
    setUsedIndices(nextUsed);
    setCurrentPrompt(prompts[randomIndex]);
    setPromptsUsedCount((count) => count + 1);

    return true;
  };

  const resetGame = () => {
    setSelectedCategory(null);
    setPrompts([]);
    setCustomPromptsState([]);
    setPlayerCount(0);
    setPlayersState([]);
    setCurrentPrompt(null);
    setUsedIndices(new Set());
    usedIndicesRef.current = new Set();
    setTotalPrompts(0);
    setPromptsUsedCount(0);
  };

  return (
    <GameContext.Provider
      value={{
        selectedCategory,
        prompts,
        customPrompts,
        playerCount,
        players,
        currentPrompt,
        usedIndices,
        totalPrompts,
        promptsUsedCount,
        selectCategory,
        setPlayers,
        setCustomPrompts,
        getNextPrompt,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
