-- ================================================
-- CRM Database Schema for Supabase
-- Run this in the Supabase SQL Editor
-- ================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. PIPELINES
-- ================================================
CREATE TABLE IF NOT EXISTS crm_pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for pipelines
ALTER TABLE crm_pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pipelines" ON crm_pipelines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pipelines" ON crm_pipelines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pipelines" ON crm_pipelines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pipelines" ON crm_pipelines
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- 2. PIPELINE STAGES
-- ================================================
CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID REFERENCES crm_pipelines(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  color VARCHAR(7) DEFAULT '#19069E',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for stages (via pipeline ownership)
ALTER TABLE crm_pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stages of own pipelines" ON crm_pipeline_stages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM crm_pipelines WHERE id = pipeline_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create stages in own pipelines" ON crm_pipeline_stages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM crm_pipelines WHERE id = pipeline_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update stages in own pipelines" ON crm_pipeline_stages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM crm_pipelines WHERE id = pipeline_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete stages in own pipelines" ON crm_pipeline_stages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM crm_pipelines WHERE id = pipeline_id AND user_id = auth.uid())
  );

-- Index for ordering
CREATE INDEX idx_crm_stages_order ON crm_pipeline_stages(pipeline_id, order_index);

-- ================================================
-- 3. LEADS
-- ================================================
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES crm_pipelines(id) ON DELETE SET NULL,
  current_stage_id UUID REFERENCES crm_pipeline_stages(id) ON DELETE SET NULL,
  
  -- Basic data
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  
  -- Origin and tracking
  origin VARCHAR(50) NOT NULL DEFAULT 'manual',
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_content VARCHAR(255),
  utm_term VARCHAR(255),
  
  -- Custom fields (JSONB for flexibility)
  custom_fields JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for leads
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads" ON crm_leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own leads" ON crm_leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON crm_leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON crm_leads
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for common queries
CREATE INDEX idx_crm_leads_pipeline ON crm_leads(pipeline_id);
CREATE INDEX idx_crm_leads_stage ON crm_leads(current_stage_id);
CREATE INDEX idx_crm_leads_email ON crm_leads(email);
CREATE INDEX idx_crm_leads_phone ON crm_leads(phone);
CREATE INDEX idx_crm_leads_created ON crm_leads(created_at DESC);

-- ================================================
-- 4. LEAD STAGE HISTORY
-- ================================================
CREATE TABLE IF NOT EXISTS crm_lead_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  from_stage_id UUID REFERENCES crm_pipeline_stages(id) ON DELETE SET NULL,
  to_stage_id UUID REFERENCES crm_pipeline_stages(id) ON DELETE SET NULL,
  moved_at TIMESTAMPTZ DEFAULT NOW(),
  moved_by VARCHAR(255) DEFAULT 'system'
);

-- RLS for history (via lead ownership)
ALTER TABLE crm_lead_stage_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view history of own leads" ON crm_lead_stage_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM crm_leads WHERE id = lead_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create history for own leads" ON crm_lead_stage_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM crm_leads WHERE id = lead_id AND user_id = auth.uid())
  );

-- Index for history queries
CREATE INDEX idx_crm_history_lead ON crm_lead_stage_history(lead_id, moved_at DESC);

-- ================================================
-- 5. LEAD INTERACTIONS
-- ================================================
CREATE TABLE IF NOT EXISTS crm_lead_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES crm_leads(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'note',
  title VARCHAR(255),
  content TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for interactions (via lead ownership)
ALTER TABLE crm_lead_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interactions of own leads" ON crm_lead_interactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM crm_leads WHERE id = lead_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create interactions for own leads" ON crm_lead_interactions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM crm_leads WHERE id = lead_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update interactions of own leads" ON crm_lead_interactions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM crm_leads WHERE id = lead_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete interactions of own leads" ON crm_lead_interactions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM crm_leads WHERE id = lead_id AND user_id = auth.uid())
  );

-- Index for interactions
CREATE INDEX idx_crm_interactions_lead ON crm_lead_interactions(lead_id, created_at DESC);

-- ================================================
-- 6. CUSTOM FIELDS DEFINITION
-- ================================================
CREATE TABLE IF NOT EXISTS crm_custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  field_key VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) NOT NULL DEFAULT 'text',
  options JSONB,
  required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for custom fields
ALTER TABLE crm_custom_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own custom fields" ON crm_custom_fields
  FOR ALL USING (auth.uid() = user_id);

-- ================================================
-- 7. API KEYS
-- ================================================
CREATE TABLE IF NOT EXISTS crm_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(10) NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for API keys
ALTER TABLE crm_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own API keys" ON crm_api_keys
  FOR ALL USING (auth.uid() = user_id);

-- ================================================
-- DONE!
-- ================================================
-- After running this, you should have:
-- - crm_pipelines
-- - crm_pipeline_stages
-- - crm_leads
-- - crm_lead_stage_history
-- - crm_lead_interactions
-- - crm_custom_fields
-- - crm_api_keys
