import { fetchAllData } from "./api.js";

let allPlaces = [];
let currentFilter = "all";

async function init() {
    const container = document.getElementById("cards");
    if (!container) return;

    container.innerHTML = "<p>Laddar kulturplatser från SMAPI...</p>";

    allPlaces = await fetchAllData();

    if (allPlaces.length > 0 && Array.isArray(allPlaces[0])) {
        allPlaces = allPlaces.map(item => item[1]);
    }

    setupFilters();
    setupSorting();
    applyFilterAndSort(); 
}

function renderCards(dataList) {
    const container = document.getElementById("cards");
    container.innerHTML = ""; 

    if (dataList && dataList.length > 0) {
        dataList.forEach(place => {
            const article = document.createElement("article");
            article.classList.add("card");

            const categoryName = place.customCategory 
                ? place.customCategory.charAt(0).toUpperCase() + place.customCategory.slice(1) 
                : 'Kultur';

            article.innerHTML = `
            <img src="/icons/${place.description}.svg">
                <h2>${place.name}</h2>
                <p>${place.description || 'Ingen beskrivning tillgänglig'}</p>
                <div class="card-footer">
                    <strong>Kategori:</strong> ${categoryName}
                </div>
            `;
            
            container.appendChild(article);
        });
    } else {
        container.innerHTML = `<p>Inga platser hittades som matchar dina val.</p>`;
    }
}

function setupFilters() {
    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach(button => {
        button.addEventListener("click", (event) => {
            currentFilter = event.target.getAttribute("data-category");
            applyFilterAndSort();
        });
    });
}

function setupSorting() {
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            applyFilterAndSort();
        });
    }
}

function applyFilterAndSort() {
    let listToRender = [];
    
    if (currentFilter === "all") {
        listToRender = [...allPlaces];
    } else {
        listToRender = allPlaces.filter(place => place.customCategory === currentFilter);
    }

    const sortSelect = document.getElementById("sort-select");
    const sortValue = sortSelect ? sortSelect.value : "name-asc";

    listToRender.sort((a, b) => {
        if (sortValue === "name-asc") {
            return a.name.localeCompare(b.name, 'sv'); 
        } else if (sortValue === "name-desc") {
            return b.name.localeCompare(a.name, 'sv');
        }
        return 0;
    });

    renderCards(listToRender);
}

init();