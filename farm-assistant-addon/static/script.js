function formatCell(value) {
    return value === null || value === undefined ? "" : value;
}

function calculateAge(birthDate) {
    if (!birthDate) return "";
    
    console.log("Calculating age for birthDate:", birthDate, "type:", typeof birthDate);
    
    let birth;
    // Handle different date formats
    if (typeof birthDate === 'string') {
        birth = new Date(birthDate);
    } else if (typeof birthDate === 'object' && birthDate.year) {
        // Handle Python date objects that might be serialized as {year: 2024, month: 1, day: 1}
        birth = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
    } else {
        birth = new Date(birthDate);
    }
    
    const today = new Date();
    console.log("Parsed birth date:", birth, "today:", today);
    
    if (isNaN(birth.getTime())) {
        console.log("Invalid birth date");
        return "";
    }
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    if (age < 0) return "";
    if (age === 0) {
        const months = today.getMonth() - birth.getMonth() + (12 * (today.getFullYear() - birth.getFullYear()));
        return months > 0 ? `${months} months` : "< 1 month";
    }
    
    return `${age} years`;
}

function getStatusIcon(status) {
    switch (status) {
        case 'On Property':
        case 'Active':
            return '<i class="fa-solid fa-house"></i>';
        case 'Deceased':
            return '<i class="fa-solid fa-skull-crossbones"></i>';
        case 'Sold':
            return '<i class="fa-solid fa-money-bill-wave"></i>';
        default:
            return '';
    }
}

// Function to get icon for animal type
function getAnimalIcon(animalType) {
    const icons = {
        "All": "fa-house-chimney",
        "Cattle": "fa-cow",
        "Dog": "fa-dog", 
        "Cat": "fa-cat",
        "Fowl": "fa-crow",
        "Goat": "fa-horse", // Using horse icon for goat
        "Sheep": "fa-horse", // Using horse icon for sheep
        "Pig": "fa-horse", // Using horse icon for pig
        "Horse": "fa-horse",
        "Llama": "fa-horse", // Using horse icon for llama
        "Alpaca": "fa-horse", // Using horse icon for alpaca
        "Donkey": "fa-horse" // Using horse icon for donkey
    };
    return icons[animalType] || "fa-paw";
}

// Species-specific gender mappings
const genderOptions = {
    'Cattle': [
        { value: 'Bull', text: 'Bull (intact male)' },
        { value: 'Steer', text: 'Steer (castrated male)' },
        { value: 'Cow', text: 'Cow (female that has calved)' },
        { value: 'Heifer', text: 'Heifer (female that has not calved)' }
    ],
    'Cat': [
        { value: 'Tom', text: 'Tom (male)' },
        { value: 'Queen', text: 'Queen (female)' }
    ],
    'Dog': [
        { value: 'Dog', text: 'Dog (male)' },
        { value: 'Bitch', text: 'Bitch (female)' }
    ],
    'Sheep': [
        { value: 'Ram', text: 'Ram (male)' },
        { value: 'Ewe', text: 'Ewe (female)' },
        { value: 'Wether', text: 'Wether (castrated male)' }
    ],
    'Goat': [
        { value: 'Billy', text: 'Billy (male)' },
        { value: 'Nanny', text: 'Nanny (female)' },
        { value: 'Wether', text: 'Wether (castrated male)' }
    ],
    'Pig': [
        { value: 'Boar', text: 'Boar (male)' },
        { value: 'Barrow', text: 'Barrow (castrated male)' },
        { value: 'Sow', text: 'Sow (female)' },
        { value: 'Gilt', text: 'Gilt (young female that has not farrowed)' }
    ],
    'Horse': [
        { value: 'Stallion', text: 'Stallion (male)' },
        { value: 'Gelding', text: 'Gelding (castrated male)' },
        { value: 'Mare', text: 'Mare (female)' },
        { value: 'Filly', text: 'Filly (young female)' },
        { value: 'Colt', text: 'Colt (young male)' }
    ],
    'Donkey': [
        { value: 'Jack', text: 'Jack (male)' },
        { value: 'Jenny', text: 'Jenny (female)' }
    ],
    'Goose': [
        { value: 'Gander', text: 'Gander (male)' },
        { value: 'Goose', text: 'Goose (female)' }
    ],
    'Duck': [
        { value: 'Drake', text: 'Drake (male)' },
        { value: 'Hen', text: 'Hen (female)' }
    ],
    'Turkey': [
        { value: 'Tom', text: 'Tom (male)' },
        { value: 'Hen', text: 'Hen (female)' }
    ],
    'Chicken': [
        { value: 'Rooster', text: 'Rooster (male)' },
        { value: 'Cockerel', text: 'Cockerel (young male)' },
        { value: 'Hen', text: 'Hen (female)' },
        { value: 'Pullet', text: 'Pullet (young female)' },
        { value: 'Capon', text: 'Capon (castrated male)' }
    ],
    'Rabbit': [
        { value: 'Buck', text: 'Buck (male)' },
        { value: 'Doe', text: 'Doe (female)' }
    ],
    'default': [
        { value: 'Male', text: 'Male' },
        { value: 'Female', text: 'Female' }
    ]
};

// Function to determine animal type from gender and breed
function getAnimalTypeFromGender(gender, breed) {
    if (!gender) return "Unknown";
    
    const genderLower = gender.toLowerCase();
    
    // Cattle
    if (['bull', 'steer', 'cow', 'heifer'].includes(genderLower)) return "Cattle";
    // Cats  
    if (['tom', 'queen'].includes(genderLower)) return "Cat";
    // Dogs
    if (['dog', 'bitch'].includes(genderLower)) return "Dog";
    
    // Special case: if gender is already the animal type, use it directly
    if (['cattle', 'cat', 'dog', 'sheep', 'goat', 'pig', 'horse', 'donkey', 'fowl'].includes(genderLower)) {
        console.log(`Gender "${gender}" appears to be animal type, using directly`);
        return genderLower.charAt(0).toUpperCase() + genderLower.slice(1);
    }
    // Sheep
    if (['ram', 'ewe', 'wether'].includes(genderLower)) return "Sheep";
    // Goats
    if (['billy', 'nanny', 'wether'].includes(genderLower)) return "Goat";
    // Pigs
    if (['boar', 'barrow', 'sow', 'gilt'].includes(genderLower)) return "Pig";
    // Horses
    if (['stallion', 'gelding', 'mare', 'filly', 'colt'].includes(genderLower)) return "Horse";
    // Donkeys
    if (['jack', 'jenny'].includes(genderLower)) return "Donkey";
    // Fowl (Chickens, Ducks, Turkeys, etc.)
    if (['rooster', 'cockerel', 'hen', 'pullet', 'capon', 'drake'].includes(genderLower)) return "Fowl";
    
    // Special cases that need breed info
    if (breed) {
        const breedLower = breed.toLowerCase();
        
        // Llamas/Alpacas
        if (['stud', 'gelding', 'female'].includes(genderLower)) {
            if (breedLower.includes('llama')) return "Llama";
            if (breedLower.includes('alpaca')) return "Alpaca";
        }
        
        // Rabbits
        if (['buck', 'doe'].includes(genderLower) && breedLower.includes('rabbit')) return "Rabbit";
        
        // Fish
        if (['silver perch', 'barramundi', 'tilapia', 'trout', 'salmon', 'catfish'].some(fish => 
            breedLower.includes(fish))) return "Fish";
        
        // Deer
        if (['buck', 'doe'].includes(genderLower) && breedLower.includes('deer')) return "Deer";
        
        // Default fallback - try to guess from breed
        if (breedLower.includes('cat')) return "Cat";
        if (breedLower.includes('dog') || breedLower.includes('shepherd') || breedLower.includes('husky') || breedLower.includes('labrador')) return "Dog";
        if (breedLower.includes('santa') || breedLower.includes('hereford') || breedLower.includes('angus')) return "Cattle";
    }
    
    return "Other";
}

// Function to populate filter tabs dynamically
async function populateFilterTabs() {
    try {
        console.log("Populating filter tabs...");
        
        // Get animals first - we will derive types from the actual data
        console.log("Fetching animals for dynamic type extraction...");
        const animalsResponse = await fetch("get_animals");
        console.log("Animals response status:", animalsResponse.status);
        
        if (!animalsResponse.ok) {
            console.error("Failed to fetch animals");
            return;
        }
        
        const allAnimals = await animalsResponse.json();
        console.log("All animals:", allAnimals);
        
        // Extract unique animal types from the actual animal records
        const animalTypeSet = new Set();
        allAnimals.forEach(animal => {
            const animalType = getAnimalTypeFromGender(animal.gender, animal.breed);
            animalTypeSet.add(animalType);
            console.log(`Processing animal: ${animal.name}, Gender: "${animal.gender}", Breed: "${animal.breed}", Type: ${animalType}`);
        });
        
        // Convert to array and add "All" at the beginning
        const animalTypes = ["All", ...Array.from(animalTypeSet).sort()];
        console.log("Dynamic animal types extracted:", animalTypes);
        
        const filterBar = document.getElementById("filter-bar");
        if (!filterBar) {
            console.error("Filter bar not found!");
            return;
        }
        
        // Clear existing tabs (except Add button which we will add back)
        filterBar.innerHTML = '';
        
        // Count animals by type using same function as filter tabs (only active animals)
        const animalCounts = {};
        const activeAnimals = allAnimals.filter(animal => animal.status === 'Active');
        
        activeAnimals.forEach(animal => {
            const type = getAnimalTypeFromGender(animal.gender, animal.breed);
            animalCounts[type] = (animalCounts[type] || 0) + 1;
            console.log(`Animal: ${animal.name}, Gender: ${animal.gender}, Breed: ${animal.breed}, Type: ${type}, Status: ${animal.status}`);
        });
        
        // Add "All" tab with total count of active animals
        const allButton = document.createElement("button");
        allButton.className = "filter-btn active";
        allButton.dataset.filter = "All";
        
        const allIcon = document.createElement("i");
        allIcon.className = `fa-solid ${getAnimalIcon("All")}`;
        
        const allCount = document.createElement("sup");
        allCount.style.cssText = "font-size: 0.7em; margin-left: 2px; color: var(--accent-color);";
        allCount.textContent = `(${activeAnimals.length})`;
        
        const allText = document.createTextNode(" All");
        
        allButton.appendChild(allIcon);
        allButton.appendChild(allText);
        allButton.appendChild(allCount);
        filterBar.appendChild(allButton);
        
        // Add tabs for each animal type with counts
        animalTypes.slice(1).forEach(animalType => {
            if (animalType === "All") return;
            
            const button = document.createElement("button");
            button.className = "filter-btn";
            button.dataset.filter = animalType;
            
            const icon = document.createElement("i");
            icon.className = `fa-solid ${getAnimalIcon(animalType)}`;
            
            const count = document.createElement("sup");
            count.style.cssText = "font-size: 0.7em; margin-left: 2px; color: var(--accent-color);";
            const countValue = animalCounts[animalType] || 0;
            count.textContent = `(${countValue})`;
            
            console.log(`Creating tab for ${animalType} with count: ${countValue}`);
            
            const text = document.createTextNode(` ${animalType}`);
            
            button.appendChild(icon);
            button.appendChild(text);
            button.appendChild(count);
            filterBar.appendChild(button);
        });
        
        // Always add "Add" tab as the last tab (no count)
        const addButton = document.createElement("button");
        addButton.className = "filter-btn";
        addButton.dataset.filter = "add";
        
        const addIcon = document.createElement("i");
        addIcon.className = "fa-solid fa-plus";
        
        const addText = document.createTextNode(" Add");
        
        addButton.appendChild(addIcon);
        addButton.appendChild(addText);
        filterBar.appendChild(addButton);
        
        console.log("Filter tabs populated successfully with counts:", animalCounts);
    } catch (error) {
        console.error("Error populating filter tabs:", error);
    }
}

