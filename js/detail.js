import { fetchSingle } from "./api.js";

async function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const distance = params.get("distance");

  if (!id) {
    window.location.href = "index.html";
    return;
  }

  
  const place = await fetchSingle(id);

  if (place) {
    renderDetail(place, distance);
  } else {
    document.getElementById("detail-container").innerHTML = "<p>Kunde inte ladda data</p>";
  }
}

function renderDetail(place, distance) {
  const container = document.getElementById("detail-container");

  const distText = distance && distance !== "null" ? `${distance} km från dig` : "Okänt avstånd";
  const fullAddress = place.address ? `${place.address}, ${place.zip_code || ""} ${place.city || ""}` : "Adress saknas";
  const priceText = place.price_range || "Information saknas";
  const webHTML = place.website ? `<div class="info-box"><small>Webbplats</small><p><a href="${place.website}" target="_blank">Besök hemsida</a></p></div>` : "";
  const phoneHTML = place.phone_number ? `<div class="info-box"><small>Telefon</small><p>${place.phone_number}</p></div>` : "";
  const descriptionText = place.text || place.abstract || place.description || "Ingen beskrivning tillgänglig.";
  const categoryName = place.type || place.description || "Kultur";

  container.innerHTML = `
        <div class="details-content">
            <div class="image-placeholder">[ Bild saknas ]</div>
            <h1 class="details-title">${place.name}</h1>
            <p class="details-subtitle">Kategori: ${categoryName.toUpperCase()} &middot; ${place.city || ""}</p>
            <p class="details-desc">${descriptionText}</p>
        </div>
        <div class="details-sidebar">
            <div class="info-box"><small>Prisnivå</small><p>${priceText}</p></div>
            <div class="info-box"><small>Adress</small><p>${fullAddress}</p></div>
            <div class="info-box"><small>Avstånd</small><p>${distText}</p></div>
            ${phoneHTML}
            ${webHTML}
            <div class="info-box map-box" id="map"></div>
        </div>`;

  if (place.lat && place.lng) {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lng);
    const map = L.map("map").setView([lat, lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: "OpenStreetMap"
    }).addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(`<b>${place.name}</b>`).openPopup();
  } else {
    document.getElementById("map").innerHTML = "<p>Karta saknas.</p>";
  }
}

const backLink = document.getElementById("back-link");
  if (backLink) {
    backLink.addEventListener("click", (e) => {
      e.preventDefault()
      window.history.back()
    })
  }

init()