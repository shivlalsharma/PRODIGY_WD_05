const userTab = document.querySelector("#user-weather");
const searchTab = document.querySelector("#search-weather");
const grantAccessContainer = document.querySelector(".grant-location-container");
const grantAccess = document.querySelector("#grant-access");
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#search-input");
const loadingScreen = document.querySelector(".loading-container");
const weatherInfoContainer = document.querySelector(".weather-info-container");
const error = document.querySelector(".error");

let oldTab = userTab;
const API_KEY = "beff69e46196465ab9ad24a766918d05";
oldTab.classList.add("current-tab-option");

// Initially calling
getFromSessionStorage();

// Switching the tab
function switchTab(newTab) {
    if(newTab != oldTab) {
        error.classList.remove("active");
        oldTab.classList.remove("current-tab-option");
        oldTab = newTab;
        oldTab.classList.add("current-tab-option");

        if(!searchForm.classList.contains("active")) {
            weatherInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            searchForm.classList.remove("active");
            weatherInfoContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

// Checking whether the cordinates are already present in session storage or not
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("location-coordinates");
    if(!localCoordinates) {
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}


//  Fetching user weather detail by allowing location to get location access
async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    
    error.classList.remove('active');
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    // Fetching weather detail based on coordinates
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        if (!response.ok) {
            throw new Error('Unable to fetch weather data');
        }

        const  data = await response.json();

        if (data.cod !== 200) {
            throw new Error('Weather data not found');
        }

        loadingScreen.classList.remove("active");
        weatherInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        if (err.message === 'Unable to fetch weather data') {
            error.innerText = `Unable to fetch weather data`;
        } else {
            error.innerText = `${err.message}`;
        }
        
        setTimeout(()=>{
            error.classList.remove('active');
        },5000);
    }
}

// Displaying the weather details
function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector(".city-name");
    const countryIcon = document.querySelector(".country-icon");
    const desc = document.querySelector(".desc");
    const weatherIcon = document.querySelector(".weather-icon");
    const temp = document.querySelector(".temp");
    const windSpeed = document.querySelector(".wind-speed");
    const humidity = document.querySelector(".humidity");
    const cloudiness = document.querySelector(".cloudiness");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

//  Fetching current location by giving location access
function getLocation() {
    error.classList.remove('active');

    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, handleGeolocationError);
    }else{
        grantAccessContainer.classList.remove("active");
        loadingScreen.classList.remove("active");
        weatherInfoContainer.classList.remove("active");
        error.classList.add('active');
        error.innerText = `Geolocation is not supported by your browser.`;
        setTimeout(()=>{
            error.classList.remove('active');
        },5000);
    }
}

function handleGeolocationError(err) {
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.remove("active");
    weatherInfoContainer.classList.remove("active");
    error.classList.add('active');

    switch(err.code) {
        case err.PERMISSION_DENIED:
            error.innerText = `You denied the request for Geolocation`;
            break;
        case err.POSITION_UNAVAILABLE:
            error.innerText = `Location information is unavailable.`;
            break;
        case err.TIMEOUT:
            error.innerText = `The request to get user location timed out.`;
            break;
        case err.UNKNOWN_ERROR:
            error.innerText = `An unknown error occurred.`;
            break;
    }
    
    setTimeout(()=>{
        error.classList.remove('active');
    },5000);
}

function showPosition(position) {
    const locationCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("location-coordinates", JSON.stringify(locationCoordinates));
    fetchUserWeatherInfo(locationCoordinates);
}

grantAccess.addEventListener("click", getLocation);

// Submitting the search form
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cityName = searchInput.value;

    if(cityName === ""){
        return;
    } else{
        fetchSearchWeatherInfo(cityName);
    }
})

//  Fetching weather details by searching
async function fetchSearchWeatherInfo(city) {
    error.classList.remove('active');
    loadingScreen.classList.add("active");
    weatherInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        if (data.cod !== 200) {
            throw new Error('Enter valid city name');
        }

        loadingScreen.classList.remove("active");
        weatherInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        error.classList.add('active');
        error.innerText = `${err.message}`;
        setTimeout(()=>{
            error.classList.remove('active');
        },5000);
    }
}