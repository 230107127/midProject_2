const apiKey = "c62659bd12addd77e4b15ea844296bf6";
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const cityInput = document.getElementById("city-input");
const unitToggle = document.getElementById("unit-toggle");
const forecastContainer = document.getElementById("forecast-container");
let unit = "metric"; 
function showLoading(isLoading) {
    searchBtn.disabled = isLoading;
    locationBtn.disabled = isLoading;
    searchBtn.textContent = isLoading ? "Loading..." : "Search";
}
async function getWeather(city) {
    showLoading(true);
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`
        );
        if (!response.ok) throw new Error("City not found");
        return response.json();
    } catch (error) {
        alert(error.message);
    } finally {
        showLoading(false);
    }
}
async function getForecast(city) {
    showLoading(true);
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`
        );
        if (!response.ok) throw new Error("City not found");
        return response.json();
    } catch (error) {
        alert(error.message);
    } finally {
        showLoading(false);
    }
}
function displayWeather(data) {
    if (!data) return;
    const currentCity = document.getElementById("current-city");
    const currentTemp = document.getElementById("current-temp");
    const currentIcon = document.getElementById("current-icon");
    const currentDetails = document.getElementById("current-details");

    currentCity.textContent = data.name;
    currentTemp.textContent = `Temp: ${data.main.temp}°`;
    currentIcon.innerHTML = `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="icon">`;
    currentDetails.textContent = `Humidity: ${data.main.humidity}%, Wind: ${data.wind.speed} m/s`;
}
function displayForecast(data) {
    if (!data) return;
    forecastContainer.innerHTML = "";

    for (let i = 0; i < data.list.length; i += 8) { 
        const forecast = data.list[i];
        const day = new Date(forecast.dt_txt).toLocaleDateString("en-US", { weekday: 'short' });
        const temp = forecast.main.temp;
        const icon = forecast.weather[0].icon;

        forecastContainer.innerHTML += `
            <div class="forecast-day">
                <p>${day}</p>
                <img src="http://openweathermap.org/img/wn/${icon}.png" alt="icon">
                <p>${temp}°</p>
            </div>
        `;
    }
}
cityInput.addEventListener("input", async () => {
    const city = cityInput.value;
    if (city.length > 2) {
        try {
            const response = await fetch(
                `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`
            );
            const cities = await response.json();
            // Подсказки городов
            const suggestions = cities.map(c => c.name).join(", ");
            // Отобразить подсказки (можно реализовать через элемент dropdown)
            console.log("Suggestions:", suggestions);
        } catch (error) {
            console.error("Error fetching city suggestions:", error);
        }
    }
});
searchBtn.addEventListener("click", async () => {
    const city = cityInput.value;
    if (city) {
        const weatherData = await getWeather(city);
        displayWeather(weatherData);

        const forecastData = await getForecast(city);
        displayForecast(forecastData);
    }
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            showLoading(true);
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${apiKey}`
                );
                const data = await response.json();
                displayWeather(data);

                const forecastResponse = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${apiKey}`
                );
                const forecastData = await forecastResponse.json();
                displayForecast(forecastData);
            } catch (error) {
                alert("Unable to retrieve location data.");
            } finally {
                showLoading(false);
            }
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});
unitToggle.addEventListener("change", () => {
    unit = unitToggle.value;
    if (cityInput.value) {
        searchBtn.click(); 
    } else {
        locationBtn.click();
    }
});
