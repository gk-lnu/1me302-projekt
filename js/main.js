import { fetchSmapi } from "./api.js";

let allPlaces = []

async function init() {
    
allPlaces = await fetchSmapi();

    const container = document.getElementById("cards");
    

    if (!container) {
        console.error("Hittade inget element med id 'cards'");
        return;
    }

    renderCards(allPlaces)
filterSetup()

    
}

function renderCards(dataList) {
    const container = document.getElementById("cards")
    container.innerHTML = ""; 

    if (dataList && dataList.length > 0) {
        dataList.forEach(place => {

            const article = document.createElement("article");
            article.classList.add("card");

           
            article.innerHTML = `
                <h2>${place.name}</h2>
                <p>${place.description || 'Ingen beskrivning tillgänglig'}</p>
                <div class="card-footer">
                    <strong>Kategori:</strong> ${place.category || 'Kultur'}
                </div>
            `;
            
            container.appendChild(article);
        });
    } else {
     
        container.innerHTML = `<p>Inga platser hittades som matchar dina sökkriterier.</p>`;
        console.log("Ingen data att visa:", dataList);
    }
}

function filterSetup() {
    const btn = document.querySelectorAll(".filter-btn")

    btn.forEach(button => {
button.addEventListener("click", (event) => {
    const category = event.target.getAttribute("data-category")

    if (category === "all") {
        renderCards(allPlaces)
    } else {
        const filtered = allPlaces.filter(place => {
            const description = place.description ? place.description.toLowerCase() : ""
            return description.includes(category.toLowerCase())
        })

        renderCards(filtered)
    }
})
    })
}

init();