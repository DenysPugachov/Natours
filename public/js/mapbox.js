/*  eslint-disable */

const locations = JSON.parse(document.getElementById("map").dataset.locations)

// console.log(locations)

mapboxgl.accessToken =
  // "pk.eyJ1IjoiZGVuLTIxIiwiYSI6ImNrdjZvY2hsbjFlYWwybm8wNDZjMDhyamoifQ.vlC2ysnO6PU07Ln1ERWQrg"
  "pk.eyJ1IjoiZGVuLTIxIiwiYSI6ImNrdjZvb3k3NjJ6NmsybnF3ZGdyYmwzZHAifQ.2gFmnOz8sk8Gh2tkjp-hvw"

var map = new mapboxgl.Map({
  container: "map", // put mapElement to id=map
  style: "mapbox://styles/den-21/ckv6qii5d54yu15mppffzke9p",
  scrollZoom: false,
  // center: [-118.113491, 34.111745],
  // zoom: 10,
  // interactive: false,
})

const bounds = new mapboxgl.LngLatBounds()

locations.forEach(loc => {
  //Create marker foe each location
  const el = document.createElement("div")
  el.className = "marker"

  //Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: "bottom",
  })
    .setLngLat(loc.coordinates)
    .addTo(map)

  //Add popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map)

  //Extends map bounds to include current location
  bounds.extend(loc.coordinates)
})

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
  },
})
