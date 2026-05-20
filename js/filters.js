let currentFilters = {
  categories: [], 
  areas: [], 
  distance: "all",
  search: ""
};

export function Dropdown(places) {
  const container = document.getElementById("municipality-checkboxes");
  if (!container) return;

  container.innerHTML = ""; 
  
  const municipalities = places.map(place => place.municipality).filter(Boolean);
  const uniqueAreas = [...new Set(municipalities)].sort();

  uniqueAreas.forEach(area => {
    let cleanName = area.replace(/ kommun| län/gi, "").trim();
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    
    const label = document.createElement("label");
    label.className = "checkbox-label";
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = area; 
    checkbox.className = "area-checkbox";
    
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + cleanName));
    
    container.appendChild(label);
  });
}

export function FilterSort(allPlaces, renderCallback) {
  
  document.querySelectorAll('.filter-toggle').forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
      const group = newBtn.getAttribute('data-group');
      const optionsDiv = document.querySelector(`.filter-options[data-group="${group}"]`);
      if (optionsDiv) optionsDiv.classList.toggle('open');
    });
  });

  const triggerUpdate = () => {
    renderActiveChips(triggerUpdate); 
    const result = applyFilterAndSort(allPlaces);
    renderCallback(result);
  };

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentFilters.search = e.target.value.toLowerCase();
      triggerUpdate();
    });
  }

  document.querySelectorAll('.category-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      if (e.target.checked) {
        currentFilters.categories.push(e.target.value);
      } else {
        currentFilters.categories = currentFilters.categories.filter(c => c !== e.target.value);
      }
      triggerUpdate();
    });
  });

  const areaContainer = document.getElementById("municipality-checkboxes");
  if (areaContainer) {
    areaContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('area-checkbox')) {
        if (e.target.checked) {
          currentFilters.areas.push(e.target.value);
        } else {
          currentFilters.areas = currentFilters.areas.filter(a => a !== e.target.value);
        }
        triggerUpdate();
      }
    });
  }

  document.querySelectorAll('.filter-options[data-group="avstand"] .filter-btn').forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll('.filter-options[data-group="avstand"] .filter-btn').forEach(b => b.classList.remove("active"));
      const targetBtn = e.currentTarget;
      targetBtn.classList.add("active");
      
      const text = targetBtn.textContent;
      if (text.includes("5")) currentFilters.distance = "5";
      else if (text.includes("25")) currentFilters.distance = "25";
      else if (text.includes("50")) currentFilters.distance = "50";
      else currentFilters.distance = "all";
      
      triggerUpdate();
    });
  });

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) sortSelect.addEventListener("change", triggerUpdate);

  triggerUpdate();
}

function renderActiveChips(updateCallback) {
  const container = document.getElementById("active-chips");
  if (!container) return;
  container.innerHTML = ""; 

  let activeCount = 0; 

  const createChip = (text, onRemove) => {
    activeCount++;
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.innerHTML = `${text} <span class="chip-close">&times;</span>`;
    btn.addEventListener("click", onRemove);
    return btn;
  };

  currentFilters.categories.forEach(cat => {
    const catName = cat.charAt(0).toUpperCase() + cat.slice(1);
    container.appendChild(createChip(catName, () => {
      currentFilters.categories = currentFilters.categories.filter(c => c !== cat);
      const cb = document.querySelector(`.category-checkbox[value="${cat}"]`);
      if (cb) cb.checked = false;
      updateCallback();
    }));
  });

  currentFilters.areas.forEach(area => {
    let cleanName = area.replace(/ kommun| län/gi, "").trim();
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    container.appendChild(createChip(cleanName, () => {
      currentFilters.areas = currentFilters.areas.filter(a => a !== area);
      const cb = document.querySelector(`.area-checkbox[value="${area}"]`);
      if (cb) cb.checked = false;
      updateCallback();
    }));
  });

  if (currentFilters.distance !== "all") {
    container.appendChild(createChip(`Max ${currentFilters.distance} km`, () => {
      currentFilters.distance = "all";
      document.querySelectorAll('.filter-options[data-group="avstand"] .filter-btn').forEach(b => b.classList.remove("active"));
      updateCallback();
    }));
  }

  if (activeCount > 1) {
    const clearAllBtn = document.createElement("button");
    clearAllBtn.className = "clear-all-chips-btn";
    clearAllBtn.textContent = "Rensa alla filter";
    clearAllBtn.addEventListener("click", () => {
      currentFilters.search = "";
      currentFilters.categories = [];
      currentFilters.areas = [];
      currentFilters.distance = "all";

      const input = document.getElementById("search-input");
      if (input) input.value = "";
      
      document.querySelectorAll('.category-checkbox, .area-checkbox').forEach(cb => cb.checked = false);
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove("active"));
      
      updateCallback();
    });
    container.appendChild(clearAllBtn);
  }
}

function applyFilterAndSort(allPlaces) {
  return allPlaces.filter((place) => {
    if (currentFilters.categories.length > 0) {
      if (!currentFilters.categories.includes(place.customCategory)) return false;
    }
    
    if (currentFilters.areas.length > 0) {
      if (!currentFilters.areas.includes(place.municipality)) return false;
    }
    
    if (currentFilters.distance !== "all") {
      const maxDist = parseInt(currentFilters.distance);
      if (place.distance > maxDist) return false;
    }
    
    if (currentFilters.search !== "") {
      const name = place.name ? place.name.toLowerCase() : "";
      const desc = place.description ? place.description.toLowerCase() : "";
      if (!name.includes(currentFilters.search) && !desc.includes(currentFilters.search)) return false;
    }
    
    return true; 
  }).sort((a, b) => {
    const sortSelect = document.getElementById("sort-select");
    const sortValue = sortSelect ? sortSelect.value : "distance-asc";

    if (sortValue === "distance-asc") return a.distance - b.distance;
    if (sortValue === "distance-desc") {
      if (a.distance === 999) return 1;
      if (b.distance === 999) return -1;
      return b.distance - a.distance;
    }
    if (sortValue === "rating-desc") return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
    if (sortValue === "rating-asc") return (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0);
    return 0;
  });
}