import Vue from 'vue'
import Vuex from 'vuex'
import GeolocationMarker from './maputil/geomarker';
import * as suncalc from './suncalc/sunside'

Vue.use(Vuex)

const mapOptions = {
  mapTypeControl: false,
  center: {lat: -33.8688, lng: 151.2195},
  zoom: 13
};

export default new Vuex.Store({
  state: {
    map : null, 
    geopositionMarker : null,
    origin: null,
    destination: null,
    currentPostion: null,
    directionsDisplay: new google.maps.DirectionsRenderer(),
    directionService: new google.maps.DirectionsService() 
  },

  mutations: {
    initMap(state, mapDiv){
        state.map = new google.maps.Map(mapDiv,mapOptions);
        state.directionsDisplay.setMap(state.map);
    },

    initPanel(state, divPanel){
      state.directionsDisplay.setPanel(divPanel);
    },

    setOrigin(state, place){
      state.origin = place;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      state.currentPostion = {
        latitude: lat, 
        longitude: lng
      };
      const location = new google.maps.LatLng(lat, lng);
      state.map.setCenter(location);
    },

    geolocate(state){
      const geopositionMarker = new GeolocationMarker(state.map);
      state.geopositionMarker = geopositionMarker;
      geopositionMarker.setCircleOptions({fillColor: '#808080', visible:false});
      google.maps.event.addListener(geopositionMarker, 'position_changed', function() {
          state.map.setCenter(this.getPosition());
          state.map.fitBounds(this.getBounds());
        });
    },

    setDestination(state, place){
      state.destination = place;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const location = new google.maps.LatLng(lat, lng);
      state.map.setCenter(location);
    },

    searchRoute(state){
      state.directionService.route({
        origin: {'placeId': state.origin.place_id},
        destination: {'placeId': state.destination.place_id},
        travelMode: 'TRANSIT',
        provideRouteAlternatives: true
      }, function(response, status) {
        if (status === 'OK') {
          suncalc.computeSide(response);
          state.directionsDisplay.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    }

  },

  actions: {

  }
})