async function populateAnimalList(filter = "All") {
    try {
        console.log("populateAnimalList called with filter:", filter);
        const response = await fetch("get_animals");
        console.log("Fetch response status:", response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const animals = await response.json();
        console.log("Animals data received:", animals);
        console.log("Number of animals:", animals.length);
        
        const filteredAnimals = filter === "All" ? animals : animals.filter(animal => getAnimalTypeFromGender(animal.gender, animal.breed) === filter);
        console.log("Filtered animals count:", filteredAnimals.length);
        
        const tableBody = document.querySelector("#livestock-list tbody");
        if (!tableBody) {
            console.error("Table body not found!");
            return;
        }
        
        tableBody.innerHTML = ""; // Clear existing rows

        filteredAnimals.forEach((animal, index) => {
            console.log(`Processing animal ${index + 1}:`, animal);
            
            const row = document.createElement("tr");
            row.dataset.animalId = animal.id;

            row.innerHTML = `
                <td>${formatCell(animal.name)}</td>
                <td>${formatCell(animal.gender)}</td>
                <td>${getStatusIcon(animal.status)}</td>
                <td>${calculateAge(animal.birth_date)}</td>
            `;

            tableBody.appendChild(row);
        });
        
        // Set minimum table width based on filter tabs width
        setTableMinWidth('livestock');
        
        console.log("Table population completed");
    } catch (error) {
        console.error("Error in populateAnimalList:", error);
    }
    }

    // Function to set minimum table width based on filter tabs width
    function setTableMinWidth(section) {
        const filterBarId = section === 'livestock' ? '#filter-bar' : '#assets-filter-bar';
        const tableId = section === 'livestock' ? '#livestock-list' : '#assets-list';
        
        const filterBar = document.querySelector(filterBarId);
        const table = document.querySelector(tableId);
        
        if (filterBar && table) {
            // Calculate total width of filter tabs
            const filterButtons = filterBar.querySelectorAll('.filter-btn');
            let totalFilterWidth = 0;
            
            filterButtons.forEach(btn => {
                const style = window.getComputedStyle(btn);
                const width = btn.offsetWidth;
                const marginLeft = parseInt(style.marginLeft) || 0;
                const marginRight = parseInt(style.marginRight) || 0;
                totalFilterWidth += width + marginLeft + marginRight;
                console.log(`Filter button width: ${width}px, margins: ${marginLeft + marginRight}px, total so far: ${totalFilterWidth}px`);
            });
            
            console.log(`Total filter width for ${section}: ${totalFilterWidth}px`);
            console.log(`Current table width: ${table.offsetWidth}px`);
            
            // Force table layout recalculation and set explicit width
            table.style.width = `${totalFilterWidth}px`;
            table.style.minWidth = `${totalFilterWidth}px`;
            table.style.tableLayout = 'fixed';
            
            // Distribute width across columns with minimum widths
            const headerCells = table.querySelectorAll('th');
            if (headerCells.length > 0) {
                // Calculate minimum widths based on content
                const minWidths = Array.from(headerCells).map(cell => {
                    const text = cell.textContent.trim();
                    const tempSpan = document.createElement('span');
                    tempSpan.style.visibility = 'hidden';
                    tempSpan.style.position = 'absolute';
                    tempSpan.style.whiteSpace = 'nowrap';
                    tempSpan.textContent = text;
                    document.body.appendChild(tempSpan);
                    const textWidth = tempSpan.offsetWidth + 20; // Add padding
                    document.body.removeChild(tempSpan);
                    return textWidth;
                });
                
                const totalMinWidth = minWidths.reduce((sum, width) => sum + width, 0);
                const extraWidth = Math.max(0, totalFilterWidth - totalMinWidth);
                const extraPerColumn = Math.floor(extraWidth / headerCells.length);
                
                headerCells.forEach((cell, index) => {
                    const finalWidth = minWidths[index] + extraPerColumn;
                    cell.style.width = `${finalWidth}px`;
                    cell.style.minWidth = `${finalWidth}px`;
                });
                
                // Apply same width to data cells
                const dataCells = table.querySelectorAll('td');
                dataCells.forEach((cell, index) => {
                    const cellIndex = index % headerCells.length; // Cycle through column widths
                    const finalWidth = minWidths[cellIndex] + extraPerColumn;
                    cell.style.width = `${finalWidth}px`;
                    cell.style.minWidth = `${finalWidth}px`;
                });
            }
            
            console.log(`Set ${section} table width to ${totalFilterWidth}px with ${headerCells.length} columns`);
            
            // Force reflow
            table.offsetHeight;
        }
    }

    // Function to populate parent dropdowns
async function populateParentDropdowns() {
    console.log("populateParentDropdowns called");
    try {
        const response = await fetch('api/animals');
        console.log("Animals response status:", response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allAnimals = await response.json();
        console.log("All animals received:", allAnimals.length);
        
        const damSelect = document.getElementById('edit-dam-id');
        const sireSelect = document.getElementById('edit-sire-id');
        
        console.log("Dam select element:", damSelect);
        console.log("Sire select element:", sireSelect);
        
        if (!damSelect || !sireSelect) {
            console.error("Dam or Sire select elements not found!");
            return;
        }
        
        // Clear existing options and add default options
        damSelect.innerHTML = '<option value="">Select Dam</option><option value="unknown">Unknown</option>';
        sireSelect.innerHTML = '<option value="">Select Sire</option><option value="unknown">Unknown</option>';
        
        // Add all female animals as potential dams
        const femaleAnimals = allAnimals.filter(animal => 
            ['cow', 'heifer', 'ewe', 'doe', 'nanny', 'sow', 'gilt', 'mare', 'filly', 'jenny', 'queen', 'hen', 'pullet', 'goose', 'duck', 'bitch'].includes(animal.gender?.toLowerCase())
        );
        console.log("Female animals found:", femaleAnimals.length);
        
        femaleAnimals.forEach(animal => {
            const option = document.createElement('option');
            option.value = animal.id;
            option.textContent = `${animal.name} (ID: ${animal.id})`;
            damSelect.appendChild(option);
        });
        
        // Add all male animals as potential sires
        const maleAnimals = allAnimals.filter(animal => 
            ['bull', 'steer', 'ram', 'buck', 'billy', 'boar', 'barrow', 'stallion', 'gelding', 'colt', 'jack', 'tom', 'rooster', 'cockerel', 'drake', 'gander', 'dog'].includes(animal.gender?.toLowerCase())
        );
        console.log("Male animals found:", maleAnimals.length);
        
        maleAnimals.forEach(animal => {
            const option = document.createElement('option');
            option.value = animal.id;
            option.textContent = `${animal.name} (ID: ${animal.id})`;
            sireSelect.appendChild(option);
        });
        
        console.log("Dam select options count:", damSelect.options.length - 1);
        console.log("Sire select options count:", sireSelect.options.length - 1);
        
    } catch (error) {
        console.error("Error populating parent dropdowns:", error);
    }
}

// Function to populate parent asset dropdowns
async function populateParentAssetDropdowns() {
    console.log("populateParentAssetDropdowns called");
    try {
        const response = await fetch("api/assets");
        console.log("Assets response status:", response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const assets = await response.json();
        console.log("Assets received:", assets.length, "assets");
        
        // Populate parent asset dropdowns
        const addParentSelect = document.getElementById('add-asset-parent-id');
        const editParentSelect = document.getElementById('edit-asset-parent-id');
        
        if (addParentSelect) {
            addParentSelect.innerHTML = '<option value="">No Parent</option>';
            assets.filter(asset => asset.category !== 'Building').forEach(asset => {
                addParentSelect.innerHTML += `<option value="${asset.id}">${asset.name} (${asset.category})</option>`;
            });
        }
        
        if (editParentSelect) {
            editParentSelect.innerHTML = '<option value="">No Parent</option>';
            assets.filter(asset => asset.category !== 'Building').forEach(asset => {
                editParentSelect.innerHTML += `<option value="${asset.id}">${asset.name} (${asset.category})</option>`;
            });
        }
        
        console.log("Parent asset dropdowns populated successfully");
        
    } catch (error) {
        console.error("Error populating parent asset dropdowns:", error);
    }
}

// Function to open add animal form
async function openAddAnimalForm() {
    // Clear form data
    document.getElementById('edit-animal-id').value = '';
    document.getElementById('edit-tag-id').value = '';
    document.getElementById('edit-name').value = '';
    document.getElementById('edit-breed').value = '';
    document.getElementById('edit-date-of-birth').value = '';
    document.getElementById('edit-date-of-disposal').value = '';
    document.getElementById('edit-health-status').value = 'Healthy';
    document.getElementById('edit-notes').value = '';
    document.getElementById('edit-dam-id').value = '';
    document.getElementById('edit-sire-id').value = '';
    document.getElementById('edit-features').value = '';
    document.getElementById('edit-photo-path').value = '';
    document.getElementById('edit-pic').value = '';
    document.getElementById('edit-status').value = 'Active';
    
    // Reset photo upload area
    resetPhotoUpload();
    
    // Reset gender options to default
    updateGenderOptions('');
    
    // Populate parent dropdowns
    await populateParentDropdowns();
    
    // Update modal title and button text
    const modalTitle = document.querySelector('#edit-animal-modal h2');
    if (modalTitle) {
        modalTitle.textContent = 'Add New Animal';
    }
    const saveButton = document.querySelector('#edit-animal-form button[type="submit"]');
    if (saveButton) {
        saveButton.textContent = 'Add Animal';
    }
    
    // Show modal
    document.getElementById('edit-animal-modal').style.display = "block";
    
    // Add event listener for generate name button
    const generateNameBtn = document.getElementById('generate-name-btn');
    if (generateNameBtn) {
        // Remove existing listeners to prevent duplicates
        generateNameBtn.replaceWith(generateNameBtn.cloneNode(true));
        // Add fresh listener
        document.getElementById('generate-name-btn').addEventListener('click', openNameWizard);
    }
}

// Function to update gender options based on category
function updateGenderOptions(category) {
    const genderSelect = document.getElementById('edit-gender');
    const options = genderOptions[category] || genderOptions['default'];
    
    // Clear existing options
    genderSelect.innerHTML = '';
    
    // Add new options
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        genderSelect.appendChild(optionElement);
    });
}

// Function to show animal details in modal
async function showAnimalDetails(animalId) {
    try {
        const response = await fetch(`get_animal/${animalId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const animal = await response.json();
        console.log("Animal details:", animal);

        const animalDetailsContent = document.getElementById("animal-details-content");
        
        // Format offspring list
        let offspringHtml = '';
        if (animal.offspring && animal.offspring.length > 0) {
            offspringHtml = animal.offspring.map(offspring => 
                `<div style="padding: 5px; border: 1px solid #ddd; margin: 2px 0; border-radius: 3px;">
                    <strong>${offspring.name}</strong> (${offspring.gender}, ${calculateAge(offspring.birth_date)})
                </div>`
            ).join('');
        } else {
            offspringHtml = '<div style="color: #666; font-style: italic;">No offspring recorded</div>';
        }
        
        animalDetailsContent.innerHTML = `
            <table class="details-table">
                <tr>
                    <td class="property-cell">Tag ID:</td>
                    <td class="value-cell">${formatCell(animal.tag_id)}</td>
                </tr>
                <tr>
                    <td class="property-cell">Name:</td>
                    <td class="value-cell">${formatCell(animal.name)}</td>
                </tr>
                <tr>
                    <td class="property-cell">Gender:</td>
                    <td class="value-cell">${formatCell(animal.gender)}</td>
                </tr>
                <tr>
                    <td class="property-cell">Breed:</td>
                    <td class="value-cell">${formatCell(animal.breed)}</td>
                </tr>
                <tr>
                    <td class="property-cell">Date of Birth:</td>
                    <td class="value-cell">${formatCell(animal.birth_date)}</td>
                </tr>
                <tr>
                    <td class="property-cell">Age:</td>
                    <td class="value-cell">${calculateAge(animal.birth_date)}</td>
                </tr>
                <tr>
                    <td class="property-cell">Status:</td>
                    <td class="value-cell">${getStatusIcon(animal.status)} ${animal.status}</td>
                </tr>
                <tr>
                    <td class="property-cell">Health Status:</td>
                    <td class="value-cell">${formatCell(animal.health_status)}</td>
                </tr>
                <tr>
                    <td class="property-cell">Notes:</td>
                    <td class="value-cell">${formatCell(animal.notes)}</td>
                </tr>
                <tr>
                    <td class="property-cell">Features:</td>
                    <td class="value-cell">${formatCell(animal.features)}</td>
                </tr>
                <tr>
                    <td class="property-cell">Photos:</td>
                    <td class="value-cell">
                        <div id="animal-details-photos" class="photo-gallery" style="margin-top: 10px;"></div>
                    </td>
                </tr>
                <tr>
                    <td class="property-cell">Dam (Mother):</td>
                    <td class="value-cell">${formatCell(animal.dam_name || 'Not recorded')}</td>
                </tr>
                <tr>
                    <td class="property-cell">Sire (Father):</td>
                    <td class="value-cell">${formatCell(animal.sire_name || 'Not recorded')}</td>
                </tr>
            </table>
            <div class="offspring-section">
                <h3>Offspring</h3>
                ${offspringHtml}
            </div>
        `;
        
        // Set the animal ID and name on the action buttons
        document.getElementById('update-animal-btn').dataset.animalId = animalId;
        document.getElementById('update-animal-btn').dataset.animalName = animal.name || 'Animal';
        document.getElementById('delete-animal-btn').dataset.animalId = animalId;
        
        // Load animal photos for details view (after DOM is updated)
        loadAnimalPhotosForDetails(animalId);
        
        // Show modal
        document.getElementById('animal-details-modal').style.display = "block";
    } catch (error) {
        console.error("Error loading animal data for details:", error);
        alert("Error loading animal data. Please try again.");
    }
}

// Function to enable edit mode for an animal
async function enableEditMode(animalId) {
    try {
        // Fetch current animal data
        const response = await fetch(`get_animal/${animalId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const animal = await response.json();
        
        // Populate form with animal data
        document.getElementById('edit-animal-id').value = animal.id;
        document.getElementById('edit-tag-id').value = animal.tag_id || '';
        document.getElementById('edit-name').value = animal.name || '';
        document.getElementById('edit-breed').value = animal.breed || '';
        document.getElementById('edit-date-of-birth').value = animal.birth_date || '';
        document.getElementById('edit-date-of-disposal').value = animal.dod || '';
        document.getElementById('edit-health-status').value = animal.health_status || 'Healthy';
        document.getElementById('edit-notes').value = animal.notes || '';
        document.getElementById('edit-features').value = animal.features || '';
        document.getElementById('edit-photo-path').value = animal.photo_path || '';
        document.getElementById('edit-pic').value = animal.pic || '';
        document.getElementById('edit-status').value = animal.status || 'Active';
        document.getElementById('edit-weight').value = animal.weight || '';
        
        // Load existing photos if available
        loadAnimalPhotos(animal.id);
        
        // Determine category from gender/breed
        let category = 'Other';
        const genderLower = animal.gender ? animal.gender.toLowerCase() : '';
        
        if (['bull', 'steer', 'cow', 'heifer'].includes(genderLower)) {
            category = 'Cattle';
        } else if (['tom', 'queen'].includes(genderLower)) {
            category = 'Cat';
        } else if (['dog', 'bitch'].includes(genderLower)) {
            category = 'Dog';
        } else if (['ram', 'ewe', 'wether'].includes(genderLower)) {
            category = 'Sheep';
        } else if (['billy', 'nanny', 'wether'].includes(genderLower)) {
            category = 'Goat';
        } else if (['boar', 'barrow', 'sow', 'gilt'].includes(genderLower)) {
            category = 'Pig';
        } else if (['stallion', 'gelding', 'mare', 'filly', 'colt'].includes(genderLower)) {
            category = 'Horse';
        } else if (['jack', 'jenny'].includes(genderLower)) {
            category = 'Donkey';
        } else if (['rooster', 'cockerel', 'hen', 'pullet', 'capon', 'drake'].includes(genderLower)) {
            category = 'Fowl';
        }
        
        // Update category dropdown to match detected type
        document.getElementById('edit-category').value = category;
        
        console.log("Edit mode - Category:", category, "Animal data:", animal);
        updateGenderOptions(category);
        
        // Set gender after options are populated
        setTimeout(() => {
            document.getElementById('edit-gender').value = animal.gender || '';
        }, 100);
        
        // Populate parent dropdowns
        await populateParentDropdowns();
        
        // Set dam and sire values AFTER dropdowns are populated
        document.getElementById('edit-dam-id').value = animal.dam_id ? String(animal.dam_id) : '';
        document.getElementById('edit-sire-id').value = animal.sire_id ? String(animal.sire_id) : '';
        
        // Update modal title and button text
        const modalTitle = document.querySelector('#edit-animal-modal h2');
        if (modalTitle) {
            modalTitle.textContent = 'Edit Animal';
        }
        const saveButton = document.querySelector('#edit-animal-form button[type="submit"]');
        if (saveButton) {
            saveButton.textContent = 'Update Animal';
        }
        
        // Hide details modal and show edit modal
        document.getElementById('animal-details-modal').style.display = "none";
        document.getElementById('edit-animal-modal').style.display = "block";
        
        // Add event listener for generate name button
        const generateNameBtn = document.getElementById('generate-name-btn');
        if (generateNameBtn) {
            // Remove existing listeners to prevent duplicates
            generateNameBtn.replaceWith(generateNameBtn.cloneNode(true));
            // Add fresh listener
            document.getElementById('generate-name-btn').addEventListener('click', openNameWizard);
        }
        
    } catch (error) {
        console.error("Error loading animal data for edit:", error);
        alert("Error loading animal data. Please try again.");
    }
}

// --- Name Generator Functions ---

let selectedNorseName = '';

// Function to open name wizard
function openNameWizard() {
    document.getElementById('name-wizard-modal').style.display = 'block';
    // Reset wizard
    document.getElementById('wizard-step-1').style.display = 'block';
    document.getElementById('wizard-step-2').style.display = 'none';
    document.getElementById('name-options').innerHTML = '';
    document.getElementById('select-name-btn').disabled = true;
    selectedNorseName = '';
    
    // Clear input fields
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`birth-word-${i}`).value = '';
    }
}

    // Function to translate English words to Old Norse
    async function translateToOldNorse(words) {
        try {
            const translations = {};
            
            // Translate each word using the Viking dictionary
            for (const word of words) {
                if (word && word.trim()) {
                    const oldNorse = await getOldNorseTranslation(word.trim().toLowerCase());
                    // Always include translation (fallback will generate something)
                    translations[word] = oldNorse;
                    console.log(`Translated "${word}" -> "${oldNorse}"`);
                }
            }
            
            console.log('All translations:', translations);
            return translations;
        } catch (error) {
            console.error('Error translating to Old Norse:', error);
            return {};
        }
}

// Function to get Old Norse translation from dictionary
async function getOldNorseTranslation(englishWord) {
    try {
        // Common Old Norse name translations based on meaning
        const nameDictionary = {
            // Strength/Battle related
            'strong': 'Styrkr',
            'brave': 'Drengr', 
            'warrior': 'Hersir',
            'battle': 'Orusta',
            'fighter': 'Kappi',
            
            // Nature/Weather related
            'storm': 'Stormr',
            'winter': 'Vetr',
            'snow': 'Snjór',
            'ice': 'Íss',
            'frost': 'Frosti',
            'cold': 'Kaldr',
            
            // Light/Brightness related
            'bright': 'Bjart',
            'light': 'Ljós',
            'shining': 'Skinandi',
            'morning': 'Morgunn',
            'dawn': 'Dagr',
            'sun': 'Sól',
            
            // Birth/New life related
            'new': 'Nýr',
            'first': 'Fyrstr',
            'calf': 'Kalfr',
            'young': 'Ungur',
            'birth': 'Fæðing',
            'joy': 'Gleði',
            
            // Animals related
            'bull': 'Naut',
            'ox': 'Uxi',
            'cow': 'Kýr',
            'cattle': 'Fé',
            'herd': 'Hjörð',
            
            // Qualities
            'swift': 'Snarr',
            'fast': 'Hrastr',
            'gentle': 'Mildr',
            'kind': 'Vinsæll',
            'lucky': 'Heppinn',
            'special': 'Sérstakur',
            'noble': 'Ættbær',
            'proud': 'Stoltur',
            
            // Colors
            'white': 'Hvítur',
            'black': 'Svartur',
            'brown': 'Brúnn',
            'red': 'Rauður',
            'golden': 'Gullinn',
            
            // Time/Season related
            'summer': 'Sumar',
            'spring': 'Vor',
            'autumn': 'Haust',
            'year': 'Ár',
            'time': 'Tími'
        };
        
        // Check if word exists in dictionary
        if (nameDictionary[englishWord]) {
            return nameDictionary[englishWord];
        }
        
        // Try to find partial matches or similar words
        const lowerWord = englishWord.toLowerCase();
        for (const [english, oldNorse] of Object.entries(nameDictionary)) {
            if (english.includes(lowerWord) || lowerWord.includes(english)) {
                return oldNorse;
            }
        }
        
        // If no translation found, return a generic Old Norse suffix
        const suffixes = ['-son', '-dóttir', '-sson', '-ur', '-ir', '-r'];
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return englishWord.charAt(0).toUpperCase() + englishWord.slice(1) + randomSuffix;
    } catch (error) {
        console.error('Error getting translation:', error);
        return null;
    }
}

// Function to generate Norse names from translations
function generateNorseNames(translations) {
    const names = [];
    const translationValues = Object.values(translations);
    
    // Generate combinations and variations
    translationValues.forEach(word => {
        if (word) {
            // Add the word as a name
            names.push({
                name: word,
                meaning: `Direct translation: ${Object.keys(translations).find(k => translations[k] === word) || 'Unknown'}`
            });
            
            // Generate variations
            if (word.length > 3) {
                // Add common Old Norse name endings
                names.push({
                    name: word + 'r',
                    meaning: `Masculine form of ${word}`
                });
                names.push({
                    name: word + 'a',
                    meaning: `Feminine form of ${word}`
                });
            }
        }
    });
    
    // Add some traditional Old Norse names that might match meanings
    const traditionalNames = [
        { name: 'Björn', meaning: 'Bear' },
        { name: 'Ulf', meaning: 'Wolf' },
        { name: 'Erik', meaning: 'Eternal ruler' },
        { name: 'Leif', meaning: 'Heir' },
        { name: 'Thor', meaning: 'Thunder' },
        { name: 'Odin', meaning: 'Poetry/fury' },
        { name: 'Freyr', meaning: 'Lord' },
        { name: 'Tyr', meaning: 'God' },
        { name: 'Skadi', meaning: 'Damage' },
        { name: 'Freyja', meaning: 'Lady' },
        { name: 'Sif', meaning: 'Wife' },
        { name: 'Idunn', meaning: 'Rejuvenator' }
    ];
    
    // Filter traditional names based on input meanings
    const inputMeanings = Object.keys(translations).join(' ').toLowerCase();
    traditionalNames.forEach(tradName => {
        if (inputMeanings.includes('strong') || inputMeanings.includes('brave') || inputMeanings.includes('warrior')) {
            names.push(tradName);
        }
        if (inputMeanings.includes('light') || inputMeanings.includes('bright') || inputMeanings.includes('morning')) {
            names.push(tradName);
        }
        if (inputMeanings.includes('new') || inputMeanings.includes('first') || inputMeanings.includes('young')) {
            names.push(tradName);
        }
    });
    
    // Remove duplicates and limit to reasonable number
    const uniqueNames = names.filter((name, index, self) => 
        index === self.findIndex(n => n.name === name.name)
    ).slice(0, 12);
    
    return uniqueNames;
}

// Function to display name options
function displayNameOptions(names) {
    const optionsContainer = document.getElementById('name-options');
    optionsContainer.innerHTML = '';
    
    names.forEach((nameObj, index) => {
        const nameCard = document.createElement('div');
        nameCard.className = 'name-option-card';
        nameCard.innerHTML = `
            <div class="name-option">
                <input type="radio" name="norse-name" value="${nameObj.name}" id="name-${index}">
                <label for="name-${index}">
                    <strong>${nameObj.name}</strong>
                    <br><small>${nameObj.meaning}</small>
                </label>
            </div>
        `;
        
        nameCard.addEventListener('click', () => {
            document.getElementById(`name-${index}`).checked = true;
            selectedNorseName = nameObj.name;
            document.getElementById('select-name-btn').disabled = false;
            
            // Update visual selection
            document.querySelectorAll('.name-option-card').forEach(card => {
                card.classList.remove('selected');
            });
            nameCard.classList.add('selected');
        });
        
        optionsContainer.appendChild(nameCard);
    });
}

// Function to open add event modal
async function openAddEventModal(date, time) {
    try {
        console.log(`Opening add event modal for ${date} at ${time}`);
        
        // Set the date and time in hidden fields
        document.getElementById('event-date').value = date;
        document.getElementById('event-time').value = time;
        
        // Clear previous form data
        document.getElementById('event-category').value = '';
        document.getElementById('event-item-name').innerHTML = '<option value="">Select Category First</option>';
        document.getElementById('event-title').value = '';
        document.getElementById('event-duration').value = '';
        document.getElementById('event-notes').value = '';
        document.getElementById('event-status').value = 'scheduled';
        document.getElementById('event-priority').value = 'medium';
        
        // Show modal
        document.getElementById('add-event-modal').style.display = 'block';
        
    } catch (error) {
        console.error('Error opening add event modal:', error);
        alert('Error opening event modal. Please try again.');
    }
}

// Function to open add event modal pre-filled for animal
async function openAddEventModalForAnimal(animalId, animalName) {
    try {
        console.log(`Opening add event modal for animal ${animalId} (${animalName})`);
        
        // Set todays date and default time
        const today = new Date().toISOString().split('T')[0];
        const defaultTime = '09:00';
        
        // Set date and time in hidden fields
        document.getElementById('event-date').value = today;
        document.getElementById('event-time').value = defaultTime;
        
        // Pre-fill livestock category
        document.getElementById('event-category').value = 'livestock';
        
        // Populate livestock dropdown and select the specific animal
        await populateEventItemDropdown('livestock');
        
        // Wait a moment for dropdown to populate, then select the animal
        setTimeout(() => {
            const itemDropdown = document.getElementById('event-item-name');
            if (itemDropdown) {
                // Find and select the specific animal
                for (let option of itemDropdown.options) {
                    if (option.value == animalId) {
                        option.selected = true;
                        break;
                    }
                }
            }
        }, 500);
        
        // Clear other form data
        document.getElementById('event-title').value = '';
        document.getElementById('event-duration').value = '';
        document.getElementById('event-notes').value = '';
        document.getElementById('event-status').value = 'scheduled';
        document.getElementById('event-priority').value = 'medium';
        
        // Show modal
        document.getElementById('add-event-modal').style.display = 'block';
        
    } catch (error) {
        console.error('Error opening add event modal for animal:', error);
        alert('Error opening event modal. Please try again.');
    }
}

// Function to populate item dropdown based on category
async function populateEventItemDropdown(category) {
    try {
        const itemDropdown = document.getElementById('event-item-name');
        itemDropdown.innerHTML = '<option value="">Loading...</option>';
        
        let response;
        if (category === 'livestock') {
            response = await fetch('api/animals');
        } else if (category === 'asset') {
            response = await fetch('api/assets');
        }
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ${category} items`);
        }
        
        const items = await response.json();
        
        itemDropdown.innerHTML = '<option value="">Select Item</option>';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name || item.tag_id || `${item.make} ${item.model}`;
            itemDropdown.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error populating item dropdown:', error);
        document.getElementById('event-item-name').innerHTML = '<option value="">Error loading items</option>';
    }
}

// Function to save event
async function saveEvent(eventData) {
    try {
        console.log('Saving event with data:', eventData);
        const response = await fetch('api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save event');
        }
        
        const result = await response.json();
        console.log('Event saved successfully:', result);
        
        // Close modal and refresh calendar
        document.getElementById('add-event-modal').style.display = 'none';
        await loadCalendarEvents();
        
        return result;
        
    } catch (error) {
        console.error('Error saving event:', error);
        console.error('Error details:', error.message, error.stack);
        alert('Error saving event. Please try again.');
        throw error;
    }
}

async function updateEvent(eventId, eventData) {
    try {
        console.log('Updating event with ID:', eventId, 'and data:', eventData);
        const response = await fetch(`api/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update event');
        }
        
        const result = await response.json();
        console.log('Event updated successfully:', result);
        
        // Close modal and refresh calendar
        document.getElementById('add-event-modal').style.display = 'none';
        await loadCalendarEvents();
        
        return result;
        
    } catch (error) {
        console.error('Error updating event:', error);
        console.error('Error details:', error.message, error.stack);
        alert('Error updating event. Please try again.');
        throw error;
    }
}

