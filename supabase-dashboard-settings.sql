-- Migration: Create dashboard_settings table for storing sheet URLs
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS dashboard_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visao_geral_sheet_url TEXT,
    investimentos_sheet_url TEXT,
    trafego_sheet_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE dashboard_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all access to dashboard_settings" ON dashboard_settings
    FOR ALL USING (true) WITH CHECK (true);

-- Insert a default row (optional, the app will create one if needed)
-- INSERT INTO dashboard_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;
