//  This is where all global variable should be declared.
var errorMessage = "Error message not set.";
var citySearchEl = $("#city-search-form");
var cityNameEl = $("#city-name");
var formalCityName;

// Variable(s)) used to get playlist
var weatherMain;
var weatherDescription;
var currentTemp;

// Get the city info from local storage to display
var cityObjArray = JSON.parse(localStorage.getItem("cityInfo") || "[]");
var cityButtonEl = document.querySelector("#city-buttons");

//*******************************************************/
//             Meme/Inspiration code goes here                */

var searchInput = "sunshine" 
//var memeContainer = document.querySelector (".meme-container")
var memeFunction = function () {
  console.log("Meme Function call works");
var queryUrl = "https://api.giphy.com/v1/gifs/search?q=" + searchInput + "&rating=g&tag=weather&api_key=4Mpw5NU7iwGDnG4LF24b8O8qVkX8MzdF&limit=1";
console.log(queryUrl)

fetch (queryUrl)
  .then (function(res){
    return res.json()
  }
  ).then (function(data){
    console.log(data)
  renderImages (data)
  }
  )
}
function renderImages (data){
  //var imageEl = document.createElement ("div")
  var image = document.createElement ("img")
  image.setAttribute ("src", data.data[0].images.fixed_height.url)
  $ (".meme-container").append (image)
  //memeContainer.append (imageEl)
}
//*******************************************************/
//             Weather section code goes here                */
var renderCitySelectors = function () {
  var length = cityObjArray.length;
  console.log(
    "***************************************cityObjArray=",
    cityObjArray
  );
  //cityObjArray.forEach(function(placeHolder, arrayIndex) {
  for (let arrayIndex = length - 3; arrayIndex < length; arrayIndex++) {
    // Create button for city choices
    appendCity(cityObjArray[arrayIndex]?.cityName);
  }
};

var appendCity = function (cityName) {
  // Create new city button and add it to the list
  var cityButton = $("<button class=button></button>")
    .text(cityName)
    .addClass("has-background-success-light is-responsive is-fullwidth mb-1");
  $("#city-buttons").prepend(cityButton); // Append new city button element
};

var citySearchHandler = function (event) {
  event.preventDefault();

  // get cityName from input element
  var cityName = $("input:text").val();

  // if we have a city name, get lat/long, else error
  if (cityName) {
    getCityLatLong(cityName);
    // clear input field content
    cityNameEl.val("");
  } else {
      errorMessage = ("Please enter a city name");
      $("#js-modal-trigger").trigger("click");
    return;
  }
};

var getCityLatLong = function (cityName) {
  // format the openwathermap api url
  var apiUrl =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    cityName +
    "&appid=d89a7998c295640400d389063c3b71e9";

  // make a get request to url
  fetch(apiUrl)
    .then(function (response) {
      // request was successful
      if (response.ok) {
        response.json().then(function (cityData) {
          console.log("*******************************  data= ", cityData);
          if (!cityData[0]) {
            // no data returned for cityName
            console.log("no data returned - invalid city????");
          } else {
            // Prepare object to push into array and make new selector button
            formalCityName = cityData[0].name;
            const cityObj = {
              cityName: formalCityName,
              stateName: cityData[0].state,
              latitude: cityData[0].lat,
              longitude: cityData[0].lon,
            };
            cityObjArray.push(cityObj);
            localStorage.setItem("cityInfo", JSON.stringify(cityObjArray));

            // Add city button to search button list and get the weather
            appendCity(cityObj.cityName);
            getWeather(cityObj.latitude, cityObj.longitude);
          }
        });
      } else {
        errorMessage = ("The OpenWeather API did not respond. Please try again");
        $("#js-modal-trigger").trigger("click");
      }
    })
    .catch(function (error) {
      errorMessage = ("Unable to connect to OpenWeatherAPI.  Please try again later.");
      $("#js-modal-trigger").trigger("click");
    });
};

