-- Run ONLY this command to add the column to your existing table:
ALTER TABLE dashboard_settings ADD COLUMN IF NOT EXISTS hidden_menu_items TEXT[] DEFAULT '{}';
