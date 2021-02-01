var currentData
var forecastData
var currentDay = moment()
var currentDayFormat = moment().format("M/D/Y")
var favs = []
if (localStorage.favs) {
    favs = JSON.parse(localStorage.favs)
}

// populate the html page of the page
document.getElementById("current-data").innerText += ` (${currentDayFormat})`
buildFavs()
buildForecast()

// function to build list of favourites
function buildFavs() {
    for (var i = 0; i < favs.length; i++) {
        var favRow = document.createElement("div")
        favRow.class = "row"
        document.getElementById("favourites").appendChild(favRow)
        var newFav = document.createElement("button")
        newFav.setAttribute("class", "btn btn-outline-dark btn-fav")
        newFav.setAttribute("onClick", `updateInformation("${favs[i]}")`)
        newFav.innerText = favs[i]
        favRow.appendChild(newFav)
    }
}

// function to get the dates for the five day forecast
function buildForecast() {
    for (var i = 1; i < 6; i++) {
        document.getElementById(`day-${i}-date`).innerText = currentDay.add(1, 'd').format("M/D/Y")
    }
    currentDay = moment()
}

// function called when user searches for a city
async function citySearch(event) {
    event.preventDefault()

    // make API call using city name entered in search bar to get current weather data
    document.getElementById("error-msg").style.display = "none"
    city = document.getElementById("city").value
    updateInformation(city)

}

// function to call API and update the forecast and current information
async function updateInformation(city) {
    currentData = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=557ace5a3feab4dc1227705af9d390c9`).then(r => r.json())

    if (currentData.cod == "404") {
        document.getElementById("error-msg").style.display = "flex"
    } else {
        lat = currentData.coord.lat
        lon = currentData.coord.lon

        // make API to get the city's current UV data
        forecastData = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=557ace5a3feab4dc1227705af9d390c9`).then(r => r.json())

        // get important data from returned object
        var currentTemp = Math.round(currentData.main.temp)
        var weatherImg = forecastData.current.weather[0].icon
        var currentHumidity = currentData.main.humidity
        var currentWindSpeed = Math.round(currentData.wind.speed * 36) / 10
        var currentUVIndex = forecastData.current.uvi


        // update text area to display weather data
        document.getElementById("current-data").innerHTML = `${currentData.name} (${currentDayFormat}) <img src="https://openweathermap.org/img/wn/${weatherImg}.png" /> `
        document.getElementById("temp").innerText = `Temperature: ${currentTemp} °C`
        document.getElementById("humidity").innerText = `Humidity: ${currentHumidity}%`
        document.getElementById("wind-speed").innerText = `Wind Speed: ${currentWindSpeed} KPH`
        document.getElementById("uv-index").innerText = `UV Index: ${currentUVIndex}`


        // get information for 5 day forecast
        for (var i = 1; i < 6; i++) {
            var temp = Math.round(forecastData.daily[i].temp.day)
            var humidity = forecastData.daily[i].humidity

            document.getElementById(`day-${i}-date`).innerText = currentDay.add(i, 'd').format("M/D/Y")
            currentDay = moment()
            document.getElementById(`day-${i}-date`).innerHTML += `<img src='https://openweathermap.org/img/wn/${forecastData.daily[i].weather[0].icon}.png' />`
            document.getElementById(`day-${i}-temp`).innerText = `Temperature: ${temp} °C`
            document.getElementById(`day-${i}-humidity`).innerText = `Humidity: ${humidity}%`
        }


        // add onto the favourites column if city is not already in favourites
        if (favs.includes(currentData.name) == false) {
            var favRow = document.createElement("div")
            favRow.class = "row"
            document.getElementById("favourites").appendChild(favRow)
            var newFav = document.createElement("button")
            newFav.setAttribute("class", "btn btn-outline-dark btn-fav")
            newFav.setAttribute("onClick", `updateInformation("${currentData.name}")`)
            newFav.innerText = currentData.name
            favRow.appendChild(newFav)

            favs.push(currentData.name)
            localStorage.favs = JSON.stringify(favs)
        }
    }
}