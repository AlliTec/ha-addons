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
        
        // Get animals first - we'll derive types from the actual data
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
        
        // Clear existing tabs (except Add button which we'll add back)
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
                dataCells.forEach(cell => {
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
        console.log("Assets received:", assets.length);
        
        const addParentSelect = document.getElementById('add-asset-parent');
        const editParentSelect = document.getElementById('edit-asset-parent');
        
        if (!addParentSelect || !editParentSelect) {
            console.error("Parent asset select elements not found!");
            return;
        }
        
        // Clear existing options and add default option
        const defaultOption = '<option value="">No Parent Asset</option>';
        addParentSelect.innerHTML = defaultOption;
        editParentSelect.innerHTML = defaultOption;
        
        // Add all assets as potential parents
        assets.forEach(asset => {
            const option = document.createElement('option');
            option.value = asset.id;
            option.textContent = `${asset.name} (ID: ${asset.id})`;
            
            addParentSelect.appendChild(option);
            editParentSelect.appendChild(option.cloneNode(true));
        });
        
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
    document.getElementById('edit-health-status').value = 'Healthy';
    document.getElementById('edit-notes').value = '';
    document.getElementById('edit-dam-id').value = '';
    document.getElementById('edit-sire-id').value = '';
    document.getElementById('edit-features').value = '';
    document.getElementById('edit-photo-path').value = '';
    document.getElementById('edit-pic').value = '';
    document.getElementById('edit-status').value = 'Active';
    
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
                    <td class="property-cell">Photo Path:</td>
                    <td class="value-cell">${formatCell(animal.photo_path)}</td>
                </tr>
                <tr>
                    <td class="property-cell">PIC:</td>
                    <td class="value-cell">${formatCell(animal.pic)}</td>
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
        
        // Set the animal ID on the action buttons
        document.getElementById('update-animal-btn').dataset.animalId = animalId;
        document.getElementById('delete-animal-btn').dataset.animalId = animalId;
        
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
        document.getElementById('edit-health-status').value = animal.health_status || 'Healthy';
        document.getElementById('edit-notes').value = animal.notes || '';
        document.getElementById('edit-dam-id').value = animal.dam_id || '';
        document.getElementById('edit-sire-id').value = animal.sire_id || '';
        document.getElementById('edit-features').value = animal.features || '';
        document.getElementById('edit-photo-path').value = animal.photo_path || '';
        document.getElementById('edit-pic').value = animal.pic || '';
        document.getElementById('edit-status').value = animal.status || 'Active';
        
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

// Main initialization
document.addEventListener("DOMContentLoaded", async () => {
    console.log("script.js: DOMContentLoaded event fired.");
    
    // Initialize page
    await populateAnimalList();
    await populateFilterTabs();
    setupSectionTabs();
    
    // Set initial table width after data is loaded
    setTimeout(() => {
        setTableMinWidth('livestock');
    }, 300);

    // Function to setup section tabs
    function setupSectionTabs() {
        const sectionTabs = document.querySelectorAll('.section-tab');
        
        sectionTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const section = tab.dataset.section;
                
                // Remove active class from all section tabs
                sectionTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all sections and tables
                document.getElementById('livestock-section').style.display = 'none';
                document.getElementById('assets-section').style.display = 'none';
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

    async function openAddAssetForm() {
        // Reset form
        document.getElementById('add-asset-form').reset();
        
        // Set default values
        document.getElementById('add-asset-quantity').value = 1;
        document.getElementById('add-asset-status').value = 'operational';
        document.getElementById('add-asset-usage-type').value = 'hours';
        
        // Populate parent asset dropdown
        await populateParentAssetDropdowns();
        
        document.getElementById('add-asset-modal').style.display = 'block';
    }

    async function enableAssetEditMode(assetId) {
        try {
            const response = await fetch(`api/asset/${assetId}`);
            if (!response.ok) throw new Error('Failed to fetch asset details');
            
            const asset = await response.json();
            
            // Populate parent asset dropdown first
            await populateParentAssetDropdowns();
            
            // Populate form fields
            document.getElementById('edit-asset-id').value = asset.id;
            
            // Basic Information
            document.getElementById('edit-asset-name').value = asset.name || '';
            document.getElementById('edit-asset-category').value = asset.category || '';
            document.getElementById('edit-asset-make').value = asset.make || '';
            document.getElementById('edit-asset-model').value = asset.model || '';
            document.getElementById('edit-asset-serial').value = asset.serial_number || '';
            
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
                                <th>Task Description</th>
                                <th>Supplier</th>
                                <th>Cost</th>
                                <th>KM Reading</th>
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
                    
                    tableHtml += `
                        <tr>
                            <td>${date}</td>
                            <td>${record.task_description || 'N/A'}</td>
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

        // Handle maintenance history button
        if (target.closest('#view-maintenance-history-btn')) {
            const assetId = document.getElementById('edit-asset-btn').dataset.assetId;
            showMaintenanceHistory(assetId);
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
            target.closest('.close-maintenance-history-btn')) {
            
            const modal = target.closest('.modal');
            
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
                health_status: formData.get('health_status') || 'Healthy',
                notes: formData.get('notes'),
                dam_id: formData.get('dam_id') ? parseInt(formData.get('dam_id')) : null,
                sire_id: formData.get('sire_id') ? parseInt(formData.get('sire_id')) : null,
                features: formData.get('features'),
                photo_path: formData.get('photo_path'),
                pic: formData.get('pic'),
                dod: null, // Will be set based on status
                status: formData.get('status')
            };
            
            // Set dod if status is Deceased
            if (animalData.status === 'Deceased') {
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
                    const message = isUpdate ? 'Animal updated successfully!' : 'Animal added successfully!';
                    console.log('Success:', message, 'Response:', await response.json());
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

    // Maintenance Schedule Form Handler
    const maintenanceScheduleForm = document.getElementById('maintenance-schedule-form');
    if (maintenanceScheduleForm) {
        maintenanceScheduleForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            console.log('Maintenance schedule form submitted. Form data:', Object.fromEntries(formData));
            
            const maintenanceData = {
                asset_id: parseInt(formData.get('asset_id')),
                task_description: formData.get('task_description'),
                due_date: formData.get('due_date') || null,
                completed_date: formData.get('completed_date') || null,
                status: formData.get('status') || 'pending',
                is_unscheduled: formData.get('is_unscheduled') === 'true',
                maintenance_trigger_type: formData.get('maintenance_trigger_type'),
                maintenance_trigger_value: formData.get('maintenance_trigger_value') ? parseInt(formData.get('maintenance_trigger_value')) : null,
                last_maintenance_usage: formData.get('last_maintenance_usage') ? parseFloat(formData.get('last_maintenance_usage')) : null,
                meter_reading: formData.get('meter_reading') ? parseInt(formData.get('meter_reading')) : null,
                interval_type: formData.get('interval_type'),
                interval_value: formData.get('interval_value') ? parseInt(formData.get('interval_value')) : null,
                cost: formData.get('cost') ? parseFloat(formData.get('cost')) : null,
                supplier: formData.get('supplier'),
                invoice_number: formData.get('invoice_number'),
                notes: formData.get('notes')
            };
            
            try {
                const response = await fetch('api/maintenance-schedule', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(maintenanceData),
                });
                
                if (response.ok) {
                    alert('Maintenance schedule saved successfully!');
                    document.getElementById('maintenance-schedule-modal').style.display = 'none';
                    // TODO: Refresh maintenance calendar when implemented
                } else {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    try {
                        const error = JSON.parse(errorText);
                        alert(`Error saving maintenance schedule: ${error.detail}`);
                    } catch (e) {
                        alert(`Error saving maintenance schedule: ${errorText}`);
                    }
                }
            } catch (error) {
                console.error('Error saving maintenance schedule:', error);
                alert('Error saving maintenance schedule. Please try again.');
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
            
            const assetData = {
                // Basic Information
                name: formData.get('name'),
                category: formData.get('category'),
                make: formData.get('make'),
                model: formData.get('model'),
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
                const response = await fetch(`api/asset/${assetId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(assetData),
                });
                
                if (response.ok) {
                    alert('Asset updated successfully!');
                    document.getElementById('edit-asset-modal').style.display = 'none';
                    
                    // Check if we should return to parent view
                    const detailsModal = document.getElementById('asset-details-modal');
                    if (detailsModal.dataset.returnToParent) {
                        const returnToParentId = detailsModal.dataset.returnToParent;
                        delete detailsModal.dataset.returnToParent;
                        showAssetDetails(returnToParentId);
                    } else {
                        populateAssetList();
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



});
