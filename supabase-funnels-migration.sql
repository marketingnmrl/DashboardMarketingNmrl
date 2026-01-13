-- Migration: Add hybrid funnel support (CRM + Sheets)
-- Run this in Supabase SQL Editor

-- 1. Add source columns to funnels table
ALTER TABLE funnels ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'sheet';
-- Values: 'sheet' (all stages from sheets) or 'pipeline' (hybrid: CRM stages + sheet stages)

ALTER TABLE funnels ADD COLUMN IF NOT EXISTS source_pipeline_id UUID REFERENCES crm_pipelines(id);
-- If source_type = 'pipeline', this links to the CRM pipeline

-- 2. Add data source columns to funnel_stages table
ALTER TABLE funnel_stages ADD COLUMN IF NOT EXISTS data_source VARCHAR(20) DEFAULT 'sheet';
-- Values: 'sheet' (data from Google Sheets) or 'crm' (data from CRM leads count)

ALTER TABLE funnel_stages ADD COLUMN IF NOT EXISTS crm_stage_id UUID REFERENCES crm_pipeline_stages(id);
-- If data_source = 'crm', this links to the CRM stage for counting leads

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_funnels_source_pipeline ON funnels(source_pipeline_id);
CREATE INDEX IF NOT EXISTS idx_funnel_stages_crm_stage ON funnel_stages(crm_stage_id);
