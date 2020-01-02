// store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// create markerColor function to modify marker color and legend
function markerColor(magnitude) {
    if (magnitude > 5) {
        return 'Red'
    } else if (magnitude > 4) {
        return 'Orange'
    } else if (magnitude > 3) {
        return 'Yellow'
    } else if (magnitude > 2) {
        return 'Green'
    } else if (magnitude > 1) {
        return 'Blue'
    } else if (magnitude > 0) {
        return 'Purple'
    } else {
        return 'White'
    }
};

// perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    // once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // define a function we want to run once for each feature in the features array and
    // give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><h3>Magnitude: " + feature.properties.mag +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // create a GeoJSON layer containing the features array on the earthquakeData object and
    // run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag * 5,
                fillColor: "White",
                color: "Black",
                weight: 1,
                opacity: 1,
                fillOpacity: feature.properties.mag / 5,
                fillColor: markerColor(feature.properties.mag)
            });
        }
    });

    // send our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // create legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function (map) {

        var div = L.DomUtil.create("div", "info legend");
        grades = [0, 1, 2, 3, 4, 5];
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };

    // add legend to the map
    legend.addTo(myMap);

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}