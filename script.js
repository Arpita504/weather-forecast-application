const apiKey = "fda2eb502bd87e508be872361cd24897";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";
const geocodingApiUrl = "https://api.openweathermap.org/geo/1.0/direct?q=";

const cityInput = document.getElementById('cityInput');
const cityList = document.getElementById('cityList');
const searchBtn = document.getElementById('searchBtn');
const unitSelect = document.getElementById('unitSelect');
const weatherInfo = document.querySelector('main');
const searchCitySection = document.querySelector('.search-city');
const notFoundSection = document.querySelector('.not-found');

searchBtn.addEventListener('click', () => {
    getWeather(cityInput.value);
});

cityInput.addEventListener('keyup', (event) => {
    if (event.key === "Enter") {
        getWeather(cityInput.value);
    } else {
        autocompleteCity(cityInput.value);
    }
});

unitSelect.addEventListener('change', () => {
    getWeather(cityInput.value);
});

async function autocompleteCity(query) {
    if (query.length < 3) return;
    
    try {
        const response = await fetch(`${geocodingApiUrl}${query}&limit=5&appid=${apiKey}`);
        const data = await response.json();
        
        cityList.innerHTML = '';
        data.forEach(city => {
            const option = document.createElement('option');
            option.value = `${city.name}, ${city.country}`;
            cityList.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching city suggestions:", error);
    }
}

async function getWeather(city) {
    try {
        const unit = unitSelect.value;
        const response = await fetch(`${apiUrl}${city}&appid=${apiKey}&units=${unit}`);
        const forecastResponse = await fetch(`${forecastApiUrl}${city}&appid=${apiKey}&units=${unit}`);

        if (!response.ok || !forecastResponse.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();
        const forecastData = await forecastResponse.json();

        updateWeatherInfo(data, unit);
        updateForecast(forecastData, unit);
        weatherInfo.style.display = "grid";
        searchCitySection.style.display = "none";
        notFoundSection.style.display = "none";
    } catch (error) {
        console.error("Error fetching weather data:", error);
        weatherInfo.style.display = "none";
        searchCitySection.style.display = "none";
        notFoundSection.style.display = "block";
    }
}

function updateWeatherInfo(data, unit) {
    const temp = unit === 'metric' ? data.main.temp : celsiusToFahrenheit(data.main.temp);
    const feelsLike = unit === 'metric' ? data.main.feels_like : celsiusToFahrenheit(data.main.feels_like);

    document.getElementById('weatherIcon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('temperature').textContent = `${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}`;
    document.getElementById('weatherDescription').textContent = data.weather[0].description;
    document.getElementById('feelsLike').textContent = `Feels like ${Math.round(feelsLike)}°${unit === 'metric' ? 'C' : 'F'}`;
    document.getElementById('dateTime').textContent = new Date().toLocaleString();
    document.getElementById('location').textContent = `${data.name}, ${data.sys.country}`;

    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}`;
    document.getElementById('sunrise').textContent = `Sunrise: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}`;
    document.getElementById('sunset').textContent = `Sunset: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}`;
    document.getElementById('clouds').textContent = `${data.clouds.all}%`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${data.visibility}  m`;

  

    // Note: UV Index is not available in the current weather API, so we'll use a placeholder
   // document.getElementById('uvIndex').textContent = "N/A";
}

function updateForecast(forecastData, unit) {
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';

    const dailyForecasts = forecastData.list.filter((item, index) => index % 8 === 0);

    dailyForecasts.forEach((day) => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayMonth = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

        const temp = unit === 'metric' ? day.main.temp : celsiusToFahrenheit(day.main.temp);
        const tempMin = unit === 'metric' ? day.main.temp_min : celsiusToFahrenheit(day.main.temp_min);
        const tempMax = unit === 'metric' ? day.main.temp_max : celsiusToFahrenheit(day.main.temp_max);

        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        forecastCard.innerHTML = `
            <h4>${dayName}</h4>
            <p>${dayMonth}</p>
            <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
            <p>${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}</p>
            <p>Low: ${Math.round(tempMin)}° High: ${Math.round(tempMax)}°</p>
            <p>${day.weather[0].description}</p>
        `;

        forecastGrid.appendChild(forecastCard);
    });
}

function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function fahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5/9;
}

// Initialize with a default city
getWeather('Bengaluru');