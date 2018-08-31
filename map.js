// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
// <div id="map"></div>

var abc = "";

function initMap() {
  // var date = new Date('2013-03-05UTC'),
  //  lat = 50.5,
  //  lng = 30.5;
  // var sunPos = SunCalc.getPosition(date, lat, lng);
  // console.log(sunPos)

  var map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: false,
    center: {lat: -33.8688, lng: 151.2195},
    zoom: 13
  });
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(initialLocation);
    });
}
  new AutocompleteDirectionsHandler(map);
}

 /**
  * @constructor
 */
function AutocompleteDirectionsHandler(map) {
  this.map = map;
  this.originPlaceId = null;
  this.destinationPlaceId = null;
  this.travelMode = 'WALKING';
  var originInput = document.getElementById('origin-input');
  var destinationInput = document.getElementById('destination-input');
  var modeSelector = document.getElementById('mode-selector');
  this.directionsService = new google.maps.DirectionsService;
  this.directionsDisplay = new google.maps.DirectionsRenderer;
  this.directionsDisplay.setMap(map);
  this.directionsDisplay.setPanel(document.getElementById('directionsPanel'));

  var originAutocomplete = new google.maps.places.Autocomplete(
      originInput, {placeIdOnly: true});
  var destinationAutocomplete = new google.maps.places.Autocomplete(
      destinationInput, {placeIdOnly: true});

  this.setupClickListener('changemode-walking', 'WALKING');
  this.setupClickListener('changemode-transit', 'TRANSIT');
  this.setupClickListener('changemode-driving', 'DRIVING');
  this.setupClickListener('changemode-bycycling', 'BICYCLING');

  this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
  this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
  this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function(id, mode) {
  var radioButton = document.getElementById(id);
  var me = this;
  radioButton.addEventListener('click', function() {
    me.travelMode = mode;
    me.route();
  });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(autocomplete, mode) {
  var me = this;
  autocomplete.bindTo('bounds', this.map);
  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.place_id) {
      window.alert("Please select an option from the dropdown list.");
      return;
    }
    if (mode === 'ORIG') {
      me.originPlaceId = place.place_id;
    } else {
      me.destinationPlaceId = place.place_id;
    }
    me.route();
  });

};

AutocompleteDirectionsHandler.prototype.route = function() {
  if (!this.originPlaceId || !this.destinationPlaceId) {
    return;
  }
  var me = this;

  this.directionsService.route({
    origin: {'placeId': this.originPlaceId},
    destination: {'placeId': this.destinationPlaceId},
    travelMode: this.travelMode,
    provideRouteAlternatives: true
  }, function(response, status) {
    if (status === 'OK') {
      computeSide(response);
      me.directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
};

const flatMap = (f,xs) =>
  xs.reduce((acc,x) =>
    acc.concat(f(x)), [])


Array.prototype.flatMap = function(lambda) { 
    return Array.prototype.concat.apply([], this.map(lambda)); 
};

function computeSide(response){
  abc = response;
  console.log(response);
  var routes = response.routes;

  routes.flatMap(function(route){ return route.legs;}).forEach(function(leg){computeLeg(leg)});
}

function computeLeg(leg){
  steps = leg.steps;
  duration = leg.duration.value;

  legStatistic = {
      front: 0,
      left: 0,
      right: 0,
      back: 0
    };

  if (!leg.departure_time){
      departureTime = new Date();
      arrivalTime = new Date(departureTime.getTime() + duration);
  } else {
      departureTime = leg.departure_time.value;
      arrivalTime = leg.arrival_time.value;
  }

  steps.forEach(function(step){
    statistic = computeStep(step.path, departureTime, arrivalTime)
    step.instructions = step.instructions + " " + getSunSide(statistic);

    legStatistic.left += statistic.left;
    legStatistic.right += statistic.right;
    legStatistic.front += statistic.front;
    legStatistic.back += statistic.back;
  });

  leg.duration.text = leg.duration.text + " " + getSunSide(legStatistic);
}

function getSunSide(statistic){
  max = Math.max.apply(Math, [statistic.left, statistic.right, statistic.front, statistic.back]);
  if (max === statistic.left) {
    return "Sun on the left side.";
  }
  
  if (max === statistic.right) {
    return "Sun on the right side.";
  }

  if (max === statistic.front) {
    return "Sun on the front.";
  }

  if (max === statistic.back) {
    return "Sun on the back";
  }
}

function computeStep(pathArr, departureTime, arrivalTime){
  arrivalTime = arrivalTime.getTime();
  departureTime = departureTime.getTime();
  diffTime = arrivalTime - departureTime;
  pointsCount = pathArr.length;
  destinationTime = diffTime / pointsCount;

  statistic = {
    front: 0,
    left: 0,
    right: 0,
    back: 0
  };

  for(var i=0; i < pathArr.length - 1; i++){
        currentPoint = pathArr[i];
        nextPoint =  pathArr[i + 1];

        currentLat = currentPoint.lat();
        currentLng = currentPoint.lng();

        nextLat = nextPoint.lat();
        nextLng = nextPoint.lng();

        sunDate = new Date(departureTime + i * departureTime); 
        sunPosition = SunCalc.getPosition(sunDate, currentLat, currentLng).azimuth;
        sunPosition = (sunPosition + 360) % 360;

        yourLook = bearing(currentLat, currentLng, nextLat, nextLng);


        if (sunPosition > yourLook){
          sunLook = sunPosition - yourLook;
        } else {
          sunLook = 360 - (yourLook - sunPosition)
        }

        if (sunLook.inRange(15,165)){
          statistic.right = statistic.right + 1;
        }

        if (sunLook.inRange(165,195)){
          statistic.back = statistic.back + 1;
        }

        if (sunLook.inRange(195,345)){
          statistic.left = statistic.left + 1;
        }

        if (sunLook.inRange(345,360) || sunLook.inRange(0, 15)){
          statistic.left = statistic.front + 1;
        }      
  }
  return statistic;
}

Number.prototype.inRange = function(a, b) {
  min = Math.min.apply(Math, [a, b]);
  max = Math.max.apply(Math, [a, b]);
  return this > min && this < max;
}

// Converts from degrees to radians.
function toRadians(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
function toDegrees(radians) {
  return radians * 180 / Math.PI;
}


function bearing(startLat, startLng, destLat, destLng){
  startLat = toRadians(startLat);
  startLng = toRadians(startLng);
  destLat = toRadians(destLat);
  destLng = toRadians(destLng);

  y = Math.sin(destLng - startLng) * Math.cos(destLat);
  x = Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  brng = Math.atan2(y, x);
  brng = toDegrees(brng);
  return (brng + 360) % 360;
}
