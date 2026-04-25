const data = JSON.parse(document.getElementById("map-data").textContent);

const tk =
  window.atob("ZjVReVNaTThjam5GZVdIRjlhOXdJZGcwQVU1MDBjajBm") +
  window.atob("VXE2R0VjaGppNExTZExuSkQybkphRDV2Y0p5MnhtYQ==");
const map = new maplibregl.Map({
  container: "map",
  style: `https://api.jawg.io/styles/jawg-terrain.json?access-token=${tk}`,
  // style: "https://tiles.openfreemap.org/styles/liberty",
  center: [data.centre_lon, data.centre_lat],
  zoom: 8,
  pitch: 20,
  minZoom: 5,
  maxZoom: 19,
  maxPitch: 75,
});
map.addControl(
  new maplibregl.NavigationControl({
    visualizePitch: true,
    showZoom: true,
    showCompass: true,
  }),
);

const demSource = {
  type: "raster-dem",
  maxzoom: 10,
  tileSize: 512,
  tiles: [`https://tile.jawg.io/jawg-dem/{z}/{x}/{y}.png?access-token=${tk}`],
  // url: "https://tiles.mapterhorn.com/tilejson.json",
  // tileSize: 256,
};
const hillshadeSource = {
  type: "raster-dem",
  url: "https://tiles.mapterhorn.com/tilejson.json",
  tileSize: 256,
};
map.once("load", () => {
  map.addSource("dem", demSource);
  map.addSource("hill", hillshadeSource);
  map.setTerrain({ source: "dem", exaggeration: 1.5 });
  map.setSky({
    "sky-color": "#199EF3",
    "sky-horizon-blend": 0.5,
    "horizon-color": "#ffffff",
    "horizon-fog-blend": 0.9,
    "fog-color": "#0000ff",
    "fog-ground-blend": 0.95,
  });
  map.addLayer({
    id: "hillshade",
    type: "hillshade",
    source: "hill",
    paint: {
      "hillshade-method": "igor",
      "hillshade-exaggeration": 0.6,
    },
  });
});

const regionSelector = document.getElementById("region-selector");
const rideSelector = document.getElementById("ride-selector");
const statsDisplay = document.getElementById("stats-display");

const colors = [
  "#0173b2",
  "#de8f05",
  "#029e73",
  "#d55e00",
  "#cc78bc",
  "#ca9161",
  "#fbafe4",
  "#949494",
  "#ece133",
  "#56b4e9",
];

const clusterColorCounters = {};
const clusters = Object.keys(data.clusters).sort((a, b) => {
  const aMatch = a.match(/\d{2}/);
  const bMatch = b.match(/\d{2}/);
  const aNum = aMatch ? parseInt(aMatch[0], 10) : 0;
  const bNum = bMatch ? parseInt(bMatch[0], 10) : 0;
  return aNum - bNum;
});

// Populate Region Selector
regionSelector.innerHTML = '<option value="all">All Regions</option>';
clusters.forEach((cluster) => {
  const option = document.createElement("option");
  option.value = cluster;
  option.textContent = cluster;
  regionSelector.appendChild(option);
});

// Prepare GeoJSON
const linesGeoJSON = {
  type: "FeatureCollection",
  features: [],
};
const markersGeoJSON = {
  type: "FeatureCollection",
  features: [],
};

const rideObjects = [];

