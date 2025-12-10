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
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [promptSubmissionPhase, setPromptSubmissionPhase] = useState<boolean>(false);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [sessionEndedReason, setSessionEndedReason] = useState<string | null>(null);

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
          resetGroup(isHost ? undefined : 'host-ended');
          return;
        }

        if (payload.new && typeof payload.new === 'object') {
          const room = payload.new as unknown as {
            players: Player[];
            started: boolean;
            current_prompt_index: number;
            category: Category;
            prompts: string[];
            active_player_id: string | null;
            prompt_submission_phase: boolean;
            game_finished: boolean;
            revealed: boolean;
          };
          
          setPlayers(room.players || []);
          setStarted(room.started || false);
          setCurrentPromptIndex(room.current_prompt_index || 0);
          setActivePlayerId(room.active_player_id || null);
          setPromptSubmissionPhase(room.prompt_submission_phase || false);
          setGameFinished(room.game_finished || false);
          setRevealed(room.revealed || false);
          
          if (room.category) setCategory(room.category);
          if (room.prompts) setPrompts(room.prompts);
        }
      })
      .on('broadcast', { event: 'room-ended' }, () => {
        resetGroup('host-ended');
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
        revealed: false,
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
      // Get current room data
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (!room) throw new Error('Room not found');

      const updates: any = { started: true };

      // If Build Your Own and prompts aren't set yet, enter submission phase
      if (room.category === Category.BuildYourOwn && (!room.prompts || room.prompts.length === 0)) {
        updates.prompt_submission_phase = true;
      } else {
        // For other modes, set random first player
        const randomIndex = Math.floor(Math.random() * (room.players as Player[]).length);
        updates.active_player_id = (room.players as Player[])[randomIndex].id;
      }

      const { error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomId);

      if (error) throw error;

      setStarted(true);
      if (updates.active_player_id) setActivePlayerId(updates.active_player_id);
      if (updates.prompt_submission_phase) setPromptSubmissionPhase(true);
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
        .update({ 
          current_prompt_index: newIndex,
          revealed: false,
        })
        .eq('id', roomId);

      if (error) throw error;

      setCurrentPromptIndex(newIndex);
    } catch (error) {
      console.error('Error moving to previous prompt:', error);
      throw error;
    }
  };

  const revealCard = async (): Promise<void> => {
    if (!roomId) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .update({ revealed: !revealed })
        .eq('id', roomId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling reveal state:', error);
      throw error;
    }
  };

  const leaveRoom = async (): Promise<void> => {
    if (!roomId) return;

    try {
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
        // Broadcast to listeners before deleting the room, in case DELETE is missed
        if (channel) {
          await channel.send({
            type: 'broadcast',
            event: 'room-ended',
            payload: { reason: 'host-ended' },
          });
        }
        // If host, delete the room
        await supabase.from('rooms').delete().eq('id', roomId);
      }

      if (channel) {
        await channel.unsubscribe();
      }

      // Host already knows; don't show them a host-ended reason
      resetGroup(isHost ? undefined : 'host-ended');
    } catch (error) {
      console.error('Error leaving room:', error);
      resetGroup();
    }
  };

  const resetGroup = (reason?: string) => {
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
    setActivePlayerId(null);
    setPromptSubmissionPhase(false);
    setGameFinished(false);
    setRevealed(false);
    setSessionEndedReason(reason ?? null);
  };

  const submitPrompt = async (prompt: string): Promise<void> => {
    if (!roomId) return;

    try {
      // Get current room data
      const { data: room } = await supabase
        .from('rooms')
        .select('players')
        .eq('id', roomId)
        .single();

      if (!room) throw new Error('Room not found');

      // Update player's prompt
      const updatedPlayers = (room.players as Player[]).map(p =>
        p.id === myPlayerId
          ? { ...p, prompt, promptSubmitted: true }
          : p
      );

      await supabase
        .from('rooms')
        .update({ players: updatedPlayers })
        .eq('id', roomId);

    } catch (error) {
      console.error('Error submitting prompt:', error);
      throw error;
    }
  };

  const setNextPlayer = async (nextPlayerId?: string): Promise<void> => {
    if (!roomId) return;

    try {
      const newIndex = currentPromptIndex + 1;

      // If we've exhausted prompts, mark finished instead of writing invalid state
      if (newIndex >= prompts.length) {
        await finishGame();
        return;
      }

      // For Build Your Own, the prompt at index i belongs to players[i]; keep them aligned
      const nextAssignedPlayerId = category === Category.BuildYourOwn
        ? players[newIndex]?.id || null
        : nextPlayerId || null;
      
      await supabase
        .from('rooms')
        .update({ 
          active_player_id: nextAssignedPlayerId,
          current_prompt_index: newIndex,
          revealed: false,
        })
        .eq('id', roomId);

      if (nextAssignedPlayerId) setActivePlayerId(nextAssignedPlayerId);
      setCurrentPromptIndex(newIndex);
    } catch (error) {
      console.error('Error setting next player:', error);
      throw error;
    }
  };

  const changeCategory = async (newCategory: Category): Promise<void> => {
    if (!isHost || !roomId) return;

    try {
      const categoryPrompts = newCategory === Category.BuildYourOwn 
        ? [] 
        : promptsData[newCategory as Exclude<Category, Category.BuildYourOwn>];

      await supabase
        .from('rooms')
        .update({ 
          category: newCategory,
          prompts: categoryPrompts,
          current_prompt_index: 0
        })
        .eq('id', roomId);

      setCategory(newCategory);
      setPrompts(categoryPrompts);
      setCurrentPromptIndex(0);
    } catch (error) {
      console.error('Error changing category:', error);
      throw error;
    }
  };

  const playAgain = async (): Promise<void> => {
    if (!isHost || !roomId) return;

    try {
      // Get current room data
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (!room) throw new Error('Room not found');

      // Reset players' prompts
      const resetPlayers = (room.players as Player[]).map(p => ({
        ...p,
        prompt: undefined,
        promptSubmitted: false
      }));

      const updates: any = {
        players: resetPlayers,
        current_prompt_index: 0,
        started: false,
        active_player_id: null,
        game_finished: false,
        revealed: false
      };

      // If Build Your Own, enter prompt submission phase
      if (room.category === Category.BuildYourOwn) {
        updates.prompts = [];
        updates.prompt_submission_phase = true;
      }

      await supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomId);

      setCurrentPromptIndex(0);
      setStarted(false);
      setActivePlayerId(null);
      setGameFinished(false);
      setRevealed(false);
      setGameFinished(false);
    } catch (error) {
      console.error('Error playing again:', error);
      throw error;
    }
  };

  const finishGame = async (): Promise<void> => {
    if (!roomId) return;

    try {
      await supabase
        .from('rooms')
        .update({ game_finished: true })
        .eq('id', roomId);

      setGameFinished(true);
    } catch (error) {
      console.error('Error finishing game:', error);
      throw error;
    }
  };

  const updatePlayerName = async (newName: string): Promise<void> => {
    if (!roomId) return;

    try {
      // Get current room data
      const { data: room } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (!room) throw new Error('Room not found');

      // Update the player's name in the players array
      const updatedPlayers = (room.players as Player[]).map(p => 
        p.id === myPlayerId ? { ...p, name: newName } : p
      );

      await supabase
        .from('rooms')
        .update({ players: updatedPlayers })
        .eq('id', roomId);
    } catch (error) {
      console.error('Error updating player name:', error);
      throw error;
    }
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
        activePlayerId,
        promptSubmissionPhase,
        gameFinished,
        revealed,
        myPlayerId,
        sessionEndedReason,
        createRoom,
        joinRoom,
        startGame,
        nextPrompt,
        previousPrompt,
        leaveRoom,
        resetGroup,
        submitPrompt,
        setNextPlayer,
        changeCategory,
        playAgain,
        finishGame,
        updatePlayerName,
        revealCard,
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
