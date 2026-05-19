let currentFilters = {
  category: "all",
  area: "all", 
  distance: "all",
  search: ""
};

export function Dropdown(places) {
  const select = document.getElementById("municipality-select");
  if (!select) return;

  select.innerHTML = '<option value="all">Alla kommuner</option>';
  
 
  const municipalities = places.map(place => place.municipality).filter(Boolean);
  const uniqueAreas = [...new Set(municipalities)].sort();

  uniqueAreas.forEach(area => {
    const option = document.createElement("option");
    
    
    option.value = area; 
    
    
    let cleanName = area.replace(/ kommun| län|s kommun|/gi, "").trim();
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

   if (area === "Tranås kommun") {
        cleanName = "Tranås";
    }
    
    option.textContent = cleanName; 
    select.appendChild(option);
  });
}

export function FilterSort(allPlaces, renderCallback) {

  document.querySelectorAll('.filter-toggle').forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', () => {
      const group = newBtn.getAttribute('data-group');
      const optionsDiv = document.querySelector(`.filter-options[data-group="${group}"]`);
      if (optionsDiv) {
        optionsDiv.classList.toggle('open');
      }
    });
  });

  
  const renderActiveChips = () => {
    const container = document.getElementById("active-chips");
    if (!container) return;
    container.innerHTML = "";

    
    const createChip = (text, onRemove) => {
      const btn = document.createElement("button");
      btn.className = "chip";
      btn.innerHTML = `${text} <span class="chip-close">X</span>`;
      btn.addEventListener("click", onRemove);
      return btn;
    };

    
    if (currentFilters.category !== "all") {
      const catName = currentFilters.category.charAt(0).toUpperCase() + currentFilters.category.slice(1);
      container.appendChild(createChip(catName, () => {
        currentFilters.category = "all";
        
        document.querySelectorAll('.filter-options[data-group="kategori"] .filter-btn').forEach(b => b.classList.remove("active"));
        triggerUpdate();
      }));
    }

   
    if (currentFilters.area !== "all") {
      let cleanName = currentFilters.area.replace(/ kommun| län/gi, "").trim();
      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      
      container.appendChild(createChip(cleanName, () => {
        currentFilters.area = "all";
        
        document.getElementById("municipality-select").value = "all";
        triggerUpdate();
      }));
    }

   
    if (currentFilters.distance !== "all") {
      container.appendChild(createChip(`Max ${currentFilters.distance} km`, () => {
        currentFilters.distance = "all";
      
        document.querySelectorAll('.filter-options[data-group="avstand"] .filter-btn').forEach(b => b.classList.remove("active"));
        triggerUpdate();
      }));
    }
  };

 
  const triggerUpdate = () => {
    renderActiveChips(); 
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

  document.querySelectorAll('.filter-options[data-group="kategori"] .filter-btn').forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll('.filter-options[data-group="kategori"] .filter-btn').forEach(b => b.classList.remove("active"));
      const targetBtn = e.currentTarget;
      targetBtn.classList.add("active");
      currentFilters.category = targetBtn.getAttribute("data-category") || "all";
      triggerUpdate();
    });
  });

  const areaSelect = document.getElementById("municipality-select");
  if (areaSelect) {
    areaSelect.addEventListener("change", (e) => {
      currentFilters.area = e.target.value; 
      triggerUpdate();
    });
  }

  document.querySelectorAll('.filter-options[data-group="avstand"] .filter-btn').forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll('.filter-options[data-group="avstand"] .filter-btn').forEach(b => b.classList.remove("active"));
      const targetBtn = e.currentTarget;
      targetBtn.classList.add("active");
      
      const text = targetBtn.textContent;
      if (text.includes("50")) currentFilters.distance = "50";
      else if (text.includes("25")) currentFilters.distance = "25";
      else if (text.includes("5")) currentFilters.distance = "5";
      else currentFilters.distance = "all";
      
      triggerUpdate();
    });
  });

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", triggerUpdate);
  }
  
  
  triggerUpdate();
}

function applyFilterAndSort(allPlaces) {
  return allPlaces.filter((place) => {
    if (currentFilters.category !== "all" && place.customCategory !== currentFilters.category) return false;
    
    
    if (currentFilters.area !== "all" && place.municipality !== currentFilters.area) return false;
    
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