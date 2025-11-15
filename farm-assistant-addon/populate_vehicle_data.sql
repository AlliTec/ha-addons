-- Populate vehicle_data table with common vehicle makes, models, years, and body types
-- This provides a comprehensive dataset for vehicle selection

-- Clear existing data to avoid duplicates
DELETE FROM vehicle_data;
ALTER SEQUENCE vehicle_data_id_seq RESTART WITH 1;

-- Toyota vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Toyota', 'Hilux', 2015, 2024, 'Ute', 'Vehicle'),
('Toyota', 'Hilux', 2015, 2024, 'Double Cab', 'Vehicle'),
('Toyota', 'Land Cruiser', 2020, 2024, 'SUV', 'Vehicle'),
('Toyota', 'Land Cruiser', 2020, 2024, '4WD', 'Vehicle'),
('Toyota', 'Corolla', 2018, 2024, 'Sedan', 'Vehicle'),
('Toyota', 'Corolla', 2018, 2024, 'Hatchback', 'Vehicle'),
('Toyota', 'Camry', 2019, 2024, 'Sedan', 'Vehicle'),
('Toyota', 'RAV4', 2019, 2024, 'SUV', 'Vehicle'),
('Toyota', 'Prado', 2020, 2024, 'SUV', 'Vehicle'),
('Toyota', 'Hiace', 2019, 2024, 'Van', 'Vehicle');

-- Ford vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Ford', 'F-150', 2021, 2024, 'Ute', 'Vehicle'),
('Ford', 'Ranger', 2022, 2024, 'Ute', 'Vehicle'),
('Ford', 'Ranger', 2022, 2024, 'Double Cab', 'Vehicle'),
('Ford', 'Mustang', 2020, 2024, 'Coupe', 'Vehicle'),
('Ford', 'Mustang', 2020, 2024, 'Convertible', 'Vehicle'),
('Ford', 'Explorer', 2020, 2024, 'SUV', 'Vehicle'),
('Ford', 'Transit', 2020, 2024, 'Van', 'Vehicle'),
('Ford', 'Falcon', 2016, 2016, 'Sedan', 'Vehicle'),
('Ford', 'Territory', 2016, 2016, 'SUV', 'Vehicle');

-- Holden vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Holden', 'Colorado', 2021, 2024, 'Ute', 'Vehicle'),
('Holden', 'Colorado', 2021, 2024, 'Double Cab', 'Vehicle'),
('Holden', 'Commodore', 2017, 2020, 'Sedan', 'Vehicle'),
('Holden', 'Commodore', 2017, 2020, 'Ute', 'Vehicle'),
('Holden', 'Captiva', 2016, 2018, 'SUV', 'Vehicle'),
('Holden', 'Trax', 2016, 2020, 'SUV', 'Vehicle'),
('Holden', 'Barina', 2016, 2018, 'Hatchback', 'Vehicle');

-- Mazda vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Mazda', 'BT-50', 2020, 2024, 'Ute', 'Vehicle'),
('Mazda', 'BT-50', 2020, 2024, 'Double Cab', 'Vehicle'),
('Mazda', 'CX-5', 2017, 2024, 'SUV', 'Vehicle'),
('Mazda', 'CX-9', 2018, 2024, 'SUV', 'Vehicle'),
('Mazda', '3', 2019, 2024, 'Sedan', 'Vehicle'),
('Mazda', '3', 2019, 2024, 'Hatchback', 'Vehicle'),
('Mazda', '6', 2018, 2024, 'Sedan', 'Vehicle'),
('Mazda', '6', 2018, 2024, 'Wagon', 'Vehicle');

-- Nissan vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Nissan', 'Navara', 2021, 2024, 'Ute', 'Vehicle'),
('Nissan', 'Navara', 2021, 2024, 'Double Cab', 'Vehicle'),
('Nissan', 'Patrol', 2020, 2024, 'SUV', 'Vehicle'),
('Nissan', 'Patrol', 2020, 2024, '4WD', 'Vehicle'),
('Nissan', 'X-Trail', 2021, 2024, 'SUV', 'Vehicle'),
('Nissan', 'Qashqai', 2021, 2024, 'SUV', 'Vehicle'),
('Nissan', 'Pathfinder', 2021, 2024, 'SUV', 'Vehicle');

-- Mitsubishi vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Mitsubishi', 'Triton', 2019, 2024, 'Ute', 'Vehicle'),
('Mitsubishi', 'Triton', 2019, 2024, 'Double Cab', 'Vehicle'),
('Mitsubishi', 'Pajero', 2020, 2024, 'SUV', 'Vehicle'),
('Mitsubishi', 'Pajero', 2020, 2024, '4WD', 'Vehicle'),
('Mitsubishi', 'ASX', 2019, 2024, 'SUV', 'Vehicle'),
('Mitsubishi', 'Outlander', 2019, 2024, 'SUV', 'Vehicle'),
('Mitsubishi', 'Lancer', 2017, 2017, 'Sedan', 'Vehicle');

