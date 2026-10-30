/**
 * SMART PCH - Weather System Module (Buxoro Region)
 */

// Use var to avoid redeclaration errors with script.js
var weatherData = weatherData || null;
var currentWeatherView = currentWeatherView || 'current';

async function loadWeatherData() {
    try {
        const weatherContainer = document.querySelector('.weather-container');
        if (!weatherContainer) return;

        // 1. Determine Coordinates (Default: Buxoro central)
        let lat = 39.75; 
        let lon = 64.42;
        let locationName = "Markaziy hudud";

        // 2. Try to get coordinates from Logged-in Branch
        const user = window.currentUser || (window.Auth && window.Auth.getUser && window.Auth.getUser());
        const bolId = user && user.bolinma_id ? parseInt(user.bolinma_id.replace(/\D/g, '')) : null;

        if (bolId && window.INITIAL_DATA && window.INITIAL_DATA.stations) {
            const station = window.INITIAL_DATA.stations.find(s => s.bolinma === bolId);
            if (station) {
                lat = station.lat;
                lon = station.lon || station.lng; // Support both naming conventions
                locationName = station.name;
            }
        }

        // Caching mechanism: Avoid redundant requests if location hasn't changed and data is fresh
        const cached = localStorage.getItem('lastWeatherData');
        const lastFetch = localStorage.getItem('lastWeatherFetchTime');
        const lastLoc = localStorage.getItem('lastWeatherLocation');
        const now = Date.now();

        if (cached && lastFetch && lastLoc === locationName && (now - lastFetch < 15 * 60 * 1000)) {
            weatherData = JSON.parse(cached);
            renderWeather(locationName);
            return;
        }

        weatherContainer.innerHTML = `<div class="weather-loading"><i class="fas fa-spinner fa-spin"></i> ${locationName} havosi yuklanmoqda...</div>`;

        // window.CONFIG already defines appropriate URLs
        const response = await fetch(`${window.CONFIG.API_URL}/weather?lat=${lat}&lon=${lon}`);
        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        weatherData = {
            current: data,
            hourly: [],
            daily: [],
            locationName: locationName
        };

        // Save to cache
        localStorage.setItem('lastWeatherData', JSON.stringify(weatherData));
        localStorage.setItem('lastWeatherFetchTime', now.toString());
        localStorage.setItem('lastWeatherLocation', locationName);

        renderWeather(locationName);
    } catch (error) {
        console.error('Weather load error:', error);
        useFallbackWeather();
    }
}

function useFallbackWeather() {
    weatherData = {
        current: {
            main: { temp: 8, feels_like: 5, humidity: 70, pressure: 1015 },
            wind: { speed: 12, deg: 320 },
            weather: [{ description: 'qisman bulutli', icon: '02d', main: 'Clouds' }],
            dt: Math.floor(Date.now() / 1000)
        }
    };
    renderWeather();
}

function renderWeather(locName) {
    const container = document.querySelector('.weather-container');
    if (!container || !weatherData) return;

    if (currentWeatherView === 'current') renderCurrentWeather(container, locName || weatherData.locationName);
    else if (currentWeatherView === 'hourly') renderHourlyForecast(container);
    else if (currentWeatherView === 'daily') renderDailyForecast(container);
}

function renderCurrentWeather(container, locName) {
    const data = weatherData.current || {};
    const main = data.main || { temp: 15, feels_like: 15, humidity: 50 };
    const wind = data.wind || { speed: 0 };
    const weather = data.weather && data.weather[0] ? data.weather[0] : { description: 'nomalum', icon: '01d', main: 'Clear' };
    
    const temp = Math.round(main.temp || 0);
    const railTemp = temp + (weather.main === 'Clear' ? 15 : 5);
    
    container.innerHTML = `
        <div class="weather-card" style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.7rem; color: #94a3b8; text-transform: uppercase;">
                    <i class="fas fa-location-dot"></i> ${locName || 'Buxoro'}
                </div>
                <div style="font-size: 0.7rem; color: #10b981;">REAL-TIME</div>
            </div>
            
            <div style="display: flex; gap: 20px; align-items: center;">
                <div style="flex: 1; display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                    <div class="weather-icon" style="font-size: 1.5rem; color: #f59e0b;"><i class="${getWeatherIcon(weather.icon)}"></i></div>
                    <div>
                        <div style="font-size: 1.6rem; font-weight: 800; color: #fff;">${temp}°C</div>
                        <div style="font-size: 0.65rem; color: #94a3b8;">HAVO HARORATI</div>
                    </div>
                </div>
                
                <div style="flex: 1; display: flex; align-items: center; gap: 12px; background: rgba(245, 158, 11, 0.05); padding: 10px; border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.2);">
                    <div style="font-size: 1.5rem; color: #ef4444;"><i class="fas fa-temperature-high"></i></div>
                    <div>
                        <div style="font-size: 1.6rem; font-weight: 800; color: #ef4444;">${railTemp}°C</div>
                        <div style="font-size: 0.65rem; color: #94a3b8;">RELS HARORATI</div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; padding: 0 5px;">
                <span><i class="fas fa-wind"></i> ${wind.speed || 0} m/s</span>
                <span><i class="fas fa-droplet"></i> ${main.humidity || 0}%</span>
                <span>${escapeHtml(weather.description || '')}</span>
            </div>
        </div>
    `;

    // Also update Hero Statistics if they exist
    const heroWeather = document.getElementById('hero-weather-temp');
    if (heroWeather) heroWeather.innerText = `${temp}°C`;
    const heroRail = document.getElementById('hero-rail-temp');
    if (heroRail) heroRail.innerText = `${railTemp}°C`;
}

function getWeatherIcon(iconCode) {
    const icons = {
        '01d': 'fas fa-sun', '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun', '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud', '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud-meatball', '04n': 'fas fa-cloud-meatball',
        '09d': 'fas fa-cloud-showers-heavy', '10d': 'fas fa-cloud-rain',
        '11d': 'fas fa-bolt', '13d': 'fas fa-snowflake', '50d': 'fas fa-smog'
    };
    return icons[iconCode] || 'fas fa-cloud';
}

// Global Exports
window.loadWeatherData = loadWeatherData;
window.renderWeather = renderWeather;
