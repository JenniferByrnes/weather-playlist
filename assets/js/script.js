//  This is where all global variable should be declared.
var errorMessage = "Error message not set.";
var formalCityName;
var stateName = "";

// Variable(s)) used to get playlist
var weatherMain;
var weatherDescription;
var currentTemp;

// Get the city info from local storage to display
var cityObjArray = JSON.parse(localStorage.getItem("cityInfo") || "[]");

//*******************************************************/
//             Giphy code goes here                */
var memeFunction = function () {
  var searchInput = weatherMain;
  var queryUrl = "https://api.giphy.com/v1/gifs/search?q=" + searchInput + "&rating=g&tag=weather&api_key=4Mpw5NU7iwGDnG4LF24b8O8qVkX8MzdF&limit=1";

  fetch(queryUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      renderImages(data);
    }).catch(function (error) {
      console.log(error)
    }
    )
};
function renderImages(data) {
  var image = document.createElement("img");
  image.setAttribute("src", data.data[0].images.fixed_height.url);
  $(".meme-container").append(image);
}

//*******************************************************/
//             Weather section code goes here                */
// Display buttons for cities in local storage
var renderCitySelectors = function () {

  // Loop through the number of stored cities
  var length = cityObjArray.length;
  for (let arrayIndex = 0; arrayIndex < length; arrayIndex++) {
    // Create button for city choices
    appendCity(cityObjArray[arrayIndex].cityName);
  }
};

// add the city selector buttons (newest on top)
var appendCity = function (cityName) {
  // Create new city button and add it to the list
  var cityButton = $("<button class=button></button>")
    .text(cityName)
    .addClass("is-responsive is-fullwidth mb-1")
    .css("background-color", "var(--secondary)");
  // Prepend new city button element (it appears on top)ß
  $("#city-buttons").prepend(cityButton);
};

// clear local storage and add back only the three most recent cities
var setLocalStorage = function (cityObjArray) {
  // Clear local storage to refresh it
  localStorage.removeItem("cityInfo");

  // Reset local storage with the most recent 3 cities
  const lengthArray = cityObjArray.length;
  if (lengthArray > 3) {
    cityObjArray.shift();
  }
  localStorage.setItem("cityInfo", JSON.stringify(cityObjArray));
};

// User has typed in a city and hit Submit
var citySearchHandler = function (event) {
  event.preventDefault();

  // get cityName from input element
  var cityName = $("input:text").val();

  // if we have a city name, get lat/long, else error
  if (cityName) {
    getCityLatLong(cityName);
    // clear input field content
    $("#city-name").val("");
  } else {
    errorMessage = "Please enter a city name";
    $("#js-modal-trigger").trigger("click");
  }
};

// Given a city, get the lat/long
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
          if (!cityData[0]) {
            // no data returned for cityName
            errorMessage = "No city with that name was found. Please try again";
            $("#js-modal-trigger").trigger("click");
          } else {
            // Prepare object to push into array and make new selector button
            formalCityName = cityData[0].name;
            const cityObj = {
              cityName: formalCityName,
              stateName: cityData[0].state,
              latitude: cityData[0].lat,
              longitude: cityData[0].lon,
            };
            stateName = cityObj.stateName;

            // Reset local storage
            cityObjArray.push(cityObj);
            const lengthArray = cityObjArray.length;
            setLocalStorage(cityObjArray);

            // Remove extra buttons
            if (lengthArray > 2) {
              $("#city-buttons").children().last().remove();
            }

            // Add city button to select button list and get the weather
            appendCity(cityObj.cityName);
            getWeather(cityObj.latitude, cityObj.longitude);
          }
        });
      } else {
        errorMessage = "The OpenWeather API did not respond. Please try again";
        $("#js-modal-trigger").trigger("click");
      }
    })
    .catch(function (error) {
      errorMessage =
        "Unable to connect to OpenWeatherAPI.  Please try again later.";
      $("#js-modal-trigger").trigger("click");
    });
};

