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
        const response = await fetch("api/animal-types");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const animalTypes = await response.json();
        console.log("Available animal types:", animalTypes);
        
        const filterBar = document.getElementById("filter-bar");
        if (!filterBar) {
            console.error("Filter bar not found!");
            return;
        }
        
        filterBar.innerHTML = ""; // Clear existing tabs
        
        animalTypes.forEach((animalType, index) => {
            const button = document.createElement("button");
            button.className = "filter-btn";
            if (index === 0) button.classList.add("active"); // First tab (All) is active
            button.dataset.filter = animalType;
            
            const icon = document.createElement("i");
            icon.className = `fa-solid ${getAnimalIcon(animalType)}`;
            
            const text = document.createTextNode(` ${animalType}`);
            
            button.appendChild(icon);
            button.appendChild(text);
            filterBar.appendChild(button);
        });
        
        console.log("Filter tabs populated successfully");
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
            { value: 'Steer', text: 'Steer (castrated male)' },
            { value: 'Bull', text: 'Bull (intact male)' },
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
            { value: 'Buck', text: 'Buck (male)' },
            { value: 'Doe', text: 'Doe (female)' },
            { value: 'Wether', text: 'Wether (castrated male)' }
        ],
        'Pig': [
            { value: 'Boar', text: 'Boar (male)' },
            { value: 'Sow', text: 'Sow (female)' },
            { value: 'Barrow', text: 'Barrow (castrated male)' },
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
        'Fowl': [
            { value: 'Rooster', text: 'Rooster (male)' },
            { value: 'Cockerel', text: 'Cockerel (young male)' },
            { value: 'Hen', text: 'Hen (female)' },
            { value: 'Pullet', text: 'Pullet (young female)' },
            { value: 'Capon', text: 'Capon (castrated male)' }
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
});

// Handle edit animal form submission
const editForm = document.getElementById('edit-animal-form');
if (editForm) {
    editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const animalId = document.getElementById('edit-animal-id').value;
    const formData = new FormData(event.target);
    
    const animalData = {
        tag_id: formData.get('tag_id'),
        name: formData.get('name'),
        gender: formData.get('gender'),
        breed: formData.get('breed'),
        birth_date: formData.get('date_of_birth') || null,
        health_status: 'Healthy', // Default value
        notes: formData.get('notes'),
        dam_id: null, // Not implemented in form yet
        sire_id: null, // Not implemented in form yet
        features: formData.get('color'),
        photo_path: null, // Not implemented in form yet
        pic: null, // Not implemented in form yet
        dod: null, // Will be set based on status
        status: formData.get('status')
    };
    
    // Set dod if status is Deceased
    if (animalData.status === 'Deceased') {
        animalData.dod = new Date().toISOString().split('T')[0];
    }
    
    try {
        const response = await fetch(`/update_animal/${animalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(animalData)
        });
        
        if (response.ok) {
            alert('Animal updated successfully!');
            document.getElementById('edit-animal-modal').style.display = "none";
            populateAnimalList(); // Refresh the animal list
        } else {
            const error = await response.json();
            alert(`Error updating animal: ${error.detail}`);
        }
    } catch (error) {
        console.error('Error updating animal:', error);
        alert('Error updating animal. Please try again.');
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

// Function to enable edit mode
async function enableEditMode(animalId) {
    try {
        // Fetch current animal data
        const response = await fetch(`get_animal/${animalId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const animal = await response.json();
        
        // Populate the edit form
        document.getElementById('edit-animal-id').value = animal.id;
        document.getElementById('edit-tag-id').value = animal.tag_id || '';
        document.getElementById('edit-name').value = animal.name || '';
        document.getElementById('edit-breed').value = animal.breed || '';
        document.getElementById('edit-date-of-birth').value = animal.birth_date ? animal.birth_date.split('T')[0] : '';
        document.getElementById('edit-color').value = animal.features || '';
        document.getElementById('edit-weight').value = animal.weight || '';
        document.getElementById('edit-price').value = animal.price || '';
        document.getElementById('edit-category').value = animal.category || '';
        document.getElementById('edit-status').value = animal.status || 'Active';
        document.getElementById('edit-notes').value = animal.notes || '';
        
        // Set gender options based on category first, then set the current gender value
        const category = animal.category || '';
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
