import { fetchSingle, starRating } from "./api.js";

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
    document.getElementById("detail-container").innerHTML =
      "<p>Kunde inte ladda data</p>";
  }
}

function renderDetail(place, distance) {
  const container = document.getElementById("detail-container");

  const mOrKm = parseFloat(distance);
  const distText =
    distance && distance !== "null" && distance !== "999"
      ? mOrKm < 1
        ? `${Math.round(mOrKm * 1000)} meter från dig`
        : `${mOrKm} km från dig`
      : "Okänt avstånd";
  const fullAddress = place.address
    ? `${place.address}, ${place.zip_code || ""} ${place.city || ""}`
    : "Adress saknas";
  const priceText = place.price_range || "Information saknas";
  const webHTML = place.website
    ? `<div class="info-box"><small>Webbplats</small><p><a href="${place.website}" target="_blank">Besök hemsida</a></p></div>`
    : "";
  const phoneHTML = place.phone_number
    ? `<div class="info-box"><small>Telefon</small><p>${place.phone_number}</p></div>`
    : "";
  const descriptionText =
    place.text ||
    place.abstract ||
    place.description ||
    "Ingen beskrivning tillgänglig.";
  const categoryName = place.type || place.description || "Kultur";

  const ratingRaw = place.rating ? parseFloat(place.rating) : 0
  const ratingValue = Math.round(ratingRaw * 10) / 10
  const starsHTML = ratingValue > 0 ? `<div class="star"style="display:flex; align-items:center; gap:5px;">${starRating(ratingValue)} <span>${ratingValue}</span></div>`
    : "Betyg saknas";
    const imageHTML = `./images/${place.id}.jpg`



  container.innerHTML = `
        <div class="details-content">
        <img class="details-img" src="${imageHTML}">
             <h1 class="details-title">${place.name}</h1>
            <p class="details-subtitle">Kategori: ${categoryName.toUpperCase()} &middot; ${place.city || ""}</p>
            <p class="details-desc">${descriptionText}</p>
        </div>
        <div class="details-sidebar">
        <div class="info-box"><small>Användarbetyg</small><div>${starsHTML}</div></div>
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

    const map = L.map("map", {
      zoomControl: false,
    }).setView([lat, lng], 14);

    L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=06974496-1f7b-4063-87eb-cea816c1b2d3",
      {
        minZoom: 0,
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: "png",
      },
    ).addTo(map);

    L.circleMarker([lat, lng], {
      color: "#ff0000",

      radius: 5,
      weight: 4,
    })
      .addTo(map)
      .bindPopup(`<b>${place.name}</b>`)
      .openPopup();
  } else {
    document.getElementById("map").innerHTML =
      "<p style='padding:1rem; color:#888;'>Karta saknas.</p>";
  }
}

const backLink = document.getElementById("back-link");
if (backLink) {
  backLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.history.back();
  });
}

init();
