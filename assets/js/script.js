$(".btn").on("click", function () {
    var cityName = $("#cityName").val().trim();
    // cityName = cityName.replace(/\s+/g, '');
    console.log(cityName);
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?&q=" + cityName + "&appid=9726f22214b33db1ab5c46343f311c22";
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        $("#searchResult").empty();
        $("#searchResult").parent().removeClass("d-none");
        $("#searchResult").append("<h5>" + response.name + " (" + moment().format("LL") + ")<img src='http://openweathermap.org/img/wn/" + response.weather[0].icon + ".png' alt='weather icon'><h5/>");
        $("#searchResult").append("<p>Temperature: " + Math.round((response.main.temp - 273.15) * 9 / 5 + 32) + " " + String.fromCharCode(176) + "F<p/>");
        $("#searchResult").append("<p>Humidity: " + response.main.humidity + "%<p/>");
    });
});