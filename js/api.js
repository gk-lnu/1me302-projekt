const apiKey = "tsShv4yJ";

async function fetchController(controller) {
  const url = `https://smapi.lnu.se/api/?api_key=${apiKey}&controller=${controller}&method=getall`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Nätverksfel på ${controller}`);
    const data = await response.json();
    return data.payload || [];
  } catch (error) {
    console.error(`Fel vid hämtning av ${controller}:`, error);
    return [];
  }
}

export async function fetchAllData() {
  const [establishments, attractions] = await Promise.all([
    fetchController("establishment"),
    fetchController("attraction"),
  ]);

  const allData = [...establishments, ...attractions];

  const keywords = ["museum", "slott", "kyrka"];

  const filteredData = allData.filter((place) => {
    const desc = place.description ? place.description.toLowerCase() : "";

    const matchKeyword = keywords.find((keyword) => desc.includes(keyword));

    if (matchKeyword) {
      place.customCategory = matchKeyword;
      return true;
    }
    return false;
  });

  const specData = Array.from(
    new Map(filteredData.map((item) => [item.name, item])),
  );

  console.log("Hämtade och filtrerat unika kulturplatser:", specData.length);
  return specData;
}