data.rides.forEach((ride) => {
  const cluster = ride.cluster || "Other";
  if (!(cluster in clusterColorCounters)) {
    clusterColorCounters[cluster] = 0;
  }
  const colorIndex = clusterColorCounters[cluster] % colors.length;
  const rideColor = colors[colorIndex];
  clusterColorCounters[cluster]++;

  const latlngs = polyline.decode(ride.encoded);
  // Leaflet uses [lat, lon], MapLibre uses [lon, lat]
  const coordinates = latlngs.map(([lat, lon]) => [lon, lat]);

  if (coordinates.length > 0) {
    linesGeoJSON.features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: coordinates,
      },
      properties: {
        id: ride.id,
        cluster: cluster,
        color: rideColor,
        name: ride.name,
      },
    });
  }

  ride.markers.forEach((m) => {
    markersGeoJSON.features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [m.lon, m.lat],
      },
      properties: {
        id: ride.id,
        cluster: cluster,
        label: m.label,
        value: m.value,
        unit: m.unit,
        color: m.color,
        strava: ride.strava,
        name: ride.name,
        dst: m.dst,
        when: m.when,
      },
    });
  });

  const lightboxElements = [];
  if (ride.media && ride.media.features) {
    ride.media.features.forEach((feature) => {
      const props = feature.properties;
      let description = "";
      if (props.timestamp) {
        const date = new Date(props.timestamp);
        description = date.toLocaleString(undefined, {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      lightboxElements.push({
        href: props.full,
        type: props.type === "video" ? "video" : "image",
        // title: ride.name,
        description: description,
      });
    });
  }

  let lightbox = null;
  if (lightboxElements.length > 0) {
    lightbox = GLightbox({
      elements: lightboxElements,
      autoplayVideos: true,
      loop: false,
    });
  }

  rideObjects.push({
    ...ride,
    coordinates,
    lightbox,
  });
});

let currentCluster = "all";
let mediaMarkers = [];

function updateMediaMarkers(cluster, rideId) {
  // Clear existing markers
  mediaMarkers.forEach((m) => m.remove());
  mediaMarkers = [];

  rideObjects.forEach((ride) => {
    const matchesCluster = ride.cluster === cluster;
    const matchesRide = rideId === "all" || String(ride.id) === String(rideId);

    if (matchesCluster && matchesRide && ride.media && ride.media.features) {
      ride.media.features.forEach((feature, index) => {
        const props = feature.properties;
        const el = document.createElement("div");
        el.classList.add("marker-thumb");
        if (props.type === "video") {
          el.classList.add("marker-video");
        }
        el.style.backgroundImage = `url("${props.thumb}")`;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          if (ride.lightbox) {
            ride.lightbox.openAt(index);
          }
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(feature.geometry.coordinates)
          .addTo(map);
        mediaMarkers.push(marker);
      });
    }
  });
}

map.on("load", () => {
  map.addSource("ride-lines", {
    type: "geojson",
    data: linesGeoJSON,
    lineMetrics: true,
  });

  map.addSource("ride-markers", {
    type: "geojson",
    data: markersGeoJSON,
  });

  map.addLayer({
    id: "ride-lines-layer",
    type: "line",
    source: "ride-lines",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": ["get", "color"],
      "line-width": 3,
      "line-opacity": 0.8,
    },
  });

  map.addLayer({
    id: "ride-arrows",
    type: "symbol",
    source: "ride-lines",
    layout: {
      "symbol-placement": "line",
      "symbol-spacing": ["interpolate", ["linear"], ["zoom"], 10, 50, 19, 200],
      "text-field": ">",
      "text-size": ["interpolate", ["linear"], ["zoom"], 6, 20, 19, 32],
      "text-padding": 5,
      "text-justify": "auto",
      "text-allow-overlap": true,
      "text-ignore-placement": true,
      "text-keep-upright": false,
    },
    paint: {
      "text-color": ["get", "color"],
      "text-halo-color": "white",
      "text-halo-width": 1,
      "text-opacity": 0.8,
    },
  });

  map.addLayer({
    id: "ride-markers-circle",
    type: "circle",
    source: "ride-markers",
    paint: {
      "circle-radius": 10,
      "circle-color": ["get", "color"],
      "circle-opacity": 0.9,
    },
  });

  map.addLayer({
    id: "ride-markers-label",
    type: "symbol",
    source: "ride-markers",
    layout: {
      "text-field": [
        "concat",
        ["get", "label"],
        " ",
        ["get", "value"],
        " ",
        ["get", "unit"],
      ],
      "text-size": 12,
      "text-font": ["Noto Regular"],
      "text-anchor": "center",
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "black",
      "text-halo-color": "rgba(250, 248, 247, 0.25)",
      "text-halo-width": 2,
    },
  });

  // Popup logic
  map.on("click", "ride-markers-circle", (e) => {
    const props = e.features[0].properties;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        `<a href="${props.strava}" target="_blank">${props.name}</a><br>after ${props.dst} km, on ${props.when}`,
      )
      .addTo(map);
  });

  map.on("mouseenter", "ride-markers-circle", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "ride-markers-circle", () => {
    map.getCanvas().style.cursor = "";
  });

  // Initial View
  filterRides("all", false);
});

