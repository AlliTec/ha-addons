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


document.addEventListener("DOMContentLoaded", async () => {
    console.log("script.js: DOMContentLoaded event fired.");

    // First populate filter tabs dynamically
    await populateFilterTabs();
    
    // Then populate the animal list
    populateAnimalList();

    // Set up filter bar event listener (using event delegation)
    const filterBar = document.getElementById("filter-bar");
    filterBar.addEventListener("click", (event) => {
        const target = event.target.closest(".filter-btn");
        if (target) {
            const filter = target.dataset.filter;
            const activeButtons = document.querySelectorAll(".filter-btn.active");
            activeButtons.forEach(btn => btn.classList.remove("active"));
            target.classList.add("active");
            populateAnimalList(filter);
        }
    });

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
            animalDetailsModal.style.display = "none";
            modal.style.display = "none";
        }
    });

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
    });
});

// Function to show animal details in modal
async function showAnimalDetails(animalId) {
    try {
        const response = await fetch(`/get_animal/${animalId}`);
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

// Function to enable edit mode (placeholder for now)
async function enableEditMode(animalId) {
    alert("Edit functionality will be implemented in the next update. For now, you can use the existing inline editing by closing this modal and clicking the edit button in the table.");
    document.getElementById('animal-details-modal').style.display = "none";
}