// Function to enable event edit mode
async function enableEventEditMode(eventId) {
    try {
        console.log('Enabling edit mode for event ID:', eventId);
        
        // Fetch the current event data
        const response = await fetch(`api/events/${eventId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch event data');
        }
        
        const eventData = await response.json();
        console.log('Fetched event data:', eventData);
        
        // Close the details modal
        document.getElementById('event-details-modal').style.display = 'none';
        
        // Open the add event modal in edit mode
        await openAddEventModal(eventData.date, eventData.time || '09:00');
        
        // Populate form with existing data
        document.getElementById('event-category').value = eventData.category || '';
        
        // Populate item dropdown based on category
        if (eventData.category) {
            await populateEventItemDropdown(eventData.category);
            document.getElementById('event-item-name').value = eventData.related_id || '';
        }
        
        document.getElementById('event-title').value = eventData.title || '';
        document.getElementById('event-duration').value = eventData.duration || '';
        document.getElementById('event-notes').value = eventData.notes || '';
        document.getElementById('event-status').value = eventData.status || 'scheduled';
        document.getElementById('event-priority').value = eventData.priority || 'medium';
        document.getElementById('event-date-completed').value = eventData.date_completed || '';
        document.getElementById('event-actual-duration').value = eventData.actual_duration || '';
        
        // Show/hide completion fields based on status
        toggleCompletionFields(eventData.status || 'scheduled');
        
        // Change form submission to update instead of create
        const form = document.getElementById('add-event-form');
        const submitBtn = document.getElementById('submit-event-btn');
        
        // Remove existing event listeners
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        
        // Add update event listener
        newSubmitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                const formData = new FormData(form);
                const eventData = {
                    category: formData.get('category'),
                    item_id: formData.get('item_name'),
                    title: formData.get('title'),
                    duration: parseFloat(formData.get('duration')),
                    notes: formData.get('notes'),
                    status: formData.get('status'),
                    priority: formData.get('priority'),
                    date_completed: formData.get('date_completed'),
                    actual_duration: formData.get('actual_duration') ? parseFloat(formData.get('actual_duration')) : null,
                    date: document.getElementById('event-date').value,
                    time: document.getElementById('event-time').value
                };
                
                await updateEvent(eventId, eventData);
            } catch (error) {
                console.error('Error updating event:', error);
            }
        });
        
        // Update modal title and button text
        document.querySelector('#add-event-modal h2').textContent = 'Edit Event';
        newSubmitBtn.innerHTML = '<i class="fa-solid fa-save"></i> Update Event';
        newSubmitBtn.className = 'action-btn edit-btn';
        
        // Add a cancel edit button
        const modalActions = document.querySelector('#add-event-modal .modal-actions');
        const cancelEditBtn = document.createElement('button');
        cancelEditBtn.type = 'button';
        cancelEditBtn.className = 'action-btn';
        cancelEditBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Cancel Edit';
        cancelEditBtn.addEventListener('click', () => {
            document.getElementById('add-event-modal').style.display = 'none';
            // Reset modal title and button
            document.querySelector('#add-event-modal h2').textContent = 'Add Event';
            const originalBtn = document.getElementById('submit-event-btn');
            originalBtn.innerHTML = '<i class="fa-solid fa-save"></i> Save Event';
            originalBtn.className = 'action-btn add-btn';
        });
        
        // Replace existing cancel button or add new one
        const existingCancelBtn = modalActions.querySelector('.close-add-event-btn');
        if (existingCancelBtn) {
            existingCancelBtn.replaceWith(cancelEditBtn);
        } else {
            modalActions.appendChild(cancelEditBtn);
        }
        
    } catch (error) {
        console.error('Error enabling event edit mode:', error);
        alert('Error loading event data for editing. Please try again.');
    }
}

// Function to toggle completion fields based on status
function toggleCompletionFields(status) {
    const completionFields = document.getElementById('completion-fields');
    if (status === 'completed') {
        completionFields.style.display = 'block';
        // Set default date completed to today if empty
        const dateCompletedField = document.getElementById('event-date-completed');
        if (!dateCompletedField.value) {
            dateCompletedField.value = new Date().toISOString().split('T')[0];
        }
    } else {
        completionFields.style.display = 'none';
        // Clear completion fields when status is not completed
        document.getElementById('event-date-completed').value = '';
        document.getElementById('event-actual-duration').value = '';
    }
}

// Function to show event details modal
function showEventDetailsModal(eventData) {
    const modal = document.getElementById('event-details-modal');
    const content = document.getElementById('event-details-content');
    const deleteBtn = document.getElementById('delete-event-btn');
    const editBtn = document.getElementById('edit-event-btn');
    
    // Format event details
    const eventDate = new Date(eventData.date + 'T00:00:00');
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const icon = eventData.category === 'livestock' ? '🐄' : '🔧';
    const typeIcon = eventData.entry_type === 'action' ? '⚠️' : 'ℹ️';
    
    let detailsHtml = `
        <div class="event-detail-item">
            <strong>Title:</strong> ${eventData.title}
        </div>
        <div class="event-detail-item">
            <strong>Date:</strong> ${formattedDate}
        </div>
        <div class="event-detail-item">
            <strong>Category:</strong> ${icon} ${eventData.category.charAt(0).toUpperCase() + eventData.category.slice(1)}
        </div>
        <div class="event-detail-item">
            <strong>Type:</strong> ${typeIcon} ${eventData.entry_type.charAt(0).toUpperCase() + eventData.entry_type.slice(1)}
        </div>
    `;
    
    if (eventData.related_name) {
        detailsHtml += `
            <div class="event-detail-item">
                <strong>Related Item:</strong> ${eventData.related_name}
            </div>
        `;
    }
    
    if (eventData.description) {
        detailsHtml += `
            <div class="event-detail-item">
                <strong>Description:</strong> ${eventData.description}
            </div>
        `;
    }
    
    if (eventData.status) {
        detailsHtml += `
            <div class="event-detail-item">
                <strong>Status:</strong> ${eventData.status.charAt(0).toUpperCase() + eventData.status.slice(1)}
            </div>
        `;
    }
    
    content.innerHTML = detailsHtml;
    
    // Show delete button only for user-created events (those with entry_type = 'event')
    console.log('=== DELETE BUTTON LOGIC DEBUG ===');
    console.log('Full eventData object:', eventData);
    console.log('eventData.id:', eventData.id);
    console.log('eventData.entry_type:', eventData.entry_type);
    console.log('eventData.entry_type === "event":', eventData.entry_type === 'event');
    console.log('Both conditions (id && entry_type === "event"):', eventData.id && eventData.entry_type === 'event');
    
    if (eventData.id && eventData.entry_type === 'event') {
        console.log('✅ SHOWING DELETE BUTTON');
        deleteBtn.style.display = 'inline-block';
        // Remove all existing event listeners
        const newDeleteBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
        // Add new event listener
        newDeleteBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                await deleteEvent(eventData.id);
            } catch (error) {
                console.error('Delete button error:', error);
            }
        });
        
        console.log('✅ SHOWING EDIT BUTTON');
        editBtn.style.display = 'inline-block';
        // Remove all existing event listeners
        const newEditBtn = editBtn.cloneNode(true);
        editBtn.parentNode.replaceChild(newEditBtn, editBtn);
        // Add new event listener
        newEditBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                await enableEventEditMode(eventData.id);
            } catch (error) {
                console.error('Edit button error:', error);
            }
        });
    } else {
        console.log('❌ HIDING DELETE BUTTON');
        deleteBtn.style.display = 'none';
        console.log('❌ HIDING EDIT BUTTON');
        editBtn.style.display = 'none';
        // Add debug info to help understand why buttons are hidden
        console.log('Buttons hidden for event:', {
            id: eventData.id,
            entry_type: eventData.entry_type,
            title: eventData.title,
            category: eventData.category
        });
    }
    
    // Add click handlers for related item links
    if (eventData.category === 'livestock' && eventData.related_id) {
        content.innerHTML += `
            <div style="margin-top: 15px;">
                <button class="action-btn" onclick="showAnimalDetails(${eventData.related_id}); document.getElementById('event-details-modal').style.display='none';">
                    <i class="fa-solid fa-eye"></i> View Livestock Details
                </button>
            </div>
        `;
    } else if (eventData.category === 'asset' && eventData.related_id) {
        content.innerHTML += `
            <div style="margin-top: 15px;">
                <button class="action-btn" onclick="showAssetDetails(${eventData.related_id}); document.getElementById('event-details-modal').style.display='none';">
                    <i class="fa-solid fa-eye"></i> View Asset Details
                </button>
            </div>
        `;
    }
    
    modal.style.display = 'block';
}

// Function to delete event
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`api/events/${eventId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete event');
        }
        
        const result = await response.json();
        console.log('Event deleted successfully:', result);
        
        // Close modal and refresh calendar
        document.getElementById('event-details-modal').style.display = 'none';
        await loadCalendarEvents();
        
        return result;
        
    } catch (error) {
        console.error('Error deleting event:', error);
        console.error('Error details:', error.message, error.stack);
        alert('Error deleting event. Please try again.');
        throw error;
    }
}

// Quick delete function for inline delete buttons
async function quickDeleteEvent(eventId, eventTitle) {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`api/events/${eventId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete event');
        }
        
        const result = await response.json();
        console.log('Event deleted successfully:', result);
        
        // Refresh calendar to show updated events
        await loadCalendarEvents();
        
        return result;
        
    } catch (error) {
        console.error('Error deleting event:', error);
        console.error('Error details:', error.message, error.stack);
        alert('Error deleting event. Please try again.');
        throw error;
    }
}

// Function to delete maintenance schedule
async function deleteMaintenanceSchedule(scheduleId) {
    try {
        const response = await fetch(`api/maintenance-schedule/${scheduleId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete maintenance schedule');
        }
        
        const result = await response.json();
        console.log('Maintenance schedule deleted successfully:', result);
        
        // Close modal and refresh asset details
        document.getElementById('maintenance-schedule-modal').style.display = 'none';
        
        // Refresh asset details if open
        const assetId = document.getElementById('edit-asset-btn').dataset.assetId;
        if (assetId) {
            showAssetDetails(assetId);
        }
        
        return result;
        
    } catch (error) {
        console.error('Error deleting maintenance schedule:', error);
        console.error('Error details:', error.message, error.stack);
        alert('Error deleting maintenance schedule. Please try again.');
        throw error;
    }
}

// Function to load event for editing
    async function loadEventForEdit(eventId) {
        try {
            console.log('loadEventForEdit called with eventId:', eventId);
            
            // Fetch event data
            const response = await fetch(`/api/events/${eventId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch event: ${response.status}`);
            }
            
            const event = await response.json();
            console.log('Event loaded for editing:', event);
            
            // Change modal to edit mode first
            const modal = document.getElementById('add-event-modal');
            if (!modal) {
                console.error('Add event modal not found');
                return;
            }
            
            // Show modal first to ensure elements are accessible
            modal.style.display = 'block';
            modal.style.visibility = 'visible';
            
            // Wait for modal to be fully visible before accessing elements
            const waitForModal = () => {
                return new Promise((resolve) => {
                    const checkModal = () => {
                        const modalTitle = modal.querySelector('.modal-header h2');
                        const submitBtn = document.querySelector('#submit-event-btn');
                        
                        if (modalTitle && submitBtn) {
                            resolve({ modalTitle, submitBtn });
                        } else {
                            setTimeout(checkModal, 50);
                        }
                    };
                    checkModal();
                });
            };
            
            const { modalTitle, submitBtn } = await waitForModal();
            
            // Now populate form fields with null checks
            const eventCategory = document.getElementById('event-category');
            const eventItemName = document.getElementById('event-item-name');
            const eventDescription = document.getElementById('event-description');
            const eventDate = document.getElementById('event-date');
            const eventTime = document.getElementById('event-time');
            const eventDuration = document.getElementById('event-duration');
            const eventNotes = document.getElementById('event-notes');
            const eventStatus = document.getElementById('event-status');
            const eventPriority = document.getElementById('event-priority');
            
            if (eventCategory) eventCategory.value = event.category || '';
            if (eventItemName) eventItemName.value = event.related_name || '';
            if (eventDescription) eventDescription.value = event.title || '';
            if (eventDate) eventDate.value = event.date || '';
            if (eventTime) eventTime.value = event.time || '';
            if (eventDuration) eventDuration.value = event.duration || 1;
            if (eventNotes) eventNotes.value = event.description || '';
            if (eventStatus) eventStatus.value = event.status || 'scheduled';
            if (eventPriority) eventPriority.value = event.priority || 'medium';
            
            // Update modal title
            if (modalTitle) {
                modalTitle.textContent = 'Edit Event';
            }
            
            // Update submit button
            if (submitBtn) {
                submitBtn.textContent = 'Update Event';
                submitBtn.dataset.mode = 'edit';
                submitBtn.dataset.eventId = eventId;
            }
            
            // Show delete button for existing events
            const deleteBtn = document.getElementById('delete-event-btn');
            if (deleteBtn) {
                deleteBtn.style.display = 'inline-flex';
                deleteBtn.onclick = () => deleteEvent(eventId);
            }
            
        } catch (error) {
            console.error('Error loading event for editing:', error);
        }
    }

