-- Migration to add photo storage capability to asset_inventory table
-- This will allow assets to have photos just like animals

-- Add photo storage columns to asset_inventory table
ALTER TABLE asset_inventory 
ADD COLUMN IF NOT EXISTS photo_path VARCHAR(255),
ADD COLUMN IF NOT EXISTS photo_mime_type VARCHAR(100);

-- Add comments for documentation
COMMENT ON COLUMN asset_inventory.photo_path IS 'File path to the asset photo image';
COMMENT ON COLUMN asset_inventory.photo_mime_type IS 'MIME type of the stored photo (e.g., image/jpeg, image/png)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_asset_inventory_photo_path ON asset_inventory(photo_path);

-- Migration completed successfully