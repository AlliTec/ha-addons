-- Migration to add year and body_feature fields to asset_inventory table
-- Run this to alter the existing table

ALTER TABLE asset_inventory 
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS body_feature VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN asset_inventory.year IS 'Manufacturing year of the asset (e.g., 2024)';
COMMENT ON COLUMN asset_inventory.body_feature IS 'Body type or feature of the asset (e.g., Sedan, Ute, 4WD, Excavator)';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_asset_inventory_year ON asset_inventory(year);
CREATE INDEX IF NOT EXISTS idx_asset_inventory_body_feature ON asset_inventory(body_feature);