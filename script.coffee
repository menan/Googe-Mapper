# setup our application with its own namespace 
App = {}

###
  Init 
###

App.init = ->
    mapOptions =
      zoom: 8
      center: new google.maps.LatLng -34.397, 150.644

    App.map = new google.maps.Map document.getElementById('map-canvas'),mapOptions
    App.directionsService = new google.maps.DirectionsService()
    App.directionsDisplay = new google.maps.DirectionsRenderer()
    App.infoWindow = new google.maps.InfoWindow();

    App.waypoints = []

    App.travelMode = google.maps.TravelMode.WALKING

    #setting placeservice for map
    App.service = new google.maps.places.PlacesService App.map

    App.distance = .1 #KM

    App.rboxer = new RouteBoxer()

    App.directionsDisplay.setMap App.map
    App.directionsDisplay.setPanel $("#directions-panel")[0]

    $("#route").click ->
      App.start = $("#clickTime_address").val()
      App.end = $("#home_dest").val()
      first_dest = $("#first_dest").val()
      secnd_dest = $("#secnd_dest").val()
      third_dest = $("#third_dest").val()

      switch parseInt($("#travel_mode").val())
        when 0 then App.travelMode = google.maps.TravelMode.BICYCLING
        when 1 then App.travelMode = google.maps.TravelMode.TRANSIT
        else App.travelMode = google.maps.TravelMode.WALKING

      App.calcRoute App.start, App.end, [first_dest,secnd_dest,third_dest]

App.calcRoute = (start, end, waypoints) ->
  request =
    origin: start
    destination: end
    travelMode: App.travelMode


  App.directionsService.route request, (result, status) ->
    if status == google.maps.DirectionsStatus.OK
      console.dir result

      path = result.routes[0].overview_path
      boxes = App.rboxer.box path, App.distance
      App.search boxes[0],waypoint for waypoint in  waypoints



      # App.directionsDisplay.setDirections result


App.search = (bounds, type) ->
  console.log "box: #{bounds}, type: #{type}"

  request =
    bounds: bounds
    query: type


  App.service.textSearch request, (results, status) -> 
    if status == google.maps.places.PlacesServiceStatus.OK
      App.waypoints.push
        location: results[0].geometry.location
        stopover: true

      # App.createMarker results[0] #result for result in results

      if App.waypoints.length == 3
        App.reloadMapWithWaypoint()
        # ...
      



      # console.log results[0]
    else
      console.log "error getting results"

App.reloadMapWithWaypoint = ->
  console.log "logging map with waypoints"
  request =
    origin: App.start
    destination: App.end
    travelMode: App.travelMode
    waypoints: App.waypoints
    optimizeWaypoints: true

  App.directionsService.route request, (result, status) ->
    if status == google.maps.DirectionsStatus.OK
      App.directionsDisplay.setDirections result



App.createMarker = (place) ->
  placeLoc = place.geometry.location
  marker = new google.maps.Marker
    map: App.map
    position: place.geometry.location

  google.maps.event.addListener marker, 'click', ->
    App.infoWindow.setContent place.name
    App.infoWindow.open App.map, this

google.maps.event.addDomListener window, 'load', App.init