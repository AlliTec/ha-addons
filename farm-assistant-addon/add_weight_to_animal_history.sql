-- Add weight tracking to animal_history table
ALTER TABLE animal_history 
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(10) DEFAULT 'kg';

-- Add index for weight queries
CREATE INDEX IF NOT EXISTS idx_animal_history_weight ON animal_history(weight);

-- Add comments for documentation
COMMENT ON COLUMN animal_history.weight IS 'Animal weight at the time of the event (in specified unit)';
COMMENT ON COLUMN animal_history.weight_unit IS 'Unit of measurement for weight (kg, lb, etc.)';

-- Create a separate table for weight history if needed for better tracking
CREATE TABLE IF NOT EXISTS animal_weight_history (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES livestock_records(id) ON DELETE CASCADE,
    weight DECIMAL(8,2) NOT NULL,
    weight_unit VARCHAR(10) DEFAULT 'kg',
    measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    measurement_time TIME NOT NULL DEFAULT CURRENT_TIME,
    notes TEXT,
    recorded_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for weight history table
CREATE INDEX IF NOT EXISTS idx_animal_weight_history_animal_id ON animal_weight_history(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_weight_history_date ON animal_weight_history(measurement_date);

-- Add trigger to update updated_at timestamp for weight history
CREATE OR REPLACE FUNCTION update_animal_weight_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER animal_weight_history_updated_at_trigger
    BEFORE UPDATE ON animal_weight_history
    FOR EACH ROW
    EXECUTE FUNCTION update_animal_weight_history_updated_at();

-- Add comment for weight history table
COMMENT ON TABLE animal_weight_history IS 'Dedicated table for tracking animal weight measurements over time';
COMMENT ON COLUMN animal_weight_history.recorded_by IS 'Name or ID of person who recorded the weight';