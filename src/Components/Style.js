/*  Module dedicated to the mapping of geojson feature (points and polygons) to Leaflet visuals.
 *
 */

import L from "leaflet"
import moment from "moment"
import chroma from "chroma-js"
import { getFeatureId } from "./GeoJSON"
import { HIDE_FEATURE, HIDE_STYLE, HIDE_TOUCHED, APRONS_COLORS } from "./Constant"

// possible property names for rotation. Must be a number
const ROATION_PROPERTIES = ["heading", "bearing", "orientation", "orient"]

let featureLayerIds = new Map()


/*  LEAFLET SPECIFIC STYLING FUNCTIONS
 *
 */
// Spawn layer from feature, mainly for point
export function pointToLayer(feature, latlng) {
    touch(feature)
    return getMarker(feature, latlng)
}


// Opportunity to bind feature' stuff to layer
// We store link between feature(id) and layer
export function onEachFeature(feature, layer) {
    featureLayerIds.set(getFeatureId(feature), layer)
    layer[HIDE_FEATURE] = feature
}


// returns the layer associated with this feature
export function getFeatureLayer(feature) {
    return featureLayerIds.get(getFeatureId(feature))
}


// style feature, mainly for polygons
export function style(feature) {
    touch(feature)
    if (feature.hasOwnProperty("properties") && feature.properties.hasOwnProperty(HIDE_STYLE)) {
        return feature.properties[HIDE_STYLE]
    }
    if (feature.properties.hasOwnProperty("apron")) {
        return {
            color: APRONS_COLORS[feature.properties.apron], // stroke color
            opacity: 0.4, // stroke opacity 0 = transparent
            weight: 1, // stroke width
            fillColor: "darkgrey", // fill color
            fillOpacity: 0.2 // fill opacity 1 = opaque
        }
    }
    return {
        color: "darkgrey", // stroke color
        opacity: 0.6, // stroke opacity 0 = transparent
        weight: 1, // stroke width
        fillColor: "darkgrey", // fill color
        fillOpacity: 0.2 // fill opacity 1 = opaque
    }
}


function touch(feature) {
    feature.properties[HIDE_TOUCHED] = moment()
}

// Get rotation of feature if supplied. Add rotation offset for tilted icon
function getRotation(feature) {
    let rotation = 0.0
    if (feature.hasOwnProperty("properties")) {
        let notdone = true
        ROATION_PROPERTIES.forEach(function(prop) {
            if (feature.properties.hasOwnProperty(prop) && notdone) { // has rotation
                let r = parseFloat(feature.properties[prop])
                if (!isNaN(r)) {
                    rotation = r
                    notdone = false
                }
            }
        })

        if (feature.properties.hasOwnProperty("_style") && feature.properties._style.hasOwnProperty("markerRotationOffset")) { // has rotation offset = need to rotate icon
            let r = parseFloat(feature.properties._style.markerRotationOffset)
            if (!isNaN(r)) {
                rotation += r
            }
        }
        // while(r > 360) { r -= 360 }
    } else {
        console.log("Style::getRotation", "feature has no properties")
    }
    return rotation
}


function getMarker(feature, latlng) {
    feature._rotation = getRotation(feature)
    //console.log("Style::getMarker", feature, latlng)
    return L.marker(latlng, {
        icon: getIcon(feature),
        rotationAngle: feature._rotation
    })
}


/*

STYLE: {
    markerSymbol: "map-marker",
    markerSize: 24, // px
    markerColor: "rgb(0,128,256)", // lighter blue
    color: "darkgrey", // stroke color
    opacity: 0.6, // stroke opacity 0 = transparent
    weight: 1, // stroke width
    fillColor: "darkgrey", // fill color
    fillOpacity: 0.2, // fill opacity 1 = opaque
    fillPattern: "solid", // fill pattern (currently unused)
    inactiveMarkerColor: "darkgrey"
}

 */
function getIcon(feature) {
    let icon = "map-marker",
        color = "#999999",
        size = 14 // px
    if (feature.properties.hasOwnProperty(HIDE_STYLE)) {
        if (feature.properties[HIDE_STYLE]["markerSymbol"]) {
            icon = feature.properties[HIDE_STYLE]["markerSymbol"]
        }
        if (feature.properties[HIDE_STYLE]["markerColor"]) {
            color = feature.properties[HIDE_STYLE]["markerColor"]
            if (color.charAt(0) == "#") {
                color = "rgb(" + chroma(color).rgb().join(",") + ")"
                console.log("getIcon::chroma", color)
            }
        }
        if (feature.properties[HIDE_STYLE]["markerSize"]) {
            size = feature.properties[HIDE_STYLE]["markerSize"]
        }
    }
    // eslint-disable-next-line quotes
    // let html = "<i class='la la-" + icon + "' style='color: " + '"' + color + '"' + "; font-size:" + size + "px;'></i>"
    let html = `<i class='la la-${ icon }' style='color: ${ color }; font-size:${ size }px;'></i>`
    console.log("getIcon", html)
    return L.divIcon({
        className: "gip-marker",
        html: html
    })
}