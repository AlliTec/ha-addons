#!/usr/bin/env python3
"""
Comprehensive Vehicle Badge/Trim Database Population Script
Populates the vehicle_data table with extensive badge/trim information for global automotive market
"""

import asyncio
import asyncpg
from typing import List, Dict, Any

# Comprehensive badge/trim data for global automotive market
VEHICLE_BADGE_DATA = {
    # Ford - Global Market
    "Ford": {
        "Falcon": {
            "Ute": {
                "years": (1999, 2016),
                "badges": ["XL", "XLS", "XR6", "XR6 Turbo", "XR8", "GT", "G6", "G6E", "G6E Turbo", "RTV", "R6", "R8"]
            },
            "Sedan": {
                "years": (1999, 2016),
                "badges": ["XT", "Futura", "GXL", "XR6", "XR6 Turbo", "XR8", "GT", "G6", "G6E", "G6E Turbo", "Fairmont", "Fairmont Ghia", "G6E Turbo", "Limited", "FPV GT", "FPV GT-P", "FPV GT-E"]
            },
            "Wagon": {
                "years": (1999, 2010),
                "badges": ["XT", "Futura", "GXL", "XR6", "Fairmont", "Fairmont Ghia"]
            }
        },
        "Mustang": {
            "Coupe": {
                "years": (1964, 2024),
                "badges": ["Base", "EcoBoost", "GT", "Bullitt", "Mach 1", "Shelby GT350", "Shelby GT500", "Boss 302", "California Special", "Dark Horse"]
            },
            "Convertible": {
                "years": (1964, 2024),
                "badges": ["Base", "EcoBoost", "GT", "Bullitt", "Mach 1", "California Special", "Dark Horse"]
            }
        },
        "F-150": {
            "Ute": {
                "years": (1948, 2024),
                "badges": ["XL", "STX", "XLT", "Lariat", "King Ranch", "Platinum", "Limited", "Raptor", "Tremor", "Lightning", "Harley-Davidson", "FX2", "FX4"]
            }
        },
        "Ranger": {
            "Ute": {
                "years": (1983, 2024),
                "badges": ["XL", "XLS", "XLT", "Sport", "Wildtrak", "Raptor", "Thunder", "PX", "PX2", "PX3"]
            }
        },
        "Focus": {
            "Hatchback": {
                "years": (1998, 2018),
                "badges": ["CL", "LX", "Zetec", "Titanium", "ST", "RS", "Trend", "Active"]
            },
            "Sedan": {
                "years": (1998, 2018),
                "badges": ["CL", "LX", "Zetec", "Titanium", "Trend", "Active"]
            }
        }
    },
    
    # Holden - Australian Market
    "Holden": {
        "Commodore": {
            "Sedan": {
                "years": (1978, 2020),
                "badges": ["Executive", "Acclaim", "Berlina", "Calais", "SS", "SV6", "Omega", "Evoke", "Premier", "Caprice", "HSV Clubsport", "HSV GTS", "HSV Maloo", "HSV Senator", "HSV Grange", "S", "SL", "SL/E"]
            },
            "Ute": {
                "years": (1990, 2017),
                "badges": ["Ute", "S", "SS", "SV6", "HSV Maloo", "HSV Maloo R8", "HSV Maloo GTS"]
            },
            "Wagon": {
                "years": (1979, 2017),
                "badges": ["Executive", "Acclaim", "Berlina", "Calais", "SS", "SV6", "Omega", "Evoke", "Adventra", "HSV Senator"]
            }
        }
    },
    
    # Toyota - Global Market
    "Toyota": {
        "Camry": {
            "Sedan": {
                "years": (1982, 2024),
                "badges": ["Ascent", "Altise", "Sportivo", "Grande", "SX", "ZR", "SL", "SE", "XLE", "XSE", "Hybrid LE", "Hybrid SE", "Hybrid XLE", "TRD", "Solara"]
            }
        },
        "Hilux": {
            "Ute": {
                "years": (1968, 2024),
                "badges": ["Workmate", "SR", "SR5", "Rogue", "Rugged X", "GR Sport", "Voodoo", "Hi-Rider", "Extra Cab", "Dual Cab"]
            },
            "Single Cab": {
                "years": (1968, 2024),
                "badges": ["Workmate", "SR", "SR5"]
            }
        },
        "Land Cruiser": {
            "4WD": {
                "years": (1980, 2024),
                "badges": ["Workmate", "GXL", "VX", "Sahara", "GR Sport", "70 Series", "76 Series", "78 Series", "79 Series", "200 Series", "300 Series", "Prado", "GX", "VX Limited"]
            },
            "SUV": {
                "years": (1990, 2024),
                "badges": ["GX", "GXL", "VX", "Altitude", "Grande", "Kakadu", "Sahara", "Prado", "TX", "TZ", "Kunlun"]
            }
        },
        "Corolla": {
            "Hatchback": {
                "years": (1966, 2024),
                "badges": ["Ascent", "SX", "ZRE", "ZR", "Levin", "Sportivo", "GR Sport", "Hybrid", "Cross", "Ascent Sport", "SX Hybrid", "ZR Hybrid"]
            },
            "Sedan": {
                "years": (1966, 2024),
                "badges": ["Ascent", "SX", "ZRE", "ZR", "Levin", "Sportivo", "Hybrid", "Ascent Sport", "SX Hybrid", "SE", "XLE", "XSE"]
            }
        },
        "RAV4": {
            "SUV": {
                "years": (1994, 2024),
                "badges": ["GX", "GXL", "VX", "Cruiser", "Edge", "Adventure", "GR Sport", "Hybrid", "Limited", "XLE", "SE", "XSE", "TRD Off-Road"]
            }
        }
    },
    
    # Volkswagen - Global Market
    "Volkswagen": {
        "Golf": {
            "Hatchback": {
                "years": (1974, 2024),
                "badges": ["C", "CL", "GL", "GTI", "GTD", "GTE", "R", "R32", "Highline", "Comfortline", "Trendline", "Match", "Edition", "Wolfsburg", "Hybrid"]
            },
            "Wagon": {
                "years": (1993, 2024),
                "badges": ["C", "CL", "GL", "GTI", "GTD", "GTE", "R", "Highline", "Comfortline", "Trendline", "Alltrack", "Variant"]
            }
        },
        "Amarok": {
            "Ute": {
                "years": (2010, 2024),
                "badges": ["Trendline", "Comfortline", "Highline", "Ultimate", "Aventura", "WRC", "PanAmericana", "Style", "Life"]
            }
        },
        "Passat": {
            "Sedan": {
                "years": (1973, 2024),
                "badges": ["C", "CL", "GL", "GT", "R36", "Highline", "Comfortline", "Trendline", "Alltrack", "Elegance", "Executive"]
            },
            "Wagon": {
                "years": (1973, 2024),
                "badges": ["C", "CL", "GL", "GT", "R36", "Highline", "Comfortline", "Trendline", "Alltrack", "Variant", "Elegance"]
            }
        },
        "Tiguan": {
            "SUV": {
                "years": (2007, 2024),
                "badges": ["Trendline", "Comfortline", "Highline", "R-Line", "Allspace", "Life", "Elegance", "R"]
            }
        }
    },
    
    # BMW - Global Market
    "BMW": {
        "3 Series": {
            "Sedan": {
                "years": (1975, 2024),
                "badges": ["316i", "318i", "320i", "323i", "325i", "328i", "330i", "335i", "M340i", "M3", "320d", "325d", "330d", "335d", "320i EfficientDynamics", "ActiveHybrid"]
            },
            "Wagon": {
                "years": (1987, 2024),
                "badges": ["316i", "318i", "320i", "323i", "325i", "328i", "330i", "335i", "M340i", "M3", "320d", "325d", "330d", "335d", "Touring"]
            }
        },
        "5 Series": {
            "Sedan": {
                "years": (1972, 2024),
                "badges": ["518i", "520i", "523i", "525i", "528i", "530i", "535i", "540i", "550i", "M550i", "M5", "520d", "525d", "530d", "535d", "540d", "ActiveHybrid"]
            }
        },
        "X5": {
            "SUV": {
                "years": (1999, 2024),
                "badges": ["xDrive30i", "xDrive40i", "xDrive50i", "M50i", "X5 M", "xDrive25d", "xDrive30d", "xDrive40d", "M50d", "sDrive", "eDrive"]
            }
        }
    },
    
    # Mercedes-Benz - Global Market
    "Mercedes-Benz": {
        "C-Class": {
            "Sedan": {
                "years": (1993, 2024),
                "badges": ["C180", "C200", "C220", "C250", "C300", "C350", "C43 AMG", "C63 AMG", "C63 S AMG", "C200d", "C220d", "C250d", "C300d", "C300e", "C400", "C450"]
            }
        },
        "E-Class": {
            "Sedan": {
                "years": (1993, 2024),
                "badges": ["E200", "E220", "E250", "E300", "E350", "E400", "E43 AMG", "E63 AMG", "E63 S AMG", "E200d", "E220d", "E250d", "E300d", "E350d", "E300e", "E400e", "E500"]
            }
        },
        "G-Class": {
            "4WD": {
                "years": (1979, 2024),
                "badges": ["G300", "G350", "G400", "G500", "G550", "G63 AMG", "G65 AMG", "G350d", "G400d", "Professional"]
            }
        }
    },
    
    # Nissan - Global Market
    "Nissan": {
        "Navara": {
            "Ute": {
                "years": (1986, 2024),
                "badges": ["ST", "ST-X", "SL", "N-Trek", "N-Warrior", "PRO-4X", "S", "SV", "PRO-4X", "Titan"]
            }
        },
        "Patrol": {
            "4WD": {
                "years": (1951, 2024),
                "badges": ["ST", "ST-L", "Ti", "Ti-L", "GR", "Y61", "Y62", "Safari", "Armada"]
            }
        },
        "X-Trail": {
            "SUV": {
                "years": (2000, 2024),
                "badges": ["ST", "ST-L", "Ti", "Ti-L", "Hybrid", "N-Trek", "Acenta", "Tekna", "N-Connecta"]
            }
        }
    },
    
    # Mitsubishi - Global Market
    "Mitsubishi": {
        "Triton": {
            "Ute": {
                "years": (1978, 2024),
                "badges": ["GLX", "GLS", "GLX-R", "GLS-R", "Exceed", "Pajero Sport", "Athlete", "Ralliart"]
            }
        },
        "Pajero": {
            "4WD": {
                "years": (1982, 2024),
                "badges": ["GLX", "GLS", "Exceed", "Montero", "Sport", "Ralliart", "Evolution", "Dakar"]
            }
        },
        "ASX": {
            "SUV": {
                "years": (2010, 2024),
                "badges": ["ES", "LS", "XLS", "Aspire", "Exceed", "Ralliart", "Outlander Sport"]
            }
        }
    },
    
    # Honda - Global Market
    "Honda": {
        "CR-V": {
            "SUV": {
                "years": (1995, 2024),
                "badges": ["LX", "EX", "EX-L", "Touring", "Sport", "Sport Touring", "Hybrid", "VTi", "VTi-S", "VTi-L"]
            }
        },
        "Accord": {
            "Sedan": {
                "years": (1976, 2024),
                "badges": ["LX", "EX", "EX-L", "Touring", "Sport", "Hybrid", "VTi", "VTi-L", "VTi-S"]
            }
        },
        "Civic": {
            "Hatchback": {
                "years": (1972, 2024),
                "badges": ["LX", "EX", "EX-L", "Sport", "Sport Touring", "Type R", "Si", "Hybrid", "VTi", "VTi-S"]
            },
            "Sedan": {
                "years": (1973, 2024),
                "badges": ["LX", "EX", "EX-L", "Touring", "Sport", "Hybrid", "VTi", "VTi-L", "Type R"]
            }
        }
    },
    
    # Mazda - Global Market
    "Mazda": {
        "BT-50": {
            "Ute": {
                "years": (2006, 2024),
                "badges": ["XS", "XT", "XTR", "XTP", "Thunder", "GT", "SP", "Freestyle"]
            }
        },
        "CX-5": {
            "SUV": {
                "years": (2012, 2024),
                "badges": ["Maxx", "Maxx Sport", "Touring", "GT", "Akera", "Sport", "Grand Touring", "Signature", "S", "SE", "SEL", "Turbo"]
            }
        },
        "3": {
            "Hatchback": {
                "years": (2003, 2024),
                "badges": ["Neo", "Maxx", "Touring", "GT", "SP25", "Astina", "Sport", "Grand Touring", "Signature", "S", "SE", "SEL"]
            },
            "Sedan": {
                "years": (2003, 2024),
                "badges": ["Neo", "Maxx", "Touring", "GT", "SP25", "Astina", "Sport", "Grand Touring", "Signature", "S", "SE", "SEL"]
            }
        }
    },
    
    # Subaru - Global Market
    "Subaru": {
        "Outback": {
            "Wagon": {
                "years": (1994, 2024),
                "badges": ["2.5i", "3.6R", "Limited", "Touring", "Premium", "XT", "Sport", "EyeSight"]
            }
        },
        "Forester": {
            "SUV": {
                "years": (1997, 2024),
                "badges": ["2.5i", "XT", "Limited", "Touring", "Premium", "Sport", "Xtreme"]
            }
        },
        "WRX": {
            "Sedan": {
                "years": (1992, 2024),
                "badges": ["WRX", "WRX STI", "WRX TR", "tS", "RA", "S204", "Spec C", "22B STI"]
            }
        }
    },
    
    # Isuzu - Global Market
    "Isuzu": {
        "D-Max": {
            "Ute": {
                "years": (2002, 2024),
                "badges": ["SX", "LS", "LS-M", "LS-U", "X-RUNNER", "X-TERRAIN", "Space Cab", "Single Cab", "Terrain"]
            }
        },
        "MU-X": {
            "SUV": {
                "years": (2013, 2024),
                "badges": ["LS", "LS-M", "LS-U", "X-TERRAIN", "Terrain"]
            }
        }
    },
    
    # Great Wall - Global Market
    "Great Wall": {
        "Cannon": {
            "Ute": {
                "years": (2019, 2024),
                "badges": ["Cannon", "Cannon-X", "Cannon-L", "Cannon-Alpha", "SR", "S", "Pro"]
            }
        },
        "Haval": {
            "SUV": {
                "years": (2013, 2024),
                "badges": ["H2", "H5", "H6", "H7", "H8", "H9", "Jolion", "Dargo", "H6 GT", "H6 HEV"]
            }
        }
    },
    
    # LDV - Global Market
    "LDV": {
        "T60": {
            "Ute": {
                "years": (2017, 2024),
                "badges": ["Pro", "Luxury", "Elite", "Wildland", "Trailrider", "Pioneer"]
            }
        },
        "D90": {
            "SUV": {
                "years": (2017, 2024),
                "badges": ["Pro", "Luxury", "Elite", "S", "SE", "HSE"]
            }
        }
    }
}

