import * as L from "leaflet/src/Leaflet"
import antPath from "leaflet-ant-path";
    

function leafletTest() {

        var mymap = L.map("mapid").setView([51.505, -0.09], 13);

        L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw", {
                maxZoom: 18,
                attribution: "Map data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, " +
                        "<a href='http://creativecommons.org/licenses/by-sa/2.0/''>CC-BY-SA</a>, " +
                        "Imagery © <a href='http://mapbox.com'>Mapbox</a>",
                id: "mapbox.streets"
        }).addTo(mymap);

    let antPolyline = antPath.antPath([
                [51.51, -0.1],
                [51.50, -0.2]
            ], {});   
    
    antPolyline.addTo(mymap);

}

export default leafletTest;