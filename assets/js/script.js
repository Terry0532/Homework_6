var searchResult = $("#searchResult");

$(".btn").on("click", function () {
    var cityName = $("#cityName").val().trim();
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?&q=" + cityName + "&appid=9726f22214b33db1ab5c46343f311c22";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        searchResult.empty();
        searchResult.parent().removeClass("d-none");
        searchResult.append("<h5>" + response.name + " (" + moment().format("LL") + ")<img src='http://openweathermap.org/img/wn/" + response.weather[0].icon + ".png' alt='weather icon'></h5>");
        searchResult.append("<p>Temperature: " + Math.round((response.main.temp - 273.15) * 9 / 5 + 32) + " " + String.fromCharCode(176) + "F</p>");
        searchResult.append("<p>Humidity: " + response.main.humidity + "%</p>");
        searchResult.append("<p>Wind Speed: " + response.wind.speed + " MPH</p>");
        getUV(response.coord.lat, response.coord.lon);
    });
});

function getUV(lat, lon) {
    var queryURL = "http://api.openweathermap.org/data/2.5/uvi?appid=9726f22214b33db1ab5c46343f311c22&lat=" + lat + "&lon=" + lon;
    $.ajax({
        url: queryURL,
        moethod: "GET"
    }).then(function (response) {
        var uvValue = response.value;
        searchResult.append("<p>UV index: <span id='uvColor'>" + uvValue + "</span></p>");
        var uvColor = $("#uvColor");
        if (uvValue < 3) {
            uvColor.css("background-color", "green");
        } else if (uvValue < 6) {
            uvColor.css("background-color", "yellow");
            uvColor.css("color", "black");
        } else if (uvValue < 8) {
            uvColor.css("background-color", "orange");
            uvColor.css("color", "black");
        } else if (uvValue < 11) {
            uvColor.css("background-color", "red");
        } else if (uvValue > 11) {
            uvColor.css("background-color", "violet");
        }
    });
};