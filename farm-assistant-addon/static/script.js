console.log("Script loaded");

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
    const addAnimalForm = document.getElementById("add-animal-form");
    console.log("Form found:", addAnimalForm);

    addAnimalForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        console.log("Form submitted");

        const formData = new FormData(addAnimalForm);
        const animal = Object.fromEntries(formData.entries());
        const action = event.submitter.dataset.action;

        let url = "/add_animal";
        let method = "POST";

        if (action === "update") {
            url = `/update_animal/${animal.id}`;
            method = "PUT";
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(animal),
        });

        if (response.ok) {
            alert(`Animal ${action === "update" ? "updated" : "added"} successfully!`);
            addAnimalForm.reset();
            const submitButton = document.querySelector("#add-animal-form button");
            submitButton.textContent = "Add Animal";
            submitButton.dataset.action = "add";
            populateAnimalList();
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail}`);
        }
    });

    // Initial population done server-side
});

async function populateAnimalList() {
    const animalListBody = document.querySelector("#livestock-list tbody");
    animalListBody.innerHTML = "";

    const response = await fetch("/get_animals");
    const animals = await response.json();

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
            <td>${animal.created_at}</td>
            <td>${animal.dam_id}</td>
            <td>${animal.sire_id}</td>
            <td>${animal.status}</td>
            <td>${animal.features}</td>
            <td>${animal.photo_path}</td>
            <td>${animal.pic}</td>
            <td>${animal.dod}</td>
            <td>
                <button class="edit-btn" data-id="${animal.id}">Edit</button>
                <button class="delete-btn" data-id="${animal.id}">Delete</button>
            </td>
        `;
        animalListBody.appendChild(row);
    });

    animalListBody.addEventListener("click", async (event) => {
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

        if (event.target.classList.contains("edit-btn")) {
            const row = event.target.closest("tr");
            const cells = row.querySelectorAll("td");
            row.originalValues = [];
            cells.forEach((cell, index) => {
                if (index < cells.length - 1) { // not actions
                    row.originalValues.push(cell.textContent);
                    const input = document.createElement("input");
                    input.type = "text";
                    input.value = cell.textContent;
                    cell.innerHTML = "";
                    cell.appendChild(input);
                }
            });
            // Change buttons
            const editBtn = row.querySelector(".edit-btn");
            const deleteBtn = row.querySelector(".delete-btn");
            editBtn.textContent = "Save";
            editBtn.classList.remove("edit-btn");
            editBtn.classList.add("save-btn");
            deleteBtn.textContent = "Cancel";
            deleteBtn.classList.remove("delete-btn");
            deleteBtn.classList.add("cancel-btn");
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
            const response = await fetch(`/update_animal/${animalId}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(animal)
            });
            if (response.ok) {
                alert("Animal updated successfully!");
                // Change buttons back
                const saveBtn = row.querySelector(".save-btn");
                const cancelBtn = row.querySelector(".cancel-btn");
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
}
