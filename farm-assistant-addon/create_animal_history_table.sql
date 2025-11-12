-- Create animal_history table for tracking livestock events and procedures
CREATE TABLE IF NOT EXISTS animal_history (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES livestock_records(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration_hours DECIMAL(5,2) DEFAULT 1.0,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animal_history_animal_id ON animal_history(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_history_date ON animal_history(event_date);
CREATE INDEX IF NOT EXISTS idx_animal_history_status ON animal_history(status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_animal_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER animal_history_updated_at_trigger
    BEFORE UPDATE ON animal_history
    FOR EACH ROW
    EXECUTE FUNCTION update_animal_history_updated_at();

-- Add comment for documentation
COMMENT ON TABLE animal_history IS 'History table for tracking livestock events, treatments, and procedures';
COMMENT ON COLUMN animal_history.duration_hours IS 'Expected or actual duration of the event in hours';
COMMENT ON COLUMN animal_history.status IS 'Current status of the event: scheduled, in_progress, completed, cancelled';
COMMENT ON COLUMN animal_history.priority IS 'Priority level: low, medium, high, urgent';