class ChartManager {
    constructor() {
        this.charts = {};
    }

    initializeCharts() {
        this.createTemperatureChart();
        this.createHumidityChart();
        this.createWaterLevelChart();
        this.createAirQualityChart();
        this.createPressureChart();
        this.createWindChart();
    }

    createTemperatureChart() {
        const ctx = document.getElementById('temperatureChart').getContext('2d');
        this.charts.temperature = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Avg Temperature (°C)',
                    data: [],
                    borderColor: '#ff6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: this.getChartOptions('°C')
        });
    }

    createHumidityChart() {
        const ctx = document.getElementById('humidityChart').getContext('2d');
        this.charts.humidity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Avg Humidity (%)',
                    data: [],
                    borderColor: '#36a2eb',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: this.getChartOptions('%')
        });
    }

    createWaterLevelChart() {
        const ctx = document.getElementById('waterChart').getContext('2d');
        this.charts.waterLevel = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Avg Water Level (m)',
                    data: [],
                    borderColor: '#4bc0c0',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: this.getChartOptions('m')
        });
    }

    createAirQualityChart() {
        const ctx = document.getElementById('airChart').getContext('2d');
        this.charts.airQuality = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Avg Air Quality (AQI)',
                    data: [],
                    borderColor: '#ff9f40',
                    backgroundColor: 'rgba(255, 159, 64, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: this.getChartOptions('AQI')
        });
    }

    createPressureChart() {
        const ctx = document.getElementById('pressureChart').getContext('2d');
        this.charts.pressure = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Avg Pressure (hPa)',
                    data: [],
                    borderColor: '#9966ff',
                    backgroundColor: 'rgba(153, 102, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: this.getChartOptions('hPa')
        });
    }

    createWindChart() {
        const ctx = document.getElementById('windChart').getContext('2d');
        this.charts.windSpeed = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Avg Wind Speed (m/s)',
                    data: [],
                    borderColor: '#c9cbcf',
                    backgroundColor: 'rgba(201, 203, 207, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: this.getChartOptions('m/s')
        });
    }

    updateCharts(historicalData) {
        const labels = historicalData.map(data => data.date);

        this.updateChart(this.charts.temperature, labels, historicalData.map(data => data.temperature));
        this.updateChart(this.charts.humidity, labels, historicalData.map(data => data.humidity));
        this.updateChart(this.charts.waterLevel, labels, historicalData.map(data => data.waterLevel));
        this.updateChart(this.charts.airQuality, labels, historicalData.map(data => data.airQuality));
        this.updateChart(this.charts.pressure, labels, historicalData.map(data => data.pressure));
        this.updateChart(this.charts.windSpeed, labels, historicalData.map(data => data.windSpeed));
    }

    updateChart(chart, labels, data) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    }

    getChartOptions(unit) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 10
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: unit !== '°C' && unit !== 'hPa',
                    title: {
                        display: true,
                        text: unit,
                        font: {
                            size: 10
                        }
                    },
                    ticks: {
                        font: {
                            size: 9
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Week',
                        font: {
                            size: 10
                        }
                    },
                    ticks: {
                        font: {
                            size: 8
                        },
                        maxRotation: 45
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        };
    }
}