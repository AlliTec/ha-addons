#!/usr/bin/env python3
"""
Import maintenance records from Excel file to maintenance_schedules table
For Falcon XR6T Ute (asset_id: 4)
"""

import pandas as pd
import asyncpg
import os
from datetime import datetime
import sys

# Database configuration
DB_HOST = os.getenv('DB_HOST', '192.168.1.130')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'homeassistant')
DB_NAME = os.getenv('DB_NAME', 'hal_farm_db')

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

async def import_maintenance_records():
    """Import maintenance records from Excel file to database"""
    
    try:
        # Read Excel file
        print("Reading Excel file...")
        df = pd.read_excel('/home/sog/ai-projects/ha-addons/XR6T Maintenance Record.xlsx', sheet_name='Maintenance')
        
        print(f"Found {len(df)} maintenance records")
        print(f"Columns: {list(df.columns)}")
        print(f"First few rows:\n{df.head()}")
        
        # Clean and prepare data
        records = []
        for index, row in df.iterrows():
            try:
                # Skip rows with missing essential data
                if pd.isna(row['completed_date']) or pd.isna(row['task_description']):
                    continue
                
                # Parse date
                completed_date = row['completed_date']
                if pd.isna(completed_date):
                    continue
                    
                # Clean cost - remove $ and convert to float
                cost = 0.0
                if not pd.isna(row['cost']):
                    cost_str = str(row['cost']).replace('$', '').replace(',', '').strip()
                    try:
                        cost = float(cost_str)
                    except ValueError:
                        cost = 0.0
                
                # Clean meter reading
                meter_reading = 0.0
                if not pd.isna(row['meter_reading']):
                    try:
                        meter_reading = float(row['meter_reading'])
                    except ValueError:
                        meter_reading = 0.0
                
                # Combine notes from multiple columns
                notes_parts = []
                if not pd.isna(row.get('notes', '')):
                    notes_parts.append(str(row['notes']))
                if not pd.isna(row.get('Unnamed: 15', '')):
                    notes_parts.append(str(row['Unnamed: 15']))
                if not pd.isna(row.get('Unnamed: 16', '')):
                    notes_parts.append(str(row['Unnamed: 16']))
                
                notes = ' | '.join(filter(None, notes_parts))
                
                # Create record matching database schema
                record = {
                    'asset_id': 4,  # Falcon XR6T Ute
                    'task_description': str(row['task_description']),
                    'completed_date': completed_date,
                    'due_date': completed_date,  # Use completed date as due date for historical records
                    'status': 'completed',
                    'is_unscheduled': bool(row.get('is_unscheduled', False)),
                    'maintenance_trigger_type': 'km',  # All based on odometer
                    'maintenance_trigger_value': meter_reading,
                    'last_maintenance_usage': meter_reading,
                    'meter_reading': meter_reading,
                    'interval_type': None,  # Not specified in historical data
                    'interval_value': None,
                    'cost': cost,
                    'supplier': str(row.get('supplier', '')) if not pd.isna(row.get('supplier', '')) else '',
                    'invoice_number': str(row.get('innvoice_number', '')) if not pd.isna(row.get('innvoice_number', '')) else '',
                    'notes': notes
                }
                
                records.append(record)
                
            except Exception as e:
                print(f"Error processing row {index}: {e}")
                continue
        
        print(f"Successfully processed {len(records)} records")
        
        # Connect to database and insert records
        print("Connecting to database...")
        conn = await asyncpg.connect(DATABASE_URL)
        
        try:
            # Insert records
            inserted_count = 0
            for i, record in enumerate(records):
                try:
                    query = """
                        INSERT INTO maintenance_schedules (
                            asset_id, task_description, due_date, completed_date, status, 
                            is_unscheduled, maintenance_trigger_type, maintenance_trigger_value,
                            last_maintenance_usage, meter_reading, interval_type, interval_value,
                            cost, supplier, invoice_number, notes
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
                        )
                    """
                    
                    await conn.execute(
                        query,
                        record['asset_id'],
                        record['task_description'],
                        record['due_date'],
                        record['completed_date'],
                        record['status'],
                        record['is_unscheduled'],
                        record['maintenance_trigger_type'],
                        record['maintenance_trigger_value'],
                        record['last_maintenance_usage'],
                        record['meter_reading'],
                        record['interval_type'],
                        record['interval_value'],
                        record['cost'],
                        record['supplier'],
                        record['invoice_number'],
                        record['notes']
                    )
                    
                    inserted_count += 1
                    if (i + 1) % 10 == 0:
                        print(f"Inserted {i + 1}/{len(records)} records...")
                        
                except Exception as e:
                    print(f"Error inserting record {i}: {e}")
                    continue
            
            print(f"Successfully inserted {inserted_count} maintenance records")
            
            # Get summary statistics
            summary = await conn.fetchrow("""
                SELECT 
                    COUNT(*) as total_records,
                    SUM(cost) as total_cost,
                    MIN(completed_date) as first_date,
                    MAX(completed_date) as last_date
                FROM maintenance_schedules 
                WHERE asset_id = 4
            """)
            
            print(f"\nImport Summary for Falcon XR6T Ute:")
            print(f"Total records: {summary['total_records']}")
            print(f"Total cost: ${summary['total_cost']:.2f}")
            print(f"Date range: {summary['first_date']} to {summary['last_date']}")
            
        finally:
            await conn.close()
            
    except Exception as e:
        print(f"Import failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    import asyncio
    asyncio.run(import_maintenance_records())