-- Chemical Inventory Table
-- Create this table in the hal_farm_db database

CREATE TABLE IF NOT EXISTS chemical_inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    chemical_type VARCHAR(50) DEFAULT 'other', -- herbicide, pesticide, other
    purpose VARCHAR(500),
    supplier VARCHAR(255),
    purchase_date DATE,
    expiry_date DATE,
    location VARCHAR(255),
    ppe_requirements VARCHAR(500),
    msds_link VARCHAR(500),
    quantity INTEGER DEFAULT 1,
    unit VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_chemical_type ON chemical_inventory(chemical_type);
CREATE INDEX IF NOT EXISTS idx_chemical_expiry ON chemical_inventory(expiry_date);