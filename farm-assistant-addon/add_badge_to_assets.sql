-- Add badge/trim level support to asset_inventory table
-- This allows storing specific trim levels like "XR6 Turbo", "GT", "Limited" etc

-- Add badge/trim column to assets table
ALTER TABLE asset_inventory ADD COLUMN badge VARCHAR(100);

-- Add comment
COMMENT ON COLUMN asset_inventory.badge IS 'Vehicle badge or trim level (e.g., XR6 Turbo, GT, Limited, Sport)';

-- Create index for badge searches
CREATE INDEX IF NOT EXISTS idx_asset_inventory_badge ON asset_inventory(badge);

-- Update timestamp for existing records
UPDATE asset_inventory SET updated_at = CURRENT_TIMESTAMP WHERE badge IS NOT NULL;