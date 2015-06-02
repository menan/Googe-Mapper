var App;

App = {};

/*
  Init
*/


App.init = function() {
  var mapOptions;
  mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(-34.397, 150.644)
  };
  App.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  App.directionsService = new google.maps.DirectionsService();
  App.directionsDisplay = new google.maps.DirectionsRenderer();
  App.infoWindow = new google.maps.InfoWindow();
  App.waypoints = [];
  App.travelMode = google.maps.TravelMode.WALKING;
  App.service = new google.maps.places.PlacesService(App.map);
  App.distance = .1;
  App.rboxer = new RouteBoxer();
  App.directionsDisplay.setMap(App.map);
  App.directionsDisplay.setPanel($("#directions-panel")[0]);
  return $("#route").click(function() {
    var first_dest, secnd_dest, third_dest;
    App.start = $("#clickTime_address").val();
    App.end = $("#home_dest").val();
    first_dest = $("#first_dest").val();
    secnd_dest = $("#secnd_dest").val();
    third_dest = $("#third_dest").val();
    switch (parseInt($("#travel_mode").val())) {
      case 0:
        App.travelMode = google.maps.TravelMode.BICYCLING;
        break;
      case 1:
        App.travelMode = google.maps.TravelMode.TRANSIT;
        break;
      default:
        App.travelMode = google.maps.TravelMode.WALKING;
    }
    return App.calcRoute(App.start, App.end, [first_dest, secnd_dest, third_dest]);
  });
};

App.calcRoute = function(start, end, waypoints) {
  var request;
  request = {
    origin: start,
    destination: end,
    travelMode: App.travelMode
  };
  return App.directionsService.route(request, function(result, status) {
    var boxes, path, waypoint, _i, _len, _results;
    if (status === google.maps.DirectionsStatus.OK) {
      console.dir(result);
      path = result.routes[0].overview_path;
      boxes = App.rboxer.box(path, App.distance);
      _results = [];
      for (_i = 0, _len = waypoints.length; _i < _len; _i++) {
        waypoint = waypoints[_i];
        _results.push(App.search(boxes[0], waypoint));
      }
      return _results;
    }
  });
};

App.search = function(bounds, type) {
  var request;
  console.log("box: " + bounds + ", type: " + type);
  request = {
    bounds: bounds,
    query: type
  };
  return App.service.textSearch(request, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      App.waypoints.push({
        location: results[0].geometry.location,
        stopover: true
      });
      if (App.waypoints.length === 3) {
        return App.reloadMapWithWaypoint();
      }
    } else {
      return console.log("error getting results");
    }
  });
};

App.reloadMapWithWaypoint = function() {
  var request;
  console.log("logging map with waypoints");
  request = {
    origin: App.start,
    destination: App.end,
    travelMode: App.travelMode,
    waypoints: App.waypoints,
    optimizeWaypoints: true
  };
  return App.directionsService.route(request, function(result, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      return App.directionsDisplay.setDirections(result);
    }
  });
};

App.createMarker = function(place) {
  var marker, placeLoc;
  placeLoc = place.geometry.location;
  marker = new google.maps.Marker({
    map: App.map,
    position: place.geometry.location
  });
  return google.maps.event.addListener(marker, 'click', function() {
    App.infoWindow.setContent(place.name);
    return App.infoWindow.open(App.map, this);
  });
};

google.maps.event.addDomListener(window, 'load', App.init);