var getWeather = function (latitude, longitude) {
  // format the openwathermap api url

  var apiUrl =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    latitude +
    "&lon=" +
    longitude +
    "&exclude=minutely,hourly&units=imperial&appid=d89a7998c295640400d389063c3b71e9";

  // make a get request to url
  fetch(apiUrl)
    .then(function (response) {
      // request was successful
      if (response.ok) {
        response.json().then(function (data) {
          console.log("*******************************  data= ", data);
          if (!data.daily[0]) {
            // no data returned
            console.log("no data returned - invalid lat/lon????");
          } else {
            console.log("Loading weather data");

            // Load window for today's data
            const initialDate = new Date();

            $("#city-date").html(
              formalCityName + " (" + initialDate.toDateString() + ")"
            );

            // Get the icon and weather description
            var iconCode = data.current.weather[0].icon + "@2x";
            weatherMain = data.current.weather[0].main;
            weatherDescription = data.current.weather[0].description;
            var iconUrl =
              "https://openweathermap.org/img/wn/" + iconCode + ".png";
            $("#today-icon").html(
              "<img class=icon-size src='" + iconUrl + "'>"
            );

            // Display the temp/wind/humidity
            $("#today-temperature").text("Temp: " + data.current.temp + "F");
            $("#today-winds").text(
              "Winds: " + data.current.wind_speed + " MPH"
            );
            $("#today-humidity").text(
              "Humidity: " + data.current.humidity + " %"
            );

            // Display the UV index number
            $("#today-uv-index").text("" + data.current.uvi);

            // clear any old color class
            $("#today-uv-index").removeClass();

            // get the correct background color
            if (data.current.uvi <= 2) {
              $("#today-uv-index").addClass("has-background-success");
            } else if (data.current.uvi <= 5) {
              $("#today-uv-index").addClass("has-background-warning");
            } else if (data.current.uvi <= 7) {
              $("#today-uv-index").addClass("has-background-warning-dark");
            } else {
              $("#today-uv-index").addClass("has-background-danger-dark");
            }
            //****************************************************************************** */
            // Get weather description for playlist (for development only - remove!!!!!!!!!!!!)
            $("#weather-main").empty(weatherMainButton);
            $("#weather-description").empty(weatherDescriptionButton);
            var weatherMainButton = $("<button class=button></button>").text(
              weatherMain
            );
            $("#weather-main").append(weatherMainButton); // Append new city button element
            var weatherDescriptionButton = $(
              "<button class=button></button>"
            ).text(weatherDescription);
            $("#weather-description").append(weatherDescriptionButton); // Append new city button element
            //****************************************************************************** */
            currentTemp = data.current.temp;
            getPlaylist();
          }
        });
      } else {
        alert("Error: Total Bummer");
        errorMessage = ("Invalid response from the OpenWeatherAPI. Please try again later.");
        $("#js-modal-trigger").trigger("click");
      }
    })
    .catch(function (error) {
      errorMessage = ("Unable to connect to OpenWeatherAPI. Please try again later.");
      $("#js-modal-trigger").trigger("click");
    });
};

var buttonClickHandler = function (event) {
  event.preventDefault();
  formalCityName = event.target.innerHTML;

  cityObjArray.forEach(function (placeHolder, arrayIndex) {
    // find the city to get the lat/long
    if (cityObjArray[arrayIndex].cityName === formalCityName) {
      getWeather(
        cityObjArray[arrayIndex].latitude,
        cityObjArray[arrayIndex].longitude
      );
    }
  });
};

//*******************************************************/
//             Spotify's code goes here                */

var getPlaylist = function () {
  var playlistOption;
  var globalTemp = currentTemp;
  console.log("currentTemp", currentTemp);
  if (globalTemp > 80) {
    playlistOption = "sunny";
  } else if (globalTemp < 80 && globalTemp > 50) {
    playlistOption = "warm";
  } else {
    playlistOption = "cold";
  }
  fetch(
    "https://v1.nocodeapi.com/babaphillips/spotify/FirIUjwQAgxPjCJN/search?q=" +
      playlistOption +
      "&type=playlist&perPage=3"
  )
    .then((response) => response.json())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
};

// Error handling
// This code creates a modal box surrounded by an opaque background.
// The user can look at the message and then click anywhere, hit escape, or 
// an "x" at the top right to close the modal box.
document.addEventListener('DOMContentLoaded', () => {

  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add('is-active');
    $("#modal-error-message").text(errorMessage);
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('#js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    const e = event || window.event;

    if (e.keyCode === 27) { // Escape key
      closeAllModals();
    }
  });
});

memeFunction();
renderCitySelectors();
citySearchEl.on("submit", citySearchHandler);
//$("#city-submit").on('submit', citySearchHandler);
cityButtonEl.addEventListener("click", buttonClickHandler);
