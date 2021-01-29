var currentData
var forecastData
var currentDay = moment()
var currentDayFormat = moment().format("M/D/Y")
var favs = []
if (localStorage.favs) {
    favs = JSON.parse(localStorage.favs)
}

document.getElementById("date").innerText = currentDayFormat

buildFavs()
buildForeCast()

function buildFavs() {
    for (var i = 0; i < favs.length; i++) {
        var favRow = document.createElement("div")
        favRow.class = "row"
        document.getElementById("favourites").appendChild(favRow)
        var newFav = document.createElement("button")
        newFav.setAttribute("class", "btn btn-outline-dark btn-test")
        newFav.setAttribute("onClick", `updateInformation("${favs[i]}")`)
        newFav.innerText = favs[i]
        favRow.appendChild(newFav)
    }
}

function buildForeCast() {
    for (var i = 1; i < 6; i++) {
        document.getElementById(`day-${i}-date`).innerText = currentDay.add(1, 'd').format("M/D/Y")
    }
    currentDay = moment()
}

async function citySearch(event) {
    event.preventDefault()

    // make API call using city name entered in search bar to get current weather data
    city = document.getElementById("city").value
    updateInformation(city)

}

async function updateInformation(city) {
    currentData = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=557ace5a3feab4dc1227705af9d390c9`).then(r => r.json())

    lat = currentData.coord.lat
    lon = currentData.coord.lon

    // make API to get the city's current UV data
    forecastData = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=557ace5a3feab4dc1227705af9d390c9`).then(r => r.json())

    // get important data from returned object
    var currentTemp = Math.round(currentData.main.temp)
    var currentHumidity = currentData.main.humidity
    var currentWindSpeed = Math.round(currentData.wind.speed * 36) / 10
    var currentUVIndex = forecastData.current.uvi


    // update text area to display weather data
    document.getElementById("city-name").innerText = currentData.name
    document.getElementById("temp").innerText = `Temperature: ${currentTemp} °C`
    document.getElementById("humidity").innerText = `Humidity: ${currentHumidity}%`
    document.getElementById("wind-speed").innerText = `Wind Speed: ${currentWindSpeed} KPH`
    document.getElementById("uv-index").innerText = `UV Index: ${currentUVIndex}`


    // get information for 5 day forecast
    for (var i = 1; i < 6; i++) {
        var temp = Math.round(forecastData.daily[i].temp.day)
        var humidity = forecastData.daily[i].humidity

        document.getElementById(`day-${i}-temp`).innerText = `Temperature: ${temp} °C`
        document.getElementById(`day-${i}-humidity`).innerText = `Humidity: ${humidity}%`
    }


    // add onto the favourites column if city is not already in favourites
    if (favs.includes(currentData.name) == false) {
        var favRow = document.createElement("div")
        favRow.class = "row"
        document.getElementById("favourites").appendChild(favRow)
        var newFav = document.createElement("button")
        newFav.setAttribute("class", "btn btn-outline-dark btn-test")
        newFav.setAttribute("onClick", `updateInformation("${currentData.name}")`)
        newFav.innerText = currentData.name
        favRow.appendChild(newFav)

        favs.push(currentData.name)
        localStorage.favs = JSON.stringify(favs)
    }
}