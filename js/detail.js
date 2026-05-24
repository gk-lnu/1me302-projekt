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
        : `${Math.round(mOrKm * 10) / 10} km från dig`
      : "Okänt avstånd";
  const fullAddress = place.address
    ? `${place.address}, ${place.zip_code || ""} ${place.city || ""}`
    : "Adress saknas";
  let priceText = place.price_range || "Information saknas";

  if (priceText === "0" || priceText === "0-25") {
    priceText = "Gratis";
  } else if (priceText.includes("-")) {
    const maxPrice = priceText.split("-")[1];
    priceText = `Upp till ${maxPrice} kr`;
  } else if (priceText !== "Information saknas") {
    priceText = `${priceText} kr`;
  }
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
  const categoryName = place.description || "Kultur";

  const ratingRaw = place.rating ? parseFloat(place.rating) : 0;
  const ratingValue = Math.round(ratingRaw * 10) / 10;
  const starsHTML =
    ratingValue > 0
      ? `<div class="star" style="display:flex; align-items:center; gap:5px;">${starRating(ratingValue)} <span>${ratingValue}</span></div>`
      : "Betyg saknas";
  const imageHTML = `./images/${place.id}.jpg`;

  container.innerHTML = `
        <div class="details-content">
            <img class="details-img" src="${imageHTML}">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <h1 class="details-title" style="margin: 0;">${place.name}</h1>
                <button id="share-btn" class="share-btn" title="Kopiera till urklipp">
                    <svg width="100%" height="100%" viewBox="0 0 1323 1323" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
    <g transform="matrix(1,0,0,1,-1252.541667,-417.541667)">
        <g>
            <g transform="matrix(0.658239,0.658239,-0.699201,0.699201,2164.303168,-1111.261377)">
                <path d="M1473,1946C1389.898,1968.751 1317.536,1798.912 1470.637,1778.151C1547.204,1767.768 1610.635,1719.095 1610.635,1646.354L1610.635,1251.911C1610.635,1179.171 1547.904,1120.115 1470.637,1120.115C1393.37,1120.115 1330.639,1179.171 1330.639,1251.911L1332.918,1489.961C1336.305,1492.772 1322.403,1501.691 1301.389,1512.069C1286.44,1519.452 1253.093,1536.525 1238.556,1547.426C1189.856,1583.947 1161.586,1626.196 1148.038,1577.147L1145,1252.784C1145,1082.362 1291.972,944 1473,944C1654.028,944 1801,1082.362 1801,1252.784L1801,1637.216C1801,1807.638 1654.028,1946 1473,1946" style="fill:rgb(255,233,151);stroke:rgb(8,6,5);stroke-width:23.86px;"/>
            </g>
            <g transform="matrix(-0.658239,-0.658239,0.699201,-0.699201,1662.90943,3268.473976)">
                <path d="M1473,1946C1389.898,1968.751 1317.536,1798.912 1470.637,1778.151C1547.204,1767.768 1610.635,1719.095 1610.635,1646.354L1610.635,1251.911C1610.635,1179.171 1547.904,1120.115 1470.637,1120.115C1393.37,1120.115 1330.639,1179.171 1330.639,1251.911L1332.918,1489.961C1336.305,1492.772 1322.403,1501.691 1301.389,1512.069C1286.44,1519.452 1253.093,1536.525 1238.556,1547.426C1189.856,1583.947 1161.586,1626.196 1148.038,1577.147L1145,1252.784C1145,1082.362 1291.972,944 1473,944C1654.028,944 1801,1082.362 1801,1252.784L1801,1637.216C1801,1807.638 1654.028,1946 1473,1946" style="fill:rgb(136,49,0);stroke:rgb(8,6,5);stroke-width:23.86px;"/>
            </g>
        </g>
    </g>
</svg>
                    Dela
                </button>
            </div>
             
            <p class="details-subtitle">Kategori: ${categoryName} &middot; Stad: ${place.city || ""}</p>
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
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png?api_key=06974496-1f7b-4063-87eb-cea816c1b2d3",
      {
        minZoom: 0,
        maxZoom: 20,
        attribution: "Tiles &copy; Esri",
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

  const shareBtn = document.getElementById("share-btn");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const shareData = {
        title: place.name,
        text: `Kolla in ${place.name} på KulturSmåland!`,
        url: window.location.href,
      };
      try {
        if (navigator.share && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(window.location.href);
          alert("Länken har kopierats till ditt urklipp!");
        }
      } catch (err) {
        console.error(err);
      }
    });
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
