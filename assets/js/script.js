var searchResult = $("#searchResult");
var searchHistory = $("#searchHistory");
var openWeather = "https://api.openweathermap.org/data/2.5/";
var apiId = "&appid=9726f22214b33db1ab5c46343f311c22";
var searchHistoryList;
var cityName;

checkLocalStorage();

//show local time
var localTime = $("<p>");
localTime.addClass("mb-0 text-right");
localTime.attr("id", "changeTime");
localTime.text("Local Time: " + moment().format("LLL"));
$("#localTime").append(localTime);
setInterval(function () {
    var currentSecond = moment().second();
    if (currentSecond == 0) {
        $("#changeTime").text("Local Time: " + moment().format("LLL"));
    }
}, 1000);

//click search button
$("#searchButton").on("click", function () {
    //get city name from input
    cityName = $("#cityName").val().trim();
    localStorage.setItem("lastSearch", cityName);

    //add city to search history
    addCityToSearchHistory(cityName);

    //empty input box
    $("#cityName").val("");

    //print weather info
    printWeatherInfo(cityName);
});

//press enter/return button to search
$("#cityName").keypress(function (event) {
    if (event.keyCode === 13) {
        $("#searchButton").click();
    }
});

//press gps button to get user location's weather
$("#getLocationButton").on("click", function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (response) {
            var queryURL = openWeather + "weather?lat=" + response.coords.latitude + "&lon=" + response.coords.longitude + apiId;
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                searchResult.empty();
                remove_dnone_class($("#weatherInfo"));
                searchResult.append("<h4>" + response.name + " (" + moment().utc().add(response.timezone, 'seconds').format("LLL") + ")<img src='http://openweathermap.org/img/wn/" + response.weather[0].icon + ".png' alt='weather icon'></h4>");
                searchResult.append("<p>Temperature: " + Math.round((response.main.temp - 273.15) * 9 / 5 + 32) + " " + String.fromCharCode(176) + "F</p>");
                searchResult.append("<p>Humidity: " + response.main.humidity + "%</p>");
                searchResult.append("<p>Wind Speed: " + response.wind.speed + " MPH</p>");
                getUV(response.coord.lat, response.coord.lon);
                cityName = response.name;
                addCityToSearchHistory(cityName);
                localStorage.setItem("lastSearch", cityName);
                forecast(response.coord.lat, response.coord.lon);
            });
        });
    }
});

//click on search history to get weather info on that city
searchHistory.on("click", ".list-group-item", function () {
    printWeatherInfo($(this).attr("city"));
});

//if there is local storage for last search, it will print last searched city's weather info
function checkLocalStorage() {
    var previousSearchHistory = localStorage.getItem("lastSearch");
    if (previousSearchHistory !== null) {
        printWeatherInfo(previousSearchHistory);
    }
}

//remove d-none class to display the content
function remove_dnone_class(remove) {
    if (remove.hasClass("d-none")) {
        remove.removeClass("d-none");
    }
}

//get city name and print the weather
function printWeatherInfo(cityName) {
    var queryURL = openWeather + "weather?&q=" + cityName + apiId;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        searchResult.empty();
        remove_dnone_class($("#weatherInfo"));
        searchResult.append("<h4>" + response.name + " (" + moment().utc().add(response.timezone, 'seconds').format("LLL") + ")<img src='http://openweathermap.org/img/wn/" + response.weather[0].icon + ".png' alt='weather icon'></h4>");
        searchResult.append("<p>Temperature: " + Math.round((response.main.temp - 273.15) * 9 / 5 + 32) + " " + String.fromCharCode(176) + "F</p>");
        searchResult.append("<p>Humidity: " + response.main.humidity + "%</p>");
        searchResult.append("<p>Wind Speed: " + response.wind.speed + " MPH</p>");
        getUV(response.coord.lat, response.coord.lon);
        forecast(response.coord.lat, response.coord.lon);
    });
}

//add city to search history
function addCityToSearchHistory(cityName) {
    var addSearchHistory = $("<li>");
    addSearchHistory.addClass("list-group-item");
    addSearchHistory.text(cityName);
    addSearchHistory.attr("city", cityName);
    searchHistory.prepend(addSearchHistory);
    remove_dnone_class(searchHistory.parent());
    //if history list is too long delete oldest search history
    if (document.getElementById("searchHistory").getElementsByTagName("li").length == 10) {
        searchHistory.find(":last-child").remove();
    }
}

//get city location and print uv index
function getUV(lat, lon) {
    var queryURL = openWeather + "uvi?lat=" + lat + "&lon=" + lon + apiId;
    $.ajax({
        url: queryURL,
        moethod: "GET"
    }).then(function (response) {
        var uvValue = response.value;
        searchResult.append("<p>UV index: <span id='uvColor'>" + uvValue + "</span></p>");
        var uvColor = $("#uvColor");
        if (uvValue < 3) {
            uvColor.css("background-color", "green");
            searchResult.append("<p>Low danger from the Sun's UV rays for the average person.</p>");
        } else if (uvValue < 6) {
            uvColor.css("background-color", "yellow");
            uvColor.css("color", "black");
            searchResult.append("<p>Moderate risk of harm from unprotected Sun exposure.</p>");
        } else if (uvValue < 8) {
            uvColor.css("background-color", "orange");
            uvColor.css("color", "black");
            searchResult.append("<p>High risk of harm from unprotected Sun exposure. Protection against skin and eye damage is needed.</p>");
        } else if (uvValue < 11) {
            uvColor.css("background-color", "red");
            searchResult.append("<p>Very high risk of harm from unprotected Sun exposure. Take extra precautions because unprotected skin and eyes will be damaged and can burn quickly.</p>");
        } else if (uvValue > 11) {
            uvColor.css("background-color", "violet");
            searchResult.append("<p>Extreme risk of harm from unportected Sun exposure. Take all precautions because unprotected skin and eyes can burn in minutes.</p>");
        }
    });
}

function forecast(lat, lon) {
    var queryURL = openWeather + "onecall?lat=" + lat + "&lon=" + lon + apiId;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        for (i = 1; i < 6; i++) {
            var forecastCard = "[value=" + i + "]";
            $(forecastCard).empty();
            $(forecastCard).append(moment.unix(response.daily[i].dt).format("LL"));
            $(forecastCard).append("<p><img src='http://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + ".png' alt='weather icon'></p>");
            $(forecastCard).append("<p>Temp: " + Math.round((response.daily[i].temp.day - 273.15) * 9 / 5 + 32) + " " + String.fromCharCode(176) + "F</p>");
            $(forecastCard).append("<p>Humidity: " + response.daily[i].humidity + "%</p>");
        }
        console.log(response);
    });
}