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
        allIcon.className = "fa-solid fa-border-all";
        
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
        
        console.log("Table population completed");
    } catch (error) {
        console.error("Error in populateAnimalList:", error);
    }
}

// Function to populate parent dropdowns
async function populateParentDropdowns() {
    console.log("populateParentDropdowns called");
    try {
        const response = await fetch('/api/animals');
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
        
        // Clear existing options except the first one
        damSelect.innerHTML = '<option value="">Select Dam</option>';
        sireSelect.innerHTML = '<option value="">Select Sire</option>';
        
        // Add all female animals as potential dams
        const femaleAnimals = allAnimals.filter(animal => 
            animal.status === 'Active' && 
            ['cow', 'heifer', 'ewe', 'doe', 'nanny', 'sow', 'gilt', 'mare', 'filly', 'jenny', 'queen', 'hen', 'pullet', 'goose', 'duck'].includes(animal.gender?.toLowerCase())
        );
        console.log("Female animals found:", femaleAnimals.length);
        
        femaleAnimals.forEach(animal => {
            const option = document.createElement('option');
            option.value = animal.id;
            option.textContent = `${animal.name} (${animal.tag_id})`;
            damSelect.appendChild(option);
        });
        
        // Add all male animals as potential sires
        const maleAnimals = allAnimals.filter(animal => 
            animal.status === 'Active' && 
            ['bull', 'steer', 'ram', 'buck', 'billy', 'boar', 'barrow', 'stallion', 'gelding', 'colt', 'jack', 'tom', 'rooster', 'cockerel', 'drake', 'gander'].includes(animal.gender?.toLowerCase())
        );
        console.log("Male animals found:", maleAnimals.length);
        
        maleAnimals.forEach(animal => {
            const option = document.createElement('option');
            option.value = animal.id;
            option.textContent = `${animal.name} (${animal.tag_id})`;
            sireSelect.appendChild(option);
        });
        
        console.log("Dam select options count:", damSelect.options.length - 1);
        console.log("Sire select options count:", sireSelect.options.length - 1);
        
    } catch (error) {
        console.error("Error populating parent dropdowns:", error);
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
        
    } catch (error) {
        console.error("Error loading animal data for edit:", error);
        alert("Error loading animal data. Please try again.");
    }
}

// Main initialization
document.addEventListener("DOMContentLoaded", async () => {
    console.log("script.js: DOMContentLoaded event fired.");
    
    // Initialize page
    populateAnimalList();
    populateFilterTabs();

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

        // Handle close buttons
        if (target.closest('.close-details-btn')) {
            document.getElementById('animal-details-modal').style.display = "none";
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
});