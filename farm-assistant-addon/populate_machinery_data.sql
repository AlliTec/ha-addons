-- Populate farm machinery data into vehicle_data table

-- Massey Ferguson
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Massey Ferguson', 'MF6712', 2010, 2023, 'Tractor', 'Machinery'),
('Massey Ferguson', 'MF5713', 2015, 2023, 'Tractor', 'Machinery'),
('Massey Ferguson', 'MF7726', 2018, 2023, 'Combine Harvester', 'Machinery'),
('Massey Ferguson', 'MF3640', 2012, 2023, 'Balers', 'Machinery'),
('Massey Ferguson', 'MF1839', 2016, 2023, 'Small Square Baler', 'Machinery');

-- New Holland
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('New Holland', 'T8.390', 2018, 2023, 'Tractor', 'Machinery'),
('New Holland', 'T7.270', 2015, 2023, 'Tractor', 'Machinery'),
('New Holland', 'CR8.90', 2017, 2023, 'Combine Harvester', 'Machinery'),
('New Holland', 'BB980', 2014, 2023, 'Large Square Baler', 'Machinery'),
('New Holland', 'BR6090', 2016, 2023, 'Round Baler', 'Machinery'),
('New Holland', 'LS180', 2010, 2023, 'Skid Steer', 'Machinery');

-- Ryobi
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Ryobi', 'Ryobi', 2018, 2023, 'Generator', 'Machinery'),
('Ryobi', 'Ryobi', 2019, 2023, 'Pressure Washer', 'Machinery'),
('Ryobi', 'Ryobi', 2020, 2023, 'Water Pump', 'Machinery'),
('Ryobi', 'Ryobi', 2017, 2023, 'Chainsaw', 'Machinery'),
('Ryobi', 'Ryobi', 2018, 2023, 'Line Trimmer', 'Machinery');

-- Briggs & Stratton
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Briggs & Stratton', 'Intek', 2010, 2023, 'Engine', 'Machinery'),
('Briggs & Stratton', 'Vanguard', 2012, 2023, 'Engine', 'Machinery'),
('Briggs & Stratton', 'Professional Series', 2015, 2023, 'Engine', 'Machinery'),
('Briggs & Stratton', 'Quantum', 2008, 2023, 'Engine', 'Machinery'),
('Briggs & Stratton', 'Craftsman', 2010, 2023, 'Engine', 'Machinery');

-- CIGWELD
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('CIGWELD', 'Transmig 250i', 2015, 2023, 'Welder', 'Machinery'),
('CIGWELD', 'Transmig 185', 2012, 2023, 'Welder', 'Machinery'),
('CIGWELD', 'WeldSkill 200', 2018, 2023, 'Welder', 'Machinery'),
('CIGWELD', 'Compcut 100', 2016, 2023, 'Plasma Cutter', 'Machinery'),
('CIGWELD', 'Weldmatic 200i', 2014, 2023, 'MIG Welder', 'Machinery');

-- John Deere
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('John Deere', '5075E', 2018, 2023, 'Tractor', 'Machinery'),
('John Deere', '6120M', 2015, 2023, 'Tractor', 'Machinery'),
('John Deere', 'S780', 2017, 2023, 'Combine Harvester', 'Machinery'),
('John Deere', '3025E', 2014, 2023, 'Compact Tractor', 'Machinery'),
('John Deere', 'Gator', 2016, 2023, 'Utility Vehicle', 'Machinery');

-- Caterpillar
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Caterpillar', 'D6T', 2015, 2023, 'Bulldozer', 'Machinery'),
('Caterpillar', '320', 2012, 2023, 'Excavator', 'Machinery'),
('Caterpillar', '966M', 2018, 2023, 'Wheel Loader', 'Machinery'),
('Caterpillar', '259B', 2016, 2023, 'Skid Steer Loader', 'Machinery'),
('Caterpillar', '140M', 2014, 2023, 'Motor Grader', 'Machinery');

-- Kubota
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Kubota', 'L4701', 2017, 2023, 'Tractor', 'Machinery'),
('Kubota', 'M7060', 2015, 2023, 'Tractor', 'Machinery'),
('Kubota', 'SVL75', 2018, 2023, 'Compact Track Loader', 'Machinery'),
('Kubota', 'KX040', 2016, 2023, 'Excavator', 'Machinery'),
('Kubota', 'RTV-X1140', 2019, 2023, 'Utility Vehicle', 'Machinery');

-- Additional common machinery brands
INSERT INTO vehicle_data (make, model, year_start, year_end, body_type, category) VALUES
('Honda', 'GX200', 2010, 2023, 'Engine', 'Machinery'),
('Honda', 'GX390', 2012, 2023, 'Engine', 'Machinery'),
('Yamaha', 'EF2000iS', 2018, 2023, 'Generator', 'Machinery'),
('Yamaha', 'EF6300iS', 2016, 2023, 'Generator', 'Machinery'),
('Makita', 'EA5000P', 2014, 2023, 'Chainsaw', 'Machinery'),
('Makita', 'DHR242', 2017, 2023, 'Rotary Hammer', 'Machinery'),
('Stihl', 'MS 261', 2015, 2023, 'Chainsaw', 'Machinery'),
('Stihl', 'MS 362', 2018, 2023, 'Chainsaw', 'Machinery');