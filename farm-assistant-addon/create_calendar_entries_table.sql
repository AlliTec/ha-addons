-- Create calendar_entries table for user-created events and calendar display
CREATE TABLE IF NOT EXISTS calendar_entries (
    id SERIAL PRIMARY KEY,
    entry_date DATE NOT NULL,
    entry_type VARCHAR(50) DEFAULT 'event' CHECK (entry_type IN ('informational', 'action', 'event')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('livestock', 'asset', 'general')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    related_id INTEGER,  -- Reference to livestock_records.id or assets.id
    related_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_entries_date ON calendar_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_category ON calendar_entries(category);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_entry_type ON calendar_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_related_id ON calendar_entries(related_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_calendar_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calendar_entries_updated_at_trigger
    BEFORE UPDATE ON calendar_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_entries_updated_at();

-- Add comment for documentation
COMMENT ON TABLE calendar_entries IS 'Calendar entries for user-created events and system-generated calendar items';
COMMENT ON COLUMN calendar_entries.entry_type IS 'Type of entry: informational, action, or user-created event';
COMMENT ON COLUMN calendar_entries.category IS 'Category: livestock, asset, or general';
COMMENT ON COLUMN calendar_entries.related_id IS 'Optional reference to livestock_records.id or assets.id';
COMMENT ON COLUMN calendar_entries.related_name IS 'Display name for the related item';