-- Isuzu vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Isuzu', 'D-Max', 2020, 2024, 'Ute', 'Vehicle'),
('Isuzu', 'D-Max', 2020, 2024, 'Double Cab', 'Vehicle'),
('Isuzu', 'MU-X', 2020, 2024, 'SUV', 'Vehicle'),
('Isuzu', 'NPR', 2018, 2024, 'Truck', 'Vehicle'),
('Isuzu', 'NQR', 2018, 2024, 'Truck', 'Vehicle'),
('Isuzu', 'NPR', 2018, 2024, 'Cab Chassis', 'Vehicle');

-- Honda vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Honda', 'CR-V', 2020, 2024, 'SUV', 'Vehicle'),
('Honda', 'HR-V', 2020, 2024, 'SUV', 'Vehicle'),
('Honda', 'Civic', 2019, 2024, 'Sedan', 'Vehicle'),
('Honda', 'Civic', 2019, 2024, 'Hatchback', 'Vehicle'),
('Honda', 'Accord', 2018, 2024, 'Sedan', 'Vehicle'),
('Honda', 'Jazz', 2020, 2024, 'Hatchback', 'Vehicle');

-- Hyundai vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Hyundai', 'Santa Fe', 2020, 2024, 'SUV', 'Vehicle'),
('Hyundai', 'Tucson', 2020, 2024, 'SUV', 'Vehicle'),
('Hyundai', 'i30', 2020, 2024, 'Hatchback', 'Vehicle'),
('Hyundai', 'i30', 2020, 2024, 'Sedan', 'Vehicle'),
('Hyundai', 'Elantra', 2020, 2024, 'Sedan', 'Vehicle'),
('Hyundai', 'Accent', 2019, 2024, 'Hatchback', 'Vehicle');

-- Kia vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Kia', 'Sorento', 2020, 2024, 'SUV', 'Vehicle'),
('Kia', 'Sportage', 2020, 2024, 'SUV', 'Vehicle'),
('Kia', 'Cerato', 2019, 2024, 'Sedan', 'Vehicle'),
('Kia', 'Cerato', 2019, 2024, 'Hatchback', 'Vehicle'),
('Kia', 'Carnival', 2021, 2024, 'Van', 'Vehicle');

-- Volkswagen vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Volkswagen', 'Amarok', 2020, 2024, 'Ute', 'Vehicle'),
('Volkswagen', 'Amarok', 2020, 2024, 'Double Cab', 'Vehicle'),
('Volkswagen', 'Tiguan', 2020, 2024, 'SUV', 'Vehicle'),
('Volkswagen', 'Touareg', 2018, 2024, 'SUV', 'Vehicle'),
('Volkswagen', 'Golf', 2020, 2024, 'Hatchback', 'Vehicle'),
('Volkswagen', 'Polo', 2018, 2024, 'Hatchback', 'Vehicle'),
('Volkswagen', 'Passat', 2019, 2024, 'Sedan', 'Vehicle'),
('Volkswagen', 'Transporter', 2020, 2024, 'Van', 'Vehicle'),
('Volkswagen', 'Caddy', 2020, 2024, 'Van', 'Vehicle');

-- BMW vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('BMW', 'X5', 2020, 2024, 'SUV', 'Vehicle'),
('BMW', 'X3', 2020, 2024, 'SUV', 'Vehicle'),
('BMW', '3 Series', 2019, 2024, 'Sedan', 'Vehicle'),
('BMW', '5 Series', 2020, 2024, 'Sedan', 'Vehicle'),
('BMW', 'X1', 2020, 2024, 'SUV', 'Vehicle');

-- Mercedes-Benz vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Mercedes-Benz', 'GLE', 2020, 2024, 'SUV', 'Vehicle'),
('Mercedes-Benz', 'GLC', 2020, 2024, 'SUV', 'Vehicle'),
('Mercedes-Benz', 'C-Class', 2021, 2024, 'Sedan', 'Vehicle'),
('Mercedes-Benz', 'E-Class', 2020, 2024, 'Sedan', 'Vehicle'),
('Mercedes-Benz', 'Sprinter', 2019, 2024, 'Van', 'Vehicle');

-- Audi vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Audi', 'Q5', 2020, 2024, 'SUV', 'Vehicle'),
('Audi', 'Q7', 2020, 2024, 'SUV', 'Vehicle'),
('Audi', 'A4', 2020, 2024, 'Sedan', 'Vehicle'),
('Audi', 'A6', 2020, 2024, 'Sedan', 'Vehicle'),
('Audi', 'Q3', 2020, 2024, 'SUV', 'Vehicle');

