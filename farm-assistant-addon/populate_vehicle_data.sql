-- populate_vehicle_data.sql
-- Corrected vehicle data with accurate production years and complete body types
-- This script fixes the major issues identified: Ford Falcon (1960-2016, not just 2016) and missing body types

-- Clear existing data to avoid conflicts
DELETE FROM vehicle_data;

-- Insert corrected data for all major manufacturers

-- TOYOTA VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Toyota', 'Hilux', 1968, 2024, 'Ute', 'Vehicle'),
('Toyota', 'Hilux', 1968, 2024, 'Double Cab', 'Vehicle'),
('Toyota', 'Land Cruiser', 1980, 2024, '4WD', 'Vehicle'),
('Toyota', 'Land Cruiser', 1980, 2024, 'SUV', 'Vehicle'),
('Toyota', 'Land Cruiser', 1980, 2024, 'Wagon', 'Vehicle'),
('Toyota', 'Corolla', 1966, 2024, 'Sedan', 'Vehicle'),
('Toyota', 'Corolla', 1966, 2024, 'Hatchback', 'Vehicle'),
('Toyota', 'Corolla', 1966, 2024, 'Wagon', 'Vehicle'),
('Toyota', 'Camry', 1982, 2024, 'Sedan', 'Vehicle'),
('Toyota', 'Camry', 1982, 2024, 'Wagon', 'Vehicle'),
('Toyota', 'RAV4', 1994, 2024, 'SUV', 'Vehicle'),
('Toyota', 'Prius', 1997, 2024, 'Hatchback', 'Vehicle'),
('Toyota', 'Hiace', 1967, 2024, 'Van', 'Vehicle'),
('Toyota', 'Prado', 1990, 2024, 'SUV', 'Vehicle');

-- FORD VEHICLES (CORRECTED DATES AND COMPLETE BODY TYPES)
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Ford', 'Falcon', 1960, 2016, 'Sedan', 'Vehicle'),
('Ford', 'Falcon', 1960, 2016, 'Wagon', 'Vehicle'),
('Ford', 'Falcon', 1960, 2016, 'Ute', 'Vehicle'),
('Ford', 'Falcon', 1960, 2016, 'Panel Van', 'Vehicle'),
('Ford', 'Falcon', 1960, 2016, 'Coupe', 'Vehicle'),
('Ford', 'Falcon', 1960, 2016, 'Hardtop', 'Vehicle'),
('Ford', 'Territory', 2004, 2016, 'SUV', 'Vehicle'),
('Ford', 'Mustang', 1964, 2024, 'Coupe', 'Vehicle'),
('Ford', 'Mustang', 1964, 2024, 'Convertible', 'Vehicle'),
('Ford', 'Ranger', 1998, 2024, 'Ute', 'Vehicle'),
('Ford', 'Ranger', 1998, 2024, 'Double Cab', 'Vehicle'),
('Ford', 'Explorer', 1990, 2024, 'SUV', 'Vehicle'),
('Ford', 'Transit', 1965, 2024, 'Van', 'Vehicle');

-- HOLDEN VEHICLES (EXPANDED WITH MORE MODELS)
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Holden', 'Commodore', 1978, 2017, 'Sedan', 'Vehicle'),
('Holden', 'Commodore', 1978, 2017, 'Wagon', 'Vehicle'),
('Holden', 'Commodore', 1978, 2017, 'Ute', 'Vehicle'),
('Holden', 'Colorado', 2012, 2024, 'Ute', 'Vehicle'),
('Holden', 'Colorado', 2012, 2024, 'Double Cab', 'Vehicle'),
('Holden', 'Captiva', 2006, 2018, 'SUV', 'Vehicle'),
('Holden', 'Trax', 2013, 2024, 'SUV', 'Vehicle'),
('Holden', 'Barina', 1985, 2018, 'Hatchback', 'Vehicle'),
('Holden', 'Barina', 1985, 2018, 'Sedan', 'Vehicle'),
('Holden', 'Statesman', 1990, 2017, 'Sedan', 'Vehicle'),
('Holden', 'Astra', 1995, 2020, 'Hatchback', 'Vehicle'),
('Holden', 'Astra', 1995, 2020, 'Sedan', 'Vehicle');

