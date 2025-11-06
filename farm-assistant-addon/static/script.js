document.addEventListener("DOMContentLoaded", () => {
    const addAnimalForm = document.getElementById("add-animal-form");

    addAnimalForm.addEventListener("submit", async (event) => {
        event.preventDefault();

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
            const animalId = event.target.dataset.id;
            const response = await fetch(`/get_animal/${animalId}`);
            const animal = await response.json();

            document.getElementById("animal-id").value = animal.id;
            document.getElementById("animal-tag-id").value = animal.tag_id;
            document.getElementById("animal-name").value = animal.name;
            document.getElementById("animal-birth-date").value = animal.birth_date;
            document.getElementById("animal-health-status").value = animal.health_status;
            document.getElementById("animal-notes").value = animal.notes;
            document.getElementById("animal-dam-id").value = animal.dam_id;
            document.getElementById("animal-sire-id").value = animal.sire_id;
            document.getElementById("animal-features").value = animal.features;
            document.getElementById("animal-photo-path").value = animal.photo_path;
            document.getElementById("animal-pic").value = animal.pic;
            document.getElementById("animal-dod").value = animal.dod;

            updateAnimalDetails().then(() => {
                document.getElementById("animal-gender").value = animal.gender;
                document.getElementById("animal-breed").value = animal.breed;
            });

            const submitButton = document.querySelector("#add-animal-form button");
            submitButton.textContent = "Update Animal";
            submitButton.dataset.action = "update";
        }
    });
}