-- Land Rover vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Land Rover', 'Defender', 2020, 2024, 'SUV', 'Vehicle'),
('Land Rover', 'Defender', 2020, 2024, '4WD', 'Vehicle'),
('Land Rover', 'Discovery', 2020, 2024, 'SUV', 'Vehicle'),
('Land Rover', 'Range Rover', 2020, 2024, 'SUV', 'Vehicle'),
('Land Rover', 'Evoque', 2020, 2024, 'SUV', 'Vehicle');

-- Subaru vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Subaru', 'Outback', 2020, 2024, 'SUV', 'Vehicle'),
('Subaru', 'Forester', 2019, 2024, 'SUV', 'Vehicle'),
('Subaru', 'XV', 2018, 2024, 'SUV', 'Vehicle'),
('Subaru', 'Impreza', 2019, 2024, 'Sedan', 'Vehicle'),
('Subaru', 'Impreza', 2019, 2024, 'Hatchback', 'Vehicle');

-- Suzuki vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Suzuki', 'Jimny', 2018, 2024, 'SUV', 'Vehicle'),
('Suzuki', 'Jimny', 2018, 2024, '4WD', 'Vehicle'),
('Suzuki', 'Vitara', 2019, 2024, 'SUV', 'Vehicle'),
('Suzuki', 'Swift', 2018, 2024, 'Hatchback', 'Vehicle'),
('Suzuki', 'S-Cross', 2017, 2024, 'SUV', 'Vehicle');

-- Jeep vehicles
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Jeep', 'Wrangler', 2018, 2024, 'SUV', 'Vehicle'),
('Jeep', 'Wrangler', 2018, 2024, '4WD', 'Vehicle'),
('Jeep', 'Cherokee', 2019, 2024, 'SUV', 'Vehicle'),
('Jeep', 'Grand Cherokee', 2021, 2024, 'SUV', 'Vehicle'),
('Jeep', 'Renegade', 2019, 2024, 'SUV', 'Vehicle');

-- Common machinery and equipment
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Caterpillar', 'D6T', 2018, 2024, 'Dozer', 'Machinery'),
('Caterpillar', '320', 2019, 2024, 'Excavator', 'Machinery'),
('Caterpillar', '966M', 2020, 2024, 'Wheel Loader', 'Machinery'),
('Komatsu', 'D61PX', 2018, 2024, 'Dozer', 'Machinery'),
('Komatsu', 'PC210', 2019, 2024, 'Excavator', 'Machinery'),
('Komatsu', 'WA380', 2018, 2024, 'Wheel Loader', 'Machinery'),
('John Deere', '350G', 2018, 2024, 'Excavator', 'Machinery'),
('John Deere', '644K', 2019, 2024, 'Wheel Loader', 'Machinery'),
('John Deere', '824K', 2020, 2024, 'Dozer', 'Machinery'),
('Bobcat', 'S70', 2018, 2024, 'Skid Steer', 'Machinery'),
('Bobcat', 'T650', 2019, 2024, 'Track Loader', 'Machinery'),
('Bobcat', 'E85', 2020, 2024, 'Excavator', 'Machinery'),
('Kubota', 'KX040', 2019, 2024, 'Excavator', 'Machinery'),
('Kubota', 'L47', 2018, 2024, 'Tractor Loader', 'Machinery'),
('Kubota', 'M62', 2020, 2024, 'Tractor Loader', 'Machinery'),
('JCB', '3CX', 2018, 2024, 'Backhoe', 'Machinery'),
('JCB', '8018', 2019, 2024, 'Excavator', 'Machinery'),
('JCB', '416S', 2020, 2024, 'Wheel Loader', 'Machinery');

-- Common farm equipment
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Massey Ferguson', '6712', 2018, 2024, 'Tractor', 'Machinery'),
('Massey Ferguson', '5713', 2019, 2024, 'Tractor', 'Machinery'),
('Case IH', 'Puma 240', 2018, 2024, 'Tractor', 'Machinery'),
('Case IH', 'Magnum 380', 2020, 2024, 'Tractor', 'Machinery'),
('New Holland', 'T8.390', 2019, 2024, 'Tractor', 'Machinery'),
('New Holland', 'T7.270', 2020, 2024, 'Tractor', 'Machinery'),
('Fendt', '936', 2018, 2024, 'Tractor', 'Machinery'),
('Fendt', '828', 2019, 2024, 'Tractor', 'Machinery'),
('John Deere', '6120M', 2018, 2024, 'Tractor', 'Machinery'),
('John Deere', '8R 410', 2020, 2024, 'Tractor', 'Machinery');

-- Update the updated_at timestamp
UPDATE vehicle_data SET updated_at = CURRENT_TIMESTAMP;