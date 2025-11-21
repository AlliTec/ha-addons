-- Add weight column to livestock_records table
ALTER TABLE livestock_records 
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2);

-- Add comment for documentation
COMMENT ON COLUMN livestock_records.weight IS 'Current weight of the animal in kilograms';

-- Add index for weight queries if needed
CREATE INDEX IF NOT EXISTS idx_livestock_records_weight ON livestock_records(weight);