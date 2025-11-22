-- Migration to update photo storage from file paths to binary data
-- This modifies the existing photo_path to store binary data and keeps pic for backward compatibility

-- Add new column for binary photo data if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'livestock_records' 
        AND column_name = 'photo_data'
    ) THEN
        ALTER TABLE livestock_records ADD COLUMN photo_data BYTEA;
    END IF;
END $$;

-- Add column for photo MIME type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'livestock_records' 
        AND column_name = 'photo_mime_type'
    ) THEN
        ALTER TABLE livestock_records ADD COLUMN photo_mime_type VARCHAR(100);
    END IF;
END $$;

-- Update photo_path to be nullable (it will store filename for reference)
ALTER TABLE livestock_records ALTER COLUMN photo_path DROP NOT NULL;

-- Add comment to document the new structure
COMMENT ON COLUMN livestock_records.photo_data IS 'Binary photo data stored as BYTEA';
COMMENT ON COLUMN livestock_records.photo_mime_type IS 'MIME type of the uploaded photo (e.g., image/jpeg, image/png)';
COMMENT ON COLUMN livestock_records.photo_path IS 'Original filename for reference (optional)';