# Supabase Setup Instructions

## Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Create rooms table
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  players JSONB NOT NULL DEFAULT '[]',
  category TEXT,
  current_prompt_index INTEGER DEFAULT 0,
  prompts JSONB NOT NULL DEFAULT '[]',
  started BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rooms
CREATE POLICY "Enable read access for all users" ON rooms
  FOR SELECT USING (true);

-- Allow anyone to insert rooms
CREATE POLICY "Enable insert access for all users" ON rooms
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update rooms
CREATE POLICY "Enable update access for all users" ON rooms
  FOR UPDATE USING (true);

-- Auto-delete rooms older than 24 hours
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'delete-old-rooms',
  '0 * * * *', -- Every hour
  $$DELETE FROM rooms WHERE created_at < NOW() - INTERVAL '24 hours'$$
);
```

## Realtime Setup

1. Go to your Supabase project
2. Navigate to Database > Replication
3. Enable replication for the `rooms` table
4. Select all columns for replication

## Update Configuration

Update `utils/supabase.ts` with your credentials or use environment variables:

```typescript
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
```
