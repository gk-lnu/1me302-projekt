import { fetchAllData } from "./api.js";

let allPlaces = [];
let currentFilter = "all";

async function init() {
  const container = document.getElementById("cards");
  if (!container) return;

  container.innerHTML = "<p>Laddar...</p>";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        await loadData(lat, lng);
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
  setupFilters();
  setupSorting();
  applyFilterAndSort();
}

function renderCards(dataList) {
  const container = document.getElementById("cards");
  container.innerHTML = "";

  dataList.forEach((place) => {
    const article = document.createElement("article");
    article.classList.add("card");

    const distanceInfo =
      place.distance && place.distance !== 999
        ? `<p><strong>${place.distance} km</strong> bort</p>`
        : "";

    const categoryName = place.customCategory
      ? place.customCategory.charAt(0).toUpperCase() +
        place.customCategory.slice(1)
      : "Kultur";

    article.innerHTML = `
            <img class="badge" src="./icons/${place.customCategory || "default"}.svg" alt="">
            <h2>${place.name}</h2>
            <p>${place.description || "Ingen beskrivning tillgänglig"}</p>
            ${distanceInfo}
            <div class="card-footer">
                <strong>Kategori:</strong> ${categoryName}
            </div>
        `;
    container.appendChild(article);
  });
}

function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      currentFilter = e.target.getAttribute("data-category");
      applyFilterAndSort();
    });
  });
}

function setupSorting() {
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", applyFilterAndSort);
  }
}

function applyFilterAndSort() {
  let listToRender =
    currentFilter === "all"
      ? [...allPlaces]
      : allPlaces.filter((place) => place.customCategory === currentFilter);

  const sortSelect = document.getElementById("sort-select");
  const sortValue = sortSelect ? sortSelect.value : "name-asc";

  listToRender.sort((a, b) => {
    if (sortValue === "distance-asc") {
        return a.distance - b.distance
    }

    if (sortValue === "distance-desc") {
        if (a.distance === 999) return 1
        if (b.distance === 999) return -1

        return b.distance - a.distance
    }


    if (
      sortValue === "distance" &&
      a.distance !== undefined &&
      b.distance !== undefined
    ) {
      return a.distance - b.distance;
    }
    if (sortValue === "name-asc") {
      return a.name.localeCompare(b.name, "sv");
    }
    if (sortValue === "name-desc") {
      return b.name.localeCompare(a.name, "sv");
    }
    return 0;
  });

  renderCards(listToRender);
}

init();
