
$(document).ready(loadDocument);
var winningCity;
var muteVol = 1;


function loadDocument(){
    clPreloader();
};

function insertWeatherInfo(cityInfo, hintInfo) {
    $(".weather-text").addClass("weather-text-bg");
    $(".weather-text").text(cityInfo);
}

function fillUpPhotoArray(photoArray){
    if (photoArray.length<4){
        photoArray.push('./images/airmail.png');
        fillUpPhotoArray(photoArray);
    }

}

function insertPicFromFlickr(photoArray){
    fillUpPhotoArray(photoArray);
    for (let index = 0; index < photoArray.length; index ++){
        let tempDivName = '#pic' + index;
        $(tempDivName).attr('src',photoArray[index]);
    }
}

// input: lon, lat, searchText;
// output: array of 4 pictures;
function getFlickr(lon='-117.731803',lat='33.635682',searchText = 'food',forMap=true){
    let photoArray = [];
    let rawFlickrData;
    const apiKey = 'aafae43be950e495d55bfe4055fde6e4';
    const perPage = '4'; //number of pictures to get from flickr
    // unix timestamp of 1420070400 is 01/01/2015
    const flickrURL = `https://api.flickr.com/services/rest?method=flickr.photos.search&api_key=${apiKey}&format=json&nojsoncallback=1&text=${searchText}&min_upload_date=1420070400&safe_search=1&sort=interestingness-asc&media=photos&lat=${lat}&lon=${lon}&radius=20&per_page=${perPage}`
    let ajaxConfig = {
        dataType: 'json',
        url: flickrURL,
        success: function(result) {
            rawFlickrData = result.photos.photo;
            for (let index = 0; index < rawFlickrData.length; index++){
                const farmId = rawFlickrData[index].farm;
                const serverId = rawFlickrData[index].server;
                const flickrId = rawFlickrData[index].id;
                const flickrSecret = rawFlickrData[index].secret;
                const picURL = `https:\/\/farm${farmId}.staticflickr.com\/${serverId}\/${flickrId}_${flickrSecret}.jpg`;
                //this is the format of the flickr picture
                //https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
                if (forMap){photoArray.push(picURL);}
                    else {
                        let tempName = `url("${picURL}")`;
                        let divName = `#nomNomPics${index}`;
                        $(divName).css("background-image", tempName); //don't use only 'background'
                }
            }
            if (forMap){insertPicFromFlickr(photoArray);}
        }
    }
    $.ajax(ajaxConfig);
    //returns an array of photo urls
}

function initMap() {
    //map options
    var options = {
        zoom: 2.3,
        //center: {lat: 40.416775, lng: -3.703790},
        center: {lat: 16, lng: 8},
        mapTypeId: 'hybrid'
    }
    //creating a new map
    var gmap = new google.maps.Map(document.getElementById('theMap'), options)
    var cities = sliceAndSplicedCities(capitalCities, 3);
    let mapLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let capitalIndex = 0; capitalIndex < cities.length; capitalIndex++) {
            var marker = new google.maps.Marker({
                position: {lat: cities[capitalIndex].latitude, lng: cities[capitalIndex].longitude},
                map: gmap,
                label: mapLabels[capitalIndex],
                // icon: capitalCityObject.iconImg,
                content: `<h3>${cities[capitalIndex].city}, ${cities[capitalIndex].country}</h3>`,
            });
            google.maps.event.addListener(marker, 'click', (function (marker, capitalIndex) {
                return function () {
                    var nameOnFlagClick = new google.maps.InfoWindow({
                        content: `<h3>${cities[capitalIndex].city}, ${cities[capitalIndex].country}</h3>`
                    });
                    nameOnFlagClick.open(gmap, marker);
                }
            })(marker, capitalIndex));
        }
        winningCity = cities[Math.floor(Math.random() * cities.length)];
        getFlickr(winningCity.longitude,winningCity.latitude,'city');
        getFlickr(winningCity.longitude,winningCity.latitude,'food',false);
        makeRequestForWeather(winningCity);
        makeRequestForWikipedia(winningCity);
        let winShortMsg = `This is ${winningCity.city}, ${winningCity.country}.`;
        $('#winShortMsg').text(winShortMsg);
        $('#myModal').on('click',function(){location.reload()});
        $(".button-text").on("click", handleButtonClick);
}

function sliceAndSplicedCities(capitalArray, splicedCount){
    var threeCitiesArray = [];
    let mapLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var copiedArray = capitalArray.slice(0);
    for (var cityIndex = 0; cityIndex < splicedCount; cityIndex++) {
        var randomNum = Math.floor(Math.random() * copiedArray.length);
        threeCitiesArray.push(copiedArray[randomNum]);
        let specificClickButton = ".button" + cityIndex;
        let displayText = mapLabels[cityIndex] + ') ' + copiedArray[randomNum].city + ', ' + copiedArray[randomNum].country;
        $(specificClickButton).text(displayText);
        $(specificClickButton).mouseover(function(){
            responsiveVoice.speak(displayText,"UK English Female", {volume: muteVol});
            $(specificClickButton).off('mouseover');
            }); //https://responsivevoice.org/
        copiedArray.splice(randomNum, 1);
    }
    return threeCitiesArray;
}

function handleButtonClick() {
    let answerTextArray = ["Nope", "Try again", "You don't know much do you?", "Either you don't know or the photographer don't know what he doing",
    "Take another stab at it", "Bruh...", "Nah but I want to go there", "I wish", "Did you fail 8th grade geography?",
    "You're not even trying are you?", "Guess what.....you're wrong",
    "No sir", "No mam", "Beautiful photos. Oh btw you're wrong", "Geographically challenged indeed"];
    let randomArrayIndex = Math.floor(Math.random() * answerTextArray.length);
    let answerText = answerTextArray[randomArrayIndex];
    let buttonTextVariable = $(this).text();
    let textSliceString = buttonTextVariable.slice(3);
    if (textSliceString === `${winningCity.city}, ${winningCity.country}`) {
        $(".button-text").removeClass("btn-warning");
        $(".button-text").addClass("btn");
        $(this).addClass("btn-success");
        $(".button-text").off("click");
        $(".description-text").text("Well Done!");
        $('#myModal').modal('show');
        let sayCityCountry = `I was at ${winningCity.city} ${winningCity.country}`;
        responsiveVoice.speak(sayCityCountry, "UK English Female", {volume: muteVol}); //https://responsivevoice.org/
    }  else {
        $(this).removeClass("btn-warning");
        $(this).addClass("btn");
        $(this).off("click");
        $(".description-text").text(answerText);
    }
}

$WIN = $(window);

// Add the User Agent to the <html>
// will be used for IE10 detection (Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0))
var doc = document.documentElement;
doc.setAttribute('data-useragent', navigator.userAgent);


   /* Preloader
    * -------------------------------------------------- */
   var clPreloader = function() {
        
    $("html").addClass('cl-preload');

    $WIN.on('load', function() {

        //force page scroll position to top at page refresh
        // $('html, body').animate({ scrollTop: 0 }, 'normal');

        // will first fade out the loading animation 
        $("#loader").fadeOut("slow", function() {
            // will fade out the whole DIV that covers the website.
            $("#preloader").delay(300).fadeOut("slow");
        }); 
        
        // for hero content animations 
        $("html").removeClass('cl-preload');
        $("html").addClass('cl-loaded');
    
    });
};