// Main initialization
document.addEventListener("DOMContentLoaded", async () => {
    console.log("script.js: DOMContentLoaded event fired.");
    
    // Initialize page
    await populateAnimalList();
    await populateFilterTabs();
    setupSectionTabs();
    setupCalendarListeners();
    
    // Initialize vehicle data for asset forms (delay to ensure DOM is ready)
    setTimeout(async () => {
        await populateVehicleMakes();
        // Don't setup handlers here - they'll be setup when modal opens
        console.log('🚗 Vehicle makes populated, handlers will be setup when modal opens');
    }, 100);
    
    // Set initial table width after data is loaded
    setTimeout(() => {
        setTableMinWidth('livestock');
    }, 300);

    // Function to setup section tabs
    function setupSectionTabs() {
        const sectionTabs = document.querySelectorAll('.section-tab');
        console.log("setupSectionTabs: Found", sectionTabs.length, "section tabs");
        
        sectionTabs.forEach(tab => {
            console.log("setupSectionTabs: Setting up listener for tab:", tab.dataset.section);
            tab.addEventListener('click', () => {
                const section = tab.dataset.section;
                console.log("Tab clicked:", section);
                
                // Remove active class from all section tabs
                sectionTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all sections and tables
                document.getElementById('livestock-section').style.display = 'none';
                document.getElementById('assets-section').style.display = 'none';
                document.getElementById('calendar-section').style.display = 'none';
                document.getElementById('livestock-list').style.display = 'none';
                document.getElementById('assets-list').style.display = 'none';
                
                // Update heading and show appropriate section and table
                const headingElement = document.querySelector('.heading-container h2');
                if (section === 'livestock') {
                    document.getElementById('livestock-section').style.display = 'block';
                    document.getElementById('livestock-list').style.display = 'block';
                    headingElement.textContent = 'Livestock List';
                    // Reset table width after showing
                    setTimeout(() => setTableMinWidth('livestock'), 200);
                } else if (section === 'assets') {
                    document.getElementById('assets-section').style.display = 'block';
                    document.getElementById('assets-list').style.display = 'block';
                    headingElement.textContent = 'Asset Register';
                    populateAssetFilterTabs(); // Populate asset filter tabs
                    populateAssetList(); // Load assets when switching to assets tab
                } else if (section === 'calendar') {
                    console.log("Showing calendar section");
                    document.getElementById('calendar-section').style.display = 'block';
                    headingElement.textContent = 'Farm Calendar';
                    loadCalendarEvents(); // Load calendar events when switching to calendar tab
                }
            });
        });
    }

    // --- Asset Management Functions ---

        // Function to populate asset filter tabs
    async function populateAssetFilterTabs() {
        try {
            console.log("Populating asset filter tabs...");
            const response = await fetch("api/assets");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const assets = await response.json();
            console.log("Assets data received for filter tabs:", assets);
            
            // Extract unique categories
            const categories = [...new Set(assets.map(asset => asset.category).filter(cat => cat))];
            console.log("Asset categories found:", categories);
            
            const filterBar = document.getElementById("assets-filter-bar");
            if (!filterBar) {
                console.error("Assets filter bar not found!");
                return;
            }
            
            // Create filter tabs HTML using filter-btn class for tab styling
            let filterTabsHtml = `<button class="filter-btn active" data-category="All"><i class="fa-solid fa-house"></i> All<sup style="color: var(--accent-color); font-size: 0.7em; margin-left: 2px;">(${assets.length})</sup></button>`;
            
            // Add category-specific tabs
            categories.forEach(category => {
                const count = assets.filter(asset => asset.category === category).length;
                const icon = getAssetCategoryIcon(category);
                filterTabsHtml += `<button class="filter-btn" data-category="${category}"><i class="${icon}"></i> ${category}<sup style="color: var(--accent-color); font-size: 0.7em; margin-left: 2px;">(${count})</sup></button>`;
            });
            
            // Add "Add Asset" button
            filterTabsHtml += '<button class="filter-btn" id="add-asset-btn"><i class="fa-solid fa-plus"></i> Add</button>';
            
            filterBar.innerHTML = filterTabsHtml;
            
            // Add click event listeners to filter tabs
            document.querySelectorAll("#assets-filter-bar .filter-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    // Check if this is the Add Asset button
                    if (btn.id === 'add-asset-btn') {
                        openAddAssetForm();
                        return;
                    }
                    
                    // Remove active class from all tabs
                    document.querySelectorAll("#assets-filter-bar .filter-btn").forEach(tab => {
                        tab.classList.remove("active");
                    });
                    // Add active class to clicked tab
                    btn.classList.add("active");
                    
                    const selectedCategory = btn.dataset.category;
                    console.log("Asset filter selected:", selectedCategory);
                    populateAssetList(selectedCategory);
                });
            });
            console.log("Asset filter tabs populated successfully");
        } catch (error) {
            console.error("Error populating asset filter tabs:", error);
        }
    }

    // Function to get icon for asset category
    function getAssetCategoryIcon(category) {
        switch (category) {
            case 'Equipment': return 'fa-solid fa-tools';
            case 'Vehicle': return 'fa-solid fa-car';
            case 'Building': return 'fa-solid fa-building';
            case 'Tool': return 'fa-solid fa-hammer';
            case 'Machinery': return 'fa-solid fa-cogs';
            default: return 'fa-solid fa-box';
        }
    }

    async function populateAssetList(filterCategory = 'All') {
        try {
            console.log("populateAssetList called with filter:", filterCategory);
            const response = await fetch("api/assets");
            console.log("Assets fetch response status:", response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const assets = await response.json();
            console.log("Assets data received:", assets);
            console.log("Number of assets:", assets.length);
            
            // Filter assets by category and exclude child items (assets with parents)
            const filteredAssets = filterCategory === 'All' 
                ? assets.filter(asset => !asset.parent_asset_id) 
                : assets.filter(asset => asset.category === filterCategory && !asset.parent_asset_id);
            
            console.log("Filtered assets count:", filteredAssets.length);
            
            const tableBody = document.querySelector("#assets-list tbody");
            if (!tableBody) {
                console.error("Assets table body not found!");
                return;
            }
            
            tableBody.innerHTML = ""; // Clear existing rows

            filteredAssets.forEach((asset, index) => {
                console.log(`Processing asset ${index + 1}:`, asset);
                
                const row = document.createElement("tr");
                row.dataset.assetId = asset.id;

                row.innerHTML = `
                    <td>${formatCell(asset.name)}</td>
                    <td>${formatCell(asset.make || '')} ${formatCell(asset.model || '')}</td>
                    <td>${formatCell(asset.location)}</td>
                    <td>${getAssetStatusIcon(asset.status)}</td>
                    <td>${formatCell(asset.quantity || 1)}</td>
                `;

                tableBody.appendChild(row);
            });

            // Add click event listeners to asset rows
            document.querySelectorAll("#assets-list tbody tr").forEach(row => {
                row.addEventListener("click", () => {
                    const assetId = row.dataset.assetId;
                    showAssetDetails(assetId);
                });
            });
            
            // Set minimum table width based on filter tabs width
            setTableMinWidth('assets');

        } catch (error) {
            console.error("Error in populateAssetList:", error);
        }
    }

    function getAssetStatusIcon(status) {
        const statusIcons = {
            'operational': '<i class="fa-solid fa-check-circle" style="color: #28a745;"></i> Operational',
            'maintenance': '<i class="fa-solid fa-wrench" style="color: #ffc107;"></i> Under Maintenance',
            'repair': '<i class="fa-solid fa-exclamation-triangle" style="color: #dc3545;"></i> Needs Repair',
            'retired': '<i class="fa-solid fa-times-circle" style="color: #6c757d;"></i> Retired'
        };
        return statusIcons[status] || status;
    }

    async function showAssetDetails(assetId, returnToParentId = null) {
        console.log(`showAssetDetails called with assetId: ${assetId}, returnToParentId: ${returnToParentId}`);
        try {
            const response = await fetch(`api/asset/${assetId}`);
            if (!response.ok) throw new Error('Failed to fetch asset details');
            
            const asset = await response.json();
            
            // Format meter reading
            let meterReading = 'No reading';
            if (asset.latest_usage) {
                const usageType = asset.latest_usage.usage_type.toLowerCase();
                const usageValue = asset.latest_usage.usage_value;
                const timestamp = new Date(asset.latest_usage.timestamp).toLocaleDateString();
                
                if (usageType === 'hours') {
                    meterReading = `${usageValue} hrs`;
                } else if (usageType === 'odo') {
                    meterReading = `${usageValue} km`;
                } else if (usageType === 'km') {
                    meterReading = `${usageValue} km`;
                } else if (usageType === 'cycles') {
                    meterReading = `${usageValue} cycles`;
                } else {
                    meterReading = `${usageValue} ${usageType}`;
                }
                meterReading += ` (as of ${timestamp})`;
            }
            
            // Fetch child components
            const childComponentsResponse = await fetch(`api/assets?parent_id=${assetId}`);
            let childComponents = [];
            if (childComponentsResponse.ok) {
                childComponents = await childComponentsResponse.json();
            }
            
            // Build child components HTML
            let childComponentsHtml = '';
            if (childComponents.length > 0) {
                childComponentsHtml = childComponents.map(child => 
                    `<div style="padding: 5px; border: 1px solid #ddd; margin: 2px 0; border-radius: 3px; cursor: pointer;" data-child-id="${child.id}">
                        <strong>${formatCell(child.name)}</strong>
                    </div>`
                ).join('');
            } else {
                childComponentsHtml = '<div style="color: #666; font-style: italic;">No components recorded</div>';
            }
            
            const detailsContent = document.getElementById('asset-details-content');
            detailsContent.innerHTML = `
                <table class="details-table">
                    <tr><td class="property-cell">Asset Name:</td><td>${formatCell(asset.name)}</td></tr>
                    <tr><td class="property-cell">Category:</td><td>${formatCell(asset.category)}</td></tr>
                    <tr><td class="property-cell">Make:</td><td>${formatCell(asset.make)}</td></tr>
                    <tr><td class="property-cell">Model:</td><td>${formatCell(asset.model)}</td></tr>
                    <tr><td class="property-cell">Year:</td><td>${formatCell(asset.year)}</td></tr>
                    <tr><td class="property-cell">Serial Number:</td><td>${formatCell(asset.serial_number)}</td></tr>
                    <tr><td class="property-cell">Location:</td><td>${formatCell(asset.location)}</td></tr>
                    <tr><td class="property-cell">Status:</td><td>${getAssetStatusIcon(asset.status)}</td></tr>
                    <tr><td class="property-cell">Quantity:</td><td>${formatCell(asset.quantity || 1)}</td></tr>
                    <tr><td class="property-cell"><strong>Meter Reading:</strong></td><td><strong>${meterReading}</strong></td></tr>
                    <tr><td class="property-cell">Purchase Date:</td><td>${formatCell(asset.purchase_date)}</td></tr>
                    <tr><td class="property-cell">Purchase Price:</td><td>${formatCell(asset.purchase_price)}</td></tr>
                    <tr><td class="property-cell">Registration No:</td><td>${formatCell(asset.registration_no)}</td></tr>
                    <tr><td class="property-cell">Registration Due:</td><td>${formatCell(asset.registration_due)}</td></tr>
                    <tr><td class="property-cell">Warranty Provider:</td><td>${formatCell(asset.warranty_provider)}</td></tr>
                    <tr><td class="property-cell">Warranty Expiry:</td><td>${formatCell(asset.warranty_expiry_date)}</td></tr>
                    <tr><td class="property-cell">Notes:</td><td>${formatCell(asset.notes)}</td></tr>
                </table>
                <div class="offspring-section">
                    <h3>Components</h3>
                    ${childComponentsHtml}
                </div>
            `;
            
            // Set asset ID for edit/delete buttons
            document.getElementById('edit-asset-btn').dataset.assetId = assetId;
            document.getElementById('delete-asset-btn').dataset.assetId = assetId;
            
            // Store return-to-parent ID if provided
            if (returnToParentId) {
                document.getElementById('asset-details-modal').dataset.returnToParent = returnToParentId;
            } else {
                delete document.getElementById('asset-details-modal').dataset.returnToParent;
            }
            
            // Add click event listeners to child component items
            document.querySelectorAll('[data-child-id]').forEach(item => {
                item.addEventListener('click', () => {
                    const childId = item.dataset.childId;
                    showAssetDetails(childId, assetId); // Pass parent ID as return target
                });
            });
            
            // Show modal
            document.getElementById('asset-details-modal').style.display = 'block';
            
        } catch (error) {
            console.error('Error showing asset details:', error);
        }
    }

    // Asset category selection functions
    function handleCategoryChange(formType) {
        const categorySelect = document.getElementById(`${formType}-asset-category`);
        const makeSelect = document.getElementById(`${formType}-asset-make`);
        const modelSelect = document.getElementById(`${formType}-asset-model`);
        const yearSelect = document.getElementById(`${formType}-asset-year`);
        const bodySelect = document.getElementById(`${formType}-asset-body-feature`);
        const badgeSelect = document.getElementById(`${formType}-asset-badge`);
        const vinField = document.getElementById(`${formType}-asset-serial`);
        const vinButton = document.getElementById(`${formType}-asset-vin-lookup`);
        
        const selectedCategory = categorySelect.value;
        
        // Show/hide fields and populate makes based on asset category
        if (selectedCategory === 'Vehicle') {
            // Show vehicle-specific fields
            makeSelect.style.display = 'block';
            modelSelect.style.display = 'block';
            yearSelect.style.display = 'block';
            bodySelect.style.display = 'block';
            badgeSelect.style.display = 'block';
            vinField.placeholder = 'Enter VIN or serial number';
            if (vinButton) vinButton.style.display = 'inline-block';
            
            // Populate with vehicle makes
            populateVehicleMakes();
        } else if (selectedCategory === 'Machinery') {
            // Show machinery-specific fields
            makeSelect.style.display = 'block';
            modelSelect.style.display = 'block';
            yearSelect.style.display = 'block';
            bodySelect.style.display = 'block';
            badgeSelect.style.display = 'block';
            vinField.placeholder = 'Enter serial number';
            if (vinButton) vinButton.style.display = 'none';
            
            // Populate with machinery makes
            populateMachineryMakes();
        } else if (selectedCategory === 'Equipment') {
            // Show equipment-specific fields
            makeSelect.style.display = 'block';
            modelSelect.style.display = 'block';
            yearSelect.style.display = 'block';
            bodySelect.style.display = 'block';
            badgeSelect.style.display = 'block';
            vinField.placeholder = 'Enter serial number';
            if (vinButton) vinButton.style.display = 'none';
            
            // Populate with equipment makes
            populateEquipmentMakes();
        } else if (selectedCategory === 'Building') {
            // Show building-specific fields
            makeSelect.style.display = 'block';
            modelSelect.style.display = 'block';
            yearSelect.style.display = 'block';
            bodySelect.style.display = 'block';
            badgeSelect.style.display = 'block';
            vinField.placeholder = 'Enter serial number';
            if (vinButton) vinButton.style.display = 'none';
            
            // Populate with building makes
            populateBuildingMakes();
        } else if (selectedCategory === 'Tool') {
            // Show tool-specific fields
            makeSelect.style.display = 'block';
            modelSelect.style.display = 'block';
            yearSelect.style.display = 'block';
            bodySelect.style.display = 'block';
            badgeSelect.style.display = 'block';
            vinField.placeholder = 'Enter serial number';
            if (vinButton) vinButton.style.display = 'none';
            
            // Populate with tool makes
            populateToolMakes();
        } else {
            // Hide fields for no category selected
            makeSelect.style.display = 'none';
            modelSelect.style.display = 'none';
            yearSelect.style.display = 'none';
            bodySelect.style.display = 'none';
            badgeSelect.style.display = 'none';
            vinField.placeholder = 'Enter serial number';
            if (vinButton) vinButton.style.display = 'none';
        }
    }
    
    async function populateMachineryMakes() {
        try {
            const response = await fetch('api/vehicle/makes?category=Machinery');
            if (!response.ok) throw new Error('Failed to fetch machinery makes');
            
            const makes = await response.json();
            
            // Populate add form
            const addMakeSelect = document.getElementById('add-asset-make');
            addMakeSelect.innerHTML = '<option value="">Select Make</option>';
            makes.forEach(make => {
                addMakeSelect.innerHTML += `<option value="${make}">${make}</option>`;
            });
            
            // Populate edit form
            const editMakeSelect = document.getElementById('edit-asset-make');
            editMakeSelect.innerHTML = '<option value="">Select Make</option>';
            makes.forEach(make => {
                editMakeSelect.innerHTML += `<option value="${make}">${make}</option>`;
            });
        } catch (error) {
            console.error('Error populating machinery makes:', error);
        }
    }

    async function populateEquipmentMakes() {
        try {
            const response = await fetch('api/vehicle/makes?category=Equipment');
            if (!response.ok) throw new Error('Failed to fetch equipment makes');
            
            const makes = await response.json();
            
            // Populate add form
            const addMakeSelect = document.getElementById('add-asset-make');
            addMakeSelect.innerHTML = '<option value="">Select Make</option>';
            makes.forEach(make => {
                addMakeSelect.innerHTML += `<option value="${make}">${make}</option>`;
            });
            
            // Populate edit form
            const editMakeSelect = document.getElementById('edit-asset-make');
            editMakeSelect.innerHTML = '<option value="">Select Make</option>';
            makes.forEach(make => {
                editMakeSelect.innerHTML += `<option value="${make}">${make}</option>`;
            });
        } catch (error) {
            console.error('Error populating equipment makes:', error);
        }
    }

    async function populateBuildingMakes() {
        try {
            const response = await fetch('api/vehicle/makes?category=Building');
            if (!response.ok) throw new Error('Failed to fetch building makes');
            
            const makes = await response.json();
            
            // Populate add form
            const addMakeSelect = document.getElementById('add-asset-make');
            addMakeSelect.innerHTML = '<option value="">Select Make</option>';
            makes.forEach(make => {
                addMakeSelect.innerHTML += `<option value="${make}">${make}</option>`;
            });
            
            // Populate edit form
            const editMakeSelect = document.getElementById('edit-asset-make');
            editMakeSelect.innerHTML = '<option value="">Select Make</option>';
            makes.forEach(make => {
                editMakeSelect.innerHTML += `<option value="${make}">${make}</option>`;
            });
        } catch (error) {
            console.error('Error populating building makes:', error);
        }
    }

    async function populateToolMakes() {
        try {
            const response = await fetch('api/vehicle/makes?category=Tool');
            if (!response.ok) throw new Error('Failed to fetch tool makes');
            
            const makes = await response.json();
            
            // Populate add form
            const addMakeSelect = document.getElementById('add-asset-make');
            addMakeSelect.innerHTML = '<option value="">Select Make</option>';
            makes.forEach(make => {
                addMakeSelect.innerHTML += `<option value="${make}">${make}</option>`;
            });
            
            // Populate edit form
            const editMakeSelect = document.getElementById('edit-asset-make');
            editMakeSelect.innerHTML = '<option value="">Select Make</option>';
            makes.forEach(make => {
                editMakeSelect.innerHTML += `<option value="${make}">${make}</option>`;
            });
        } catch (error) {
            console.error('Error populating tool makes:', error);
        }
    }

    // Vehicle selection functions
async function populateVehicleMakes() {
    try {
        const response = await fetch('api/vehicle/makes?category=Vehicle');
        if (!response.ok) throw new Error('Failed to fetch vehicle makes');
        
        const makes = await response.json();
        
        // Populate add form
        const addMakeSelect = document.getElementById('add-asset-make');
        addMakeSelect.innerHTML = '<option value="">Select Make</option><option value="__new__">+ Add New Make</option>';
        makes.forEach(make => {
            addMakeSelect.innerHTML += `<option value="${make}">${make}</option>`;
        });
        
        // Populate edit form
        const editMakeSelect = document.getElementById('edit-asset-make');
        editMakeSelect.innerHTML = '<option value="">Select Make</option><option value="__new__">+ Add New Make</option>';
        makes.forEach(make => {
            editMakeSelect.innerHTML += `<option value="${make}">${make}</option>`;
        });
    } catch (error) {
        console.error('Error populating vehicle makes:', error);
    }
}

async function populateVehicleModels(make) {
    try {
        console.log('🚗 populateVehicleModels called for make:', make);
        const url = `api/vehicle/models?make=${encodeURIComponent(make)}`;
        console.log('🔍 Fetching URL:', url);
        
        const response = await fetch(url);
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Response error text:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const models = await response.json();
        console.log('📋 Models received:', models);
        console.log('📊 Models count:', models.length);
        
        // Populate add form
        const addModelSelect = document.getElementById('add-asset-model');
        console.log('🎯 addModelSelect element found:', !!addModelSelect);
        if (addModelSelect) {
            addModelSelect.innerHTML = '<option value="">Select Model</option><option value="__new__">+ Add New Model</option>';
            models.forEach(model => {
                addModelSelect.innerHTML += `<option value="${model}">${model}</option>`;
            });
            console.log('✅ Add form populated with models');
        } else {
            console.error('❌ addModelSelect element not found!');
        }
        
        // Populate edit form
        const editModelSelect = document.getElementById('edit-asset-model');
        console.log('🎯 editModelSelect element found:', !!editModelSelect);
        if (editModelSelect) {
            editModelSelect.innerHTML = '<option value="">Select Model</option><option value="__new__">+ Add New Model</option>';
            models.forEach(model => {
                editModelSelect.innerHTML += `<option value="${model}">${model}</option>`;
            });
            console.log('✅ Edit form populated with models');
        } else {
            console.error('❌ editModelSelect element not found!');
        }
        
        console.log(`Successfully populated ${models.length} models for ${make}: ${models.join(', ')}`);
        
    } catch (error) {
        console.error('❌ Error populating vehicle models:', error);
        console.error('❌ Error stack:', error.stack);
        
        // Show user-friendly error
        const addModelSelect = document.getElementById('add-asset-model');
        if (addModelSelect) {
            addModelSelect.innerHTML = '<option value="">Error loading models</option>';
        }
    }
}

async function saveNewMake(make, formType) {
    try {
        const category = document.getElementById(`${formType}-asset-category`).value || 'Vehicle';
        const response = await fetch(`/api/vehicle/make?make=${encodeURIComponent(make)}&category=${encodeURIComponent(category)}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Refresh the make dropdown
            await populateVehicleMakes();
            
            // Select the newly added make
            const makeSelect = document.getElementById(`${formType}-asset-make`);
            makeSelect.value = make;
            
            // Hide the new make input
            document.getElementById(`${formType}-asset-make-new`).style.display = 'none';
            
            // Show model dropdown and populate models for new make
            const modelSelect = document.getElementById(`${formType}-asset-model`);
            modelSelect.parentElement.style.display = 'flex';
            await populateVehicleModels(make);
            
            alert(`Make '${make}' added successfully!`);
        } else {
            alert(`Error adding make: ${result.message}`);
        }
    } catch (error) {
        console.error('Error saving new make:', error);
        alert('Error adding new make. Please try again.');
    }
}

async function saveNewModel(make, model, formType) {
    try {
        const category = document.getElementById(`${formType}-asset-category`).value || 'Vehicle';
        const response = await fetch(`/api/vehicle/model?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&category=${encodeURIComponent(category)}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Refresh the model dropdown
            await populateVehicleModels(make);
            
            // Select the newly added model
            const modelSelect = document.getElementById(`${formType}-asset-model`);
            modelSelect.value = model;
            
            // Hide the new model input
            document.getElementById(`${formType}-asset-model-new`).style.display = 'none';
            
            alert(`Model '${model}' added successfully for make '${make}'!`);
        } else {
            alert(`Error adding model: ${result.message}`);
        }
    } catch (error) {
        console.error('Error saving new model:', error);
        alert('Error adding new model. Please try again.');
    }
}

async function populateVehicleYears(make, model) {
    try {
        const response = await fetch(`api/vehicle/years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
        if (!response.ok) throw new Error('Failed to fetch vehicle years');
        
        const years = await response.json();
        
        // Generate year options
        const yearOptions = [];
        years.forEach(yearRange => {
            const startYear = yearRange.year_start;
            const endYear = yearRange.year_end || new Date().getFullYear();
            
            for (let year = endYear; year >= startYear; year--) {
                if (!yearOptions.includes(year)) {
                    yearOptions.push(year);
                }
            }
        });
        
        // Populate add form
        const addYearSelect = document.getElementById('add-asset-year');
        addYearSelect.innerHTML = '<option value="">Select Year</option>';
        yearOptions.forEach(year => {
            addYearSelect.innerHTML += `<option value="${year}">${year}</option>`;
        });
        
        // Populate edit form
        const editYearSelect = document.getElementById('edit-asset-year');
        editYearSelect.innerHTML = '<option value="">Select Year</option>';
        yearOptions.forEach(year => {
            editYearSelect.innerHTML += `<option value="${year}">${year}</option>`;
        });
    } catch (error) {
        console.error('Error populating vehicle years:', error);
    }
}

async function populateVehicleBodyTypes(make, model, year) {
    try {
        let url = `api/vehicle/body-types?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
        if (year) {
            url += `&year=${year}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch vehicle body types');
        
        const bodyTypes = await response.json();
        
        // Populate add form
        const addBodySelect = document.getElementById('add-asset-body-feature');
        addBodySelect.innerHTML = '<option value="">Select Body Type</option>';
        bodyTypes.forEach(bodyType => {
            addBodySelect.innerHTML += `<option value="${bodyType}">${bodyType}</option>`;
        });
        
        // Populate edit form
        const editBodySelect = document.getElementById('edit-asset-body-feature');
        editBodySelect.innerHTML = '<option value="">Select Body Type</option>';
        bodyTypes.forEach(bodyType => {
            editBodySelect.innerHTML += `<option value="${bodyType}">${bodyType}</option>`;
        });
    } catch (error) {
        console.error('Error populating vehicle body types:', error);
    }
}

async function populateVehicleBadges(make, model, year, bodyType) {
    try {
        let url = `api/vehicle/badges?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
        if (year) {
            url += `&year=${year}`;
        }
        if (bodyType) {
            url += `&body_type=${encodeURIComponent(bodyType)}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch vehicle badges');
        
        const badges = await response.json();
        
        // Populate add form
        const addBadgeSelect = document.getElementById('add-asset-badge');
        if (addBadgeSelect) {
            addBadgeSelect.innerHTML = '<option value="">Select Badge/Trim</option>';
            badges.forEach(badge => {
                addBadgeSelect.innerHTML += `<option value="${badge}">${badge}</option>`;
            });
        }
        
        // Populate edit form
        const editBadgeSelect = document.getElementById('edit-asset-badge');
        if (editBadgeSelect) {
            editBadgeSelect.innerHTML = '<option value="">Select Badge/Trim</option>';
            badges.forEach(badge => {
                editBadgeSelect.innerHTML += `<option value="${badge}">${badge}</option>`;
            });
        }
    } catch (error) {
        console.error('Error populating vehicle badges:', error);
    }
}

// VIN lookup functions
async function lookupVIN(vin) {
    try {
        const response = await fetch(`api/vin/vehicle-data/${encodeURIComponent(vin)}`);
        if (!response.ok) throw new Error('Failed to lookup VIN');
        
        const specs = await response.json();
        return specs;
    } catch (error) {
        console.error('Error looking up VIN:', error);
        return null;
    }
}

async function validateVIN(vin) {
    try {
        const response = await fetch('api/vin/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vin: vin })
        });
        
        if (!response.ok) throw new Error('Failed to validate VIN');
        
        const result = await response.json();
        return result.valid;
    } catch (error) {
        console.error('Error validating VIN:', error);
        return false;
    }
}

window.populateFromVIN = async function populateFromVIN(vin, formType = 'add') {
    if (!vin || vin.length < 17) {
        alert('Please enter a valid 17-character VIN');
        return;
    }
    
    // Show loading state
    const lookupBtn = document.getElementById(`${formType}-asset-vin-lookup`);
    if (lookupBtn) {
        lookupBtn.disabled = true;
        lookupBtn.textContent = 'Looking up...';
    }
    
    try {
        console.log('🔍 Starting VIN lookup for:', vin);
        const specs = await lookupVIN(vin);
        console.log('📋 VIN specs received:', specs);
        
        if (specs && specs.valid) {
            console.log('✅ VIN is valid, populating form fields...');
            
            // Populate form fields with VIN data
            const makeSelect = document.getElementById(`${formType}-asset-make`);
            const modelSelect = document.getElementById(`${formType}-asset-model`);
            const yearSelect = document.getElementById(`${formType}-asset-year`);
            const bodySelect = document.getElementById(`${formType}-asset-body-feature`);
            const badgeSelect = document.getElementById(`${formType}-asset-badge`);
            
            console.log('🎯 Form elements found:', {
                makeSelect: !!makeSelect,
                modelSelect: !!modelSelect,
                yearSelect: !!yearSelect,
                bodySelect: !!bodySelect,
                badgeSelect: !!badgeSelect
            });
            
            // Set make if found
            if (specs.make && makeSelect) {
                console.log('🏭 Looking for make:', specs.make);
                console.log('📋 Available makes:', Array.from(makeSelect.options).map(o => o.value));
                
                const makeOption = Array.from(makeSelect.options).find(option => 
                    option.value === specs.make
                );
                console.log('🎯 Make option found:', makeOption);
                
                if (makeOption) {
                    makeSelect.value = makeOption.value;
                    console.log('✅ Make set to:', makeOption.value);
                    await populateVehicleModels(makeOption.value);
                    
                    // Set model if found
                    if (specs.model && modelSelect) {
                        console.log('🚗 Looking for model:', specs.model);
                        console.log('📋 Available models:', Array.from(modelSelect.options).map(o => o.value));
                        
                        const modelOption = Array.from(modelSelect.options).find(option => 
                            option.value === specs.model
                        );
                        console.log('🎯 Model option found:', modelOption);
                        
                        if (modelOption) {
                            modelSelect.value = modelOption.value;
                            console.log('✅ Model set to:', modelOption.value);
                            await populateVehicleYears(makeOption.value, modelOption.value);
                            
                            // Set year if found
                            if (specs.year && yearSelect) {
                                console.log('📅 Looking for year:', specs.year);
                                console.log('📋 Available years:', Array.from(yearSelect.options).map(o => o.value));
                                
                                const yearOption = Array.from(yearSelect.options).find(option => 
                                    option.value === specs.year.toString()
                                );
                                console.log('🎯 Year option found:', yearOption);
                                
                                if (yearOption) {
                                    yearSelect.value = yearOption.value;
                                    console.log('✅ Year set to:', yearOption.value);
                                    await populateVehicleBodyTypes(makeOption.value, modelOption.value, specs.year);
                                    
                                    // Set body type if found
                                    if (specs.body_type && bodySelect) {
                                        console.log('🚙 Looking for body type:', specs.body_type);
                                        console.log('📋 Available body types:', Array.from(bodySelect.options).map(o => o.value));
                                        
                                        const bodyOption = Array.from(bodySelect.options).find(option => 
                                            option.value === specs.body_type
                                        );
                                        console.log('🎯 Body type option found:', bodyOption);
                                        
                                        if (bodyOption) {
                                            bodySelect.value = bodyOption.value;
                                            console.log('✅ Body type set to:', bodyOption.value);
                                            await populateVehicleBadges(makeOption.value, modelOption.value, specs.year, specs.body_type);
                                            
                                            // Set badge if found
                                            if (specs.badge && badgeSelect) {
                                                console.log('🏷️ Looking for badge:', specs.badge);
                                                console.log('📋 Available badges:', Array.from(badgeSelect.options).map(o => o.value));
                                                
                                                const badgeOption = Array.from(badgeSelect.options).find(option => 
                                                    option.value === specs.badge
                                                );
                                                console.log('🎯 Badge option found:', badgeOption);
                                                
                                                if (badgeOption) {
                                                    badgeSelect.value = badgeOption.value;
                                                    console.log('✅ Badge set to:', badgeOption.value);
                                                    console.log('🎉 ALL FIELDS POPULATED SUCCESSFULLY!');
                                                } else {
                                                    console.warn('❌ Badge not found in options');
                                                }
                                            } else {
                                                console.warn('❌ No trim info in VIN data or badge select not found');
                                            }
                                        } else {
                                            console.warn('❌ Body type not found in options');
                                        }
                                    } else {
                                        console.warn('❌ No body_type info in VIN data or body select not found');
                                    }
                                } else {
                                    console.warn('❌ Year not found in options');
                                }
                            } else {
                                console.warn('❌ No year info in VIN data or year select not found');
                            }
                        } else {
                            console.warn('❌ Model not found in options');
                        }
                    } else {
                        console.warn('❌ No model info in VIN data or model select not found');
                    }
                } else {
                    console.warn('❌ Make not found in options');
                }
            } else {
                console.warn('❌ No manufacturer info in VIN data or make select not found');
            }
            
            console.log('🏁 VIN lookup process completed');
            
            // Force UI update and provide detailed feedback
            setTimeout(() => {
                const finalValues = {
                    make: makeSelect?.value,
                    model: modelSelect?.value,
                    year: yearSelect?.value,
                    bodyType: bodySelect?.value,
                    badge: badgeSelect?.value
                };
                console.log('🎯 Final form values:', finalValues);
                
                if (finalValues.make && finalValues.model && finalValues.year && finalValues.bodyType && finalValues.badge) {
                    alert(`VIN lookup completed successfully!\n\nVehicle populated:\n• Make: ${finalValues.make}\n• Model: ${finalValues.model}\n• Year: ${finalValues.year}\n• Body Type: ${finalValues.bodyType}\n• Badge: ${finalValues.badge}`);
                } else {
                    alert('⚠️ VIN lookup completed but some fields may not have populated. Check console for details.');
                }
            }, 100);
        } else {
            console.warn('❌ Invalid VIN or vehicle not found in database');
            alert('Invalid VIN or vehicle not found in database');
        }
    } catch (error) {
        console.error('Error in VIN lookup:', error);
        alert('Error looking up VIN. Please check the VIN and try again.');
    } finally {
        // Reset button state
        if (lookupBtn) {
            lookupBtn.disabled = false;
            lookupBtn.textContent = 'Lookup VIN';
        }
    }
}

// Vehicle selection event handlers
function setupVehicleSelectionHandlers() {
    // Add form handlers
    const addMakeSelect = document.getElementById('add-asset-make');
    const addModelSelect = document.getElementById('add-asset-model');
    const addYearSelect = document.getElementById('add-asset-year');
    
    // Remove existing event listeners to prevent duplicates
    if (addMakeSelect.dataset.listenersAttached === 'true') {
        return; // Already attached
    }
    
    addMakeSelect.addEventListener('change', async function() {
        const make = this.value;
        const newMakeInput = document.getElementById('add-asset-make-new');
        console.log('🚗 Make changed to:', make);
        console.log('🎯 addMakeSelect element:', !!addMakeSelect);
        console.log('🎯 addModelSelect element:', !!addModelSelect);
        
        if (make === '__new__') {
            // Show new make input field
            newMakeInput.style.display = 'block';
            newMakeInput.focus();
            // Hide model dropdown until make is saved
            addModelSelect.parentElement.style.display = 'none';
        } else if (make) {
            // Hide new make input field
            newMakeInput.style.display = 'none';
            newMakeInput.value = '';
            // Show model dropdown
            addModelSelect.parentElement.style.display = 'flex';
            
            try {
                console.log('🔄 Calling populateVehicleModels for:', make);
                await populateVehicleModels(make);
                console.log('✅ populateVehicleModels completed');
                
                // Clear dependent fields
                addModelSelect.value = '';
                addYearSelect.value = '';
                document.getElementById('add-asset-body-feature').value = '';
                document.getElementById('add-asset-badge').value = '';
                console.log('🗑️ Dependent fields cleared');
            } catch (error) {
                console.error('❌ Error in make change handler:', error);
                alert(`Error loading models for ${make}: ${error.message}`);
            }
        } else {
            // Hide new make input field
            newMakeInput.style.display = 'none';
            newMakeInput.value = '';
            // Show model dropdown
            addModelSelect.parentElement.style.display = 'flex';
            
            // Clear all dependent fields
            addModelSelect.innerHTML = '<option value="">Select Model</option><option value="__new__">+ Add New Model</option>';
            addYearSelect.innerHTML = '<option value="">Select Year</option>';
            document.getElementById('add-asset-body-feature').innerHTML = '<option value="">Select Body Type</option>';
            document.getElementById('add-asset-badge').innerHTML = '<option value="">Select Badge/Trim</option>';
            console.log('🗑️ All fields cleared (no make selected)');
        }
    });
    
    // Handle new make input
    document.getElementById('add-asset-make-new').addEventListener('blur', async function() {
        const newMake = this.value.trim();
        if (newMake) {
            await saveNewMake(newMake, 'add');
        }
    });

    document.getElementById('add-asset-make-new').addEventListener('keypress', async function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newMake = this.value.trim();
            if (newMake) {
                await saveNewMake(newMake, 'add');
            }
        }
    });

    // Handle new model input
    document.getElementById('add-asset-model-new').addEventListener('blur', async function() {
        const newModel = this.value.trim();
        const make = addMakeSelect.value;
        if (newModel && make && make !== '__new__') {
            await saveNewModel(make, newModel, 'add');
        }
    });

    document.getElementById('add-asset-model-new').addEventListener('keypress', async function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newModel = this.value.trim();
            const make = addMakeSelect.value;
            if (newModel && make && make !== '__new__') {
                await saveNewModel(make, newModel, 'add');
            }
        }
    });

    addModelSelect.addEventListener('change', async function() {
        const make = addMakeSelect.value;
        const newModelInput = document.getElementById('add-asset-model-new');
        
        if (this.value === '__new__') {
            // Show new model input field
            newModelInput.style.display = 'block';
            newModelInput.focus();
        } else {
            // Hide new model input field
            newModelInput.style.display = 'none';
            newModelInput.value = '';
        }
        
        const model = this.value === '__new__' ? '' : this.value;
        if (make && model) {
            await populateVehicleYears(make, model);
            // Clear dependent fields
            addYearSelect.value = '';
            document.getElementById('add-asset-body-feature').value = '';
            document.getElementById('add-asset-badge').value = '';
        } else {
            // Clear dependent fields
            addYearSelect.innerHTML = '<option value="">Select Year</option>';
            document.getElementById('add-asset-body-feature').innerHTML = '<option value="">Select Body Type</option>';
            document.getElementById('add-asset-badge').innerHTML = '<option value="">Select Badge/Trim</option>';
        }
    });
    
    addYearSelect.addEventListener('change', async function() {
        const make = addMakeSelect.value;
        const model = addModelSelect.value;
        const year = this.value;
        if (make && model && year) {
            await populateVehicleBodyTypes(make, model, year);
        } else {
            document.getElementById('add-asset-body-feature').innerHTML = '<option value="">Select Body Type</option>';
        }
    });
    
    // Add body type change handler for badges
    const addBodySelect = document.getElementById('add-asset-body-feature');
    addBodySelect.addEventListener('change', async function() {
        const make = addMakeSelect.value;
        const model = addModelSelect.value;
        const year = addYearSelect.value;
        const bodyType = this.value;
        if (make && model && bodyType) {
            await populateVehicleBadges(make, model, year, bodyType);
        } else {
            document.getElementById('add-asset-badge').innerHTML = '<option value="">Select Badge/Trim</option>';
        }
    });
    
    // Edit form handlers
    const editMakeSelect = document.getElementById('edit-asset-make');
    const editModelSelect = document.getElementById('edit-asset-model');
    const editYearSelect = document.getElementById('edit-asset-year');
    
    editMakeSelect.addEventListener('change', async function() {
        const make = this.value;
        const newMakeInput = document.getElementById('edit-asset-make-new');
        
        if (make === '__new__') {
            // Show new make input field
            newMakeInput.style.display = 'block';
            newMakeInput.focus();
            // Hide model dropdown until make is saved
            editModelSelect.parentElement.style.display = 'none';
        } else if (make) {
            // Hide new make input field
            newMakeInput.style.display = 'none';
            newMakeInput.value = '';
            // Show model dropdown
            editModelSelect.parentElement.style.display = 'flex';
            
            await populateVehicleModels(make);
            // Clear dependent fields
            editModelSelect.value = '';
            editYearSelect.value = '';
            document.getElementById('edit-asset-body-feature').value = '';
            document.getElementById('edit-asset-badge').value = '';
        } else {
            // Hide new make input field
            newMakeInput.style.display = 'none';
            newMakeInput.value = '';
            // Show model dropdown
            editModelSelect.parentElement.style.display = 'flex';
            
            // Clear all dependent fields
            editModelSelect.innerHTML = '<option value="">Select Model</option><option value="__new__">+ Add New Model</option>';
            editYearSelect.innerHTML = '<option value="">Select Year</option>';
            document.getElementById('edit-asset-body-feature').innerHTML = '<option value="">Select Body Type</option>';
            document.getElementById('edit-asset-badge').innerHTML = '<option value="">Select Badge/Trim</option>';
        }
    });
    
    // Handle new make input for edit form
    document.getElementById('edit-asset-make-new').addEventListener('blur', async function() {
        const newMake = this.value.trim();
        if (newMake) {
            await saveNewMake(newMake, 'edit');
        }
    });

    document.getElementById('edit-asset-make-new').addEventListener('keypress', async function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newMake = this.value.trim();
            if (newMake) {
                await saveNewMake(newMake, 'edit');
            }
        }
    });

    // Handle new model input for edit form
    document.getElementById('edit-asset-model-new').addEventListener('blur', async function() {
        const newModel = this.value.trim();
        const make = editMakeSelect.value;
        if (newModel && make && make !== '__new__') {
            await saveNewModel(make, newModel, 'edit');
        }
    });

    document.getElementById('edit-asset-model-new').addEventListener('keypress', async function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newModel = this.value.trim();
            const make = editMakeSelect.value;
            if (newModel && make && make !== '__new__') {
                await saveNewModel(make, newModel, 'edit');
            }
        }
    });

    editModelSelect.addEventListener('change', async function() {
        const make = editMakeSelect.value;
        const newModelInput = document.getElementById('edit-asset-model-new');
        
        if (this.value === '__new__') {
            // Show new model input field
            newModelInput.style.display = 'block';
            newModelInput.focus();
        } else {
            // Hide new model input field
            newModelInput.style.display = 'none';
            newModelInput.value = '';
        }
        
        const model = this.value === '__new__' ? '' : this.value;
        if (make && model) {
            await populateVehicleYears(make, model);
            // Clear dependent fields
            editYearSelect.value = '';
            document.getElementById('edit-asset-body-feature').value = '';
            document.getElementById('edit-asset-badge').value = '';
        } else {
            // Clear dependent fields
            editYearSelect.innerHTML = '<option value="">Select Year</option>';
            document.getElementById('edit-asset-body-feature').innerHTML = '<option value="">Select Body Type</option>';
            document.getElementById('edit-asset-badge').innerHTML = '<option value="">Select Badge/Trim</option>';
        }
    });
    
    editYearSelect.addEventListener('change', async function() {
        const make = editMakeSelect.value;
        const model = editModelSelect.value;
        const year = this.value;
        if (make && model && year) {
            await populateVehicleBodyTypes(make, model, year);
        } else {
            document.getElementById('edit-asset-body-feature').innerHTML = '<option value="">Select Body Type</option>';
        }
    });
    
    // Edit body type change handler for badges
    const editBodySelect = document.getElementById('edit-asset-body-feature');
    editBodySelect.addEventListener('change', async function() {
        const make = editMakeSelect.value;
        const model = editModelSelect.value;
        const year = editYearSelect.value;
        const bodyType = this.value;
        if (make && model && bodyType) {
            await populateVehicleBadges(make, model, year, bodyType);
        } else {
            document.getElementById('edit-asset-badge').innerHTML = '<option value="">Select Badge/Trim</option>';
        }
    });
    
    // Mark listeners as attached
    addMakeSelect.dataset.listenersAttached = 'true';
}

    async function openAddAssetForm() {
        console.log('🚪 Opening add asset form...');
        
        // Reset form
        document.getElementById('add-asset-form').reset();
        
        // Set default values
        document.getElementById('add-asset-quantity').value = 1;
        document.getElementById('add-asset-status').value = 'operational';
        document.getElementById('add-asset-usage-type').value = 'hours';
        
        // Show modal first
        document.getElementById('add-asset-modal').style.display = 'block';
        console.log('📋 Modal displayed');
        
        // Wait a bit for DOM to be ready, then populate
        setTimeout(async () => {
            try {
                // Setup asset category change handler
                const addCategorySelect = document.getElementById('add-asset-category');
                addCategorySelect.addEventListener('change', () => handleCategoryChange('add'));
                
                // Populate vehicle makes
                await populateVehicleMakes();
                console.log('🚗 Vehicle makes populated');
                
                // Setup handlers AFTER modal is visible
                setupVehicleSelectionHandlers();
                console.log('⚙️ Vehicle selection handlers setup complete');
                
                // Populate parent asset dropdown
                await populateParentAssetDropdowns();
                console.log('👥 Parent asset dropdown populated');
            } catch (error) {
                console.error('❌ Error in openAddAssetForm:', error);
                alert(`Error opening asset form: ${error.message}`);
            }
        }, 100);
    }

    async function enableAssetEditMode(assetId) {
        try {
            const response = await fetch(`api/asset/${assetId}`);
            if (!response.ok) throw new Error('Failed to fetch asset details');
            
            const asset = await response.json();
            
            // Setup asset class change handler
            const editCategorySelect = document.getElementById('edit-asset-category');
            editCategorySelect.addEventListener('change', () => handleCategoryChange('edit'));
            
            // Populate vehicle makes and setup handlers first
            await populateVehicleMakes();
            setupVehicleSelectionHandlers();
            
            // Populate parent asset dropdown
            await populateParentAssetDropdowns();
            
            // Populate form fields
            document.getElementById('edit-asset-id').value = asset.id;
            
            // Basic Information
            document.getElementById('edit-asset-name').value = asset.name || '';
            document.getElementById('edit-asset-category').value = asset.category || '';
            document.getElementById('edit-asset-serial').value = asset.serial_number || '';
            
            // Handle category change to show/hide appropriate fields
            await handleCategoryChange('edit');
            
            // Populate vehicle dependent dropdowns if make is selected
            if (asset.make) {
                await populateVehicleModels(asset.make);
                
                if (asset.model) {
                    await populateVehicleYears(asset.make, asset.model);
                    
                    if (asset.year) {
                        await populateVehicleBodyTypes(asset.make, asset.model, asset.year);
                        
                        if (asset.body_feature) {
                            await populateVehicleBadges(asset.make, asset.model, asset.year, asset.body_feature);
                        }
                    }
                }
                
                // Now set the values after dropdowns are populated
                document.getElementById('edit-asset-make').value = asset.make || '';
                document.getElementById('edit-asset-model').value = asset.model || '';
                document.getElementById('edit-asset-year').value = asset.year || '';
                document.getElementById('edit-asset-body-feature').value = asset.body_feature || '';
                document.getElementById('edit-asset-badge').value = asset.badge || '';
            }
            
            // Status & Location
            document.getElementById('edit-asset-location').value = asset.location || '';
            document.getElementById('edit-asset-quantity').value = asset.quantity || 1;
            document.getElementById('edit-asset-status').value = asset.status || 'operational';
            document.getElementById('edit-asset-parent').value = asset.parent_asset_id || '';
            
            // Purchase Information
            document.getElementById('edit-asset-purchase-date').value = asset.purchase_date || '';
            document.getElementById('edit-asset-purchase-price').value = asset.purchase_price || '';
            document.getElementById('edit-asset-purchase-location').value = asset.purchase_location || '';
            
            // Registration & Insurance
            document.getElementById('edit-asset-registration').value = asset.registration_no || '';
            document.getElementById('edit-asset-registration-due').value = asset.registration_due || '';
            document.getElementById('edit-asset-insurance').value = asset.insurance_info || '';
            
            // Permits & Documentation
            document.getElementById('edit-asset-permit').value = asset.permit_info || '';
            
            // Warranty Information
            document.getElementById('edit-asset-warranty-provider').value = asset.warranty_provider || '';
            document.getElementById('edit-asset-warranty-expiry').value = asset.warranty_expiry_date || '';
            
            // Usage Information (clear for new entry)
            document.getElementById('edit-asset-usage-type').value = 'hours';
            document.getElementById('edit-asset-usage-value').value = '';
            document.getElementById('edit-asset-usage-notes').value = '';
            
            // General Notes
            document.getElementById('edit-asset-notes').value = asset.notes || '';
            
            // Hide details modal and show edit modal
            document.getElementById('asset-details-modal').style.display = 'none';
            document.getElementById('edit-asset-modal').style.display = 'block';
            
        } catch (error) {
            console.error('Error enabling asset edit mode:', error);
        }
    }



    // Maintenance Schedule Functions
    async function openMaintenanceScheduleModal(assetId) {
        try {
            // Set the asset ID in the form
            document.getElementById('maintenance-schedule-asset-id').value = assetId;
            
            // Clear form data
            document.getElementById('maintenance-schedule-form').reset();
            
            // Set default values
            document.getElementById('maintenance-schedule-status').value = 'pending';
            document.getElementById('maintenance-schedule-unscheduled').value = 'false';
            
            // Fetch current asset usage to populate meter reading
            const assetResponse = await fetch(`api/asset/${assetId}`);
            if (assetResponse.ok) {
                const asset = await assetResponse.json();
                if (asset.latest_usage) {
                    document.getElementById('maintenance-schedule-meter-reading').value = asset.latest_usage.usage_value;
                    document.getElementById('maintenance-schedule-last-usage').value = asset.latest_usage.usage_value;
                }
            }
            
            // Hide delete button for new schedules
            const deleteBtn = document.getElementById('delete-maintenance-schedule-btn');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
            }
            
            // Show modal
            document.getElementById('maintenance-schedule-modal').style.display = 'block';
            
        } catch (error) {
            console.error('Error opening maintenance schedule modal:', error);
            alert('Error opening maintenance schedule. Please try again.');
        }
    }

    // Function to show maintenance history
    async function showMaintenanceHistory(assetId) {
        try {
            console.log("Loading maintenance history for asset:", assetId);
            
            const response = await fetch(`api/asset/${assetId}/maintenance`);
            if (!response.ok) {
                throw new Error('Failed to fetch maintenance history');
            }
            
            const maintenanceRecords = await response.json();
            console.log("Maintenance records:", maintenanceRecords);
            
            const historyContent = document.getElementById('maintenance-history-content');
            
            if (maintenanceRecords.length === 0) {
                historyContent.innerHTML = '<p>No maintenance records found for this asset.</p>';
            } else {
                // Calculate summary statistics
                let totalCost = 0;
                let latestMeterReading = null;
                let latestDate = null;
                
                maintenanceRecords.forEach(record => {
                    // Only include actual maintenance records in summary, not scheduled events
                    if (record.record_type !== 'scheduled') {
                        if (record.cost) {
                            totalCost += parseFloat(record.cost);
                        }
                        if (record.meter_reading) {
                            const meterReading = parseFloat(record.meter_reading);
                            const recordDate = record.completed_date ? new Date(record.completed_date) : new Date(0);
                            if (!latestMeterReading || recordDate > latestDate) {
                                latestMeterReading = meterReading;
                                latestDate = recordDate;
                            }
                        }
                    }
                });
                
                // Create summary section
                const summaryHtml = `
                    <div class="maintenance-summary">
                        <h3>Maintenance Summary</h3>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <strong>Maintenance Cost:</strong> 
                                <span class="cost-total">$${totalCost.toFixed(2)}</span>
                            </div>
                            <div class="summary-item">
                                <strong>Latest Meter Reading:</strong> 
                                <span class="latest-reading">${latestMeterReading ? `${latestMeterReading.toLocaleString()} km` : 'N/A'}</span>
                            </div>
                            <div class="summary-item">
                                <strong>Total Records:</strong> 
                                <span class="record-count">${maintenanceRecords.length}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                // Create table for maintenance history
                let tableHtml = `
                    <table class="maintenance-history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>TASK</th>
                                <th>Supplier</th>
                                <th>Cost</th>
                                <th>METER</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                maintenanceRecords.forEach(record => {
                    const date = record.completed_date ? new Date(record.completed_date).toLocaleDateString() : 'N/A';
                    const cost = record.cost ? `$${parseFloat(record.cost).toFixed(2)}` : 'N/A';
                    const km = record.meter_reading ? `${parseFloat(record.meter_reading).toLocaleString()} km` : 'N/A';
                    const status = record.status || 'N/A';
                    
                    // Format task description for scheduled events
                    let taskDescription = record.task_description || 'N/A';
                    if (record.record_type === 'scheduled' && record.event_time) {
                        const time = record.event_time.substring(0, 5);
                        const duration = record.duration_hours || 1;
                        taskDescription = `${taskDescription} (${time}${duration > 1 ? ` (${duration}h)` : ''})`;
                    }
                    
                    // Add special styling for scheduled events
                    const rowClass = record.record_type === 'scheduled' ? 'scheduled-event-row' : 'maintenance-record-row';
                    
                    tableHtml += `
                        <tr class="${rowClass}" ${record.record_type === 'scheduled' ? 'data-scheduled-id' : 'data-maintenance-id'}="${record.id}" style="cursor: pointer;">
                            <td>${date}</td>
                            <td>${taskDescription}</td>
                            <td>${record.supplier || 'N/A'}</td>
                            <td>${cost}</td>
                            <td>${km}</td>
                            <td><span class="status-badge status-${status}">${status}</span></td>
                        </tr>
                    `;
                });
                
                tableHtml += `
                        </tbody>
                    </table>
                `;
                
                historyContent.innerHTML = summaryHtml + tableHtml;
            }
            
            // Show modal
            document.getElementById('maintenance-history-modal').style.display = 'block';
            
        } catch (error) {
            console.error('Error loading maintenance history:', error);
            alert('Error loading maintenance history. Please try again.');
        }
    }

    // Function to show animal history
    async function showAnimalHistory(animalId) {
        try {
            console.log("Loading animal history for animal:", animalId);
            
            // Load both event history and weight history
            const [historyResponse, weightResponse] = await Promise.all([
                fetch(`api/livestock/${animalId}/history`),
                fetch(`api/animal/${animalId}/weight-history`)
            ]);
            
            if (!historyResponse.ok) {
                throw new Error('Failed to fetch animal history');
            }
            
            const historyRecords = await historyResponse.json();
            console.log("Animal history records:", historyRecords);
            
            // Load weight history
            let weightRecords = [];
            if (weightResponse.ok) {
                weightRecords = await weightResponse.json();
                console.log("Weight history records:", weightRecords);
            }
            
            const historyContent = document.getElementById('animal-history-content');
            
            if (historyRecords.length === 0 && weightRecords.length === 0) {
                historyContent.innerHTML = '<p>No history records found for this animal.</p>';
            } else {
                // Create summary section
                const summaryHtml = `
                    <div class="maintenance-summary">
                        <h3>Animal History Summary</h3>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <strong>Total Records:</strong> 
                                <span class="record-count">${historyRecords.length + weightRecords.length}</span>
                            </div>
                            <div class="summary-item">
                                <strong>Scheduled Events:</strong> 
                                <span class="scheduled-count">${historyRecords.filter(r => r.record_type === 'scheduled').length}</span>
                            </div>
                            <div class="summary-item">
                                <strong>Completed Events:</strong> 
                                <span class="completed-count">${historyRecords.filter(r => r.record_type === 'history').length}</span>
                            </div>
                            <div class="summary-item">
                                <strong>Weight Records:</strong> 
                                <span class="weight-count">${weightRecords.length}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                // Create table for animal history
                let tableHtml = `
                    <table class="maintenance-history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Event</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                historyRecords.forEach(record => {
                    const date = record.completed_date ? new Date(record.completed_date).toLocaleDateString() : 'N/A';
                    const status = record.status || 'N/A';
                    
                    // Format event description for scheduled events
                    let eventDescription = record.task_description || 'N/A';
                    if (record.record_type === 'scheduled' && record.event_time) {
                        const time = record.event_time.substring(0, 5);
                        const duration = record.duration_hours || 1;
                        eventDescription = `${eventDescription} (${time}${duration > 1 ? ` (${duration}h)` : ''})`;
                    }
                    
                    // Add special styling for scheduled events
                    const rowClass = record.record_type === 'scheduled' ? 'scheduled-event-row' : 'maintenance-record-row';
                    const dataAttr = record.record_type === 'scheduled' ? 'data-scheduled-id' : 'data-history-id';
                    
                    tableHtml += `
                        <tr class="${rowClass}" ${dataAttr}="${record.id}" style="cursor: pointer;">
                            <td>${date}</td>
                            <td>${eventDescription}</td>
                            <td>${record.supplier || 'N/A'}</td>
                            <td><span class="status-badge status-${status}">${status}</span></td>
                            <td>${record.notes || 'N/A'}</td>
                        </tr>
                    `;
                });
                
                tableHtml += `
                        </tbody>
                    </table>
                `;
                
                // Add weight history table if there are weight records
                if (weightRecords.length > 0) {
                    tableHtml += `
                        <div style="margin-top: 30px;">
                            <h3>Weight History</h3>
                            <table class="maintenance-history-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Weight (kg)</th>
                                        <th>Notes</th>
                                        <th>Recorded By</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;
                    
                    weightRecords.forEach(record => {
                        const date = new Date(record.measurement_date).toLocaleDateString();
                        const time = record.measurement_time ? record.measurement_time.substring(0, 5) : 'N/A';
                        const weight = record.weight ? parseFloat(record.weight).toFixed(1) : 'N/A';
                        
                        tableHtml += `
                            <tr class="weight-record-row">
                                <td>${date}</td>
                                <td>${time}</td>
                                <td><strong>${weight}</strong></td>
                                <td>${record.notes || 'N/A'}</td>
                                <td>${record.recorded_by || 'N/A'}</td>
                            </tr>
                        `;
                    });
                    
                    tableHtml += `
                                </tbody>
                            </table>
                        </div>
                    `;
                }
                
                historyContent.innerHTML = summaryHtml + tableHtml;
            }
            
            // Show modal
            document.getElementById('animal-history-modal').style.display = 'block';
            
        } catch (error) {
            console.error('Error loading animal history:', error);
            alert('Error loading animal history. Please try again.');
        }
    }

    // Function to load maintenance record for editing
    async function loadMaintenanceRecordForEdit(scheduleId) {
        try {
            console.log('loadMaintenanceRecordForEdit called with scheduleId:', scheduleId);
            const response = await fetch(`api/maintenance-schedule/${scheduleId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch maintenance record');
            }
            
            const record = await response.json();
            console.log('Maintenance record loaded:', record);
            
            // Populate form with record data
            document.getElementById('maintenance-schedule-asset-id').value = record.asset_id;
            document.getElementById('maintenance-schedule-asset-id').dataset.scheduleId = scheduleId;
            document.getElementById('maintenance-schedule-task').value = record.task_description || '';
            document.getElementById('maintenance-schedule-status').value = record.status || 'pending';
            document.getElementById('maintenance-schedule-unscheduled').value = record.is_unscheduled ? 'true' : 'false';
            document.getElementById('maintenance-schedule-due-date').value = record.due_date || '';
            document.getElementById('maintenance-schedule-completed-date').value = record.completed_date || '';
            document.getElementById('maintenance-schedule-interval-type').value = record.interval_type || '';
            document.getElementById('maintenance-schedule-interval-value').value = record.interval_value || '';
            document.getElementById('maintenance-schedule-trigger-type').value = record.maintenance_trigger_type || '';
            document.getElementById('maintenance-schedule-trigger-value').value = record.maintenance_trigger_value || '';
            document.getElementById('maintenance-schedule-last-usage').value = record.last_maintenance_usage || '';
            document.getElementById('maintenance-schedule-meter-reading').value = record.meter_reading || '';
            document.getElementById('maintenance-schedule-cost').value = record.cost || '';
            document.getElementById('maintenance-schedule-supplier').value = record.supplier || '';
            document.getElementById('maintenance-schedule-invoice').value = record.invoice_number || '';
            document.getElementById('maintenance-schedule-notes').value = record.notes || '';
            
            // Change modal to edit mode
            const modal = document.getElementById('maintenance-schedule-modal');
            const modalTitle = modal.querySelector('h2');
            modalTitle.textContent = 'Edit Maintenance Schedule';
            
            // Change submit button text and add update mode flag
            const submitBtn = document.querySelector('#maintenance-schedule-form button[type="submit"]');
            submitBtn.textContent = 'Update Schedule';
            submitBtn.dataset.mode = 'edit';
            submitBtn.dataset.scheduleId = scheduleId;
            
            // Show delete button for existing schedules
            const deleteBtn = document.getElementById('delete-maintenance-schedule-btn');
            if (deleteBtn) {
                deleteBtn.style.display = 'inline-block';
            }
            
            // Show modal
            modal.style.display = 'block';
            
        } catch (error) {
            console.error('Error loading maintenance record for editing:', error);
            alert('Error loading maintenance record. Please try again.');
        }
    }

    // Function to reset maintenance schedule form to create mode
    function resetMaintenanceScheduleForm(resetAssetId = true) {
        const form = document.getElementById('maintenance-schedule-form');
        const modal = document.getElementById('maintenance-schedule-modal');
        
        if (!form || !modal) {
            console.error('Maintenance schedule form or modal not found');
            return;
        }
        
        // Show modal first to ensure elements are accessible
        modal.style.display = 'block';
        modal.style.visibility = 'visible';
        
        // Wait for modal to be fully visible before accessing elements
        const waitForModal = () => {
            return new Promise((resolve) => {
                const checkModal = () => {
                    const modalTitle = modal.querySelector('.modal-header h2');
                    const submitBtn = document.querySelector('#maintenance-schedule-form button[type="submit"]');
                    
                    if (modalTitle && submitBtn) {
                        resolve({ modalTitle, submitBtn });
                    } else {
                        setTimeout(checkModal, 50);
                    }
                };
                checkModal();
            });
        };
        
        waitForModal().then(({ modalTitle, submitBtn }) => {
            // Reset form
            form.reset();
            
            // Reset modal title
            if (modalTitle) {
                modalTitle.textContent = 'Schedule Maintenance';
            }
            
            // Reset submit button
            if (submitBtn) {
                submitBtn.textContent = 'Schedule Maintenance';
                submitBtn.innerHTML = '<i class="fa-solid fa-save"></i> Schedule Maintenance';
                
                // Remove edit mode flags
                delete submitBtn.dataset.mode;
                delete submitBtn.dataset.scheduleId;
            }
            
            // Hide delete button
            const deleteBtn = document.getElementById('delete-maintenance-schedule-btn');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
            }
            
            // Reset asset ID if provided
            const assetIdInput = document.getElementById('maintenance-schedule-asset-id');
            if (assetIdInput && resetAssetId) {
                assetIdInput.value = '';
            }
        });
    }

    // Function to update gender options based on category
    function updateGenderOptions(category) {
        const genderSelect = document.getElementById('edit-gender');
        const options = genderOptions[category] || genderOptions['default'];
        
        // Clear existing options
        genderSelect.innerHTML = '';
        
        // Add new options
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            genderSelect.appendChild(optionElement);
        });
    }

    const filterBar = document.getElementById("filter-bar");
    const animalListTable = document.querySelector("#livestock-list");
    if (!animalListTable) {
        console.error("script.js: Could not find table with ID #livestock-list.");
        return;
    }
    console.log("script.js: Found table element:", animalListTable);

    animalListTable.addEventListener("click", async (event) => {
        const target = event.target;

        // Handle row click for animal details
        if (target.closest('tr')) {
            const row = target.closest('tr');
            const animalId = row.dataset.animalId;
            await showAnimalDetails(animalId);
            return;
        }
    });

    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-image");
    const animalDetailsModal = document.getElementById("animal-details-modal");
    const animalDetailsContent = document.getElementById("animal-details-content");
    const closeModals = document.querySelectorAll(".close-modal");

    closeModals.forEach(closeModal => {
        closeModal.onclick = function() {
            // Find which modal this close button belongs to
            const modal = closeModal.closest('.modal');
            if (modal) {
                modal.style.display = "none";
            }
        }
    });

    // Add Event Modal Event Listeners
    const eventCategorySelect = document.getElementById('event-category');
    if (eventCategorySelect) {
        eventCategorySelect.addEventListener('change', async (e) => {
            const category = e.target.value;
            if (category) {
                await populateEventItemDropdown(category);
            } else {
                document.getElementById('event-item-name').innerHTML = '<option value="">Select Category First</option>';
            }
        });
    }

    // Add status change listener to toggle completion fields
    const eventStatusSelect = document.getElementById('event-status');
    if (eventStatusSelect) {
        eventStatusSelect.addEventListener('change', (e) => {
            toggleCompletionFields(e.target.value);
        });
    }

    const addEventForm = document.getElementById('add-event-form');
    if (addEventForm) {
        addEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-event-btn');
            const isEditMode = submitBtn.dataset.mode === 'edit';
            const eventId = submitBtn.dataset.eventId;
            
            const formData = new FormData(e.target);
            const eventData = {
                date: document.getElementById('event-date').value,
                time: document.getElementById('event-time').value,
                category: formData.get('category'),
                item_id: parseInt(formData.get('item_name')),
                title: formData.get('title'),
                duration: parseFloat(formData.get('duration')) || 1,
                notes: formData.get('notes'),
                status: formData.get('status'),
                priority: formData.get('priority'),
                date_completed: formData.get('date_completed'),
                actual_duration: formData.get('actual_duration') ? parseFloat(formData.get('actual_duration')) : null
            };
            
            try {
                if (isEditMode && eventId) {
                    await updateEvent(eventId, eventData);
                } else {
                    await saveEvent(eventData);
                }
            } catch (error) {
                console.error('Failed to save event:', error);
            }
        });
        
        // Add category change listener to populate item dropdown
        const categoryDropdown = document.getElementById('event-category');
        if (categoryDropdown) {
            categoryDropdown.addEventListener('change', async (e) => {
                const category = e.target.value;
                if (category) {
                    await populateEventItemDropdown(category);
                } else {
                    // Clear item dropdown if no category selected
                    document.getElementById('event-item-name').innerHTML = '<option value="">Select Category First</option>';
                }
            });
        }
    }

    // Close buttons for add event modal
    const closeAddEventBtns = document.querySelectorAll('.close-add-event-btn');
    closeAddEventBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('add-event-modal').style.display = 'none';
        });
    });

    // Delete button for add event modal (edit mode)
    const deleteEventBtn = document.getElementById('delete-event-btn');
    if (deleteEventBtn) {
        deleteEventBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const eventId = deleteEventBtn.dataset.eventId;
            if (!eventId) {
                console.error('No event ID found for deletion');
                return;
            }
            
            if (confirm('Are you sure you want to delete this event?')) {
                try {
                    await deleteEvent(eventId);
                    document.getElementById('add-event-modal').style.display = 'none';
                } catch (error) {
                    console.error('Failed to delete event:', error);
                }
            }
        });
    }

    // Event Details Modal Event Listeners
    const closeEventDetailsBtns = document.querySelectorAll('.close-event-details-btn');
    closeEventDetailsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('event-details-modal').style.display = 'none';
        });
    });

    // Name Generator Wizard Event Listeners
    const translateWordsBtn = document.getElementById('translate-words-btn');
    if (translateWordsBtn) {
        translateWordsBtn.addEventListener('click', async () => {
            const words = [];
            for (let i = 1; i <= 5; i++) {
                const word = document.getElementById(`birth-word-${i}`).value.trim();
                if (word) {
                    words.push(word);
                }
            }
            
            if (words.length < 2) {
                alert('Please enter at least 2 words to translate.');
                return;
            }
            
            translateWordsBtn.disabled = true;
            translateWordsBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Translating...';
            
            try {
                const translations = await translateToOldNorse(words);
                const norseNames = generateNorseNames(translations);
                
                // Show step 2
                document.getElementById('wizard-step-1').style.display = 'none';
                document.getElementById('wizard-step-2').style.display = 'block';
                displayNameOptions(norseNames);
            } catch (error) {
                console.error('Error in translation:', error);
                alert('Error translating words. Please try again.');
            } finally {
                translateWordsBtn.disabled = false;
                translateWordsBtn.innerHTML = '<i class="fa-solid fa-language"></i> Translate to Old Norse';
            }
        });
    }
    
    // Select name button
    const selectNameBtn = document.getElementById('select-name-btn');
    if (selectNameBtn) {
        selectNameBtn.addEventListener('click', () => {
            if (selectedNorseName) {
                // Populate the name field in the edit form
                document.getElementById('edit-name').value = selectedNorseName;
                // Close wizard
                document.getElementById('name-wizard-modal').style.display = 'none';
            } else {
                alert('Please select a name first.');
            }
        });
    }
    
    // Close wizard button
    const closeWizardBtn = document.getElementById('close-wizard-btn');
    if (closeWizardBtn) {
        closeWizardBtn.addEventListener('click', () => {
            console.log('Cancel button clicked - closing wizard');
            document.getElementById('name-wizard-modal').style.display = 'none';
        });
    }

    // Add event listener for category change
    const categorySelect = document.getElementById('edit-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            updateGenderOptions(this.value);
        });
    }

    // Add event listener for filter bar clicks
    const filterBarElement = document.getElementById("filter-bar");
    if (filterBarElement) {
        filterBarElement.addEventListener('click', async (event) => {
            const target = event.target;
            const filterButton = target.closest('.filter-btn');
            
            if (filterButton) {
                const filter = filterButton.dataset.filter;
                
                // Handle Add button click
                if (filter === 'add') {
                    await openAddAnimalForm();
                    return;
                }
                
                // Handle regular filter clicks
                // Remove active class from all buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                filterButton.classList.add('active');
                
                // Populate animal list with selected filter
                populateAnimalList(filter);
            }
        });
    }

    // Handle modal action buttons
    document.addEventListener("click", async (event) => {
        const target = event.target;

        // Handle update button
        if (target.closest('#update-animal-btn')) {
            const animalId = document.getElementById('update-animal-btn').dataset.animalId;
            await enableEditMode(animalId);
            return;
        }

        // Handle delete button
        if (target.closest('#delete-animal-btn')) {
            const animalId = document.getElementById('delete-animal-btn').dataset.animalId;
            if (confirm("Are you sure you want to delete this animal?")) {
                const response = await fetch(`delete_animal/${animalId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    alert("Animal deleted successfully!");
                    document.getElementById('animal-details-modal').style.display = "none";
                    populateAnimalList();
                } else {
                    const error = await response.json();
                    alert(`Error: ${error.detail}`);
                }
            }
            return;
        }

        // Handle asset edit button
        if (target.closest('#edit-asset-btn')) {
            const assetId = document.getElementById('edit-asset-btn').dataset.assetId;
            await enableAssetEditMode(assetId);
            return;
        }

        // Handle maintenance schedule button
        if (target.closest('#maintenance-schedule-btn')) {
            const assetId = document.getElementById('edit-asset-btn').dataset.assetId;
            openMaintenanceScheduleModal(assetId);
            return;
        }

        // Handle delete maintenance schedule button
        if (target.closest('#delete-maintenance-schedule-btn')) {
            const scheduleId = document.getElementById('maintenance-schedule-asset-id').dataset.scheduleId;
            if (scheduleId && confirm('Are you sure you want to delete this maintenance schedule?')) {
                deleteMaintenanceSchedule(scheduleId);
            }
            return;
        }

        // Handle maintenance history button
        if (target.closest('#view-maintenance-history-btn')) {
            const assetId = document.getElementById('edit-asset-btn').dataset.assetId;
            showMaintenanceHistory(assetId);
            return;
        }

        // Handle animal history button
        if (target.closest('#view-animal-history-btn')) {
            const animalId = document.getElementById('update-animal-btn').dataset.animalId;
            showAnimalHistory(animalId);
            return;
        }

        // Handle schedule event button for animals
        if (target.closest('#schedule-event-btn')) {
            const animalId = document.getElementById('update-animal-btn').dataset.animalId;
            const animalName = document.getElementById('update-animal-btn').dataset.animalName || 'Animal';
            openAddEventModalForAnimal(animalId, animalName);
            return;
        }



        // Handle scheduled event row clicks for editing
        if (target.closest('.scheduled-event-row')) {
            console.log('Scheduled event row clicked!');
            const row = target.closest('.scheduled-event-row');
            const eventId = row.dataset.scheduledId;
            console.log('Event ID:', eventId);
            
            // Close history modal first
            const currentModal = target.closest('.modal');
            if (currentModal) {
                currentModal.style.display = 'none';
            }
            
            // Load the event for editing
            setTimeout(() => {
                loadEventForEdit(eventId);
            }, 100);
            return;
        }
        
        // Handle maintenance record row clicks (show alert that these cannot be edited)
        if (target.closest('.maintenance-record-row')) {
            console.log('Maintenance record row clicked!');
            const row = target.closest('.maintenance-record-row');
            const historyId = row.dataset.historyId;
            console.log('History ID:', historyId);
            
            alert('Historical records cannot be edited. Only scheduled events can be edited.');
            return;
        }

        // Handle asset delete button
        if (target.closest('#delete-asset-btn')) {
            const assetId = document.getElementById('delete-asset-btn').dataset.assetId;
            if (confirm("Are you sure you want to delete this asset?")) {
                const response = await fetch(`api/asset/${assetId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    alert("Asset deleted successfully!");
                    const detailsModal = document.getElementById('asset-details-modal');
                    
                    // Check if we should return to parent view
                    if (detailsModal.dataset.returnToParent) {
                        const returnToParentId = detailsModal.dataset.returnToParent;
                        delete detailsModal.dataset.returnToParent;
                        detailsModal.style.display = "none";
                        showAssetDetails(returnToParentId);
                    } else {
                        detailsModal.style.display = "none";
                        populateAssetList();
                    }
                } else {
                    const error = await response.json();
                    alert(`Error: ${error.detail}`);
                }
            }
            return;
        }

        // Handle close buttons
        if (target.closest('.close-modal') || 
            target.closest('.close-details-btn') || 
            target.closest('.close-edit-btn') ||
            target.closest('.close-asset-details-btn') || 
            target.closest('.close-edit-asset-btn') ||
            target.closest('.close-add-asset-btn') ||
            target.closest('.close-maintenance-schedule-btn') ||
            target.closest('.close-maintenance-history-btn') ||
            target.closest('.close-animal-history-btn')) {
            
            const modal = target.closest('.modal');
            if (!modal) {
                console.error('Modal not found for close button');
                return;
            }
            
            // Reset maintenance schedule form to create mode when closing
            if (modal.id === 'maintenance-schedule-modal') {
                resetMaintenanceScheduleForm();
            }
            
            // Check if we should return to parent view
            if (modal.id === 'asset-details-modal' && modal.dataset.returnToParent) {
                const returnToParentId = modal.dataset.returnToParent;
                delete modal.dataset.returnToParent;
                modal.style.display = 'none';
                showAssetDetails(returnToParentId);
                return;
            }
            
            modal.style.display = 'none';
            return;
        }

        // Handle edit modal close buttons
        if (target.closest('.close-edit-btn')) {
            document.getElementById('edit-animal-modal').style.display = "none";
            return;
        }
    });

    // Handle edit animal form submission
    const editForm = document.getElementById('edit-animal-form');
    if (editForm) {
        editForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const animalId = document.getElementById('edit-animal-id').value;
            const formData = new FormData(event.target);
            console.log('Form submitted. Animal ID:', animalId, 'Is Update:', animalId && animalId !== '');
            console.log('Form data:', Object.fromEntries(formData));
            
            const animalData = {
                tag_id: formData.get('tag_id'),
                name: formData.get('name'),
                gender: formData.get('gender'),
                breed: formData.get('breed'),
                birth_date: formData.get('date_of_birth') || null,
                dod: formData.get('dod') || null,
                health_status: formData.get('health_status') || 'Healthy',
                notes: formData.get('notes'),
                dam_id: formData.get('dam_id') ? parseInt(formData.get('dam_id')) : null,
                sire_id: formData.get('sire_id') ? parseInt(formData.get('sire_id')) : null,
                features: formData.get('features'),
                photo_path: formData.get('photo_path'),
                pic: formData.get('pic'),
                status: formData.get('status')
            };
            
            // Auto-set dod if status is Deceased and no dod is provided
            if (animalData.status === 'Deceased' && !animalData.dod) {
                animalData.dod = new Date().toISOString().split('T')[0];
            }
            
            try {
                let response;
                const isUpdate = animalId && animalId !== '';
                
                if (isUpdate) {
                    // Update existing animal
                    response = await fetch(`update_animal/${animalId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(animalData)
                    });
                } else {
                    // Add new animal
                    response = await fetch('add_animal', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(animalData)
                    });
                }
                
                if (response.ok) {
                    const result = await response.json();
                    const message = isUpdate ? 'Animal updated successfully!' : 'Animal added successfully!';
                    console.log('Success:', message, 'Response:', result);
                    
                    // Upload photos if any were selected
                    const animalIdForPhoto = isUpdate ? animalId : result.id;
                    try {
                        await uploadAnimalPhotos(animalIdForPhoto);
                        console.log('Photo upload completed');
                    } catch (photoError) {
                        console.error('Photo upload failed:', photoError);
                        // Don't fail the whole operation if photo upload fails
                        alert(message + ' (Note: Some photo uploads may have failed)');
                    }
                    
                    alert(message);
                    document.getElementById('edit-animal-modal').style.display = "none";
                    populateAnimalList(); // Refresh the animal list
                    populateFilterTabs(); // Refresh filter tabs
                } else {
                    const errorText = await response.text();
                    const action = isUpdate ? 'updating' : 'adding';
                    console.error('Error response:', errorText);
                    try {
                        const error = JSON.parse(errorText);
                        alert(`Error ${action} animal: ${error.detail}`);
                    } catch (e) {
                        alert(`Error ${action} animal: ${errorText}`);
                    }
                }
            } catch (error) {
                console.error('Error saving animal:', error);
                alert('Error saving animal. Please try again.');
            }
        });
    }

    // Asset Form Handlers
    const addAssetForm = document.getElementById('add-asset-form');
    if (addAssetForm) {
        addAssetForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            console.log('Asset form submitted. Form data:', Object.fromEntries(formData));
            
            const assetData = {
                // Basic Information
                name: formData.get('name'),
                category: formData.get('category'),
                make: formData.get('make'),
                model: formData.get('model'),
                year: formData.get('year') ? parseInt(formData.get('year')) : null,
                body_feature: formData.get('body_feature'),
                badge: formData.get('badge'),
                serial_number: formData.get('serial_number'),
                
                // Status & Location
                location: formData.get('location'),
                quantity: formData.get('quantity') ? parseInt(formData.get('quantity')) : 1,
                status: formData.get('status'),
                parent_asset_id: formData.get('parent_asset_id') ? parseInt(formData.get('parent_asset_id')) : null,
                
                // Purchase Information
                purchase_date: formData.get('purchase_date') || null,
                purchase_price: formData.get('purchase_price') ? parseFloat(formData.get('purchase_price')) : null,
                purchase_location: formData.get('purchase_location'),
                
                // Registration & Insurance
                registration_no: formData.get('registration_no'),
                registration_due: formData.get('registration_due') || null,
                insurance_info: formData.get('insurance_info'),
                insurance_due: formData.get('insurance_due') || null,
                
                // Permits & Documentation
                permit_info: formData.get('permit_info'),
                manual_or_doc_path: formData.get('manual_or_doc_path'),
                
                // Warranty Information
                warranty_provider: formData.get('warranty_provider'),
                warranty_expiry_date: formData.get('warranty_expiry_date') || null,
                
                // Usage Information
                usage_type: formData.get('usage_type'),
                usage_value: formData.get('usage_value') ? parseFloat(formData.get('usage_value')) : null,
                usage_notes: formData.get('usage_notes'),
                
                // General Notes
                notes: formData.get('notes')
            };
            
            try {
                const response = await fetch('api/asset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(assetData),
                });
                
                if (response.ok) {
                    alert('Asset added successfully!');
                    document.getElementById('add-asset-modal').style.display = 'none';
                    populateAssetList();
                } else {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    try {
                        const error = JSON.parse(errorText);
                        alert(`Error adding asset: ${error.detail}`);
                    } catch (e) {
                        alert(`Error adding asset: ${errorText}`);
                    }
                }
            } catch (error) {
                console.error('Error adding asset:', error);
                alert('Error adding asset. Please try again.');
            }
        });
    }

    // Function to calculate due date based on interval and meter readings
    function calculateDueDate() {
        const intervalType = document.getElementById('maintenance-schedule-interval-type').value;
        const intervalValue = parseInt(document.getElementById('maintenance-schedule-interval-value').value);
        const meterReading = parseFloat(document.getElementById('maintenance-schedule-meter-reading').value);
        const lastMaintenanceUsage = parseFloat(document.getElementById('maintenance-schedule-last-usage').value) || 0;
        const dueDateField = document.getElementById('maintenance-schedule-due-date');
        
        if (!intervalType || !intervalValue) {
            return; // Don't calculate if interval fields are missing
        }
        
        // If meter reading is not provided, use time-based calculation
        if (!meterReading || isNaN(meterReading)) {
            console.log('Meter reading not provided, using time-based calculation');
        }
        
        let dueDate = new Date();
        
        if (intervalType === 'hours' || intervalType === 'km') {
            // Calculate based on meter reading using modulo
            const usageSinceLastMaintenance = meterReading - lastMaintenanceUsage;
            const remainingInterval = intervalValue - (usageSinceLastMaintenance % intervalValue);
            
            // Estimate when next maintenance is due based on average usage
            // For simplicity, estimate 30 days from now if usage-based
            dueDate.setDate(dueDate.getDate() + 30);
            
            console.log(`Usage-based calculation: ${usageSinceLastMaintenance} ${intervalType} used, ${remainingInterval} ${intervalType} remaining`);
        } else {
            // Calculate based on time intervals
            switch (intervalType) {
                case 'days':
                    dueDate.setDate(dueDate.getDate() + intervalValue);
                    break;
                case 'weeks':
                    dueDate.setDate(dueDate.getDate() + (intervalValue * 7));
                    break;
                case 'months':
                    dueDate.setMonth(dueDate.getMonth() + intervalValue);
                    break;
                case 'years':
                    dueDate.setFullYear(dueDate.getFullYear() + intervalValue);
                    break;
            }
        }
        
        // Format date as YYYY-MM-DD for input field
        const formattedDate = dueDate.toISOString().split('T')[0];
        dueDateField.value = formattedDate;
        
        console.log(`Calculated due date: ${formattedDate} for ${intervalType} interval of ${intervalValue}`);
    }

    // Maintenance Schedule Form Handler
    const maintenanceScheduleForm = document.getElementById('maintenance-schedule-form');
    if (maintenanceScheduleForm) {
        // Add event listeners for automatic due date calculation
        const intervalTypeField = document.getElementById('maintenance-schedule-interval-type');
        const intervalValueField = document.getElementById('maintenance-schedule-interval-value');
        const meterReadingField = document.getElementById('maintenance-schedule-meter-reading');
        const lastUsageField = document.getElementById('maintenance-schedule-last-usage');
        
        if (intervalTypeField) intervalTypeField.addEventListener('change', calculateDueDate);
        if (intervalValueField) intervalValueField.addEventListener('input', calculateDueDate);
        if (meterReadingField) meterReadingField.addEventListener('input', calculateDueDate);
        if (lastUsageField) lastUsageField.addEventListener('input', calculateDueDate);
        
        maintenanceScheduleForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Trigger automatic due date calculation before submission
            calculateDueDate();
            
            const formData = new FormData(event.target);
            const submitBtn = event.target.querySelector('button[type="submit"]');
            const isEditMode = submitBtn.dataset.mode === 'edit';
            const scheduleId = submitBtn.dataset.scheduleId;
            
            console.log('Maintenance schedule form submitted. Form data:', Object.fromEntries(formData));
            console.log('Edit mode:', isEditMode, 'Schedule ID:', scheduleId);
            
            // Get form values and validate mandatory fields
            const dueDate = formData.get('due_date');
            const intervalType = formData.get('interval_type');
            const intervalValue = formData.get('interval_value');
            
            // Validate mandatory fields
            if (!dueDate || !intervalType || !intervalValue) {
                alert('Due date, interval type, and interval value are required fields for scheduled maintenance.');
                return;
            }
            
            const maintenanceData = {
                asset_id: parseInt(formData.get('asset_id')),
                task_description: formData.get('task_description'),
                due_date: dueDate, // Now mandatory
                completed_date: formData.get('completed_date') || null,
                status: formData.get('status') || 'pending',
                is_unscheduled: formData.get('is_unscheduled') === 'true',
                maintenance_trigger_type: formData.get('maintenance_trigger_type'),
                maintenance_trigger_value: formData.get('maintenance_trigger_value') ? parseInt(formData.get('maintenance_trigger_value')) : null,
                last_maintenance_usage: formData.get('last_maintenance_usage') ? parseFloat(formData.get('last_maintenance_usage')) : null,
                meter_reading: formData.get('meter_reading') ? parseInt(formData.get('meter_reading')) : null,
                interval_type: intervalType, // Now mandatory
                interval_value: parseInt(intervalValue), // Now mandatory
                cost: formData.get('cost') ? parseFloat(formData.get('cost')) : null,
                supplier: formData.get('supplier'),
                invoice_number: formData.get('invoice_number'),
                notes: formData.get('notes')
            };
            
            try {
                const url = isEditMode ? `api/maintenance-schedule/${scheduleId}` : 'api/maintenance-schedule';
                const method = isEditMode ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(maintenanceData),
                });
                
                if (response.ok) {
                    const successMessage = isEditMode ? 'Maintenance schedule updated successfully!' : 'Maintenance schedule saved successfully!';
                    alert(successMessage);
                    document.getElementById('maintenance-schedule-modal').style.display = 'none';
                    // TODO: Refresh maintenance history when implemented
                } else {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    try {
                        const error = JSON.parse(errorText);
                        alert(`Error ${isEditMode ? 'updating' : 'saving'} maintenance schedule: ${error.detail}`);
                    } catch (e) {
                        alert(`Error ${isEditMode ? 'updating' : 'saving'} maintenance schedule: ${errorText}`);
                    }
                }
            } catch (error) {
                console.error('Error saving maintenance schedule:', error);
                alert(`Error ${isEditMode ? 'updating' : 'saving'} maintenance schedule. Please try again.`);
            }
        });
    }

    const editAssetForm = document.getElementById('edit-asset-form');
    if (editAssetForm) {
        editAssetForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const assetId = document.getElementById('edit-asset-id').value;
            const formData = new FormData(event.target);
            console.log('Edit asset form submitted. Asset ID:', assetId, 'Form data:', Object.fromEntries(formData));
            console.log('About to send PUT request to api/asset/' + assetId);
            
            const assetData = {
                // Basic Information
                name: formData.get('name'),
                category: formData.get('category'),
                make: formData.get('make'),
                model: formData.get('model'),
                year: formData.get('year') ? parseInt(formData.get('year')) : null,
                body_feature: formData.get('body_feature'),
                badge: formData.get('badge'),
                serial_number: formData.get('serial_number'),
                
                // Status & Location
                location: formData.get('location'),
                quantity: formData.get('quantity') ? parseInt(formData.get('quantity')) : 1,
                status: formData.get('status'),
                parent_asset_id: formData.get('parent_asset_id') ? parseInt(formData.get('parent_asset_id')) : null,
                
                // Purchase Information
                purchase_date: formData.get('purchase_date') || null,
                purchase_price: formData.get('purchase_price') ? parseFloat(formData.get('purchase_price')) : null,
                purchase_location: formData.get('purchase_location'),
                
                // Registration & Insurance
                registration_no: formData.get('registration_no'),
                registration_due: formData.get('registration_due') || null,
                insurance_info: formData.get('insurance_info'),
                insurance_due: formData.get('insurance_due') || null,
                
                // Permits & Documentation
                permit_info: formData.get('permit_info'),
                manual_or_doc_path: formData.get('manual_or_doc_path'),
                
                // Warranty Information
                warranty_provider: formData.get('warranty_provider'),
                warranty_expiry_date: formData.get('warranty_expiry_date') || null,
                
                // Usage Information
                usage_type: formData.get('usage_type'),
                usage_value: formData.get('usage_value') ? parseFloat(formData.get('usage_value')) : null,
                usage_notes: formData.get('usage_notes'),
                
                // General Notes
                notes: formData.get('notes')
            };
            
            try {
                console.log('Sending PUT request to api/asset/' + assetId);
                const response = await fetch(`api/asset/${assetId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(assetData),
                });
                
                console.log('Response status:', response.status, 'Response ok:', response.ok);
                if (response.ok) {
                    const responseText = await response.text();
                    console.log('Update successful, response:', responseText);
                    alert('Asset updated successfully!');
                    document.getElementById('edit-asset-modal').style.display = 'none';
                    
                    // Check if we should return to parent view
                    const detailsModal = document.getElementById('asset-details-modal');
                    if (detailsModal.dataset.returnToParent) {
                        const returnToParentId = detailsModal.dataset.returnToParent;
                        delete detailsModal.dataset.returnToParent;
                        console.log('Returning to parent asset:', returnToParentId);
                        showAssetDetails(returnToParentId);
                    } else {
                        console.log('Refreshing asset list and current asset details');
                        await populateAssetList();
                        // Add small delay to ensure database changes are committed
                        await new Promise(resolve => setTimeout(resolve, 100));
                        await showAssetDetails(assetId);
                        console.log('Asset list and details refreshed');
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    try {
                        const error = JSON.parse(errorText);
                        alert(`Error updating asset: ${error.detail}`);
                    } catch (e) {
                        alert(`Error updating asset: ${errorText}`);
                    }
                }
            } catch (error) {
                console.error('Error updating asset:', error);
                alert('Error updating asset. Please try again.');
            }
        });
    }

    function loadCalendarEvents() {
        console.log("loadCalendarEvents: Starting to load calendar events");
        const filterType = document.getElementById('calendar-filter-type').value;
        const entryType = document.getElementById('calendar-entry-type').value;
        const category = document.getElementById('calendar-category').value;
        
        console.log("loadCalendarEvents: Filters:", { filterType, entryType, category });
        
        const eventsContainer = document.getElementById('calendar-events');
        if (!eventsContainer) {
            console.error("loadCalendarEvents: calendar-events container not found!");
            return;
        }
        eventsContainer.innerHTML = '<div class="calendar-loading"><i class="fa-solid fa-spinner"></i> Loading calendar events...</div>';
        
        // Calculate date range based on current date and filter type
        const today = new Date();
        let startDate, endDate;
        
        // Helper function to format date as YYYY-MM-DD without timezone conversion
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        switch (filterType) {
            case 'day':
                startDate = formatDate(currentDate);
                endDate = formatDate(currentDate);
                break;
            case 'week':
                const weekStart = new Date(currentDate);
                weekStart.setDate(currentDate.getDate() - currentDate.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                startDate = formatDate(weekStart);
                endDate = formatDate(weekEnd);
                break;
            case 'month':
                startDate = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
                const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                endDate = formatDate(new Date(nextMonth.getTime() - 86400000)); // Subtract 1 day
                break;
            case 'year':
                startDate = formatDate(new Date(currentDate.getFullYear(), 0, 1));
                endDate = formatDate(new Date(currentDate.getFullYear(), 11, 31));
                break;
        }
        
        console.log("loadCalendarEvents: Date range:", { filterType, startDate, endDate, currentDate: currentDate.toISOString().split('T')[0] });
        
        // Build query parameters
        const params = new URLSearchParams({
            filter_type: filterType,
            start_date: startDate,
            end_date: endDate
        });
        
        if (entryType) params.append('entry_type', entryType);
        if (category) params.append('category', category);
        
        const url = `api/calendar?${params}`;
        console.log("loadCalendarEvents: Fetching URL:", url);
        console.log("loadCalendarEvents: Full URL would be:", window.location.origin + url);
        
        fetch(url)
            .then(response => {
                console.log("loadCalendarEvents: Response status:", response.status);
                console.log("loadCalendarEvents: Response headers:", [...response.headers.entries()]);
                console.log("loadCalendarEvents: Response URL:", response.url);
                
                if (!response.ok) {
                    console.error("loadCalendarEvents: HTTP error:", response.status, response.statusText);
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return response.json();
            })
            .then(events => {
                console.log("loadCalendarEvents: Successfully loaded events:", events);
                displayCalendarEvents(events);
                updateDateDisplay(filterType);
            })
            .catch(error => {
                console.error('Error loading calendar events:', error);
                eventsContainer.innerHTML = `<div class="no-events">Error loading calendar events: ${error.message}</div>`;
            });
    }
    

    
    function handleCalendarEventClick(element) {
        // Get event data from data attribute or use element directly if it's already an event object
        const eventData = element.dataset ? JSON.parse(element.dataset.event) : element;
        
        console.log('=== CALENDAR EVENT CLICK DEBUG ===');
        console.log('Element dataset:', element.dataset);
        console.log('Raw dataset.event:', element.dataset.event);
        console.log('Parsed eventData:', eventData);
        
        // Show event details modal
        showEventDetailsModal(eventData);
    }
    
    function navigateToDay(year, month, day) {
        currentDate = new Date(year, month, day);
        currentView = 'day';
        document.getElementById('calendar-filter-type').value = 'day';
        loadCalendarEvents();
    }
    
    function updateDateDisplay(filterType) {
        const dateDisplay = document.getElementById('calendar-date-display');
        const periodDisplay = document.getElementById('calendar-period-display');
        const today = new Date();
        let displayText = '';
        
// Use currentDate instead of today for display
        switch (filterType) {
            case 'day':
                displayText = currentDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                break;
            case 'week':
                const weekStart = new Date(currentDate);
                weekStart.setDate(currentDate.getDate() - currentDate.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                displayText = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
                break;
            case 'month':
                displayText = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                break;
            case 'year':
                displayText = currentDate.getFullYear().toString();
                break;
        }
        
        if (dateDisplay) dateDisplay.textContent = displayText;
        if (periodDisplay) periodDisplay.textContent = filterType.charAt(0).toUpperCase() + filterType.slice(1);
    }
    
    // Setup calendar event listeners
    function setupCalendarListeners() {
        // Filter change listeners
        document.getElementById('calendar-filter-type').addEventListener('change', loadCalendarEvents);
        document.getElementById('calendar-entry-type').addEventListener('change', loadCalendarEvents);
        document.getElementById('calendar-category').addEventListener('change', loadCalendarEvents);
        
        // Refresh button
        document.getElementById('refresh-calendar').addEventListener('click', loadCalendarEvents);
    }
    
    // --- Calendar Functions ---
    
    // Global calendar state
    let currentDate = new Date();
    let currentView = 'month';
    let sunriseTime = 6; // Default 6 AM
    let sunsetTime = 18; // Default 6 PM
    
    
    function displayCalendarEvents(events) {
        console.log("displayCalendarEvents: Received events:", events);
        console.log("displayCalendarEvents: Event types breakdown:", events.reduce((acc, event) => {
            acc[event.entry_type] = (acc[event.entry_type] || 0) + 1;
            return acc;
        }, {}));
        const filterType = document.getElementById('calendar-filter-type').value;
        const eventsContainer = document.getElementById('calendar-events');
        
        // For day view, always show the 24-hour layout even if no events
        if (events.length === 0 && filterType !== 'day') {
            eventsContainer.innerHTML = '<div class="no-events">No events found for selected period.</div>';
            updateDateDisplay();
            return;
        }
        
        // Group events by date
        const eventsByDate = {};
        events.forEach(event => {
            if (!eventsByDate[event.date]) {
                eventsByDate[event.date] = [];
            }
            eventsByDate[event.date].push(event);
        });
        
        let html = '';
        
        switch (filterType) {
            case 'day':
                html = displayDayView(eventsByDate);
                break;
            case 'week':
                html = displayWeekView(eventsByDate);
                break;
            case 'month':
                html = displayMonthView(eventsByDate);
                break;
            case 'year':
                html = displayYearView(eventsByDate);
                break;
        }
        
        eventsContainer.innerHTML = html;
        updateDateDisplay();
        
        // Add click handlers for events
        document.querySelectorAll('.calendar-event').forEach(eventElement => {
            eventElement.addEventListener('click', function() {
                const eventData = JSON.parse(this.dataset.event);
                handleCalendarEventClick(eventData);
            });
        });
        
        // Add navigation handlers
        document.getElementById('calendar-nav-prev').onclick = navigatePrevious;
        document.getElementById('calendar-nav-next').onclick = navigateNext;
        
        // Make functions globally accessible
        window.navigateToDay = navigateToDay;
        window.handleCalendarEventClick = handleCalendarEventClick;
        window.navigatePrevious = navigatePrevious;
        window.navigateNext = navigateNext;
    }
    
    function displayDayView(eventsByDate) {
        // Fix timezone issue: create date string manually to avoid UTC conversion
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
        const dayEvents = eventsByDate[dateStr] || [];
        const dateObj = new Date(dateStr + 'T00:00:00');
        
        let html = `<div class="day-view">
            <div class="day-header">
                <h2>${dateObj.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</h2>
            </div>
            <div class="day-timeline">`;
        
        // Create hourly layout with event spanning
        // Initialize hourly segments array to track occupied hours
        const hourlySegments = Array(24).fill(null);
        
        // Process events and mark occupied hours
        dayEvents.forEach(event => {
            if (!event.time) return; // Skip events without time
            
            const startHour = parseInt(event.time.split(':')[0]);
            const duration = event.duration || 1.0;
            const endHour = Math.min(startHour + Math.ceil(duration), 24);
            
            // Mark all hours this event occupies
            for (let hour = startHour; hour < endHour; hour++) {
                if (!hourlySegments[hour]) {
                    hourlySegments[hour] = [];
                }
                hourlySegments[hour].push(event);
            }
        });
        
        // Create 24-hour segments
        for (let hour = 0; hour < 24; hour++) {
            const isDaylight = hour >= sunriseTime && hour <= sunsetTime;
            const hourStr = hour.toString().padStart(2, '0') + ':00';
            
            // Check if this hour has events
            const hasEvents = hourlySegments[hour] && hourlySegments[hour].length > 0;
            
            html += `<div class="hour-segment ${isDaylight ? 'daylight' : 'nighttime'} ${hasEvents ? 'has-events' : ''}" onclick="openAddEventModal('${dateStr}', '${hourStr}')" style="cursor: pointer;">
                <div class="hour-label">${hourStr}</div>
                <div class="hour-events">`;
            if (hourlySegments[hour] && hourlySegments[hour].length > 0) {
                // Group events by start time to avoid duplicates
                const eventsToShow = [];
                const seenEvents = new Set();
                
                hourlySegments[hour].forEach(event => {
                    const eventKey = `${event.id}-${event.title}`;
                    if (!seenEvents.has(eventKey)) {
                        seenEvents.add(eventKey);
                        eventsToShow.push(event);
                    }
                });
                
                eventsToShow.forEach(event => {
                    const displayName = event.related_name || event.title;
                    const isCompleted = event.status === 'completed';
                    const icon = event.category === 'livestock' ? '🐄' : '🔧';
                    const completedIcon = isCompleted ? ' <i class="fa-solid fa-check-circle" style="color: #4caf50;"></i>' : '';
                    
                    const startHour = parseInt(event.time.split(':')[0]);
                    const duration = event.duration || 1.0;
                    
                    // Check if this is the first hour of the event
                    const isFirstHour = hour === startHour;
                    
                    html += `<div class="event-item ${event.entry_type} ${isFirstHour ? 'event-start' : 'event-continuation'}" 
                             data-event='${JSON.stringify(event).replace(/'/g, '&apos;')}' 
                             onclick="event.stopPropagation(); handleCalendarEventClick(this)">
                        ${isFirstHour ? `
                            <div class="event-time">${event.time}</div>
                            <div class="event-content-small">
                                <div class="event-title-small">${event.title}</div>
                                <div class="event-meta-small">${icon} ${displayName}${completedIcon}</div>
                                ${duration > 1 ? `<div class="event-duration">${duration}h</div>` : ''}
                            </div>
                            ${event.entry_type === 'event' ? `
                                <div class="event-actions">
                                    <button class="event-delete-btn" onclick="event.stopPropagation(); quickDeleteEvent(${event.id}, '${event.title.replace(/'/g, "\\'")}')">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            ` : ''}
                        ` : `
                            <div class="event-continuation-indicator">
                                ${icon} ${duration > 1 ? '↳' : ''}
                            </div>
                        `}
                    </div>`;
                });
            }
            
            html += `</div></div>`;
        }
        
        html += `</div></div>`;
        return html;
    }
    
    function displayWeekView(eventsByDate) {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day;
        startOfWeek.setDate(diff);
        
        let html = `<div class="week-view">
            <div class="week-grid">`;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            // Fix timezone issue: create date string manually to avoid UTC conversion
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const dayEvents = eventsByDate[dateStr] || [];
            
            html += `<div class="day-column" onclick="navigateToDay(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()})">
                <div class="day-header-small">
                    <div class="day-name">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div class="day-number">${date.getDate()}</div>
                </div>
                <div class="day-events-small">`;
            
            dayEvents.forEach(event => {
                const displayName = event.related_name || event.title;
                const isCompleted = event.status === 'completed';
                const icon = event.category === 'livestock' ? '🐄' : '🔧';
                const completedIcon = isCompleted ? ' <i class="fa-solid fa-check-circle" style="color: #4caf50;"></i>' : '';
                const eventTime = event.time ? event.time.substring(0, 5) : 'All Day'; // Show HH:MM format
                const duration = event.duration || 1.0;
                
                html += `<div class="event-item ${event.entry_type} ${event.category}" title="${event.title}" data-event='${JSON.stringify(event).replace(/'/g, '&apos;')}' onclick="event.stopPropagation(); handleCalendarEventClick(this)">
                    <div class="event-time">${eventTime}${duration > 1 ? ` (${duration}h)` : ''}</div>
                    <div class="event-content-small">
                        <div class="event-title-small">${event.title}</div>
                        <div class="event-meta-small">${icon} ${displayName}${completedIcon}</div>
                    </div>
                    ${event.entry_type === 'event' ? `
                        <div class="event-actions">
                            <button class="event-delete-btn" onclick="event.stopPropagation(); quickDeleteEvent(${event.id}, '${event.title.replace(/'/g, "\\'")}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>`;
            });
            
            html += `</div></div>`;
        }
        
        html += `</div></div>`;
        return html;
    }
    
    function displayMonthView(eventsByDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        let html = `<div class="month-view">
            <div class="month-grid">
                <div class="weekday-headers">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div class="month-days">`;
        
        // Empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div class="empty-day"></div>';
        }
        
        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            // Fix timezone issue: create date string manually to avoid UTC conversion
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = date.toDateString() === new Date().toDateString();
            
            // Debug logging for specific days that have events
            if (dayEvents.length > 0) {
                console.log(`Month view Day ${day} (${dateStr}): Found ${dayEvents.length} events:`, dayEvents.map(e => e.title));
            }
            
            html += `<div class="month-day ${isToday ? 'today' : ''}" onclick="navigateToDay(${year}, ${month}, ${day})">
                <div class="day-number">${day}</div>
                <div class="day-events-mini">`;
            
            dayEvents.slice(0, 3).forEach(event => {
                const displayName = event.related_name || event.title;
                const isCompleted = event.status === 'completed';
                const icon = event.category === 'livestock' ? '🐄' : '🔧';
                const completedIcon = isCompleted ? ' <i class="fa-solid fa-check-circle" style="color: #4caf50;"></i>' : '';
                html += `<div class="event-item ${event.entry_type} ${event.category}" title="${event.title}" data-event='${JSON.stringify(event).replace(/'/g, '&apos;')}' onclick="event.stopPropagation(); handleCalendarEventClick(this)">${icon} ${displayName}${completedIcon}</div>`;
            });
            
            if (dayEvents.length > 3) {
                html += `<div class="event-more">+${dayEvents.length - 3}</div>`;
            }
            
            html += `</div></div>`;
        }
        
        // Calculate total cells to ensure proper grid
        const totalCells = startingDayOfWeek + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        
        // Empty cells for days after month ends
        for (let i = 0; i < remainingCells; i++) {
            html += '<div class="empty-day"></div>';
        }
        
        html += `</div></div></div>`;
        return html;
    }
    
    function displayYearView(eventsByDate) {
        const year = currentDate.getFullYear();
        
        let html = `<div class="year-view">
            <div class="year-grid">`;
        
        for (let month = 0; month < 12; month++) {
            const firstDay = new Date(year, month, 1);
            const monthName = firstDay.toLocaleDateString('en-US', { month: 'long' });
            
            html += `<div class="month-card" data-month="${month}">
                <div class="month-card-header">${monthName}</div>
                <div class="month-card-days">`;
            
            // Simple month preview with first day of week
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayOfWeek = new Date(year, month, 1).getDay();
            
            for (let day = 1; day <= Math.min(daysInMonth, 35); day++) {
                const date = new Date(year, month, day);
                // Fix timezone issue: create date string manually to avoid UTC conversion
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasEvents = eventsByDate[dateStr] && eventsByDate[dateStr].length > 0;
                const isToday = date.toDateString() === new Date().toDateString();
                
                // Debug logging for specific days that have events
                if (hasEvents) {
                    console.log(`Year view ${monthName} Day ${day} (${dateStr}): Found events:`, eventsByDate[dateStr].map(e => e.title));
                }
                
                html += `<div class="mini-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}" onclick="navigateToDay(${year}, ${month}, ${day})">${day}</div>`;
            }
            
            html += `</div></div>`;
        }
        
        html += `</div></div>`;
        return html;
    }
    
    function updateDateDisplay() {
        const display = document.getElementById('calendar-date-display');
        const filterType = document.getElementById('calendar-filter-type').value;
        
        switch (filterType) {
            case 'day':
                display.textContent = currentDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                break;
            case 'week':
                const startOfWeek = new Date(currentDate);
                const day = startOfWeek.getDay();
                const diff = startOfWeek.getDate() - day;
                startOfWeek.setDate(diff);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                
                display.textContent = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                break;
            case 'month':
                display.textContent = currentDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                });
                break;
            case 'year':
                display.textContent = currentDate.getFullYear().toString();
                break;
        }
    }
    
    function navigatePrevious() {
        const filterType = document.getElementById('calendar-filter-type').value;
        
        switch (filterType) {
            case 'day':
                currentDate.setDate(currentDate.getDate() - 1);
                break;
            case 'week':
                currentDate.setDate(currentDate.getDate() - 7);
                break;
            case 'month':
                currentDate.setMonth(currentDate.getMonth() - 1);
                break;
            case 'year':
                currentDate.setFullYear(currentDate.getFullYear() - 1);
                break;
        }
        
        loadCalendarEvents();
    }
    
    function navigateNext() {
        const filterType = document.getElementById('calendar-filter-type').value;
        
        switch (filterType) {
            case 'day':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
            case 'week':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            case 'month':
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
            case 'year':
                currentDate.setFullYear(currentDate.getFullYear() + 1);
                break;
        }
        
        loadCalendarEvents();
    }

    // Setup calendar event listeners
    function setupCalendarListeners() {
        // Filter change listeners
        document.getElementById('calendar-filter-type').addEventListener('change', loadCalendarEvents);
        document.getElementById('calendar-entry-type').addEventListener('change', loadCalendarEvents);
        document.getElementById('calendar-category').addEventListener('change', loadCalendarEvents);
        
        // Refresh button
        document.getElementById('refresh-calendar').addEventListener('click', loadCalendarEvents);
    }
    
    // Make functions globally accessible for onclick handlers
    window.showEventDetailsModal = showEventDetailsModal;
    window.deleteEvent = deleteEvent;
    window.saveEvent = saveEvent;
    window.showAssetDetails = showAssetDetails;
    window.showAnimalDetails = showAnimalDetails;
    window.handleCalendarEventClick = handleCalendarEventClick;
    window.navigateToDay = navigateToDay;
    window.openAddEventModal = openAddEventModal;
    window.loadCalendarEvents = loadCalendarEvents;
    
    // Photo Upload Functionality
    initializePhotoUpload();
});

