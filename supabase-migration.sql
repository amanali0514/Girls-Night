-- Migration: Add columns for turn-based multiplayer gameplay
-- Run this in your Supabase SQL Editor

-- Add missing columns to rooms table
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS prompt_submission_phase BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS active_player_id TEXT,
ADD COLUMN IF NOT EXISTS game_finished BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN rooms.prompt_submission_phase IS 'Indicates if the game is in the prompt submission phase (for Build Your Own mode)';
COMMENT ON COLUMN rooms.active_player_id IS 'The ID of the player whose turn it is to reveal a prompt';
COMMENT ON COLUMN rooms.game_finished IS 'Indicates if the game has been completed and players should navigate to end screen';
