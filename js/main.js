import { fetchAllData, starRating } from "./api.js";
import { FilterSort, Dropdown } from "./filters.js";

let allPlaces = [];

async function init() {
  const container = document.getElementById("cards");
  if (!container) return;
  container.innerHTML = "<p>Laddar in platser...</p>";
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await loadData(position.coords.latitude, position.coords.longitude);
      },
      async () => {
        await loadData();
      },
    );
  } else {
    await loadData();
  }
}

async function loadData(lat = null, lng = null) {
  allPlaces = await fetchAllData(lat, lng);
  
 
  Dropdown(allPlaces);
  
  
  FilterSort(allPlaces, renderCards);
}

function renderCards(dataList) {
  const container = document.getElementById("cards");
  container.innerHTML = "";
  
  if (dataList.length === 0) {
    container.innerHTML = "<p>Inga platser hittades med aktuella filter.</p>";
    return;
  }
  
  dataList.forEach((place) => {
    const article = document.createElement("article");
    article.classList.add("card");
    
    const distNum = parseFloat(place.distance);
    const mOrKm = distNum < 1 
      ? `${Math.round(distNum * 1000)} m` 
      : `${Math.round(distNum * 10) / 10} km`;
      
    const distanceInfo = place.distance && place.distance !== 999 
      ? `<p><strong>${mOrKm}</strong> bort</p>` 
      : "";

   
    const cityDisplay = place.municipality || "Okänd kommun";
    
    const categoryName = place.customCategory 
      ? place.customCategory.charAt(0).toUpperCase() + place.customCategory.slice(1)
      : "Kultur";
      
    const ratingRaw = place.rating ? parseFloat(place.rating) : 0;
    const ratingValue = Math.round(ratingRaw * 10) / 10;
    const starsHTML = ratingValue > 0 ? `<div class="star" style="display:flex; align-items:center; gap:5px;">${starRating(ratingValue)} <span>${ratingValue}</span></div>` : "Betyg saknas";
    
    const imageHTML = `./images/${place.id}.jpg`;

    article.innerHTML = `
    <div class="card-image-wrapper">
        <div class="card-badge">
            <img src="./icons/${place.customCategory}.svg" alt="${categoryName}" onerror="this.style.display='none'">
        </div>
        <img class="card-main-img" src="${imageHTML}" alt="${place.name}" onerror="this.src='./images/default.jpeg'">
    </div>
      
    <div class="card-content">
        <h2>${place.name} (ID:${place.id})</h2>
        <div class="card-rating">${starsHTML}</div>
        
        <p>${cityDisplay}</p>
        ${distanceInfo}
        
        <div class="card-footer">
            <strong>Kategori:</strong> ${categoryName}
        </div>
    </div>
    `;
    
    article.addEventListener("click", () => {
      const distParam = place.distance && place.distance !== 999 ? `&distance=${place.distance}` : "";
      window.location.href = `detail.html?id=${place.id}&controller=${place.originController}${distParam}`;
    });
    
    container.appendChild(article);
  });
}

init();