export async function fetchSmapi() {
    
    const url = `https://smapi.lnu.se/api/?api_key=tsShv4yJ&controller=attraction&method=getall`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const attractions = data.payload || [];

       
        const keywords = ["museum", "sevärdhet", "konsthall", "slott", "kyrka", "naturreservat", "fornlämning"];


        const filteredData = attractions.filter(place => {
            const desc = place.description ? place.description.toLowerCase() : "";
            
            return keywords.some(keyword => desc.includes(keyword.toLowerCase()));
        });

        console.log("Hittade antal efter filtrering:", filteredData.length);
        return filteredData; 

    } catch (error) {
        console.error("Fel vid hämtning:", error);
        return [];
    }
}