function initializePhotoUpload() {
    const uploadArea = document.getElementById('animal-photo-upload');
    const fileInput = document.getElementById('animal-photo-input');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPlaceholder = document.getElementById('photo-placeholder');
    const addMoreBtn = document.getElementById('add-more-photos-btn');
    
    if (!uploadArea) return;
    
    // Store current animal photos
    window.currentAnimalPhotos = [];
    window.newPhotosToAdd = [];
    
    // Click to upload
    uploadArea.addEventListener('click', (e) => {
        if (e.target !== addMoreBtn && !e.target.closest('.photo-action-btn')) {
            fileInput.click();
        }
    });
    
    // File selection
    fileInput.addEventListener('change', handleFileSelect);
    
    // Add more photos button
    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });
    }
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleMultipleFiles(files);
        }
    });
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        handleMultipleFiles(files);
    }
}

function handleMultipleFiles(files) {
    const validFiles = files.filter(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert(`File "${file.name}" is not an image. Please select only image files.`);
            return false;
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
            return false;
        }
        
        return true;
    });
    
    if (validFiles.length > 0) {
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                addPhotoToGallery(e.target.result, file);
            };
            reader.readAsDataURL(file);
        });
    }
}

function addPhotoToGallery(imageSrc, file) {
    const photoGallery = document.getElementById('photo-gallery');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPlaceholder = document.getElementById('photo-placeholder');
    
    // Show gallery container
    photoPreviewContainer.style.display = 'block';
    photoPlaceholder.style.display = 'none';
    
    // Create photo item
    const photoItem = document.createElement('div');
    photoItem.className = 'photo-item';
    photoItem.innerHTML = `
        <img src="${imageSrc}" alt="${file.name}">
        <div class="photo-actions">
            <button class="photo-action-btn delete" onclick="removePhotoFromGallery(this, '${file.name}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    
    // Store file data
    photoItem.dataset.file = file.name;
    photoItem.dataset.size = file.size;
    photoItem.dataset.type = file.type;
    photoItem.dataset.src = imageSrc;
    
    photoGallery.appendChild(photoItem);
    
    // Add to new photos array
    window.newPhotosToAdd = window.newPhotosToAdd || [];
    window.newPhotosToAdd.push(file);
}

function removePhotoFromGallery(button, filename) {
    const photoItem = button.closest('.photo-item');
    const photoGallery = document.getElementById('photo-gallery');
    
    // Remove from new photos array
    window.newPhotosToAdd = window.newPhotosToAdd.filter(f => f.name !== filename);
    
    // Remove from DOM
    photoGallery.removeChild(photoItem);
    
    // Hide gallery if empty
    if (photoGallery.children.length === 0) {
        resetPhotoUpload();
    }
}

function resetPhotoUpload() {
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPlaceholder = document.getElementById('photo-placeholder');
    const photoGallery = document.getElementById('photo-gallery');
    const fileInput = document.getElementById('animal-photo-input');
    
    photoPreviewContainer.style.display = 'none';
    photoPlaceholder.style.display = 'block';
    photoGallery.innerHTML = '';
    fileInput.value = '';
    
    // Clear stored data
    window.currentAnimalPhotos = [];
    window.newPhotosToAdd = [];
}

async function uploadAnimalPhotos(animalId) {
    const newPhotos = window.newPhotosToAdd || [];
    
    if (newPhotos.length === 0) {
        return; // No photos to upload
    }
    
    // Upload each photo
    for (const file of newPhotos) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch(`/api/animal/${animalId}/photo`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                console.error(`Failed to upload ${file.name}:`, await response.text());
            } else {
                console.log(`Successfully uploaded ${file.name}`);
            }
        } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
        }
    }
}

async function loadAnimalPhotos(animalId) {
    try {
        const response = await fetch(`/api/animal/${animalId}/photos`);
        if (response.ok) {
            const photos = await response.json();
            
            if (photos.length > 0) {
                const photoGallery = document.getElementById('photo-gallery');
                const photoPreviewContainer = document.getElementById('photo-preview-container');
                const photoPlaceholder = document.getElementById('photo-placeholder');
                
                // Show gallery container
                photoPreviewContainer.style.display = 'block';
                photoPlaceholder.style.display = 'none';
                
                // Clear existing gallery
                photoGallery.innerHTML = '';
                
                // Add each photo to gallery
                for (const photo of photos) {
                    const photoItem = document.createElement('div');
                    photoItem.className = 'photo-item';
                    photoItem.innerHTML = `
                        <img src="/api/animal/${animalId}/photo/${photo.id}" alt="${photo.filename}">
                        <div class="photo-actions">
                            <button class="photo-action-btn delete" onclick="deleteExistingPhoto(${animalId}, ${photo.id}, '${photo.filename}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    `;
                    
                    photoGallery.appendChild(photoItem);
                }
                
                // Store existing photos
                window.currentAnimalPhotos = photos;
            } else {
                resetPhotoUpload();
            }
        } else {
            resetPhotoUpload();
        }
    } catch (error) {
        console.log('Error loading photos for animal:', animalId, error);
        resetPhotoUpload();
    }
}

