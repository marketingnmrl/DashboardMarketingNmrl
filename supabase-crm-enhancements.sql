-- CRM Enhancements Migration
-- Run this in Supabase SQL Editor

-- 1. Add default_value to pipeline stages
ALTER TABLE crm_pipeline_stages 
ADD COLUMN IF NOT EXISTS default_value DECIMAL(10,2) DEFAULT NULL;

COMMENT ON COLUMN crm_pipeline_stages.default_value IS 'Default deal value when a lead enters this stage';

-- 2. Add deal_value to leads
ALTER TABLE crm_leads 
ADD COLUMN IF NOT EXISTS deal_value DECIMAL(10,2) DEFAULT NULL;

COMMENT ON COLUMN crm_leads.deal_value IS 'Deal/sale value for this lead';

-- 3. Change origin column to text if it's an enum (allows custom origins)
-- First check if it's an enum and alter if needed
DO $$
BEGIN
    -- If origin is an enum type, convert to text
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'crm_leads' 
        AND column_name = 'origin' 
        AND data_type = 'USER-DEFINED'
    ) THEN
        ALTER TABLE crm_leads ALTER COLUMN origin TYPE TEXT;
    END IF;
END $$;

-- 4. Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_crm_leads_origin ON crm_leads(origin);
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage_origin ON crm_leads(current_stage_id, origin);
CREATE INDEX IF NOT EXISTS idx_crm_leads_utm_source ON crm_leads(utm_source);
CREATE INDEX IF NOT EXISTS idx_crm_leads_utm_campaign ON crm_leads(utm_campaign);

-- 5. Create a view for lead analytics with deal values
CREATE OR REPLACE VIEW crm_lead_analytics AS
SELECT 
    l.id,
    l.pipeline_id,
    l.current_stage_id,
    l.origin,
    l.utm_source,
    l.utm_medium,
    l.utm_campaign,
    l.deal_value,
    l.created_at,
    p.name as pipeline_name,
    s.name as stage_name,
    s.order_index as stage_order
FROM crm_leads l
LEFT JOIN crm_pipelines p ON l.pipeline_id = p.id
LEFT JOIN crm_pipeline_stages s ON l.current_stage_id = s.id;

COMMENT ON VIEW crm_lead_analytics IS 'Denormalized view for lead analytics and reporting';
