-- Add completion fields to calendar_entries table
ALTER TABLE calendar_entries 
ADD COLUMN IF NOT EXISTS date_completed DATE,
ADD COLUMN IF NOT EXISTS actual_duration_hours DECIMAL(5,2);

-- Add completion fields to animal_history table  
ALTER TABLE animal_history
ADD COLUMN IF NOT EXISTS date_completed DATE,
ADD COLUMN IF NOT EXISTS actual_duration_hours DECIMAL(5,2);

-- Add completion fields to maintenance_history table
ALTER TABLE maintenance_history
ADD COLUMN IF NOT EXISTS date_completed DATE,
ADD COLUMN IF NOT EXISTS actual_duration_hours DECIMAL(5,2);

-- Add comments for documentation
COMMENT ON COLUMN calendar_entries.date_completed IS 'Date when the event was actually completed';
COMMENT ON COLUMN calendar_entries.actual_duration_hours IS 'Actual duration in hours the event took to complete';
COMMENT ON COLUMN animal_history.date_completed IS 'Date when the animal event was actually completed';
COMMENT ON COLUMN animal_history.actual_duration_hours IS 'Actual duration in hours the animal event took to complete';
COMMENT ON COLUMN maintenance_history.date_completed IS 'Date when the maintenance was actually completed';
COMMENT ON COLUMN maintenance_history.actual_duration_hours IS 'Actual duration in hours the maintenance took to complete';