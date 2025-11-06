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

        const response = await fetch("/add_animal", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(animal),
        });

        if (response.ok) {
            alert("Animal added successfully!");
            addAnimalForm.reset();
            updateAnimalDetails();
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail}`);
        }
    });

    // Initial population
    updateAnimalDetails();
});
