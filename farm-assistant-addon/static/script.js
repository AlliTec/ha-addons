console.log("script.js: File loaded.");

async function populateAnimalList() {
    const response = await fetch("get_animals");
    const animals = await response.json();
    const tableBody = document.querySelector("#livestock-list tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    animals.forEach(animal => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${animal.id}</td>
            <td>${animal.tag_id}</td>
            <td>${animal.name}</td>
            <td>${animal.breed}</td>
            <td>${animal.birth_date}</td>
            <td>${animal.gender}</td>
            <td>${animal.health_status}</td>
            <td>${animal.notes}</td>
            <td>${animal.dam_id}</td>
            <td>${animal.sire_id}</td>
            <td>${animal.status}</td>
            <td>${animal.features}</td>
            <td>${animal.photo_path}</td>
            <td><a href="${animal.pic}" target="_blank">View</a></td>
            <td>${animal.dod}</td>
            <td>
                <button class=\"edit-btn\" data-id=\"${animal.id}\">Edit</button>
                <button class=\"delete-btn\" data-id=\"${animal.id}\">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("script.js: DOMContentLoaded event fired.");

    populateAnimalList();

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
            const animalData = {};
            const allFields = ["id", "tag_id", "name", "breed", "birth_date", "gender", "health_status", "notes", "dam_id", "sire_id", "status", "features", "photo_path", "pic", "dod"];
            cells.forEach((cell, index) => {
                if (index < cells.length - 1) {
                    const input = cell.querySelector("input");
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

            const response = await fetch("/api/animals");
            const animals = await response.json();

            row.originalValues = [];
            cells.forEach((cell, index) => {
                console.log(`script.js: Processing cell ${index}...`);
                if (index < cells.length - 1) { // Exclude the last cell (actions)
                    const currentValue = cell.textContent.trim();
                    console.log(`script.js: Cell ${index} current value: '${currentValue}'`);
                    row.originalValues.push(currentValue);
                    
                    let input;
                    if (index === 4 || index === 14) { // birth_date and dod
                        input = document.createElement("input");
                        input.type = "date";
                        input.value = currentValue;
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
                        const dams = animals.filter(animal => ["Cow", "Hen", "Bitch"].includes(animal.gender));
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
                    } else if (index === 13) { // pic
                        const link = document.createElement("a");
                        link.href = currentValue;
                        link.target = "_blank";
                        link.textContent = currentValue;
                        cell.innerHTML = "";
                        cell.appendChild(link);
                        return;
                    } else {
                        input = document.createElement("input");
                        input.type = "text";
                        input.value = currentValue;
                    }
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
            return; // Prevent event from bubbling up
        }

        if (event.target.classList.contains("save-btn")) {
            const row = event.target.closest("tr");
            const cells = row.querySelectorAll("td");
            const animalId = event.target.dataset.id;
            const animalData = {};
            const allFields = ["id", "tag_id", "name", "breed", "birth_date", "gender", "health_status", "notes", "dam_id", "sire_id", "status", "features", "photo_path", "pic", "dod"];
            cells.forEach((cell, index) => {
                if (index < cells.length - 1) {
                    const input = cell.querySelector("input, select, textarea");
                    animalData[allFields[index]] = input.value;
                    cell.textContent = input.value;
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
                // Change buttons back
                const saveBtn = row.querySelector(".save-btn");
                const cancelBtn = row.querySelector("cancel-btn");
                saveBtn.textContent = "Edit";
                saveBtn.classList.remove("save-btn");
                saveBtn.classList.add("edit-btn");
                cancelBtn.textContent = "Delete";
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