async function loadAnimalPhotosForDetails(animalId) {
    try {
        const response = await fetch(`/api/animal/${animalId}/photos`);
        if (response.ok) {
            const photos = await response.json();
            
            const detailsPhotoContainer = document.getElementById('animal-details-photos');
            
            if (photos.length > 0) {
                // Clear existing photos
                detailsPhotoContainer.innerHTML = '';
                
                // Add each photo to details gallery
                for (const photo of photos) {
                    const photoItem = document.createElement('div');
                    photoItem.className = 'photo-item';
                    photoItem.style.cssText = 'display: inline-block; margin: 5px; text-align: center;';
                    photoItem.innerHTML = `
                        <img src="/api/animal/${animalId}/photo/${photo.id}" alt="${photo.filename}" 
                             style="width: 150px; height: 150px; object-fit: cover; border-radius: 5px; border: 1px solid #ddd;">
                        <div style="font-size: 12px; color: #666; margin-top: 3px;">${photo.filename}</div>
                    `;
                    
                    detailsPhotoContainer.appendChild(photoItem);
                }
            } else {
                detailsPhotoContainer.innerHTML = '<div style="color: #666; font-style: italic;">No photos uploaded</div>';
            }
        } else {
            const detailsPhotoContainer = document.getElementById('animal-details-photos');
            detailsPhotoContainer.innerHTML = '<div style="color: #666; font-style: italic;">Error loading photos</div>';
        }
    } catch (error) {
        console.log('Error loading photos for animal details:', animalId, error);
        const detailsPhotoContainer = document.getElementById('animal-details-photos');
        detailsPhotoContainer.innerHTML = '<div style="color: #666; font-style: italic;">Error loading photos</div>';
    }
}