function updateStats(stats) {
  const hours = Math.floor(stats.moving_hours);
  const minutes = Math.round((stats.moving_hours - hours) * 60);

  statsDisplay.innerHTML = `
    <b>Rides:</b> ${stats.ride_count} |
    <b>Total Distance:</b> ${stats.distance_km} km |
    <b>Elevation Gain:</b> ${stats.elevation_m} m |
    <b>Moving Time:</b> ${hours}h ${minutes}m
  `;
}

function applyDisplayFilters(cluster, rideId) {
  const clusterFilter = cluster === "all" ? null : ["==", ["get", "cluster"], cluster];

  // Set filter for lines and arrows
  map.setFilter("ride-lines-layer", clusterFilter);
  map.setFilter("ride-arrows", clusterFilter);

  // Set filter for markers: if rideId is set, only show markers for that ride
  let markerFilter = clusterFilter;
  if (rideId !== "all") {
    const rideIdNum = Number(rideId);
    const rideFilter = ["==", ["get", "id"], rideIdNum];
    markerFilter = clusterFilter ? ["all", clusterFilter, rideFilter] : rideFilter;

    // Dim other rides in the current view
    const opacityExp = ["case", ["==", ["get", "id"], rideIdNum], 0.8, 0.3];
    map.setPaintProperty("ride-lines-layer", "line-opacity", opacityExp);
    map.setPaintProperty("ride-arrows", "text-opacity", opacityExp);
  } else {
    // Restore default opacity
    map.setPaintProperty("ride-lines-layer", "line-opacity", 0.8);
    map.setPaintProperty("ride-arrows", "text-opacity", 0.8);
  }

  map.setFilter("ride-markers-circle", markerFilter);
  map.setFilter("ride-markers-label", markerFilter);
}

function filterRides(selectedCluster, animate = true) {
  currentCluster = selectedCluster;
  applyDisplayFilters(selectedCluster, "all");
  updateMediaMarkers(selectedCluster, "all");

  // Calculate bounds
  const bounds = new maplibregl.LngLatBounds();
  let hasVisible = false;

  linesGeoJSON.features.forEach((f) => {
    if (selectedCluster === "all" || f.properties.cluster === selectedCluster) {
      f.geometry.coordinates.forEach((coord) => bounds.extend(coord));
      hasVisible = true;
    }
  });

  if (hasVisible) {
    map.fitBounds(bounds, {
      padding: 50,
      duration: animate ? 800 : 0,
    });
  }

  const stats =
    selectedCluster === "all" ? data.total_stats : data.clusters[selectedCluster];
  updateStats(stats);

  // Update ride selector
  rideSelector.innerHTML = '<option value="all">Select Ride...</option>';
  rideObjects.forEach((obj) => {
    if (selectedCluster === "all" || obj.cluster === selectedCluster) {
      const opt = document.createElement("option");
      opt.value = obj.id;
      opt.textContent = obj.name;
      rideSelector.appendChild(opt);
    }
  });
}

regionSelector.addEventListener("change", (e) => {
  filterRides(e.target.value);
});

rideSelector.addEventListener("change", (e) => {
  const rideId = e.target.value;

  // Apply visual highlighting
  applyDisplayFilters(currentCluster, rideId);
  updateMediaMarkers(currentCluster, rideId);

  if (rideId === "all") return;

  const feature = linesGeoJSON.features.find(
    (f) => String(f.properties.id) === String(rideId),
  );
  if (feature) {
    const bounds = new maplibregl.LngLatBounds();
    feature.geometry.coordinates.forEach((coord) => bounds.extend(coord));
    map.fitBounds(bounds, {
      padding: 50,
      duration: 1200,
    });
  }
});
