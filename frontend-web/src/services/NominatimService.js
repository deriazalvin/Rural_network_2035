// NominatimService.js

class NominatimService {
    constructor() {
        this.baseUrl = 'https://nominatim.openstreetmap.org/search';
    }

    async autocomplete(searchTerm) {
        try {
            const response = await fetch(`${this.baseUrl}?q=${encodeURIComponent(searchTerm)}&format=json&addressdetails=1`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data.map(item => ({
                latitude: item.lat,
                longitude: item.lon,
                displayName: item.display_name
            }));
        } catch (error) {
            console.error('Error fetching data from Nominatim API:', error);
            return [];
        }
    }
}

export default NominatimService;