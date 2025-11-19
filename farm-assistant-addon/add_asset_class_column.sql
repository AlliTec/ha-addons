-- Migration to add asset_class column to asset_inventory table

ALTER TABLE asset_inventory 
ADD COLUMN asset_class VARCHAR(50);

-- Add comment
COMMENT ON COLUMN asset_inventory.asset_class IS 'Classification of asset type (Vehicle, Machinery, Equipment, Building, Tool)';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_asset_inventory_asset_class ON asset_inventory(asset_class);