async function deleteExistingPhoto(animalId, photoId, filename) {
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
        try {
            const response = await fetch(`/api/animal/${animalId}/photo/${photoId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove photo from gallery
                const photoGallery = document.getElementById('photo-gallery');
                const photoItems = photoGallery.querySelectorAll('.photo-item');
                
                for (const item of photoItems) {
                    const deleteBtn = item.querySelector(`button[onclick*="${photoId}"]`);
                    if (deleteBtn) {
                        photoGallery.removeChild(item);
                        break;
                    }
                }
                
                // Update current photos array
                window.currentAnimalPhotos = window.currentAnimalPhotos.filter(p => p.id !== photoId);
                
                // Hide gallery if empty
                if (photoGallery.children.length === 0) {
                    resetPhotoUpload();
                }
                
                console.log(`Successfully deleted photo ${filename}`);
            } else {
                alert('Failed to delete photo');
            }
        } catch (error) {
            console.error('Error deleting photo:', error);
            alert('Error deleting photo');
        }
    }
}

function resetPhotoUpload() {
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPlaceholder = document.getElementById('photo-placeholder');
    const photoGallery = document.getElementById('photo-gallery');
    const fileInput = document.getElementById('animal-photo-input');
    
    photoPreviewContainer.style.display = 'none';
    photoPlaceholder.style.display = 'block';
    photoGallery.innerHTML = '';
    fileInput.value = '';
    
    // Clear stored data
    window.currentAnimalPhotos = [];
    window.newPhotosToAdd = [];
}
