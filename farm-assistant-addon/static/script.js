document.addEventListener("DOMContentLoaded", () => {
    const animalTypeSelect = document.getElementById("animal-type");
    const animalGenderSelect = document.getElementById("animal-gender");
    const animalBreedSelect = document.getElementById("animal-breed");
    const addAnimalForm = document.getElementById("add-animal-form");

    const updateAnimalDetails = async () => {
        const animalType = animalTypeSelect.value;
        const response = await fetch("/get_animal_details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ animal_type: animalType }),
        });
        const data = await response.json();

        animalGenderSelect.innerHTML = "";
        data.genders.forEach(gender => {
            const option = document.createElement("option
            option.value = gender;
            option.textContent = gender;
            animalGenderSelect.appendChild(option);
        });

        animalBreedSelect.innerHTML = "";
        data.breeds.forEach(breed => {
            const option = document.createElement("option");
            option.value = breed;
            option.textContent = breed;
            animalBreedSelect.appendChild(option);
        });
    };

    animalTypeSelect.addEventListener("change", updateAnimalDetails);

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
            updateAnimalDetails();
            populateAnimalList();
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail}`);
        }
    });

    // Initial population
    updateAnimalDetails();
    populateAnimalList();
});

async function populateAnimalList() {
    const animalListBody = document.querySelector("#livestock-list tbody");
    animalListBody.innerHTML = "";

    const response = await fetch("/get_animals");
    const animals = await response.json();

    animals.forEach(animal => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${animal.name}</td>
            <td>${animal.animal_type}</td>
            <td>${animal.gender}</td>
            <td>${animal.breed}</td>
            <td>${animal.birth_date}</td>
            <td>${animal.features}</td>
            <td>${animal.status}</td>
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
            document.getElementById("animal-type").value = animal.animal_type;
            document.getElementById("animal-name").value = animal.name;
            document.getElementById("animal-birth-date").value = animal.birth_date;
            document.getElementById("animal-features").value = animal.features;

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