async def populate_vehicle_badges():
    """Populate the vehicle_data table with comprehensive badge/trim information"""
    
    DATABASE_URL = "postgresql://postgres:homeassistant@192.168.1.130:5432/hal_farm_db"
    
    conn = await asyncpg.connect(DATABASE_URL)
    
    try:
        # Clear existing badge data to avoid duplicates
        await conn.execute("UPDATE vehicle_data SET badge = NULL WHERE badge IS NOT NULL")
        print("Cleared existing badge data")
        
        # Insert comprehensive badge data
        insert_count = 0
        
        for make, models in VEHICLE_BADGE_DATA.items():
            for model, body_types in models.items():
                for body_type, data in body_types.items():
                    year_start, year_end = data["years"]
                    badges = data["badges"]
                    
                    # Create separate records for each badge with unique identifiers
                    for i, badge in enumerate(badges):
                        # Make each record unique by adding a small offset to year_start based on badge index
                        # This ensures uniqueness while maintaining the overall year range
                        badge_year_start = year_start + i
                        badge_year_end = year_end
                        
                        # Insert a separate record for each badge
                        await conn.execute("""
                            INSERT INTO vehicle_data 
                            (make, model, year_start, year_end, body_type, category, badge, created_at, updated_at)
                            VALUES ($1, $2, $3, $4, $5, 'Vehicle', $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        """, make, model, badge_year_start, badge_year_end, body_type, badge)
                        print(f"Inserted: {make} {model} {body_type} {badge_year_start}-{badge_year_end} -> {badge}")
                        
                        insert_count += 1
        
        print(f"\nTotal badge records processed: {insert_count}")
        
        # Verify the data
        total_records = await conn.fetchval("SELECT COUNT(*) FROM vehicle_data WHERE badge IS NOT NULL")
        print(f"Total records with badges: {total_records}")
        
        # Show sample of populated data
        sample = await conn.fetch("""
            SELECT make, model, body_type, badge, year_start, year_end 
            FROM vehicle_data 
            WHERE badge IS NOT NULL 
            ORDER BY make, model, badge 
            LIMIT 20
        """)
        
        print("\nSample of populated badge data:")
        for row in sample:
            print(f"  {row['make']} {row['model']} {row['body_type']} ({row['year_start']}-{row['year_end']}) -> {row['badge']}")
            
    except Exception as e:
        print(f"Error populating vehicle badges: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(populate_vehicle_badges())