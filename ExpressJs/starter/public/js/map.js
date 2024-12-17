/* eslint-disable */
import L from 'leaflet';

export const mapContent = (locations) => {
  // Initialize the map (set to the center of the first location's coordinates)
  var firstLocation = locations[0].coordinates;
  var map = L.map('map').setView([firstLocation[1], firstLocation[0]], 10); // [lat, lng]

  // Add tile layer (OpenStreetMap tiles)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Loop through the locations and add markers for each
  locations.forEach(function (location) {
    var coordinates = location.coordinates; // Extract the [lng, lat] from coordinates array
    var description = location.description || 'Location';

    // Add marker with coordinates and a popup with the description
    L.marker([coordinates[1], coordinates[0]])
      .addTo(map)
      .bindPopup(`<b>${description}</b><br>Day: ${location.day}`);
  });
};
