class EnvironmentalMonitor {
    constructor() {
        this.locationService = new LocationService();
        this.environmentalAPI = new EnvironmentalAPI();
        this.chartManager = new ChartManager();
        this.loadingTimeout = null;
        this.updateInterval = null;
        this.currentLocation = null;
        this.initializeApp();
    }

    initializeApp() {
        this.chartManager.initializeCharts();
        this.setupEventListeners();
        
        this.tryGetDefaultLocation();
    }

    setupEventListeners() {
        document.getElementById('useCurrentLocation').addEventListener('click', () => {
            this.getCurrentLocationData();
        });

        document.getElementById('searchLocation').addEventListener('click', () => {
            this.getCustomLocationData();
        });

        document.getElementById('customLocation').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.getCustomLocationData();
            }
        });
    }

    async tryGetDefaultLocation() {
        try {
            await this.getCurrentLocationData();
        } catch (error) {
            this.showSampleData();
        }
    }

    async getCurrentLocationData() {
        this.showLoading();
        
        this.loadingTimeout = setTimeout(() => {
            this.showSampleData();
        }, 5000);

        try {
            const location = await this.locationService.getCurrentLocation();
            clearTimeout(this.loadingTimeout);
            this.currentLocation = location;
            await this.updateEnvironmentalData(location);
            this.startRealTimeUpdates();
        } catch (error) {
            clearTimeout(this.loadingTimeout);
            this.showError(error.message);
        }
    }

    async getCustomLocationData() {
        const cityName = document.getElementById('customLocation').value.trim();
        
        if (!cityName) {
            this.showError('Please enter a city name');
            return;
        }

        this.showLoading();

        this.loadingTimeout = setTimeout(() => {
            this.showSampleData();
        }, 5000);

        try {
            const location = await this.locationService.getLocationByCity(cityName);
            clearTimeout(this.loadingTimeout);
            this.currentLocation = location;
            await this.updateEnvironmentalData(location);
            this.startRealTimeUpdates();
        } catch (error) {
            clearTimeout(this.loadingTimeout);
            this.showError(error.message);
        }
    }

    async updateEnvironmentalData(location) {
        try {
            const locationName = await this.locationService.getLocationName(
                location.latitude, 
                location.longitude
            );

            document.getElementById('locationName').textContent = locationName;
            document.getElementById('coordinates').textContent = 
                `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)} • Updated: ${new Date().toLocaleTimeString()}`;

            const [currentData, historicalData] = await Promise.all([
                this.environmentalAPI.getEnvironmentalData(location.latitude, location.longitude),
                this.environmentalAPI.getHistoricalData(location.latitude, location.longitude, 8) // 8 weeks
            ]);

            this.updateSensorReadings(currentData);
            this.chartManager.updateCharts(historicalData);
            
            this.showDashboard();

        } catch (error) {
            this.showError('Failed to fetch environmental data: ' + error.message);
        }
    }

    startRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(async () => {
            if (this.currentLocation) {
                try {
                    const currentData = await this.environmentalAPI.getEnvironmentalData(
                        this.currentLocation.latitude, 
                        this.currentLocation.longitude
                    );
                    this.updateSensorReadings(currentData);
                    
                    document.getElementById('coordinates').textContent = 
                        `Lat: ${this.currentLocation.latitude.toFixed(4)}, Lon: ${this.currentLocation.longitude.toFixed(4)} • Updated: ${new Date().toLocaleTimeString()}`;
                } catch (error) {
                    console.error('Error updating real-time data:', error);
                }
            }
        }, 120000);
    }

    updateSensorReadings(data) {
        document.getElementById('temperature').textContent = `${data.temperature}°C`;
        document.getElementById('tempStatus').textContent = 
            this.environmentalAPI.getTemperatureStatus(data.temperature);

        document.getElementById('humidity').textContent = `${data.humidity}%`;
        document.getElementById('humidityStatus').textContent = 
            this.environmentalAPI.getHumidityStatus(data.humidity);

        document.getElementById('waterLevel').textContent = `${data.waterLevel}m`;
        document.getElementById('waterStatus').textContent = 
            this.environmentalAPI.getWaterLevelStatus(data.waterLevel);

        document.getElementById('airQuality').textContent = `${data.airQuality} AQI`;
        document.getElementById('airStatus').textContent = 
            this.environmentalAPI.getAirQualityStatus(data.airQuality);

        document.getElementById('pressure').textContent = `${data.pressure} hPa`;
        document.getElementById('pressureStatus').textContent = 
            this.environmentalAPI.getPressureStatus(data.pressure);

        document.getElementById('windSpeed').textContent = `${data.windSpeed} m/s`;
        document.getElementById('windStatus').textContent = 
            this.environmentalAPI.getWindStatus(data.windSpeed);
    }

    showSampleData() {
        const now = new Date();
        const sampleData = this.environmentalAPI.calculateRealisticData(40.7128, -74.0060, now);

        document.getElementById('locationName').textContent = 'Sample Location (NYC)';
        document.getElementById('coordinates').textContent = 'Using realistic sample data • Updated: ' + now.toLocaleTimeString();
        
        this.updateSensorReadings(sampleData);
        
        
        const historicalData = [];
        for (let i = 7; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - (i * 7));
            const weekData = this.environmentalAPI.calculateWeeklyAverage(40.7128, -74.0060, date);
            historicalData.push({
                date: this.environmentalAPI.getWeekLabel(date),
                ...weekData
            });
        }
        
        this.chartManager.updateCharts(historicalData);
        this.showDashboard();
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('error').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('error').style.display = 'none';
    }

    showError(message) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('errorMessage').textContent = message;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    new EnvironmentalMonitor();
});