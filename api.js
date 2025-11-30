class EnvironmentalAPI {
    constructor() {
        this.dataCache = new Map();
    }

    async getEnvironmentalData(latitude, longitude) {
        await new Promise(resolve => setTimeout(resolve, 300));

        const now = new Date();
        const baseData = this.calculateRealisticData(latitude, longitude, now);
        
        return {
            temperature: baseData.temperature,
            humidity: baseData.humidity,
            waterLevel: baseData.waterLevel,
            airQuality: baseData.airQuality,
            pressure: baseData.pressure,
            windSpeed: baseData.windSpeed,
            timestamp: now.toISOString()
        };
    }

    async getHistoricalData(latitude, longitude, weeks = 8) {
        const historicalData = [];
        const now = new Date();

        for (let i = weeks - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - (i * 7)); 
            
            
            const weekData = this.calculateWeeklyAverage(latitude, longitude, date);
            
            historicalData.push({
                date: this.getWeekLabel(date),
                temperature: weekData.temperature,
                humidity: weekData.humidity,
                waterLevel: weekData.waterLevel,
                airQuality: weekData.airQuality,
                pressure: weekData.pressure,
                windSpeed: weekData.windSpeed,
                rawDate: date
            });
        }

        return historicalData;
    }

    calculateWeeklyAverage(latitude, longitude, startDate) {
        let tempSum = 0;
        let humiditySum = 0;
        let waterLevelSum = 0;
        let airQualitySum = 0;
        let pressureSum = 0;
        let windSpeedSum = 0;
        
        const samples = 7; 
        
        for (let day = 0; day < samples; day++) {
            const sampleDate = new Date(startDate);
            sampleDate.setDate(sampleDate.getDate() + day);
            
            const dailyData = this.calculateRealisticData(latitude, longitude, sampleDate);
            
            tempSum += dailyData.temperature;
            humiditySum += dailyData.humidity;
            waterLevelSum += dailyData.waterLevel;
            airQualitySum += dailyData.airQuality;
            pressureSum += dailyData.pressure;
            windSpeedSum += dailyData.windSpeed;
        }
        
        return {
            temperature: Math.round((tempSum / samples) * 10) / 10,
            humidity: Math.round(humiditySum / samples),
            waterLevel: Math.round((waterLevelSum / samples) * 10) / 10,
            airQuality: Math.round(airQualitySum / samples),
            pressure: Math.round(pressureSum / samples),
            windSpeed: Math.round((windSpeedSum / samples) * 10) / 10
        };
    }

    getWeekLabel(date) {
        const weekStart = new Date(date);
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const startStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return `${startStr}-${endStr}`;
    }

    calculateRealisticData(latitude, longitude, date) {
        const hour = date.getHours();
        const month = date.getMonth();
        const isDaytime = hour >= 6 && hour <= 18;
        
        const baseTemp = this.calculateBaseTemperature(latitude, month);
        const baseHumidity = this.calculateBaseHumidity(latitude, longitude, month);
        const basePressure = this.calculateBasePressure(month);
        
        
        const tempVariation = this.calculateTemperatureVariation(hour, isDaytime);
        const humidityVariation = this.calculateHumidityVariation(hour, isDaytime);
        const pressureVariation = this.calculatePressureVariation(hour);
        const windVariation = this.calculateWindVariation(hour);
        const airQualityVariation = this.calculateAirQualityVariation(hour, isDaytime);
        
        return {
            temperature: Math.round((baseTemp + tempVariation) * 10) / 10,
            humidity: Math.round(baseHumidity + humidityVariation),
            waterLevel: this.calculateWaterLevel(date, latitude),
            airQuality: Math.round(basePressure + airQualityVariation),
            pressure: Math.round(basePressure + pressureVariation),
            windSpeed: Math.round((3 + windVariation) * 10) / 10
        };
    }

    calculateBaseTemperature(latitude, month) {
        
        const isNorthern = latitude >= 0;
        let seasonalAdjustment = 0;
        
        if (isNorthern) {
            
            seasonalAdjustment = Math.sin((month - 4) * Math.PI / 6) * 12;
        } else {
           
            seasonalAdjustment = Math.sin((month - 10) * Math.PI / 6) * 12;
        }
        
        const equatorTemp = 25 + seasonalAdjustment;
        const poleTemp = -15 + seasonalAdjustment;
        const latRatio = Math.abs(latitude) / 90;
        return equatorTemp - (equatorTemp - poleTemp) * latRatio;
    }

    calculateBaseHumidity(latitude, longitude, month) {
        
        const seasonalHumidity = Math.sin((month - 6) * Math.PI / 6) * 15;
        const baseHumidity = 60 + seasonalHumidity;
        
        
        const coastalEffect = (Math.sin(longitude * 0.01) + 1) * 20;
        return baseHumidity + coastalEffect;
    }

    calculateBasePressure(month) {
        
        const seasonalVariation = Math.sin((month - 6) * Math.PI / 6) * 8;
        return 1013 + seasonalVariation;
    }

    calculateTemperatureVariation(hour, isDaytime) {
        const amplitude = 8;
        const phaseShift = -3 * Math.PI / 12;
        const variation = Math.sin((hour * Math.PI / 12) + phaseShift) * amplitude;
        return variation;
    }

    calculateHumidityVariation(hour, isDaytime) {
        const amplitude = 20;
        const phaseShift = Math.PI;
        const variation = Math.sin((hour * Math.PI / 12) + phaseShift) * amplitude;
        return variation;
    }

    calculatePressureVariation(hour) {
        const amplitude = 2;
        return Math.sin(hour * Math.PI / 6) * amplitude;
    }

    calculateWindVariation(hour) {
        const base = Math.sin(hour * Math.PI / 12) * 2;
        const gust = Math.random() * 3;
        return base + gust;
    }

    calculateAirQualityVariation(hour, isDaytime) {
        let variation = 0;
        
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            variation = 30;
        } else if (hour >= 22 || hour <= 5) {
            variation = -20;
        }
        
        const windEffect = -Math.random() * 10;
        return variation + windEffect;
    }

    calculateWaterLevel(date, latitude) {
        const timeOfDay = date.getHours() + (date.getMinutes() / 60);
        const dayOfYear = this.getDayOfYear(date);
        
        
        const tidalVariation = Math.sin(timeOfDay * Math.PI / 6) * 0.3;
        
        
        const seasonalVariation = Math.sin((dayOfYear - 80) * 2 * Math.PI / 365) * 0.6;
        
        
        const weeklyPattern = Math.sin(dayOfYear * 2 * Math.PI / 14) * 0.2;
        
        const baseLevel = latitude > 0 ? 2.5 : 2.8;
        
        return Math.round((baseLevel + tidalVariation + seasonalVariation + weeklyPattern) * 10) / 10;
    }

    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    
    getTemperatureStatus(temp) {
        if (temp < 0) return 'Freezing ❄️';
        if (temp < 10) return 'Cold 🥶';
        if (temp < 20) return 'Cool 😊';
        if (temp < 30) return 'Warm ☀️';
        return 'Hot 🔥';
    }

    getHumidityStatus(humidity) {
        if (humidity < 30) return 'Dry 🏜️';
        if (humidity < 60) return 'Comfortable 😊';
        if (humidity < 80) return 'Humid 💧';
        return 'Very Humid 🌫️';
    }

    getWaterLevelStatus(level) {
        if (level < 1.5) return 'Very Low ⚠️';
        if (level < 2.2) return 'Low 📉';
        if (level < 3.5) return 'Normal ✅';
        return 'High 📈';
    }

    getAirQualityStatus(aqi) {
        if (aqi < 50) return 'Good ✅';
        if (aqi < 100) return 'Moderate 😊';
        if (aqi < 150) return 'Unhealthy for Sensitive Groups 😐';
        if (aqi < 200) return 'Unhealthy ❌';
        return 'Very Unhealthy 🚨';
    }

    getPressureStatus(pressure) {
        if (pressure < 1000) return 'Low 🌧️';
        if (pressure < 1015) return 'Normal 😊';
        return 'High ☀️';
    }

    getWindStatus(speed) {
        if (speed < 1) return 'Calm 🍃';
        if (speed < 5) return 'Light 💨';
        if (speed < 10) return 'Moderate 🌬️';
        if (speed < 15) return 'Strong 💨💨';
        return 'Very Strong 🌪️';
    }
}