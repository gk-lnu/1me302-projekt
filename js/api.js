const apiKey = "tsShv4yJ";

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function fetchController(controller, lat = null, lng = null) {
  let method = "getall";
  let params = "";
  if (lat !== null && lng !== null) {
    method = "getfromlatlng";
    params = `&lat=${lat}&lng=${lng}&radius=100`;
  }
  const url = `https://smapi.lnu.se/api/?api_key=${apiKey}&controller=${controller}&method=${method}${params}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const payload = data.payload || [];
    return payload.map((item) => ({ ...item, originController: controller }));
  } catch (error) {
    return [];
  }
}

export async function fetchAllData(userLat = null, userLng = null) {
  const [establishments, attractions] = await Promise.all([
    fetchController("establishment", userLat, userLng),
    fetchController("attraction", userLat, userLng),
  ]);
  const allData = [...establishments, ...attractions];
  const keywords = ["museum", "slott", "kyrka"];
  const filteredData = allData.filter((place) => {
    const name = place.name ? place.name.toLowerCase() : "";
    const desc = place.description ? place.description.toLowerCase() : "";
    const matchKeyword = keywords.find(
      (keyword) => desc.includes(keyword) || name.includes(keyword),
    );
    if (matchKeyword) {
      place.customCategory = matchKeyword;
      if (userLat !== null && userLng !== null) {
        const pLat = parseFloat(place.lat);
        const pLng = parseFloat(place.lng);
        if (!isNaN(pLat) && !isNaN(pLng)) {
          place.distance = parseFloat(
            calcDistance(userLat, userLng, pLat, pLng).toFixed(1),
          );
        } else {
          place.distance = 999;
        }
      }
      return true;
    }
    return false;
  });
  return Array.from(
    new Map(filteredData.map((item) => [item.name, item])).values(),
  );
}

export async function fetchSingle(id) {
  const url = `https://smapi.lnu.se/api/?api_key=${apiKey}&controller=establishment&method=getall&ids=${id}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.payload && data.payload.length > 0 ? data.payload[0] : null;
  } catch (error) {
    return null;
  }
}

