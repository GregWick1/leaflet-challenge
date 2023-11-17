// Create the tile layer for the background of the map

let basemap = L.tileLayer(
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', 
    {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

// Create the map object
let map = L.map("map", {
 center: [
    40.7, -94.5
 ],
 zoom: 5
});

// Add the basempa tile layer to the map
basemap.addTo(map);

// Retrieve the earthquake geoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
    console.log(data)

    // Create a function that returns the style data for each earthquake 
    // Pass the magnitude into two functions to calculate color and radius
    function style(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    // Create function that determines color of marker based on magnitude
    function getColor(depth) {
        switch (true) {
            case depth > 90:
                return "#ea2c2c";
            case depth > 70:
                return "#ea822c";
            case depth > 50:
                return "#ee9c00";
            case depth > 30:
                return "#eecc00";
            case depth > 10:
                return "#d4ee00";
            default:
                return "#98ee00";
        }
    }

    // Create function that determines the radius of the marker based on magnitude
    // Earthquakes with a mag of 0 were plotted with the wrong radius
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4
    }

    // Add the GeoJSON layer to the map
    L.geoJSON(data, {
        // Create a marker for each feature
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: style,
        // Create a popup for each marker to display the magnitude and location of the earthquake
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "Magnitude: "
                + feature.properties.mag
                + "<br>Depth: "
                + feature.geometry.coordinates[2]
                + "<br>Location: "
                + feature.properties.place
            );
        }
    }).addTo(map);

    // Create the legend object
    let legend = L.control({
        positon: "bottomright"
    });

    // Add the deatils for the legend
    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");

        let grades = [-10, 10, 30, 50, 70, 90];
        let colors = [
         "#98ee00",
         "#d4ee00",
         "#eecc00",
         "#ee9c00",
         "#ea822c",
         "#ea2c2c"
        ];

        // Create a function that loops through intervals to generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style='background: " + colors[i] + "'></i> "
            + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    // Add the legend to the map
    legend.addTo(map);
});
