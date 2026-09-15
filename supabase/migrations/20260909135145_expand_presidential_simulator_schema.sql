/*
# Presidential Simulator - Expanded Schema

## Overview
Expands game_sessions with VP, election margin, month counter, and expanded economic/political metrics.
Adds policies and citizen_responses tables.

## Changes to game_sessions
- vice_president, election_margin, current_month
- inflation_rate, deficit, national_debt, gdp_growth
- government_stability, family_management, foreign_relations
- midterm_completed, election_completed, advisor_consults_used

## New Tables
- policies: enacted proposals with risks, news, state reactions, citizen responses
- citizen_responses: individual citizen reactions

## Security
- RLS enabled, single-tenant anon+authenticated policies.
*/

ALTER TABLE game_sessions
  ADD COLUMN IF NOT EXISTS vice_president text DEFAULT 'Sam Bennett',
  ADD COLUMN IF NOT EXISTS election_margin text DEFAULT 'moderate',
  ADD COLUMN IF NOT EXISTS current_month int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS inflation_rate numeric NOT NULL DEFAULT 2.1,
  ADD COLUMN IF NOT EXISTS deficit numeric NOT NULL DEFAULT -850,
  ADD COLUMN IF NOT EXISTS national_debt numeric NOT NULL DEFAULT 34000,
  ADD COLUMN IF NOT EXISTS gdp_growth numeric NOT NULL DEFAULT 2.3,
  ADD COLUMN IF NOT EXISTS government_stability int NOT NULL DEFAULT 55 CHECK (government_stability >= 0 AND government_stability <= 100),
  ADD COLUMN IF NOT EXISTS family_management int NOT NULL DEFAULT 70 CHECK (family_management >= 0 AND family_management <= 100),
  ADD COLUMN IF NOT EXISTS foreign_relations int NOT NULL DEFAULT 50 CHECK (foreign_relations >= 0 AND foreign_relations <= 100),
  ADD COLUMN IF NOT EXISTS midterm_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS election_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS advisor_consults_used int NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  month int NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'domestic',
  risk_economic int NOT NULL DEFAULT 30,
  risk_implementation int NOT NULL DEFAULT 30,
  risk_public int NOT NULL DEFAULT 30,
  news_left text NOT NULL DEFAULT '',
  news_right text NOT NULL DEFAULT '',
  news_neutral text NOT NULL DEFAULT '',
  state_reactions jsonb NOT NULL DEFAULT '{}',
  citizen_responses jsonb NOT NULL DEFAULT '[]',
  average_rating int NOT NULL DEFAULT 50,
  metric_changes jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_policies" ON policies;
CREATE POLICY "anon_select_policies" ON policies FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_policies" ON policies;
CREATE POLICY "anon_insert_policies" ON policies FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_policies" ON policies;
CREATE POLICY "anon_update_policies" ON policies FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_policies" ON policies;
CREATE POLICY "anon_delete_policies" ON policies FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS citizen_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id uuid REFERENCES policies(id) ON DELETE CASCADE,
  name text NOT NULL,
  race text NOT NULL DEFAULT '',
  political_leaning text NOT NULL DEFAULT '',
  rating int NOT NULL DEFAULT 50,
  response text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE citizen_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_citizen_responses" ON citizen_responses;
CREATE POLICY "anon_select_citizen_responses" ON citizen_responses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_citizen_responses" ON citizen_responses;
CREATE POLICY "anon_insert_citizen_responses" ON citizen_responses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_citizen_responses" ON citizen_responses;
CREATE POLICY "anon_delete_citizen_responses" ON citizen_responses FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_policies_session_id ON policies(session_id);
CREATE INDEX IF NOT EXISTS idx_citizen_responses_policy_id ON citizen_responses(policy_id);