-- MAZDA VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Mazda', 'BT-50', 2006, 2024, 'Ute', 'Vehicle'),
('Mazda', 'BT-50', 2006, 2024, 'Double Cab', 'Vehicle'),
('Mazda', 'CX-5', 2012, 2024, 'SUV', 'Vehicle'),
('Mazda', 'CX-7', 2006, 2012, 'SUV', 'Vehicle'),
('Mazda', 'CX-9', 2007, 2024, 'SUV', 'Vehicle'),
('Mazda', '3', 2003, 2024, 'Sedan', 'Vehicle'),
('Mazda', '3', 2003, 2024, 'Hatchback', 'Vehicle'),
('Mazda', '6', 2002, 2024, 'Sedan', 'Vehicle'),
('Mazda', '6', 2002, 2024, 'Hatchback', 'Vehicle'),
('Mazda', '6', 2002, 2024, 'Wagon', 'Vehicle');

-- NISSAN VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Nissan', 'Navara', 1986, 2024, 'Ute', 'Vehicle'),
('Nissan', 'Navara', 1986, 2024, 'Double Cab', 'Vehicle'),
('Nissan', 'Patrol', 1951, 2024, 'SUV', 'Vehicle'),
('Nissan', 'Patrol', 1951, 2024, '4WD', 'Vehicle'),
('Nissan', 'X-Trail', 2000, 2024, 'SUV', 'Vehicle'),
('Nissan', 'Pathfinder', 1985, 2024, 'SUV', 'Vehicle'),
('Nissan', 'Dualis', 2007, 2014, 'SUV', 'Vehicle'),
('Nissan', 'Skyline', 1957, 2024, 'Sedan', 'Vehicle'),
('Nissan', 'Skyline', 1957, 2024, 'Coupe', 'Vehicle');

-- MITSUBISHI VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Mitsubishi', 'Triton', 1978, 2024, 'Ute', 'Vehicle'),
('Mitsubishi', 'Triton', 1978, 2024, 'Double Cab', 'Vehicle'),
('Mitsubishi', 'Pajero', 1982, 2021, 'SUV', 'Vehicle'),
('Mitsubishi', 'Pajero', 1982, 2021, '4WD', 'Vehicle'),
('Mitsubishi', 'Lancer', 1973, 2017, 'Sedan', 'Vehicle'),
('Mitsubishi', 'Lancer', 1973, 2017, 'Hatchback', 'Vehicle'),
('Mitsubishi', 'Lancer', 1973, 2017, 'Wagon', 'Vehicle'),
('Mitsubishi', 'ASX', 2010, 2024, 'SUV', 'Vehicle');

-- SUBARU VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Subaru', 'Impreza', 1992, 2024, 'Sedan', 'Vehicle'),
('Subaru', 'Impreza', 1992, 2024, 'Hatchback', 'Vehicle'),
('Subaru', 'Impreza', 1992, 2024, 'Wagon', 'Vehicle'),
('Subaru', 'Outback', 1994, 2024, 'SUV', 'Vehicle'),
('Subaru', 'Legacy', 1989, 2024, 'Sedan', 'Vehicle'),
('Subaru', 'Legacy', 1989, 2024, 'Wagon', 'Vehicle'),
('Subaru', 'Forester', 1997, 2024, 'SUV', 'Vehicle');

