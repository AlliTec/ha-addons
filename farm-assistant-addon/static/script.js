console.log("script.js: File loaded.");

document.addEventListener("DOMContentLoaded", () => {
    console.log("script.js: DOMContentLoaded event fired.");

    populateAnimalList();

    const filterBar = document.getElementById("filter-bar");
    filterBar.addEventListener("click", (event) => {
        const target = event.target;
        if (target.classList.contains("filter-img")) {
            const filter = target.alt;
            const activeImages = document.querySelectorAll(".filter-img.active");
            activeImages.forEach(img => img.classList.remove("active"));
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

    animalListTable.addEventListener("click", async (event) => {
        console.log("script.js: Click detected inside table. Target:", event.target);

        if (event.target.classList.contains("delete-btn")) {
            const animalId = event.target.dataset.id;
            if (confirm("Are you sure you want to delete this animal?")) {
                const response = await fetch(`/delete_animal/${animalId}`, {
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

        if (event.target.classList.contains("add-btn")) {
            const row = event.target.closest("tr");
            const cells = row.querySelectorAll("td");
            cells.forEach((cell, index) => {
                if (index < cells.length - 1) {
                    const input = document.createElement("input");
                    input.type = "text";
                    cell.innerHTML = "";
                    cell.appendChild(input);
                }
            });
            const addBtn = row.querySelector(".add-btn");
            addBtn.textContent = "Save";
            addBtn.classList.remove("add-btn");
            addBtn.classList.add("save-add-btn");
            const cancelBtn = document.createElement("button");
            cancelBtn.textContent = "Cancel";
            cancelBtn.classList.add("cancel-add-btn");
            row.querySelector("td:last-child").appendChild(cancelBtn);
        }

        if (event.target.classList.contains("save-add-btn")) {
            const row = event.target.closest("tr");
            const cells = row.querySelectorAll("td");
            const animal = {};
            const fields = ["id", "tag_id", "name", "breed", "birth_date", "gender", "health_status", "notes", "created_at", "dam_id", "sire_id", "status", "features", "photo_path", "pic", "dod"];
            cells.forEach((cell, index) => {
                if (index < cells.length - 1) {
                    const input = cell.querySelector("input");
                    animal[fields[index]] = input ? input.value : "";
                }
            });
            const response = await fetch("/add_animal", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(animal)
            });
            if (response.ok) {
                alert("Animal added successfully!");
                populateAnimalList();
            } else {
                const error = await response.json();
                alert(`Error: ${error.detail}`);
            }
        }

        if (event.target.classList.contains("cancel-add-btn")) {
            const row = event.target.closest("tr");
            const cells = row.querySelectorAll("td");
            cells.forEach(cell => cell.innerHTML = "");
            const saveBtn = row.querySelector(".save-add-btn");
            saveBtn.textContent = "Add";
            saveBtn.classList.remove("save-add-btn");
            saveBtn.classList.add("add-btn");
            const cancelBtn = row.querySelector(".cancel-add-btn");
            cancelBtn.remove();
        }

        if (event.target.classList.contains("edit-btn")) {
            console.log("script.js: 'Edit' button clicked.");
            const row = event.target.closest("tr");
            if (!row) {
                console.error("script.js: Could not find parent row for edit button.");
                return;
            }
            console.log("script.js: Found row:", row);
            const cells = row.querySelectorAll("td");
            console.log(`script.js: Found ${cells.length} cells in the row.`);

            row.originalValues = [];
            cells.forEach((cell, index) => {
                console.log(`script.js: Processing cell ${index}...`);
                if (index < cells.length - 1) { // Exclude the last cell (actions)
                    const currentValue = cell.textContent.trim();
                    console.log(`script.js: Cell ${index} current value: '${currentValue}'`);
                    row.originalValues.push(currentValue);
                    
                    const input = document.createElement("input");
                    input.type = "text";
                    input.value = currentValue;
                    input.classList.add("inline-edit-input");
                    
                    cell.replaceChildren(input);
                    console.log(`script.js: Cell ${index} replaced with an input field.`);
                } else {
                    console.log(`script.js: Cell ${index} is the action cell, skipping.`);
                }
            });

            // Change buttons
            const editBtn = row.querySelector(".edit-btn");
            const deleteBtn = row.querySelector(".delete-btn");
            if (editBtn && deleteBtn) {
                console.log("script.js: Changing buttons to Save/Cancel.");
                editBtn.textContent = "Save";
                editBtn.classList.remove("edit-btn");
                editBtn.classList.add("save-btn");
                deleteBtn.textContent = "Cancel";
                deleteBtn.classList.remove("delete-btn");
                deleteBtn.classList.add("cancel-btn");
                console.log("script.js: Buttons changed successfully.");
            } else {
                console.error("script.js: Could not find edit/delete buttons to change.");
            }
        }

        if (event.target.classList.contains("save-btn")) {
            const row = event.target.closest("tr");
            const cells = row.querySelectorAll("td");
            const animalId = event.target.dataset.id;
            const animal = {};
            const fields = ["id", "tag_id", "name", "breed", "birth_date", "gender", "health_status", "notes", "created_at", "dam_id", "sire_id", "status", "features", "photo_path", "pic", "dod"];
            cells.forEach((cell, index) => {
                if (index < cells.length - 1) {
                    const input = cell.querySelector("input");
                    animal[fields[index]] = input.value;
                    cell.textContent = input.value;
                }
            });
            const response = await fetch(`update_animal/${animalId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(animal)
            });
            if (response.ok) {
                alert("Animal updated successfully!");
                // Change buttons back
                const saveBtn = row.querySelector(".save-btn");
                const cancelBtn = row.querySelector(".cancel-btn");
             saveBtn.innerHTML = "<i class=\"fa-solid fa-pencil\" aria-label=\"Edit\"></i>";
             saveBtn.classList.remove("save-btn");
             saveBtn.classList.add("edit-btn");
             cancelBtn.innerHTML = "<i class=\"fa-solid fa-trash-can\" aria-label=\"Delete\"></i>";
             cancelBtn.classList.remove("cancel-btn");
             cancelBtn.classList.add("delete-btn");
            } else {
                const error = await response.json();
                alert(`Error: ${error.detail}`);
            }
        }

        if (event.target.classList.contains("cancel-btn")) {
            const row = event.target.closest("tr");
            const cells = row.querySelectorAll("td");
            cells.forEach((cell, index) => {
                if (index < cells.length - 1) {
                    cell.textContent = row.originalValues[index];
                }
            });
            // Change buttons back
            const saveBtn = row.querySelector(".save-btn");
            const cancelBtn = row.querySelector(".cancel-btn");
            saveBtn.textContent = "Edit";
            saveBtn.classList.remove("save-btn");
            saveBtn.classList.add("edit-btn");
            cancelBtn.textContent = "Delete";
            cancelBtn.classList.remove("cancel-btn");
            cancelBtn.classList.add("delete-btn");
        }
    });
});
