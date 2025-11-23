-- Create table for multiple asset photos (identical to animal_photos structure)
CREATE TABLE IF NOT EXISTS asset_photos (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES asset_inventory(id) ON DELETE CASCADE,
    photo_data BYTEA NOT NULL,
    photo_mime_type VARCHAR(100) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    upload_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_size INTEGER NOT NULL,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_asset_photos_asset_id ON asset_photos(asset_id);

COMMENT ON TABLE asset_photos IS 'Stores multiple photos for each asset (identical to animal_photos)';
COMMENT ON COLUMN asset_photos.photo_data IS 'Binary photo data stored as BYTEA';
COMMENT ON COLUMN asset_photos.photo_mime_type IS 'MIME type of uploaded photo (e.g., image/jpeg, image/png)';
COMMENT ON COLUMN asset_photos.filename IS 'Original filename of uploaded photo';
COMMENT ON COLUMN asset_photos.upload_time IS 'Timestamp when photo was uploaded';
COMMENT ON COLUMN asset_photos.file_size IS 'Size of photo file in bytes';
COMMENT ON COLUMN asset_photos.description IS 'Optional description for photo';