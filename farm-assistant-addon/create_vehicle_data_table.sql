-- Create vehicle_data table for standardized vehicle information
-- This table will store vehicle makes, models, years, and body types

CREATE TABLE IF NOT EXISTS vehicle_data (
    id SERIAL PRIMARY KEY,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    body_type VARCHAR(50),
    category VARCHAR(50) DEFAULT 'Vehicle',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicle_data_make ON vehicle_data(make);
CREATE INDEX IF NOT EXISTS idx_vehicle_data_model ON vehicle_data(model);
CREATE INDEX IF NOT EXISTS idx_vehicle_data_year ON vehicle_data(year_start, year_end);
CREATE INDEX IF NOT EXISTS idx_vehicle_data_body_type ON vehicle_data(body_type);
CREATE INDEX IF NOT EXISTS idx_vehicle_data_category ON vehicle_data(category);

-- Add unique constraint to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_data_unique 
ON vehicle_data(make, model, year_start, year_end, body_type);

-- Add comments
COMMENT ON TABLE vehicle_data IS 'Standardized vehicle data for make, model, year, and body type selection';
COMMENT ON COLUMN vehicle_data.make IS 'Vehicle manufacturer (e.g., Toyota, Ford, Honda)';
COMMENT ON COLUMN vehicle_data.model IS 'Vehicle model name (e.g., Hilux, F-150, Civic)';
COMMENT ON COLUMN vehicle_data.year_start IS 'First production year for this configuration';
COMMENT ON COLUMN vehicle_data.year_end IS 'Last production year for this configuration (NULL if still produced)';
COMMENT ON COLUMN vehicle_data.body_type IS 'Vehicle body style (e.g., Ute, Sedan, SUV, Hatchback)';
COMMENT ON COLUMN vehicle_data.category IS 'Asset category (Vehicle, Machinery, Equipment)';