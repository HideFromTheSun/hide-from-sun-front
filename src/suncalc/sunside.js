var SunCalc = require('suncalc');

Array.prototype.flatMap = function(lambda) { 
  return Array.prototype.concat.apply([], this.map(lambda)); 
};

export function computeSide(response){
  var routes = response.routes;
  routes.flatMap(function(route){ return route.legs;}).forEach(function(leg){computeLeg(leg)});
}

function computeLeg(leg){
  const steps = leg.steps;
  const duration = leg.duration.value;

  const legStatistic = {
      front: 0,
      left: 0,
      right: 0,
      back: 0
    };

  var departureTime = null;  
  var arrivalTime = null;

  if (!leg.departure_time){
      departureTime = new Date();
      arrivalTime = new Date(departureTime.getTime() + duration);
  } else {
      departureTime = leg.departure_time.value;
      arrivalTime = leg.arrival_time.value;
  }

  steps.forEach(function(step){
    const statistic = computeStep(step.path, departureTime, arrivalTime)
    step.instructions = step.instructions + " " + getSunSide(statistic);

    legStatistic.left += statistic.left;
    legStatistic.right += statistic.right;
    legStatistic.front += statistic.front;
    legStatistic.back += statistic.back;
  });

  leg.duration.text = leg.duration.text + " " + getSunSide(legStatistic);
}

function getSunSide(statistic){
  const max = Math.max.apply(Math, [statistic.left, statistic.right, statistic.front, statistic.back]);
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

function computeStep(pathArr, departure, arrival){
  arrival.getTime();
  const departureTime = departure.getTime();
  // const diffTime = arrivalTime - departureTime;
  // const pointsCount = pathArr.length;
  // const destinationTime = diffTime / pointsCount;

  const statistic = {
    front: 0,
    left: 0,
    right: 0,
    back: 0
  };

  for(var i=0; i < pathArr.length - 1; i++){
    const currentPoint = pathArr[i];
    const nextPoint =  pathArr[i + 1];

    const currentLat = currentPoint.lat();
    const currentLng = currentPoint.lng();

    const nextLat = nextPoint.lat();
    const nextLng = nextPoint.lng();

    const sunDate = new Date(departureTime + i * departureTime); 
    var sunPosition = SunCalc.getPosition(sunDate, currentLat, currentLng).azimuth;
        sunPosition = (sunPosition + 360) % 360;

    const yourLook = bearing(currentLat, currentLng, nextLat, nextLng);
    var sunLook = null;

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
  const min = Math.min.apply(Math, [a, b]);
  const max = Math.max.apply(Math, [a, b]);
  return this > min && this < max;
}

// Converts from degrees to radians.
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}
 
// Converts from radians to degrees.
function toDegrees(radians) {
  return radians * 180 / Math.PI;
}


function bearing(startLat, startLng, destLat, destLng){
  startLat = toRadians(startLat);
  startLng = toRadians(startLng);
  destLat = toRadians(destLat);
  destLng = toRadians(destLng);

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x = Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  const brng = Math.atan2(y, x);
  const degreesBrng = toDegrees(brng);
  return (degreesBrng + 360) % 360;
}