-- HONDA VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Honda', 'Civic', 1972, 2024, 'Sedan', 'Vehicle'),
('Honda', 'Civic', 1972, 2024, 'Hatchback', 'Vehicle'),
('Honda', 'Civic', 1972, 2024, 'Wagon', 'Vehicle'),
('Honda', 'Accord', 1976, 2024, 'Sedan', 'Vehicle'),
('Honda', 'Accord', 1976, 2024, 'Wagon', 'Vehicle'),
('Honda', 'CR-V', 1995, 2024, 'SUV', 'Vehicle'),
('Honda', 'Fit', 2001, 2024, 'Hatchback', 'Vehicle'),
('Honda', 'Jazz', 2001, 2024, 'Hatchback', 'Vehicle'),
('Honda', 'City', 1981, 2024, 'Sedan', 'Vehicle');

-- HYUNDAI VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Hyundai', 'Elantra', 1990, 2024, 'Sedan', 'Vehicle'),
('Hyundai', 'Elantra', 1990, 2024, 'Hatchback', 'Vehicle'),
('Hyundai', 'Sonata', 1985, 2024, 'Sedan', 'Vehicle'),
('Hyundai', 'Tucson', 2004, 2024, 'SUV', 'Vehicle'),
('Hyundai', 'i30', 2007, 2024, 'Hatchback', 'Vehicle'),
('Hyundai', 'i30', 2007, 2024, 'Wagon', 'Vehicle'),
('Hyundai', 'Accent', 1994, 2024, 'Hatchback', 'Vehicle'),
('Hyundai', 'Accent', 1994, 2024, 'Sedan', 'Vehicle');

-- KIA VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Kia', 'Sorento', 2002, 2024, 'SUV', 'Vehicle'),
('Kia', 'Sportage', 1993, 2024, 'SUV', 'Vehicle'),
('Kia', 'Rio', 1999, 2024, 'Sedan', 'Vehicle'),
('Kia', 'Rio', 1999, 2024, 'Hatchback', 'Vehicle'),
('Kia', 'Carnival', 1998, 2024, 'Van', 'Vehicle');

-- VOLKSWAGEN VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Volkswagen', 'Golf', 1974, 2024, 'Hatchback', 'Vehicle'),
('Volkswagen', 'Golf', 1974, 2024, 'Sedan', 'Vehicle'),
('Volkswagen', 'Golf', 1974, 2024, 'Wagon', 'Vehicle'),
('Volkswagen', 'Polo', 1975, 2024, 'Hatchback', 'Vehicle'),
('Volkswagen', 'Passat', 1973, 2024, 'Sedan', 'Vehicle'),
('Volkswagen', 'Passat', 1973, 2024, 'Wagon', 'Vehicle'),
('Volkswagen', 'Tiguan', 2007, 2024, 'SUV', 'Vehicle'),
('Volkswagen', 'Amarok', 2010, 2024, 'Ute', 'Vehicle'),
('Volkswagen', 'Amarok', 2010, 2024, 'Double Cab', 'Vehicle');

-- BMW VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('BMW', '3 Series', 1975, 2024, 'Sedan', 'Vehicle'),
('BMW', '3 Series', 1975, 2024, 'Wagon', 'Vehicle'),
('BMW', '3 Series', 1975, 2024, 'Coupe', 'Vehicle'),
('BMW', '5 Series', 1972, 2024, 'Sedan', 'Vehicle'),
('BMW', '5 Series', 1972, 2024, 'Wagon', 'Vehicle'),
('BMW', 'X5', 1999, 2024, 'SUV', 'Vehicle'),
('BMW', 'X3', 2003, 2024, 'SUV', 'Vehicle');

-- MERCEDES-BENZ VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Mercedes-Benz', 'C-Class', 1993, 2024, 'Sedan', 'Vehicle'),
('Mercedes-Benz', 'C-Class', 1993, 2024, 'Wagon', 'Vehicle'),
('Mercedes-Benz', 'E-Class', 1946, 2024, 'Sedan', 'Vehicle'),
('Mercedes-Benz', 'E-Class', 1946, 2024, 'Wagon', 'Vehicle'),
('Mercedes-Benz', 'GLC', 2015, 2024, 'SUV', 'Vehicle'),
('Mercedes-Benz', 'GLE', 2015, 2024, 'SUV', 'Vehicle'),
('Mercedes-Benz', 'Sprinter', 1995, 2024, 'Van', 'Vehicle');

