-- Create table for multiple animal photos
CREATE TABLE IF NOT EXISTS animal_photos (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES livestock_records(id) ON DELETE CASCADE,
    photo_data BYTEA NOT NULL,
    photo_mime_type VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
    filename VARCHAR(255) NOT NULL,
    upload_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_size INTEGER NOT NULL,
    description TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_animal_photos_animal_id ON animal_photos(animal_id);

-- Add comment
COMMENT ON TABLE animal_photos IS 'Stores multiple photos for each animal';
COMMENT ON COLUMN animal_photos.photo_data IS 'Binary photo data stored as BYTEA';
COMMENT ON COLUMN animal_photos.photo_mime_type IS 'MIME type of uploaded photo (e.g., image/jpeg, image/png)';
COMMENT ON COLUMN animal_photos.filename IS 'Original filename of the uploaded photo';
COMMENT ON COLUMN animal_photos.upload_time IS 'Timestamp when photo was uploaded';
COMMENT ON COLUMN animal_photos.file_size IS 'Size of the photo file in bytes';
COMMENT ON COLUMN animal_photos.description IS 'Optional description for the photo';