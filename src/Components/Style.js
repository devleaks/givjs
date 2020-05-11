/*
 *
 */

import L from "leaflet"
import moment from "moment"
import { getFeatureId } from "./GeoJSON"
// import BeautifyIcon from "leaflet-beautify-icon"


// possible property names for rotation. Must be a number
const ROATION_PROPERTIES = ["heading", "bearing", "orientation", "orient"]
const HIDE_FEATURE = "_feature"
const HIDE_LAYER = "_layer"
const HIDE_STYLE = "_style"

/*  LEAFLET SPECIFIC STYLING FUNCTIONS
 *
 */
// Spawn layer from feature
export function pointToLayer(feature, latlng) {
    touch(feature)
    feature._rotation = getRotation(feature)
    return L.marker(latlng)
}

export function onEachFeature(feature, layer) {
    touch(feature)
    feature[HIDE_LAYER] = layer
    layer[HIDE_FEATURE] = feature
}


export function style(feature) {
    touch(feature)
    if(feature.hasOwnProperty("properties") && feature.properties.hasOwnProperty(HIDE_STYLE)) {
        return feature.properties[HIDE_STYLE]
    }
    const opacity = [0.0, 0.2, 0.6, 0.2, 0.0, 0.6, 0.4]
    return {
        color: "darkgrey", // stroke color
        opacity: 0.6, // stroke opacity 0 = transparent
        weight: 1, // stroke width
        fillColor: "darkgrey", // fill color
        fillOpacity: (feature.properties.apron ? opacity[feature.properties.apron] : 0.2) // fill opacity 1 = opaque
    }
}


export function getLayerFeatureId(layer) {
    return layer.hasOwnProperty(HIDE_FEATURE) ? getFeatureId(layer[HIDE_FEATURE]) : false
}

export function getLayerForFeatureId(layerGroup, id) {
    let layers = layerGroup.getLayers()
    let layer = false
    layers.forEach(l => {
        if(!layer && (getLayerFeatureId(l) == id)) {
            layer = l
        }
    })
    return layer
}


function touch(feature) {
    feature.properties._touched = moment()
}

// Compute rotation if requested
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