-- AUDI VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Audi', 'A4', 1994, 2024, 'Sedan', 'Vehicle'),
('Audi', 'A4', 1994, 2024, 'Wagon', 'Vehicle'),
('Audi', 'A6', 1994, 2024, 'Sedan', 'Vehicle'),
('Audi', 'A6', 1994, 2024, 'Wagon', 'Vehicle'),
('Audi', 'Q3', 2011, 2024, 'SUV', 'Vehicle'),
('Audi', 'Q5', 2008, 2024, 'SUV', 'Vehicle'),
('Audi', 'Q7', 2002, 2024, 'SUV', 'Vehicle');

-- LAND ROVER VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Land Rover', 'Defender', 1948, 2024, 'SUV', 'Vehicle'),
('Land Rover', 'Defender', 1948, 2024, '4WD', 'Vehicle'),
('Land Rover', 'Discovery', 1989, 2024, 'SUV', 'Vehicle'),
('Land Rover', 'Range Rover', 1970, 2024, 'SUV', 'Vehicle'),
('Land Rover', 'Evoque', 2011, 2024, 'SUV', 'Vehicle');

-- JEEP VEHICLES
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Jeep', 'Wrangler', 1986, 2024, 'SUV', 'Vehicle'),
('Jeep', 'Wrangler', 1986, 2024, '4WD', 'Vehicle'),
('Jeep', 'Cherokee', 1974, 2024, 'SUV', 'Vehicle'),
('Jeep', 'Grand Cherokee', 1992, 2024, 'SUV', 'Vehicle'),
('Jeep', 'Renegade', 2014, 2024, 'SUV', 'Vehicle');

-- FARM MACHINERY VEHICLES (Key agricultural brands)
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('John Deere', '350', 1975, 2024, 'Tractor', 'Machinery'),
('John Deere', '450', 1985, 2024, 'Tractor', 'Machinery'),
('John Deere', '644K', 2000, 2024, 'Tractor', 'Machinery'),
('John Deere', '8R', 2010, 2024, 'Tractor', 'Machinery'),
('John Deere', '350G', 2011, 2024, 'Tractor', 'Machinery'),
('John Deere', '450G', 2011, 2024, 'Tractor', 'Machinery'),
('John Deere', '640', 2012, 2024, 'Tractor', 'Machinery'),
('John Deere', '824', 2020, 2024, 'Tractor', 'Machinery'),
('John Deere', '830', 2020, 2024, 'Tractor', 'Machinery'),
('John Deere', '950', 2020, 2024, 'Tractor', 'Machinery');

-- CATERPILLAR MACHINERY
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Caterpillar', 'D6T', 2018, 2024, 'Dozer', 'Machinery'),
('Caterpillar', '320', 2019, 2024, 'Excavator', 'Machinery'),
('Caterpillar', '966M', 2015, 2024, 'Wheel Loader', 'Machinery'),
('Caterpillar', '950', 2020, 2024, 'Wheel Loader', 'Machinery'),

-- KOMATSU MACHINERY
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Komatsu', 'D61PX', 2018, 2024, 'Dozer', 'Machinery'),
('Komatsu', 'PC210', 2019, 2024, 'Excavator', 'Machinery'),
('Komatsu', 'PC360', 2015, 2024, 'Excavator', 'Machinery'),
('Komatsu', 'WA380', 2018, 2024, 'Wheel Loader', 'Machinery'),

-- BOBCAT MACHINERY
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Bobcat', 'S70', 2018, 2024, 'Skid Steer', 'Machinery'),
('Bobcat', 'S650', 2019, 2024, 'Track Loader', 'Machinery'),
('Bobcat', 'T650', 2019, 2024, 'Track Loader', 'Machinery'),
('Bobcat', 'E85', 2020, 2024, 'Excavator', 'Machinery'),

