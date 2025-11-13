-- Add time and duration fields to calendar_entries table
ALTER TABLE calendar_entries 
ADD COLUMN IF NOT EXISTS event_time TIME,
ADD COLUMN IF NOT EXISTS duration_hours DECIMAL(5,2) DEFAULT 1.0;

-- Add comments for new fields
COMMENT ON COLUMN calendar_entries.event_time IS 'Start time of the event (HH:MM:SS)';
COMMENT ON COLUMN calendar_entries.duration_hours IS 'Duration of the event in hours';

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_calendar_entries_datetime ON calendar_entries(entry_date, event_time);