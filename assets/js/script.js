var searchResult = $("#searchResult");
var searchHistory = $("#searchHistory");
var openWeather = "https://api.openweathermap.org/data/2.5/";
var apiId = "&appid=9726f22214b33db1ab5c46343f311c22";

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

//click search button to get city name from input and print city weather info
$(".btn").on("click", function () {
    //get city name from input
    var cityName = $("#cityName").val().trim();

    //add searched city names to a list
    var addSearchHistory = $("<li>");
    addSearchHistory.addClass("list-group-item");
    addSearchHistory.text(cityName);
    addSearchHistory.attr("city", cityName);
    searchHistory.prepend(addSearchHistory);
    searchHistory.parent().removeClass("d-none");
    //if history list is too long delete oldest search history
    if (document.getElementById("searchHistory").getElementsByTagName("li").length == 10) {
        searchHistory.find(":last-child").remove();
    }

    //empty input box
    $("#cityName").val("");

    printWeatherInfo(cityName);
});

//press enter/return button to search
$("#cityName").keypress(function (event) {
    if (event.keyCode === 13) {
        $(".btn").click();
    }
});

//click on search history to get weather info on that city
searchHistory.on("click", ".list-group-item", function () {
    printWeatherInfo($(this).attr("city"));
});

//get city name and print the weather
function printWeatherInfo(cityName) {
    var queryURL = openWeather + "weather?&q=" + cityName + apiId;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        searchResult.empty();
        searchResult.parent().removeClass("d-none");
        searchResult.append("<h4>" + response.name + " (" + moment().utc().add(response.timezone, 'seconds').format("LLL") + ")<img src='http://openweathermap.org/img/wn/" + response.weather[0].icon + ".png' alt='weather icon'></h4>");
        searchResult.append("<p>Temperature: " + Math.round((response.main.temp - 273.15) * 9 / 5 + 32) + " " + String.fromCharCode(176) + "F</p>");
        searchResult.append("<p>Humidity: " + response.main.humidity + "%</p>");
        searchResult.append("<p>Wind Speed: " + response.wind.speed + " MPH</p>");
        getUV(response.coord.lat, response.coord.lon);
        $("#forecastText").removeClass("d-none");
        $("#forecastRow").removeClass("d-none");
        forecast(cityName);
    });
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
};

//get city name and print 5 day forecast
function forecast(cityName) {
    var queryURL = openWeather + "forecast?q=" + cityName + apiId;;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        for (i = 7; i < 40; i = i + 8) {
            var forecastCard = "[value=" + i + "]";
            $(forecastCard).empty();
            $(forecastCard).append(response.list[i].dt_txt.replace(" 06:00:00", ""));
            $(forecastCard).append("<p><img src='http://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + ".png' alt='weather icon'></p>");
            $(forecastCard).append("<p>Temp: " + Math.round((response.list[i].main.temp - 273.15) * 9 / 5 + 32) + " " + String.fromCharCode(176) + "F</p>");
            $(forecastCard).append("<p>Humidity: " + response.list[i].main.humidity + "%</p>");
        }
    });
}