-- Add badge/trim level support to vehicle_data table
-- This allows for specific trim levels like "XR6 Turbo", "GT", "Limited" etc

-- Add badge/trim column
ALTER TABLE vehicle_data ADD COLUMN badge VARCHAR(100);

-- Add comment
COMMENT ON COLUMN vehicle_data.badge IS 'Vehicle badge or trim level (e.g., XR6 Turbo, GT, Limited, Sport)';

-- Update unique constraint to include badge
DROP INDEX IF EXISTS idx_vehicle_data_unique;
CREATE UNIQUE INDEX idx_vehicle_data_unique 
ON vehicle_data(make, model, year_start, year_end, body_type, badge);

-- Create index for badge searches
CREATE INDEX IF NOT EXISTS idx_vehicle_data_badge ON vehicle_data(badge);

-- Insert specific badge variants for popular models

-- Ford Falcon badges
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, badge, category) VALUES
('Ford', 'Falcon', 2002, 2008, 'Sedan', 'XR6 Turbo', 'Vehicle'),
('Ford', 'Falcon', 2002, 2008, 'Ute', 'XR6 Turbo', 'Vehicle'),
('Ford', 'Falcon', 2008, 2016, 'Sedan', 'XR6 Turbo', 'Vehicle'),
('Ford', 'Falcon', 2008, 2016, 'Ute', 'XR6 Turbo', 'Vehicle'),
('Ford', 'Falcon', 1992, 2002, 'Sedan', 'XR6', 'Vehicle'),
('Ford', 'Falcon', 1992, 2002, 'Ute', 'XR6', 'Vehicle'),
('Ford', 'Falcon', 2002, 2008, 'Sedan', 'XR8', 'Vehicle'),
('Ford', 'Falcon', 2002, 2008, 'Ute', 'XR8', 'Vehicle'),
('Ford', 'Falcon', 2008, 2016, 'Sedan', 'XR8', 'Vehicle'),
('Ford', 'Falcon', 2008, 2016, 'Ute', 'XR8', 'Vehicle'),
('Ford', 'Falcon', 2002, 2016, 'Sedan', 'G6', 'Vehicle'),
('Ford', 'Falcon', 2002, 2016, 'Sedan', 'G6E', 'Vehicle'),
('Ford', 'Falcon', 2002, 2016, 'Sedan', 'G6E Turbo', 'Vehicle'),
('Ford', 'Falcon', 2002, 2016, 'Wagon', 'G6E', 'Vehicle'),
('Ford', 'Falcon', 2002, 2016, 'Wagon', 'G6E Turbo', 'Vehicle');

-- Holden Commodore badges
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, badge, category) VALUES
('Holden', 'Commodore', 1997, 2006, 'Sedan', 'SS', 'Vehicle'),
('Holden', 'Commodore', 1997, 2006, 'Ute', 'SS', 'Vehicle'),
('Holden', 'Commodore', 2006, 2013, 'Sedan', 'SS', 'Vehicle'),
('Holden', 'Commodore', 2006, 2013, 'Ute', 'SS', 'Vehicle'),
('Holden', 'Commodore', 2013, 2017, 'Sedan', 'SSV', 'Vehicle'),
('Holden', 'Commodore', 2013, 2017, 'Ute', 'SSV', 'Vehicle'),
('Holden', 'Commodore', 1997, 2017, 'Sedan', 'Calais', 'Vehicle'),
('Holden', 'Commodore', 1997, 2017, 'Wagon', 'Calais', 'Vehicle'),
('Holden', 'Commodore', 2006, 2017, 'Sedan', 'Calais V', 'Vehicle'),
('Holden', 'Commodore', 2006, 2017, 'Wagon', 'Calais V', 'Vehicle');

-- Toyota Hilux badges
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, badge, category) VALUES
('Toyota', 'Hilux', 2015, 2024, 'Ute', 'SR5', 'Vehicle'),
('Toyota', 'Hilux', 2015, 2024, 'Double Cab', 'SR5', 'Vehicle'),
('Toyota', 'Hilux', 2015, 2024, 'Ute', 'Rogue', 'Vehicle'),
('Toyota', 'Hilux', 2015, 2024, 'Double Cab', 'Rogue', 'Vehicle'),
('Toyota', 'Hilux', 2005, 2015, 'Ute', 'SR', 'Vehicle'),
('Toyota', 'Hilux', 2005, 2015, 'Double Cab', 'SR', 'Vehicle');

-- Ford Ranger badges
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, badge, category) VALUES
('Ford', 'Ranger', 2011, 2024, 'Ute', 'XLT', 'Vehicle'),
('Ford', 'Ranger', 2011, 2024, 'Double Cab', 'XLT', 'Vehicle'),
('Ford', 'Ranger', 2011, 2024, 'Ute', 'Wildtrak', 'Vehicle'),
('Ford', 'Ranger', 2011, 2024, 'Double Cab', 'Wildtrak', 'Vehicle'),
('Ford', 'Ranger', 2011, 2024, 'Ute', 'Raptor', 'Vehicle'),
('Ford', 'Ranger', 2011, 2024, 'Double Cab', 'Raptor', 'Vehicle');

-- Nissan Navara badges
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, badge, category) VALUES
('Nissan', 'Navara', 2014, 2024, 'Ute', 'ST-X', 'Vehicle'),
('Nissan', 'Navara', 2014, 2024, 'Double Cab', 'ST-X', 'Vehicle'),
('Nissan', 'Navara', 2008, 2014, 'Ute', 'ST', 'Vehicle'),
('Nissan', 'Navara', 2008, 2014, 'Double Cab', 'ST', 'Vehicle');

-- Mitsubishi Triton badges
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, badge, category) VALUES
('Mitsubishi', 'Triton', 2015, 2024, 'Ute', 'GLS', 'Vehicle'),
('Mitsubishi', 'Triton', 2015, 2024, 'Double Cab', 'GLS', 'Vehicle'),
('Mitsubishi', 'Triton', 2009, 2015, 'Ute', 'GLX', 'Vehicle'),
('Mitsubishi', 'Triton', 2009, 2015, 'Double Cab', 'GLX', 'Vehicle');

-- Update timestamp
UPDATE vehicle_data SET updated_at = CURRENT_TIMESTAMP WHERE badge IS NOT NULL;