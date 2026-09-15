/*
# Presidential Simulator - Game Tables

## Overview
Creates the database schema for a presidential simulator game where players make decisions
as a fictional president and receive ultra-realistic AI-generated responses from advisors,
the press, the public, and world leaders.

## New Tables

### 1. `game_sessions`
Stores individual playthroughs of the game.
- `id` (uuid, primary key)
- `player_name` (text, the president's name)
- `party` (text, political party choice)
- `current_scenario_id` (int, which scenario the player is currently on)
- `approval_rating` (int, 0-100, starts at 50)
- `economy_rating` (int, 0-100, starts at 50)
- `global_standing` (int, 0-100, starts at 50)
- `crisis_level` (int, 0-100, starts at 20)
- `term_days_elapsed` (int, days into the presidential term, starts at 1)
- `game_over` (boolean, default false)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### 2. `decisions`
Stores each decision a player makes during a game session.
- `id` (uuid, primary key)
- `session_id` (uuid, FK to game_sessions)
- `scenario_id` (int, which scenario this decision was for)
- `choice` (text, the choice text the player selected)
- `ai_response` (text, the AI-generated response to the decision)
- `response_type` (text, who responded: 'advisor', 'press', 'public', 'world_leader')
- `approval_change` (int, how much approval changed)
- `economy_change` (int, how much economy changed)
- `global_change` (int, how much global standing changed)
- `crisis_change` (int, how much crisis level changed)
- `created_at` (timestamp)

## Security
- RLS enabled on both tables.
- This is a single-tenant app (no sign-in), so policies use `TO anon, authenticated`
  to allow the anon-key frontend to read and write.
*/

CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL DEFAULT 'President',
  party text NOT NULL DEFAULT 'Independent',
  current_scenario_id int NOT NULL DEFAULT 0,
  approval_rating int NOT NULL DEFAULT 50 CHECK (approval_rating >= 0 AND approval_rating <= 100),
  economy_rating int NOT NULL DEFAULT 50 CHECK (economy_rating >= 0 AND economy_rating <= 100),
  global_standing int NOT NULL DEFAULT 50 CHECK (global_standing >= 0 AND global_standing <= 100),
  crisis_level int NOT NULL DEFAULT 20 CHECK (crisis_level >= 0 AND crisis_level <= 100),
  term_days_elapsed int NOT NULL DEFAULT 1,
  game_over boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_game_sessions" ON game_sessions;
CREATE POLICY "anon_select_game_sessions" ON game_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_game_sessions" ON game_sessions;
CREATE POLICY "anon_insert_game_sessions" ON game_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_game_sessions" ON game_sessions;
CREATE POLICY "anon_update_game_sessions" ON game_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_game_sessions" ON game_sessions;
CREATE POLICY "anon_delete_game_sessions" ON game_sessions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  scenario_id int NOT NULL,
  choice text NOT NULL,
  ai_response text NOT NULL DEFAULT '',
  response_type text NOT NULL DEFAULT 'advisor',
  approval_change int NOT NULL DEFAULT 0,
  economy_change int NOT NULL DEFAULT 0,
  global_change int NOT NULL DEFAULT 0,
  crisis_change int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_decisions" ON decisions;
CREATE POLICY "anon_select_decisions" ON decisions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_decisions" ON decisions;
CREATE POLICY "anon_insert_decisions" ON decisions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_decisions" ON decisions;
CREATE POLICY "anon_update_decisions" ON decisions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_decisions" ON decisions;
CREATE POLICY "anon_delete_decisions" ON decisions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_decisions_session_id ON decisions(session_id);