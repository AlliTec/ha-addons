function formatCell(value) {
    return value === null || value === undefined ? "" : value;
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

async function populateAnimalList(filter = "All") {
    const response = await fetch("get_animals");
    const animals = await response.json();
    const filteredAnimals = filter === "All" ? animals : animals.filter(animal => animal.animal_type === filter);
    const tableBody = document.querySelector("#livestock-list tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    filteredAnimals.forEach(animal => {
        const row = document.createElement("tr");
        row.dataset.animalId = animal.id;

        // Name
        const nameCell = document.createElement("td");
        nameCell.textContent = formatCell(animal.name);
        row.appendChild(nameCell);

        // Gender
        const genderCell = document.createElement("td");
        genderCell.textContent = formatCell(animal.gender);
        row.appendChild(genderCell);

        // Status
        const statusCell = document.createElement("td");
        statusCell.innerHTML = getStatusIcon(animal.status);
        row.appendChild(statusCell);

        // Age
        const ageCell = document.createElement("td");
        ageCell.textContent = calculateAge(animal.birth_date);
        row.appendChild(ageCell);

        // Actions
        const actionsCell = document.createElement("td");
        actionsCell.innerHTML = `
            <button class="edit-btn" data-id="${animal.id}"><i class="fa-solid fa-pencil" aria-label="Edit"></i></button>
            <button class="delete-btn" data-id="${animal.id}"><i class="fa-solid fa-trash-can" aria-label="Delete"></i></button>
        `;
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    console.log("script.js: DOMContentLoaded event fired.");

    populateAnimalList();

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

        if (target.closest('tr') && !target.closest('button') && !target.classList.contains('pic-icon')) {
            const row = target.closest('tr');
            const animalId = row.dataset.animalId;
            const response = await fetch(`/get_animal/${animalId}`);
            const animal = await response.json();

            animalDetailsContent.innerHTML = `
                <div>Tag ID:</div><div>${formatCell(animal.tag_id)}</div>
                <div>Breed:</div><div>${formatCell(animal.breed)}</div>
                <div>Birth Date:</div><div>${formatCell(animal.birth_date)}</div>
                <div>Health Status:</div><div>${formatCell(animal.health_status)}</div>
                <div>Notes:</div><div>${formatCell(animal.notes)}</div>
                <div>Dam:</div><div>${formatCell(animal.dam_name)}</div>
                <div>Sire:</div><div>${formatCell(animal.sire_name)}</div>
                <div>Features:</div><div>${formatCell(animal.features)}</div>
                <div>DOD:</div><div>${formatCell(animal.dod)}</div>
            `;
            animalDetailsModal.style.display = "block";
        }

    animalListTable.addEventListener("click", async (event) => {
        const target = event.target;

        if (target.classList.contains('pic-icon')) {
            const picPath = target.dataset.picPath;
            if (picPath) {
                modalImg.src = picPath;
                modal.style.display = "block";
            } else {
                const animalId = target.dataset.animalId;
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.onchange = async (e) => {
                    const file = e.target.files[0];
                    const formData = new FormData();
                    formData.append('file', file);
                    const response = await fetch(`/upload_image/${animalId}`, {
                        method: 'POST',
                        body: formData
                    });
                    if (response.ok) {
                        alert('Image uploaded successfully!');
                        populateAnimalList();
                    } else {
                        alert('Error uploading image.');
                    }
                };
                fileInput.click();
            }
            return; // Stop further execution
        }

        const button = target.closest('button');
        if (!button) return; // Exit if the click was not on a button

        if (button.classList.contains("delete-btn")) {
            const animalId = button.dataset.id;
            if (confirm("Are you sure you want to delete this animal?")) {
                const response = await fetch(`delete_animal/${animalId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    alert("Animal deleted successfully!");
                    populateAnimalList();
                } else {
                    const error = await response.json();
                    alert(`Error: ${error.detail}`);
                }
            }
        }

        if (button.classList.contains("add-btn")) {
            const response = await fetch("api/animals");
            const animals = await response.json();
            const row = button.closest("tr");
            const cells = row.querySelectorAll("td");
            
            row.originalValues = [];
            cells.forEach((cell, index) => {
                row.originalValues.push(cell.innerHTML);
                if (index < cells.length - 2) { // Exclude the last two cells (actions)
let input;
                     if (index === 3) { // birth_date
                         input = document.createElement("input");
                         input.type = "date";
                     } else if (index === 12) { // dod
                         input = document.createElement("input");
                         input.type = "date";
                      } else if (index === 4) { // gender
                          input = document.createElement("select");
                          const options = ["Cock", "Hen", "Dog", "Bitch", "Cow", "Bull", "Steer", "Heifer", "Queen", "Tom"];
                         options.forEach(optionValue => {
                             const option = document.createElement("option");
                             option.value = optionValue;
                             option.textContent = optionValue;
                             input.appendChild(option);
                         });
                     } else if (index === 9) { // status
                         input = document.createElement("select");
                         const options = ["On Property", "Deceased", "Sold"];
                         options.forEach(optionValue => {
                             const option = document.createElement("option");
                             option.value = optionValue;
                             option.textContent = optionValue;
                             input.appendChild(option);
                         });
                     } else if (index === 6) { // notes
                         input = document.createElement("textarea");
                     } else if (index === 7) { // dam_id
                         input = document.createElement("select");
                         const dams = animals.filter(animal => ["Cow", "Hen", "Bitch"].includes(animal.gender));
                         dams.forEach(dam => {
                             const option = document.createElement("option");
                             option.value = dam.id;
                             option.textContent = dam.name;
                             input.appendChild(option);
                         });
                     } else if (index === 8) { // sire_id
                         input = document.createElement("select");
                         const sires = animals.filter(animal => ["Bull", "Dog", "Cock"].includes(animal.gender));
                         sires.forEach(sire => {
                             const option = document.createElement("option");
                             option.value = sire.id;
                             option.textContent = sire.name;
                             input.appendChild(option);
                         });
                     } else {
                         input = document.createElement("input");
                         input.type = "text";
                     }
                    input.classList.add("inline-edit-input");
                    cell.innerHTML = "";
                    cell.appendChild(input);
                }
            });

            const addBtn = row.querySelector(".add-btn");
            addBtn.innerHTML = "<i class=\"fa-solid fa-save\" aria-label=\"Save\"></i>";
            addBtn.classList.remove("add-btn");
            addBtn.classList.add("save-add-btn");
            const cancelBtn = document.createElement("button");
            cancelBtn.innerHTML = "<i class=\"fa-solid fa-xmark\" aria-label=\"Cancel\"></i>";
            cancelBtn.classList.add("cancel-add-btn");
            row.querySelector("td:last-child").appendChild(cancelBtn);
            return;
        }

        if (button.classList.contains("save-add-btn")) {
            const row = button.closest("tr");
            const cells = row.querySelectorAll("td");
            const animalData = {};
            const allFields = ["id", "tag_id", "name", "breed", "birth_date", "gender", "health_status", "notes", "dam_id", "sire_id", "status", "features", "photo_path", "pic", "dod"];
            cells.forEach((cell, index) => {
                if (index < cells.length - 2) {
                    const input = cell.querySelector("input, select, textarea");
                    animalData[allFields[index]] = input ? input.value : "";
                }
            });

            const damId = parseInt(animalData.dam_id);
            const sireId = parseInt(animalData.sire_id);
            const pydanticFields = {
                "tag_id": animalData.tag_id,
                "name": animalData.name,
                "gender": animalData.gender,
                "breed": animalData.breed,
                "birth_date": animalData.birth_date,
                "health_status": animalData.health_status,
                "notes": animalData.notes,
                "dam_id": isNaN(damId) ? null : damId,
                "sire_id": isNaN(sireId) ? null : sireId,
                "features": animalData.features,
                "photo_path": animalData.photo_path,
                "pic": animalData.pic,
                "dod": animalData.dod
            };

            const response = await fetch("add_animal", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(pydanticFields)
            });
            if (response.ok) {
                alert("Animal added successfully!");
                populateAnimalList();
                const addRow = document.querySelector(".empty-row");
                const addCells = addRow.querySelectorAll("td");
                addCells.forEach(cell => cell.innerHTML = "");
                const saveBtn = addRow.querySelector(".save-add-btn");
                saveBtn.innerHTML = "<i class=\"fa-solid fa-plus-circle\" aria-label=\"Add\"></i>";
                saveBtn.classList.remove("save-add-btn");
                saveBtn.classList.add("add-btn");
                const cancelBtn = addRow.querySelector(".cancel-add-btn");
                cancelBtn.remove();

            } else {
                const error = await response.json();
                alert(`Error: ${error.detail}`);
            }
        }

        if (button.classList.contains("cancel-add-btn")) {
            const row = button.closest("tr");
            const cells = row.querySelectorAll("td");
            cells.forEach((cell, index) => {
                cell.innerHTML = row.originalValues[index];
            });
        }

        if (button.classList.contains("edit-btn")) {
            console.log("script.js: 'Edit' button clicked.");
            const row = button.closest("tr");
            if (!row) {
                console.error("script.js: Could not find parent row for edit button.");
                return;
            }
            console.log("script.js: Found row:", row);
            const cells = row.querySelectorAll("td");
            console.log(`script.js: Found ${cells.length} cells in the row.`);

            const response = await fetch("api/animals");
            const animals = await response.json();

            row.originalValues = [];
            cells.forEach((cell, index) => {
                console.log(`script.js: Processing cell ${index}...`);
                if (index > 0 && index < cells.length - 2) { // Exclude ID and actions
                    const currentValue = cell.textContent.trim();
                    console.log(`script.js: Cell ${index} current value: '${currentValue}'`);
                    row.originalValues.push(currentValue);
                    
let input;
                     if (index === 4) { // birth_date
                         input = document.createElement("input");
                         input.type = "date";
                         if (currentValue && currentValue !== 'null') {
                             input.value = new Date(currentValue).toISOString().split('T')[0];
                         }
                     } else if (index === 13) { // dod
                         input = document.createElement("input");
                         input.type = "date";
                         if (row.querySelector('td:nth-child(10)').textContent.trim() === 'Deceased') {
                             input.value = new Date().toISOString().split('T')[0];
                         } else if (currentValue && currentValue !== 'null') {
                             input.value = new Date(currentValue).toISOString().split('T')[0];
                         }
                     } else if (index === 5) { // gender
                         input = document.createElement("select");
                         const options = ["Cock", "Hen", "Dog", "Bitch", "Cow", "Bull", "Steer", "Heifer"];
                         options.forEach(optionValue => {
                             const option = document.createElement("option");
                             option.value = optionValue;
                             option.textContent = optionValue;
                             if (optionValue === currentValue) {
                                 option.selected = true;
                             }
                             input.appendChild(option);
                         });
                     } else if (index === 10) { // status
                         input = document.createElement("select");
                         const options = ["On Property", "Deceased", "Sold"];
                         options.forEach(optionValue => {
                             const option = document.createElement("option");
                             option.value = optionValue;
                             option.textContent = optionValue;
                             if (optionValue === currentValue) {
                                 option.selected = true;
                             }
                             input.appendChild(option);
                         });
                     } else if (index === 7) { // notes
                         input = document.createElement("textarea");
                         input.value = currentValue;
                      } else if (index === 8) { // dam_id
                          input = document.createElement("select");
                          const dams = animals.filter(animal => ["Cow", "Hen", "Bitch", "Queen"].includes(animal.gender));
                         dams.forEach(dam => {
                             const option = document.createElement("option");
                             option.value = dam.id;
                             option.textContent = dam.name;
                             if (dam.id == currentValue) {
                                 option.selected = true;
                             }
                             input.appendChild(option);
                         });
                     } else if (index === 9) { // sire_id
                         input = document.createElement("select");
                         const sires = animals.filter(animal => ["Bull", "Dog", "Cock"].includes(animal.gender));
                         sires.forEach(sire => {
                             const option = document.createElement("option");
                             option.value = sire.id;
                             option.textContent = sire.name;
                             if (sire.id == currentValue) {
                                 option.selected = true;
                             }
                             input.appendChild(option);
                         });
                     } else {
                         input = document.createElement("input");
                         input.type = "text";
                         input.value = currentValue;
                     }
                    input.classList.add("inline-edit-input");
                    
                    cell.replaceChildren(input);
                    console.log(`script.js: Cell ${index} replaced with an input field.`);
                } else {
                    row.originalValues.push(cell.textContent.trim());
                    console.log(`script.js: Cell ${index} is the action/id cell, skipping.`);
                }
            });

            // Change buttons
            const editBtn = row.querySelector(".edit-btn");
            const deleteBtn = row.querySelector(".delete-btn");
            if (editBtn && deleteBtn) {
                console.log("script.js: Changing buttons to Save/Cancel.");
                editBtn.innerHTML = "<i class=\"fa-solid fa-save\" aria-label=\"Save\"></i>";
                editBtn.classList.remove("edit-btn");
                editBtn.classList.add("save-btn");
                deleteBtn.innerHTML = "<i class=\"fa-solid fa-xmark\" aria-label=\"Cancel\"></i>";
                deleteBtn.classList.remove("delete-btn");
                deleteBtn.classList.add("cancel-btn");
                console.log("script.js: Buttons changed successfully.");
            } else {
                console.error("script.js: Could not find edit/delete buttons to change.");
            }
            return; // Prevent event from bubbling up
        }

        if (button.classList.contains("save-btn")) {
            const row = button.closest("tr");
            const cells = row.querySelectorAll("td");
            const animalId = button.dataset.id;
            const animalData = {};
            const allFields = ["id", "tag_id", "name", "breed", "birth_date", "gender", "health_status", "notes", "dam_id", "sire_id", "status", "features", "photo_path", "pic", "dod"];
            
            cells.forEach((cell, index) => {
                if (index > 0 && index < cells.length - 2) {
                    const input = cell.querySelector("input, select, textarea");
                    animalData[allFields[index]] = input.value;
                } else if (index === 0) {
                    animalData.id = cell.textContent.trim();
                }
            });

            const damId = parseInt(animalData.dam_id);
            const sireId = parseInt(animalData.sire_id);

            if (animalData.status !== "Deceased") {
                animalData.dod = null;
            }

            const pydanticFields = {
                "tag_id": animalData.tag_id,
                "name": animalData.name,
                "gender": animalData.gender,
                "breed": animalData.breed,
                "birth_date": animalData.birth_date,
                "health_status": animalData.health_status,
                "notes": animalData.notes,
                "dam_id": isNaN(damId) ? null : damId,
                "sire_id": isNaN(sireId) ? null : sireId,
                "status": animalData.status,
                "features": animalData.features,
                "photo_path": animalData.photo_path,
                "pic": animalData.pic,
                "dod": animalData.dod
            };

            const response = await fetch(`update_animal/${animalId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(pydanticFields)
            });
            if (response.ok) {
                alert("Animal updated successfully!");
                populateAnimalList();
            } else {
                const error = await response.json();
                alert(`Error: ${error.detail}`);
            }
        }

        if (button.classList.contains("cancel-btn")) {
            const row = button.closest("tr");
            const cells = row.querySelectorAll("td");
            cells.forEach((cell, index) => {
                if (index < cells.length - 2) {
                    cell.textContent = row.originalValues[index];
                }
            });
            // Change buttons back
            const saveBtn = row.querySelector(".save-btn");
            const cancelBtn = row.querySelector(".cancel-btn");
            saveBtn.innerHTML = "<i class=\"fa-solid fa-pencil\" aria-label=\"Edit\"></i>";
            saveBtn.classList.remove("save-btn");
            saveBtn.classList.add("edit-btn");
            cancelBtn.innerHTML = "<i class=\"fa-solid fa-trash-can\" aria-label=\"Delete\"></i>";
            cancelBtn.classList.remove("cancel-btn");
            cancelBtn.classList.add("delete-btn");
        }
    });
});