// Given lat/long find the weather from Open Weather API
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
          if (!data.daily[0]) {
            // no data returned
            errorMessage =
              "The OpenWeather API did not respond. Please try again";
            $("#js-modal-trigger").trigger("click");
          } else {
            // Display today's date
            const initialDate = new Date();
            const options = {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            };
            $("#city-display").html(formalCityName + ", " + stateName);
            $("#date-display").html(
              " (" + initialDate.toLocaleDateString(undefined, options) + ")"
            );

            // Get the icon and weather description
            var iconCode = data.current.weather[0].icon;
            weatherMain = data.current.weather[0].main;
            weatherDescription = data.current.weather[0].description;
            var iconUrl =
              "https://openweathermap.org/img/w/" + iconCode + ".png";
            $("#today-icon").html("<img src='" + iconUrl + "'>");

            // empty out fields from previous city
            $("#weather-main").empty();
            $("#weather-right-now").empty();

            // Display current weather verbiage and icon
            const weatherRightNow = $("<div>Weather now: </div>");
            $("#weather-right-now").append(weatherRightNow);
            var weatherDescDisplay = $(
              "<div class=is-italic>" + weatherDescription + "</div>"
            );
            $("#weather-main").append(weatherDescDisplay);

            // Display the temp/wind/humidity
            $("#today-temperature").text(data.current.temp + "F");
            $("#today-winds").text(data.current.wind_speed + " MPH"
            );
            $("#today-humidity").text(data.current.humidity + " %"
            );

            // Display the UV index number
            $("#today-uv-index").text(data.current.uvi);

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

            currentTemp = data.current.temp;

            // reset gif
            $(".meme-container").empty();

            // Call functions to get gif and Spotify playlist
            memeFunction();
            getPlaylist();

            // Reveal screen elements that now have data 
            $("#body-div").removeClass("is-fullheight-100vh");
            $("#display-weather-column").removeClass("is-hidden");
            $(".meme-div").removeClass("is-hidden");
            $("#spotify-div").removeClass("is-hidden");

          }
        });
      } else {
        errorMessage =
          "Invalid response from the OpenWeatherAPI. Please try again later.";
        $("#js-modal-trigger").trigger("click");
      }
    })
    .catch(function (error) {
      errorMessage =
        "Unable to connect to OpenWeatherAPI. Please try again later.";
      $("#js-modal-trigger").trigger("click");
    });
};

// When a city is selected from a button, retrieve the
// lat/long and state/country data for that city.
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
      stateName = cityObjArray[arrayIndex].stateName;
    }
  });
};

//*******************************************************/
//             Spotify's code goes here                */

