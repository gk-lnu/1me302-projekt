import { fetchSmapi } from "./api.js";

async function displayData() {
    
    const data = await fetchSmapi();

    const container = document.getElementById("cards");
    

    if (!container) {
        console.error("Hittade inget element med id 'cards'");
        return;
    }

    container.innerHTML = ""; 


    if (data && data.length > 0) {
        data.forEach(place => {

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
        console.log("Ingen data att visa:", data);
    }
}


displayData();