-- KUBOTA MACHINERY
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Kubota', 'L47', 2018, 2024, 'Tractor Loader', 'Machinery'),
('Kubota', 'KX040', 2019, 2024, 'Excavator', 'Machinery'),
('Kubota', 'M62', 2020, 2024, 'Tractor Loader', 'Machinery'),
('Kubota', 'L574', 2019, 2024, 'Tractor', 'Machinery'),

-- JCB MACHINERY
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('JCB', '3CX', 2018, 2024, 'Backhoe', 'Machinery'),
('JCB', '416S', 2018, 2024, 'Backhoe', 'Machinery'),
('JCB', '8018', 2020, 2024, 'Excavator', 'Machinery'),
('JCB', '814', 2020, 2024, 'Backhoe', 'Machinery'),

-- MASSEY FERGUSON MACHINERY
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Massey Ferguson', '35', 1960, 1975, 'Tractor', 'Machinery'),
('Massey Ferguson', '6712', 2018, 2024, 'Tractor', 'Machinery'),
('Massey Ferguson', '6713', 2019, 2024, 'Tractor', 'Machinery'),
('Massey Ferguson', '5713', 2019, 2024, 'Tractor', 'Machinery'),
('Massey Ferguson', '5714', 2020, 2024, 'Tractor', 'Machinery'),

-- CASE IH MACHINERY
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Case IH', 'Puma', 2007, 2024, 'Tractor', 'Machinery'),
('Case IH', 'Magnum', 1987, 2024, 'Tractor', 'Machinery'),
('Case IH', 'Steiger', 1986, 2024, 'Tractor', 'Machinery'),

-- NEW HOLLAND MACHINERY
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('New Holland', 'T8.270', 2008, 2024, 'Tractor', 'Machinery'),
('New Holland', 'T8.330', 2019, 2024, 'Tractor', 'Machinery'),
('New Holland', 'T8.360', 2012, 2024, 'Tractor', 'Machinery'),
('New Holland', 'T7.270', 2015, 2024, 'Tractor', 'Machinery'),
('New Holland', 'T7.320', 2019, 2024, 'Tractor', 'Machinery'),
('New Holland', 'T9.320', 2010, 2024, 'Tractor', 'Machinery'),
('New Holland', 'T9.390', 2020, 2024, 'Tractor', 'Machinery'),
('New Holland', 'T9.480', 2015, 2024, 'Tractor', 'Machinery'),
('New Holland', 'T9.560', 2014, 2024, 'Tractor', 'Machinery'),
('New Holland', 'T9.590', 2012, 2024, 'Tractor', 'Machinery'),

-- FENDT MACHINERY
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Fendt', '828', 2015, 2024, 'Tractor', 'Machinery'),
('Fendt', '822', 2016, 2024, 'Tractor', 'Machinery'),
('Fendt', '836', 2016, 2024, 'Tractor', 'Machinery'),
('Fendt', '105', 2013, 2024, 'Tractor', 'Machinery'),

-- VALTRA MACHINERY
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Valtra', 'L6', 2008, 2024, 'Tractor', 'Machinery'),

-- ISEKI MACHINERY
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Iseki', 'N60', 2019, 2024, 'Tractor', 'Machinery'),
('Iseki', 'N70', 2012, 2024, 'Tractor', 'Machinery'),

-- UTILITY TRUCKS
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Isuzu', 'NPR', 2005, 2024, 'Truck', 'Vehicle'),
('Isuzu', 'NPR', 2005, 2024, 'Cab Chassis', 'Vehicle'),
('Isuzu', 'NQR', 2006, 2024, 'Truck', 'Vehicle'),
('Isuzu', 'NQR', 2006, 2024, 'Cab Chassis', 'Vehicle'),

-- Update timestamp
UPDATE vehicle_data SET updated_at = CURRENT_TIMESTAMP;