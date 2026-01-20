-- Ensure default_value column exists
ALTER TABLE crm_pipeline_stages ADD COLUMN IF NOT EXISTS default_value NUMERIC(10, 2);

-- Ensure deal_value column exists on leads
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS deal_value NUMERIC(10, 2);

-- Ensure origin column is TEXT
ALTER TABLE crm_leads ALTER COLUMN origin TYPE TEXT;

-- Verify permissions
GRANT ALL ON crm_pipeline_stages TO authenticated;
GRANT ALL ON crm_leads TO authenticated;
