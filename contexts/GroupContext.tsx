import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, GroupContextType, Player, Room } from '../types/game';
import { supabase } from '../utils/supabase';
import { prompts as promptsData } from '../data/prompts';
import { RealtimeChannel } from '@supabase/supabase-js';

const GroupContext = createContext<GroupContextType | undefined>(undefined);

// Generate a random 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar-looking chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function GroupProvider({ children }: { children: ReactNode }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [hostId, setHostId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(0);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [started, setStarted] = useState<boolean>(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [myPlayerId] = useState<string>(() => Math.random().toString(36).substring(7));

  // Subscribe to room updates
  useEffect(() => {
    if (!roomId) return;

    const roomChannel = supabase.channel(`room:${roomId}`);

    roomChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        // Handle room deletion (when host ends game)
        if (payload.eventType === 'DELETE') {
          resetGroup();
          return;
        }

        if (payload.new && typeof payload.new === 'object') {
          const room = payload.new as unknown as {
            players: Player[];
            started: boolean;
            current_prompt_index: number;
            category: Category;
            prompts: string[];
          };
          
          setPlayers(room.players || []);
          setStarted(room.started || false);
          setCurrentPromptIndex(room.current_prompt_index || 0);
          
          if (room.category) setCategory(room.category);
          if (room.prompts) setPrompts(room.prompts);
        }
      })
      .subscribe();

    setChannel(roomChannel);

    return () => {
      roomChannel.unsubscribe();
    };
  }, [roomId]);

  const createRoom = async (selectedCategory: Category): Promise<string> => {
    try {
      const code = generateRoomCode();
      const categoryPrompts = selectedCategory === Category.BuildYourOwn 
        ? [] 
        : promptsData[selectedCategory as Exclude<Category, Category.BuildYourOwn>];

      const host: Player = {
        id: myPlayerId,
        name: 'Host',
        joinedAt: Date.now(),
      };

      const { error } = await supabase.from('rooms').insert({
        id: code,
        host_id: myPlayerId,
        players: [host],
        category: selectedCategory,
        current_prompt_index: 0,
        prompts: categoryPrompts,
        started: false,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setRoomId(code);
      setHostId(myPlayerId);
      setIsHost(true);
      setCategory(selectedCategory);
      setPlayers([host]);
      setPrompts(categoryPrompts);
      setCurrentPromptIndex(0);
      setStarted(false);

      return code;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  const joinRoom = async (code: string, playerName: string): Promise<void> => {
    try {
      // Fetch the room
      const { data: room, error: fetchError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', code.toUpperCase())
        .single();

      if (fetchError || !room) {
        throw new Error('Room not found');
      }

      const newPlayer: Player = {
        id: myPlayerId,
        name: playerName,
        joinedAt: Date.now(),
      };

      const updatedPlayers = [...(room.players as Player[]), newPlayer];

      // Update the room with the new player
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ players: updatedPlayers })
        .eq('id', code.toUpperCase());

      if (updateError) throw updateError;

      setRoomId(code.toUpperCase());
      setHostId(room.host_id);
      setIsHost(false);
      setCategory(room.category as Category);
      setPlayers(updatedPlayers);
      setPrompts(room.prompts as string[]);
      setCurrentPromptIndex(room.current_prompt_index);
      setStarted(room.started);
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  };

  const startGame = async (): Promise<void> => {
    if (!isHost || !roomId) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .update({ started: true })
        .eq('id', roomId);

      if (error) throw error;

      setStarted(true);
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  };

  const nextPrompt = async (): Promise<void> => {
    if (!isHost || !roomId) return;

    try {
      const newIndex = currentPromptIndex + 1;

      const { error } = await supabase
        .from('rooms')
        .update({ current_prompt_index: newIndex })
        .eq('id', roomId);

      if (error) throw error;

      setCurrentPromptIndex(newIndex);
    } catch (error) {
      console.error('Error moving to next prompt:', error);
      throw error;
    }
  };

  const previousPrompt = async (): Promise<void> => {
    if (!isHost || !roomId || currentPromptIndex === 0) return;

    try {
      const newIndex = currentPromptIndex - 1;

      const { error } = await supabase
        .from('rooms')
        .update({ current_prompt_index: newIndex })
        .eq('id', roomId);

      if (error) throw error;

      setCurrentPromptIndex(newIndex);
    } catch (error) {
      console.error('Error moving to previous prompt:', error);
      throw error;
    }
  };

  const leaveRoom = async (): Promise<void> => {
    if (!roomId) return;

    try {
      if (channel) {
        await channel.unsubscribe();
      }

      // If not host, remove player from room
      if (!isHost) {
        const { data: room } = await supabase
          .from('rooms')
          .select('players')
          .eq('id', roomId)
          .single();

        if (room) {
          const updatedPlayers = (room.players as Player[]).filter(
            (p) => p.id !== myPlayerId
          );

          await supabase
            .from('rooms')
            .update({ players: updatedPlayers })
            .eq('id', roomId);
        }
      } else {
        // If host, delete the room
        await supabase.from('rooms').delete().eq('id', roomId);
      }

      resetGroup();
    } catch (error) {
      console.error('Error leaving room:', error);
      resetGroup();
    }
  };

  const resetGroup = () => {
    if (channel) {
      channel.unsubscribe();
      setChannel(null);
    }
    setRoomId(null);
    setPlayers([]);
    setHostId(null);
    setIsHost(false);
    setCategory(null);
    setCurrentPromptIndex(0);
    setPrompts([]);
    setStarted(false);
  };

  return (
    <GroupContext.Provider
      value={{
        roomId,
        players,
        hostId,
        isHost,
        category,
        currentPromptIndex,
        prompts,
        started,
        createRoom,
        joinRoom,
        startGame,
        nextPrompt,
        previousPrompt,
        leaveRoom,
        resetGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup(): GroupContextType {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within GroupProvider');
  }
  return context;
}
