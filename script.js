// Initialize map
const map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

// Fetch Earthquake Data
async function showEarthquakes() {
  const url =
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
  const res = await fetch(url);
  const data = await res.json();

  // Add markers to the map
  data.features.forEach((eq) => {
    const coords = eq.geometry.coordinates; // [longitude, latitude, depth]
    const mag = eq.properties.mag;
    const place = eq.properties.place;

    // Marker style based on magnitude
    const color = mag > 5 ? "red" : mag > 3 ? "orange" : "green";

    L.circleMarker([coords[1], coords[0]], {
      radius: mag * 2,
      color: color,
      fillOpacity: 0.7,
    })
      .bindPopup(`<b>Magnitude:</b> ${mag}<br><b>Location:</b> ${place}`)
      .addTo(map);
  });

  // Draw the histogram chart after loading data
  drawMagnitudeChart(data.features);
}

// Function to draw magnitude distribution chart
function drawMagnitudeChart(quakes) {
  const ctx = document.getElementById('magnitudeChart').getContext('2d');
  const counts = [0, 0, 0, 0, 0]; // bins for 0–2, 2–4, 4–6, 6–8, 8+

  quakes.forEach((q) => {
    const mag = q.properties.mag;
    if (mag < 2) counts[0]++;
    else if (mag < 4) counts[1]++;
    else if (mag < 6) counts[2]++;
    else if (mag < 8) counts[3]++;
    else counts[4]++;
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['0–2', '2–4', '4–6', '6–8', '8+'],
      datasets: [{
        label: 'Earthquake Count',
        data: counts,
        backgroundColor: [
          'rgba(0, 200, 83, 0.6)',   // green
          'rgba(255, 193, 7, 0.6)',  // yellow
          'rgba(255, 87, 34, 0.6)',  // orange
          'rgba(244, 67, 54, 0.6)',  // red
          'rgba(156, 39, 176, 0.6)'  // purple
        ],
        borderColor: '#333',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Earthquake Magnitude Distribution' }
      }
    }
  });
}

// Call main function
showEarthquakes();
