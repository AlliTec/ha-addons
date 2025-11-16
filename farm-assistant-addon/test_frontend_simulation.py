#!/usr/bin/env python3
"""Simulate the exact frontend JavaScript behavior to identify the issue"""

import sys
import os
import asyncio
import asyncpg

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from vin_decoder import VINDecoder

class MockDOMElement:
    def __init__(self, element_id):
        self.element_id = element_id
        self.value = ""
        self.options = []
    
    def add_option(self, value, text=None):
        if text is None:
            text = value
        self.options.append({'value': value, 'text': text})
    
    def clear_options(self):
        self.options = []
        self.add_option("", "Select...")  # Default empty option

class MockFrontend:
    def __init__(self):
        self.elements = {
            'add-asset-make': MockDOMElement('add-asset-make'),
            'add-asset-model': MockDOMElement('add-asset-model'),
            'add-asset-year': MockDOMElement('add-asset-year'),
            'add-asset-body-feature': MockDOMElement('add-asset-body-feature'),
            'add-asset-badge': MockDOMElement('add-asset-badge')
        }
        self.conn = None
    
    async def setup_database(self):
        self.conn = await asyncpg.connect(
            host='192.168.1.130',
            port=5432,
            user='postgres',
            password='homeassistant',
            database='hal_farm_db'
        )
    
    def get_element(self, element_id):
        return self.elements.get(element_id)
    
    async def populate_vehicle_makes(self):
        """Simulate populateVehicleMakes function"""
        makes = await self.conn.fetch('SELECT DISTINCT make FROM vehicle_data ORDER BY make')
        make_select = self.get_element('add-asset-make')
        make_select.clear_options()
        for make in [row['make'] for row in makes]:
            make_select.add_option(make, make)
        print(f"📋 Populated {len(makes)} makes: {[row['make'] for row in makes]}")
    
    async def populate_vehicle_models(self, make):
        """Simulate populateVehicleModels function"""
        models = await self.conn.fetch('SELECT DISTINCT model FROM vehicle_data WHERE make = $1 ORDER BY model', make)
        model_select = self.get_element('add-asset-model')
        model_select.clear_options()
        for model in [row['model'] for row in models]:
            model_select.add_option(model, model)
        print(f"📋 Populated {len(models)} models for {make}: {[row['model'] for row in models]}")
    
    async def populate_vehicle_years(self, make, model):
        """Simulate populateVehicleYears function"""
        years = await self.conn.fetch('SELECT DISTINCT year_start FROM vehicle_data WHERE make = $1 AND model = $2 ORDER BY year_start', make, model)
        year_select = self.get_element('add-asset-year')
        year_select.clear_options()
        for year in [row['year_start'] for row in years]:
            year_select.add_option(str(year), str(year))
        print(f"📋 Populated {len(years)} years for {make} {model}: {[row['year_start'] for row in years]}")
    
    async def populate_vehicle_body_types(self, make, model, year):
        """Simulate populateVehicleBodyTypes function"""
        body_types = await self.conn.fetch('SELECT DISTINCT body_type FROM vehicle_data WHERE make = $1 AND model = $2 AND ($3 BETWEEN year_start AND COALESCE(year_end, 9999)) ORDER BY body_type', make, model, year)
        body_select = self.get_element('add-asset-body-feature')
        body_select.clear_options()
        for body_type in [row['body_type'] for row in body_types]:
            body_select.add_option(body_type, body_type)
        print(f"📋 Populated {len(body_types)} body types for {make} {model} {year}: {[row['body_type'] for row in body_types]}")
    
    async def populate_vehicle_badges(self, make, model, year, body_type):
        """Simulate populateVehicleBadges function"""
        badges = await self.conn.fetch('SELECT DISTINCT badge FROM vehicle_data WHERE make = $1 AND model = $2 AND ($3 BETWEEN year_start AND COALESCE(year_end, 9999)) AND body_type = $4 AND badge IS NOT NULL AND badge != \'\' ORDER BY badge', make, model, year, body_type)
        badge_select = self.get_element('add-asset-badge')
        badge_select.clear_options()
        for badge in [row['badge'] for row in badges]:
            badge_select.add_option(badge, badge)
        print(f"📋 Populated {len(badges)} badges for {make} {model} {year} {body_type}: {[row['badge'] for row in badges]}")
    
    async def simulate_populate_from_vin(self, vin, form_type='add'):
        """Simulate the exact populateFromVIN function"""
        print(f"\n🔍 Starting VIN lookup simulation for: {vin}")
        
        # Step 1: Lookup VIN specifications
        decoder = VINDecoder()
        specs = decoder.decode_vin(vin)
        print(f"📋 VIN specs received: {specs}")
        
        if not specs.get('valid'):
            print("❌ VIN is invalid")
            return False
        
        print("✅ VIN is valid, populating form fields...")
        
        # Step 2: Get form elements (simulating document.getElementById)
        make_select = self.get_element(f'{form_type}-asset-make')
        model_select = self.get_element(f'{form_type}-asset-model')
        year_select = self.get_element(f'{form_type}-asset-year')
        body_select = self.get_element(f'{form_type}-asset-body-feature')
        badge_select = self.get_element(f'{form_type}-asset-badge')
        
        print(f"🎯 Form elements found: make={bool(make_select)}, model={bool(model_select)}, year={bool(year_select)}, body={bool(body_select)}, badge={bool(badge_select)}")
        
        # Step 3: Set make (simulating frontend logic)
        if specs.get('manufacturer') and make_select:
            make_name = specs['manufacturer'].split(' ')[0]
            print(f"🏭 Looking for make: '{make_name}'")
            print(f"📋 Available makes: {[opt['value'] for opt in make_select.options if opt['value']]}")
            
            # Simulate Array.from(makeSelect.options).find(option => option.value.includes(makeName))
            make_option = None
            for option in make_select.options:
                if make_name in option['value']:
                    make_option = option
                    break
            
            print(f"🎯 Make option found: {make_option}")
            
            if make_option:
                make_select.value = make_option['value']
                print(f"✅ Make set to: {make_select.value}")
                
                # Populate models (simulating await populateVehicleModels)
                await self.populate_vehicle_models(make_option['value'])
                
                # Step 4: Set model
                if specs.get('model_info') and specs['model_info'].get('model') and model_select:
                    model_name = specs['model_info']['model']
                    print(f"🚗 Looking for model: '{model_name}'")
                    print(f"📋 Available models: {[opt['value'] for opt in model_select.options if opt['value']]}")
                    
                    # Simulate exact match: option.value === specs.model_info.model
                    model_option = None
                    for option in model_select.options:
                        if option['value'] == model_name:
                            model_option = option
                            break
                    
                    print(f"🎯 Model option found: {model_option}")
                    
                    if model_option:
                        model_select.value = model_option['value']
                        print(f"✅ Model set to: {model_select.value}")
                        
                        # Populate years
                        await self.populate_vehicle_years(make_option['value'], model_option['value'])
                        
                        # Step 5: Set year
                        if specs.get('year') and year_select:
                            year_value = str(specs['year'])
                            print(f"📅 Looking for year: {year_value}")
                            print(f"📋 Available years: {[opt['value'] for opt in year_select.options if opt['value']]}")
                            
                            year_option = None
                            for option in year_select.options:
                                if option['value'] == year_value:
                                    year_option = option
                                    break
                            
                            print(f"🎯 Year option found: {year_option}")
                            
                            if year_option:
                                year_select.value = year_option['value']
                                print(f"✅ Year set to: {year_select.value}")
                                
                                # Populate body types
                                await self.populate_vehicle_body_types(make_option['value'], model_option['value'], specs['year'])
                                
                                # Step 6: Set body type
                                if specs.get('model_info') and specs['model_info'].get('body_type') and body_select:
                                    body_type = specs['model_info']['body_type']
                                    print(f"🚙 Looking for body type: '{body_type}'")
                                    print(f"📋 Available body types: {[opt['value'] for opt in body_select.options if opt['value']]}")
                                    
                                    body_option = None
                                    for option in body_select.options:
                                        if option['value'] == body_type:
                                            body_option = option
                                            break
                                    
                                    print(f"🎯 Body type option found: {body_option}")
                                    
                                    if body_option:
                                        body_select.value = body_option['value']
                                        print(f"✅ Body type set to: {body_select.value}")
                                        
                                        # Populate badges
                                        await self.populate_vehicle_badges(make_option['value'], model_option['value'], specs['year'], body_type)
                                        
                                        # Step 7: Set badge
                                        if specs.get('model_info') and specs['model_info'].get('trim') and badge_select:
                                            trim = specs['model_info']['trim']
                                            print(f"🏷️ Looking for badge: '{trim}'")
                                            print(f"📋 Available badges: {[opt['value'] for opt in badge_select.options if opt['value']]}")
                                            
                                            badge_option = None
                                            for option in badge_select.options:
                                                if option['value'] == trim:
                                                    badge_option = option
                                                    break
                                            
                                            print(f"🎯 Badge option found: {badge_option}")
                                            
                                            if badge_option:
                                                badge_select.value = badge_option['value']
                                                print(f"✅ Badge set to: {badge_select.value}")
                                                print(f"🎉 ALL FIELDS POPULATED SUCCESSFULLY!")
                                                return True
                                            else:
                                                print(f"❌ Badge '{trim}' not found in options")
                                                return False
                                        else:
                                            print("❌ No trim info in VIN data or badge select not found")
                                            return False
                                    else:
                                        print(f"❌ Body type '{body_type}' not found in options")
                                        return False
                                else:
                                    print("❌ No body_type info in VIN data or body select not found")
                                    return False
                            else:
                                print(f"❌ Year {year_value} not found in options")
                                return False
                        else:
                            print("❌ No year info in VIN data or year select not found")
                            return False
                    else:
                        print(f"❌ Model '{model_name}' not found in options")
                        return False
                else:
                    print("❌ No model info in VIN data or model select not found")
                    return False
            else:
                print(f"❌ Make '{make_name}' not found in options")
                return False
        else:
            print("❌ No manufacturer info in VIN data or make select not found")
            return False

async def main():
    frontend = MockFrontend()
    await frontend.setup_database()
    
    # Test with the problematic VIN
    test_vin = "6FPAAAJG33333"
    
    # First populate makes (as would happen on page load)
    await frontend.populate_vehicle_makes()
    
    # Then simulate the VIN lookup
    success = await frontend.simulate_populate_from_vin(test_vin)
    
    if success:
        print("\n🎉 FRONTEND SIMULATION SUCCESSFUL!")
        print("The VIN lookup should work perfectly in the browser.")
        print("If it's not working, the issue is likely:")
        print("1. JavaScript errors in the browser")
        print("2. Timing issues with async operations")
        print("3. DOM manipulation problems")
        print("4. User interface not updating properly")
    else:
        print("\n❌ FRONTEND SIMULATION FAILED!")
        print("There's a logic issue in the frontend code.")
    
    await frontend.conn.close()

if __name__ == "__main__":
    asyncio.run(main())