var getPlaylist = function () {
  var playlistOption;
  var globalTemp = currentTemp;

  if (globalTemp > 80) {
    playlistOption = "happy";
  } else if (globalTemp < 80 && globalTemp > 65) {
    playlistOption = "warm-vibes";
  } else if (globalTemp < 65 && globalTemp > 50) {
    playlistOption = "acoustic";
  } else {
    playlistOption = "instrumental, low-fi";
  }

  fetch(
    "https://v1.nocodeapi.com/babaphillips/spotify/PZbXydYnaLTYpbUy/search?q="
    +
    playlistOption +
    "&type=playlist&perPage=3"
  )
    .then((response) => response.json())
    .then((result) => console.log("[playlist???=", result))
    .catch((error) => console.log("error", error));

  //var spotifyPlaylistThing;
  fetch(
    "https://v1.nocodeapi.com/babaphillips/spotify/PZbXydYnaLTYpbUy/search?q=" +
    playlistOption +
    "&type=playlist&perPage=3"
  ).then(function (response) {
    // request was successful

    if (response.ok) {
      response.json().then(function (spotifyPlaylistThing) {

        PlaylistName = spotifyPlaylistThing.playlists.items[0].name;
        var spotifyPlaylistObj = {
          name: spotifyPlaylistThing.playlists.items[0].name,
          playlistUrl:
            spotifyPlaylistThing.playlists.items[0].external_urls.spotify,
          imageUrl: spotifyPlaylistThing.playlists.items[0].images[0].url,
        };
        $("#spot-test-title-1").text(spotifyPlaylistObj.name);
        $("#spot-test-title").text("Click on the playlist that you want to hear.");
        //$("#spot-test-img-1").

        // use html element declared in index.html.  This is easier - one line.
        $("#spot-test-img-1").attr("src", spotifyPlaylistObj.imageUrl);
        $("#spot-playlist-1").attr("href", spotifyPlaylistObj.playlistUrl);

        // Prepare object to push into array and make new selector button

        PlaylistName = spotifyPlaylistThing.playlists.items[1].name;
        spotifyPlaylistObj = {
          name: spotifyPlaylistThing.playlists.items[1].name,
          playlistUrl:
            spotifyPlaylistThing.playlists.items[1].external_urls.spotify,
          imageUrl: spotifyPlaylistThing.playlists.items[1].images[0].url,
        };
        $("#spot-test-title-2").text(spotifyPlaylistObj.name);
        //$("#spot-test-img-1").

        // use html element declared in index.html.  This is easier - one line.
        $("#spot-test-img-2").attr("src", spotifyPlaylistObj.imageUrl);
        $("#spot-playlist-2").attr("href", spotifyPlaylistObj.playlistUrl);
        // Prepare object to push into array and make new selector button

        PlaylistName = spotifyPlaylistThing.playlists.items[2].name;
        spotifyPlaylistObj = {
          name: spotifyPlaylistThing.playlists.items[2].name,
          playlistUrl:
            spotifyPlaylistThing.playlists.items[2].external_urls.spotify,
          imageUrl: spotifyPlaylistThing.playlists.items[2].images[0].url,
        };
        $("#spot-test-title-3").text(spotifyPlaylistObj.name);
        // use html element declared in index.html.  This is easier - one line.
        $("#spot-test-img-3").attr("src", spotifyPlaylistObj.imageUrl);
        $("#spot-playlist-3").attr("href", spotifyPlaylistObj.playlistUrl);
      });
    }
  });
};

//*******************************************************/
// Error handling
// This code creates a modal box surrounded by an opaque background.
// The user can look at the message and then click anywhere, hit escape, or
// an "x" at the top right to close the modal box.
document.addEventListener("DOMContentLoaded", () => {
  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add("is-active");
    $("#modal-error-message").text(errorMessage);
  }

  function closeModal() {
    (document.querySelectorAll(".modal") || []).forEach(($modal) => {
      $(".modal").removeClass("is-active");
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll("#js-modal-trigger") || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener("click", () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (
    document.querySelectorAll(
      ".modal-background, .modal-close, .modal-exit .delete, .modal-content .button.modal-error-handling"
    ) || []
  ).forEach(($close) => {

    $close.addEventListener("click", () => {
      closeModal();
    });

    // Click exit button to close modal
    $(".modal-exit").click(function () {
      closeModal()
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener("keydown", (event) => {
    const e = event || window.event;

    if (e.key === 27) {
      // Escape key
      closeModal();
    }
  });
}); // end modal error handling

// Highlight playlist on hover
$("#spot-test-img-1").hover(function () {
  $(this).css("outline-style", "solid");
},
  function () {
    $(this).css("outline-style", "none");
  });
$("#spot-test-img-2").hover(function () {
  $(this).css("outline-style", "solid");
},
  function () {
    $(this).css("outline-style", "none");
  });
$("#spot-test-img-3").hover(function () {
  $(this).css("outline-style", "solid");
},
  function () {
    $(this).css("outline-style", "none");
  });


renderCitySelectors();
document.getElementById("city-name").focus();
$("#city-search-form").on('submit', citySearchHandler);
$("#city-buttons").on("click", buttonClickHandler);

