class LocationService {
    constructor() {
        this.currentLocation = null;
    }

    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        type: 'gps'
                    };
                    this.currentLocation = location;
                    resolve(location);
                },
                (error) => {
                    reject(new Error(this.getLocationError(error)));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

    async getLocationByCity(cityName) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                const location = {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon),
                    name: data[0].display_name,
                    type: 'search'
                };
                this.currentLocation = location;
                return location;
            } else {
                throw new Error('Location not found');
            }
        } catch (error) {
            throw new Error('Failed to geocode location: ' + error.message);
        }
    }

    getLocationError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                return 'User denied the request for Geolocation.';
            case error.POSITION_UNAVAILABLE:
                return 'Location information is unavailable.';
            case error.TIMEOUT:
                return 'The request to get user location timed out.';
            default:
                return 'An unknown error occurred.';
        }
    }

    async getLocationName(lat, lon) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );
            const data = await response.json();
            return data.display_name || 'Unknown Location';
        } catch (error) {
            return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        }
    }
}