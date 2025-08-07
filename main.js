const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");

getfromSessionStorage();

function switchTab(newTab) {
    if(newTab != oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        newTab.classList.add("current-tab");
        
        if(!searchForm.classList.contains("active")) {
              //if search form is invisible then make it visible
              userInfoContainer.classList.remove("active");
              grantAccessContainer.classList.remove("active");
              searchForm.classList.add("active");
        }
        else {
            //in else case search form is already visible now visible your weather tab
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //now i come to the your weather tab , so i have to display weather ,so lets check local storage first
            //for coordinaateraters if we saved them there
            getfromSessionStorage();

        }
    }
    else {
           return;
    }
}

userTab.addEventListener("click",() => {
      //pass clicked tab as input parameter
      switchTab(userTab);      
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(searchTab);   
});

//first check if coordiantes are already present in session storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        //if local coordinates not found 
        grantAccessContainer.classList.add("active");
    }
    else {
        //if local coordinates found set the values to inputs and call function to show user info
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordiantes) {
    const {lat,lon} = coordiantes;
    //make grantcontainer invisible ?
    grantAccessContainer.classList.remove("active")
    //make loader visible
    loadingScreen.classList.add("active");

    //API call
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
          
        if (!response.ok) {
            throw new Error('Weather data not available for this city');
        }
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        alert("There was an error fetching weather data: " + err.message);
    }
}

function renderWeatherInfo(weatherInfo) {
    //fistly, we have to fetch the elements 

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description; //?
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;

}

function geoLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        alert("Geolocation is not supporated");
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",geoLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit",(e) => {
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName === "") 
        return;
    else
    fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );

        if (!response.ok) {
            throw new Error('Weather data not available for this city');
        }

        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        alert("There was an error fetching weather data: " + err.message);
    }
}