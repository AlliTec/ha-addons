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

// Function to populate filter tabs dynamically
async function populateFilterTabs() {
    try {
        console.log("Populating filter tabs...");
        
        // Get animal types first
        console.log("Fetching animal types...");
        const animalTypesResponse = await fetch("/api/animal-types");
        console.log("Animal types response status:", animalTypesResponse.status);
        
        if (!animalTypesResponse.ok) {
            console.error("Failed to fetch animal types, using fallback");
            // Fallback to basic types if API fails
            const animalTypes = ["All", "Cattle", "Dog"];
        } else {
            const animalTypes = await animalTypesResponse.json();
            console.log("Available animal types:", animalTypes);
        }
        
        // Get animals for counting
        console.log("Fetching animals for counting...");
        const animalsResponse = await fetch("/get_animals");
        console.log("Animals response status:", animalsResponse.status);
        
        if (!animalsResponse.ok) {
            console.error("Failed to fetch animals");
            return;
        }
        
        const allAnimals = await animalsResponse.json();
        console.log("All animals:", allAnimals);
        
        const filterBar = document.getElementById("filter-bar");
        if (!filterBar) {
            console.error("Filter bar not found!");
            return;
        }
        
        // Clear existing tabs (except Add button which we'll add back)
        filterBar.innerHTML = '';
        
        // Count animals by type
        const animalCounts = {};
        allAnimals.forEach(animal => {
            const type = animal.animal_type || 'Unknown';
            animalCounts[type] = (animalCounts[type] || 0) + 1;
        });
        
        // Add "All" tab with total count
        const allButton = document.createElement("button");
        allButton.className = "filter-btn active";
        allButton.dataset.filter = "All";
        
        const allIcon = document.createElement("i");
        allIcon.className = "fa-solid fa-border-all";
        
        const allCount = document.createElement("sup");
        allCount.style.cssText = "font-size: 0.7em; margin-left: 2px; color: var(--accent-color);";
        allCount.textContent = `(${allAnimals.length})`;
        
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
            count.textContent = `(${animalCounts[animalType] || 0})`;
            
            const text = document.createTextNode(` ${animalType}`);
            
            button.appendChild(icon);
            button.appendChild(text);
            button.appendChild(count);
            filterBar.appendChild(button);
        });
        
        // Always add "Add" tab as the last tab (no count)
        const addButton = document.createElement("button");
        addButton.className = "filter-btn add-btn";
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
        
        const filteredAnimals = filter === "All" ? animals : animals.filter(animal => animal.animal_type === filter);
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
                <td class="details-cell">
                    <i class="fa-solid fa-circle-info details-icon" data-id="${animal.id}" aria-label="View Details"></i>
                </td>
            `;

            tableBody.appendChild(row);
        });
        
        console.log("Table population completed");
    } catch (error) {
        console.error("Error in populateAnimalList:", error);
    }
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
        'Llama': [
            { value: 'Stud', text: 'Stud (male)' },
            { value: 'Gelding', text: 'Gelding (castrated male)' },
            { value: 'Female', text: 'Female' }
        ],
        'Alpaca': [
            { value: 'Stud', text: 'Stud (male)' },
            { value: 'Gelding', text: 'Gelding (castrated male)' },
            { value: 'Female', text: 'Female' }
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

document.addEventListener("DOMContentLoaded", async () => {
    console.log("script.js: DOMContentLoaded event fired.");
    populateAnimalList();
    populateFilterTabs();
    
    const filterBar = document.getElementById("filter-bar");
    const animalListTable = document.querySelector("#livestock-list");
    if (!animalListTable) {
        console.error("script.js: Could not find table with ID #livestock-list.");
        return;
    }
    console.log("script.js: Found table element:", animalListTable);
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
    if (filterBar) {
        filterBar.addEventListener('click', async (event) => {
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

    animalListTable.addEventListener("click", async (event) => {
        const target = event.target;

        // Handle details icon click
        if (target.classList.contains('details-icon')) {
            const animalId = target.dataset.id;
            await showAnimalDetails(animalId);
            return;
        }

        // Handle row click for animal details (anywhere on row except details icon)
        if (target.closest('tr') && !target.classList.contains('details-icon')) {
            const row = target.closest('tr');
            const animalId = row.dataset.animalId;
            await showAnimalDetails(animalId);
            return;
        }
    });

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
            response = await fetch(`/update_animal/${animalId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(animalData)
            });
        } else {
            // Add new animal
            response = await fetch('/add_animal', {
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
        } else {
            const error = await response.json();
            const action = isUpdate ? 'updating' : 'adding';
            console.error('Error:', error);
            alert(`Error ${action} animal: ${error.detail}`);
        }
    } catch (error) {
        console.error('Error saving animal:', error);
        alert('Error saving animal. Please try again.');
    }
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
            <div>Tag ID:</div><div>${formatCell(animal.tag_id)}</div>
            <div>Name:</div><div>${formatCell(animal.name)}</div>
            <div>Gender:</div><div>${formatCell(animal.gender)}</div>
            <div>Breed:</div><div>${formatCell(animal.breed)}</div>
            <div>Birth Date:</div><div>${formatCell(animal.birth_date)}</div>
            <div>Age:</div><div>${calculateAge(animal.birth_date)}</div>
            <div>Health Status:</div><div>${formatCell(animal.health_status)}</div>
            <div>Status:</div><div>${getStatusIcon(animal.status)} ${formatCell(animal.status)}</div>
            <div>Notes:</div><div>${formatCell(animal.notes)}</div>
            <div>Dam:</div><div>${formatCell(animal.dam_name)}</div>
            <div>Sire:</div><div>${formatCell(animal.sire_name)}</div>
            <div>Features:</div><div>${formatCell(animal.features)}</div>
            <div>Date of Death:</div><div>${formatCell(animal.dod)}</div>
            <div style="grid-column: 1 / -1; margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
                <strong>Offspring:</strong>
            </div>
            <div style="grid-column: 1 / -1;">
                ${offspringHtml}
            </div>
        `;

        // Set animal ID on action buttons
        document.getElementById('update-animal-btn').dataset.animalId = animalId;
        document.getElementById('delete-animal-btn').dataset.animalId = animalId;

        // Show modal
        document.getElementById('animal-details-modal').style.display = "block";
        
    } catch (error) {
        console.error("Error showing animal details:", error);
        alert("Error loading animal details");
    }
}

    // Function to determine if gender is female
    function isFemale(gender) {
        if (!gender) return false;
        const femaleTerms = ['Cow', 'Heifer', 'Ewe', 'Nanny', 'Sow', 'Gilt', 'Mare', 'Filly', 'Jenny', 'Goose', 'Hen', 'Pullet', 'Doe', 'Queen', 'Bitch'];
        return femaleTerms.includes(gender);
    }
    
    // Function to determine if gender is male
    function isMale(gender) {
        if (!gender) return false;
        const maleTerms = ['Bull', 'Steer', 'Ram', 'Billy', 'Wether', 'Boar', 'Barrow', 'Stallion', 'Gelding', 'Colt', 'Jack', 'Gander', 'Drake', 'Tom', 'Rooster', 'Cockerel', 'Capon', 'Buck', 'Dog', 'Stud'];
        return maleTerms.includes(gender);
    }
    
    // Function to populate Dam/Sire dropdowns
    async function populateParentDropdowns() {
        try {
            const response = await fetch('/api/animals');
            const animals = await response.json();
            
            const damSelect = document.getElementById('edit-dam-id');
            const sireSelect = document.getElementById('edit-sire-id');
            
            // Clear existing options except first one
            damSelect.innerHTML = '<option value="">Select Dam</option>';
            sireSelect.innerHTML = '<option value="">Select Sire</option>';
            
            // Filter and add animals to appropriate dropdowns
            animals.forEach(animal => {
                if (isFemale(animal.gender)) {
                    const optionDam = document.createElement('option');
                    optionDam.value = animal.id;
                    optionDam.textContent = `${animal.name} (${animal.gender})`;
                    damSelect.appendChild(optionDam);
                }
                
                if (isMale(animal.gender)) {
                    const optionSire = document.createElement('option');
                    optionSire.value = animal.id;
                    optionSire.textContent = `${animal.name} (${animal.gender})`;
                    sireSelect.appendChild(optionSire);
                }
            });
        } catch (error) {
            console.error('Error populating parent dropdowns:', error);
        }
    }

    // Function to open add animal form
    async function openAddAnimalForm() {
        // Clear the edit form for new animal
        document.getElementById('edit-animal-id').value = '';
        document.getElementById('edit-tag-id').value = '';
        document.getElementById('edit-name').value = '';
        document.getElementById('edit-breed').value = '';
        document.getElementById('edit-date-of-birth').value = '';
        document.getElementById('edit-features').value = '';
        document.getElementById('edit-health-status').value = '';
        document.getElementById('edit-photo-path').value = '';
        document.getElementById('edit-pic').value = '';
        document.getElementById('edit-category').value = '';
        document.getElementById('edit-status').value = 'Active';
        document.getElementById('edit-notes').value = '';
        
        // Reset gender options to default
        updateGenderOptions('');
        
        // Populate parent dropdowns
        await populateParentDropdowns();
        
        // Show edit modal with "Add Animal" title
        const editModal = document.getElementById('edit-animal-modal');
        const modalTitle = editModal.querySelector('h2');
        if (modalTitle) {
            modalTitle.textContent = 'Add New Animal';
        }
        
        // Change save button text
        const saveButton = document.querySelector('#edit-animal-form button[type="submit"]');
        if (saveButton) {
            saveButton.innerHTML = '<i class="fa-solid fa-save"></i> Add Animal';
        }
        
        editModal.style.display = "block";
    }

    // Function to enable edit mode
async function enableEditMode(animalId) {
    try {
        // Fetch current animal data
        const response = await fetch(`get_animal/${animalId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const animal = await response.json();
        
        // Populate parent dropdowns first
        await populateParentDropdowns();
        
        // Populate the edit form
        document.getElementById('edit-animal-id').value = animal.id;
        document.getElementById('edit-tag-id').value = animal.tag_id || '';
        document.getElementById('edit-name').value = animal.name || '';
        document.getElementById('edit-breed').value = animal.breed || '';
        document.getElementById('edit-date-of-birth').value = animal.birth_date ? animal.birth_date.split('T')[0] : '';
        document.getElementById('edit-features').value = animal.features || '';
        document.getElementById('edit-dam-id').value = animal.dam_id || '';
        document.getElementById('edit-sire-id').value = animal.sire_id || '';
        document.getElementById('edit-health-status').value = animal.health_status || '';
        document.getElementById('edit-photo-path').value = animal.photo_path || '';
        document.getElementById('edit-pic').value = animal.pic || '';
        document.getElementById('edit-category').value = animal.category || '';
        document.getElementById('edit-status').value = animal.status || 'Active';
        document.getElementById('edit-notes').value = animal.notes || '';
        
        // Set gender options based on category first, then set the current gender value
        let category = animal.category || '';
        
        // If no category, try to detect from gender
        if (!category && animal.gender) {
            if (animal.gender === 'Cow' || animal.gender === 'Bull' || animal.gender === 'Steer' || animal.gender === 'Heifer') {
                category = 'Cattle';
            } else if (animal.gender === 'Tom' || animal.gender === 'Queen') {
                category = 'Cat';
            } else if (animal.gender === 'Dog' || animal.gender === 'Bitch') {
                category = 'Dog';
            } else if (animal.gender === 'Ram' || animal.gender === 'Ewe' || animal.gender === 'Wether') {
                category = 'Sheep';
            } else if (animal.gender === 'Billy' || animal.gender === 'Nanny' || animal.gender === 'Wether') {
                category = 'Goat';
            } else if (animal.gender === 'Boar' || animal.gender === 'Sow' || animal.gender === 'Barrow' || animal.gender === 'Gilt') {
                category = 'Pig';
            }
            // Update the category dropdown to match detected type
            document.getElementById('edit-category').value = category;
        }
        
        console.log("Edit mode - Category:", category, "Animal data:", animal);
        updateGenderOptions(category);
        
        // Set gender after options are populated
        setTimeout(() => {
            document.getElementById('edit-gender').value = animal.gender || '';
        }, 100);
        
        // Hide details modal and show edit modal
        document.getElementById('animal-details-modal').style.display = "none";
        document.getElementById('edit-animal-modal').style.display = "block";
        
    } catch (error) {
        console.error("Error loading animal data for edit:", error);
        alert("Error loading animal data. Please try again.");
    }
}
