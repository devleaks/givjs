/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


/*  Module dedicated to the mapping of geojson feature (points and polygons) to Leaflet visuals.
 */
import { DivIcon, Marker } from "leaflet"
import moment from "moment"
// import chroma from "chroma-js"
import Mustache from "mustache"

import { getFeatureId } from "./GeoJSON"
import { Sparkline } from "../Tiles/Charts/Sparkline"

import { HIDE_FEATURE, HIDE_STYLE, HIDE_TOUCHED, APRONS_COLORS, HASDATA } from "../Constant"

// possible property names for rotation. Must be a number
const ROTATION_PROPERTIES = ["heading", "bearing", "orientation", "orient"]
const ROTATION_PROPERTY = "_rotation"

const DEFAULTS = {
    markerSymbol: "map-marker",
    markerColor: "#999999",
    markerSize: 12, // px
    lDivIconClassname: "gip-marker",
    SparklinePrefix: "spark-",
    info_content_id: "side-info",
    apron_default_style: {
        color: "darkgrey", // stroke color
        opacity: 0.4, // stroke opacity 0 = transparent
        weight: 1, // stroke width
        fillColor: "darkgrey", // fill color
        fillOpacity: 0.2 // fill opacity 1 = opaque
    },
    style: {
        color: "darkgrey", // stroke color
        opacity: 0.6, // stroke opacity 0 = transparent
        weight: 1, // stroke width
        fillColor: "darkgrey", // fill color
        fillOpacity: 0.2 // fill opacity 1 = opaque
    }
}

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
    bindTexts(feature, layer)
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
        let style = DEFAULTS.apron_default_style
        style.color = APRONS_COLORS[feature.properties.apron]
        return style
    }
    return DEFAULTS.style
}


function touch(feature) {
    feature.properties[HIDE_TOUCHED] = moment()
}

// Get rotation of feature if supplied. Add rotation offset for tilted icon
function getRotation(feature) {
    let rotation = 0.0
    if (feature.hasOwnProperty("properties")) {
        let notdone = true
        ROTATION_PROPERTIES.forEach(function(prop) {
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
        console.warn("Style::getRotation", "feature has no rotation properties", ROTATION_PROPERTIES, feature)
    }
    return rotation
}


function getSparklineId(feature) {
    return DEFAULTS.SparklinePrefix + getFeatureId(feature)
}

function isPlane(feature) {
    return feature.properties.type == "AIRCRAFT"
}

function getMarker(feature, latlng) {
    feature.properties[ROTATION_PROPERTY] = getRotation(feature)
    let marker

    if (isPlane(feature)) {
        let name = feature.properties.hasOwnProperty("name") ? feature.properties.name : "PLANE"
        let altitude = feature.properties.hasOwnProperty("altitude") ? feature.properties.altitude : "0"
        let speed = feature.properties.hasOwnProperty("speed") ? feature.properties.speed : "0"
        let heading = feature.properties.hasOwnProperty("heading") ? feature.properties.heading : "0"
        marker = new Marker(latlng, {
            icon: new DivIcon({
                className: DEFAULTS.lDivIconClassname,
                html: `<svg version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     width="49.215px" height="71.679px" viewBox="0.512 0 49.215 71.679" enable-background="new 0.512 0 49.215 71.679"
     xml:space="preserve">
<rect x="0.937" y="0.146" fill="#40A629" width="48.189" height="10.278"/>
<polyline fill="none" stroke="#40A629" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="
    0.937,37.819 49.127,37.819 23.526,71.004 "/>
<text transform="matrix(1 0 0 1 1.8972 18.532)" fill="#40A629" font-family="'Helvetica'" font-size="10">AL</text>
<text transform="matrix(1 0 0 1 1.8972 26.8147)" fill="#40A629" font-family="'Helvetica'" font-size="10">SP</text>
<text transform="matrix(1 0 0 1 1.8972 35.0999)" fill="#40A629" font-family="'Helvetica'" font-size="10">HD</text>
<text transform="matrix(1 0 0 1 1.8972 8.9998)" fill="#FFFFFF" font-family="'Helvetica'" font-size="10">${ name }</text>
<text transform="matrix(1 0 0 1 15.0715 18.532)" fill="#40A629" font-family="'Helvetica'" font-size="10">: ${ altitude }</text>
<text transform="matrix(1 0 0 1 15.0715 26.8147)" fill="#40A629" font-family="'Helvetica'" font-size="10">: ${ speed }</text>
<text transform="matrix(1 0 0 1 15.0715 35.0999)" fill="#40A629" font-family="'Helvetica'" font-size="10">: ${ heading }°</text>
</svg>`,
                iconAnchor: [23.526,71.004] // last point of polyline
            })
        })
    } else {
        marker = new Marker(latlng, {
            icon: getIcon(feature),
            rotationAngle: feature.properties[ROTATION_PROPERTY]
        })
    }

    if (feature.properties.hasOwnProperty(HASDATA)) {
        marker.on("add", function() {
            let sparkline = new Sparkline(
                getSparklineId(feature),
                feature.properties[HASDATA].type,
                feature.properties[HASDATA].values
            )
            sparkline.render()
        });
    }

    return marker
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
/**
 * Gets the icon.
 *
 * @param      {<type>}  feature  The feature
 * @return     {Object}  The icon and a function to be called when added to the map.
 */
function getIcon(feature) {
    let glyph = DEFAULTS["markerSymbol"],
        color = DEFAULTS["markerColor"],
        size = DEFAULTS["markerSize"]
    let html = ""

    if (feature.properties.hasOwnProperty(HASDATA)) {
        html = "<div id='" + getSparklineId(feature) + "'></div>"
    } else {
        if (feature.properties.hasOwnProperty(HIDE_STYLE)) {
            if (feature.properties[HIDE_STYLE]["markerSymbol"]) {
                glyph = feature.properties[HIDE_STYLE]["markerSymbol"]
            }
            if (feature.properties[HIDE_STYLE]["markerColor"]) {
                color = feature.properties[HIDE_STYLE]["markerColor"]
                /*
                if (color.charAt(0) == "#") { // to avoid double quotes in html string...
                    color = "rgb(" + chroma(color).rgb().join(",") + ")"
                }*/
            }
            if (feature.properties[HIDE_STYLE]["markerSize"]) {
                size = feature.properties[HIDE_STYLE]["markerSize"]
            }
        }
        html = `<i class='la la-${ glyph }' style='color: ${ color }; font-size:${ size }px;'></i>`
    }
    return new DivIcon({
        className: DEFAULTS.lDivIconClassname,
        html: html
    })
}


const TEMPLATE_PROPERTIES = ["linkText", "linkURL", "label", "tooltip", "popup", "sidebar"]

function bindTexts(feature, layer) {
    function showLabel(f) {
        return (f.properties.hasOwnProperty("_templates") &&
            f.properties._templates.hasOwnProperty("show_label") &&
            f.properties._templates.show_label)
    }

    if (feature.properties.hasOwnProperty("_templates")) {
        let bound = []
        feature.properties._texts = feature.properties.hasOwnProperty("_texts") ? feature.properties._texts : {}
        TEMPLATE_PROPERTIES.forEach(function(s) {
            let text = feature.properties._texts.hasOwnProperty(s) ? feature.properties._texts[s] : false
            if (feature.properties._templates.hasOwnProperty(s) && feature.properties._templates[s] != null && !text) {
                feature.properties._texts[s] = Mustache.render(feature.properties._templates[s], {
                    feature: feature,
                    templates: feature.properties._templates,
                    texts: feature.properties._texts || {}
                })
            }
            // if some text, use it for its purpose
            if (feature.properties._texts[s]) {
                switch (s) {
                    case "label": // only one of label or tooltip. First one gets installed, second one does not get installed. Label gets tested first.
                        if (!layer.getTooltip() && showLabel(feature)) {
                            layer.bindTooltip(feature.properties._texts.label, { direction: "center", className: "oscars-label", permanent: true })
                            bound.push(s)
                        }
                        break
                    case "tooltip":
                        if (!layer.getTooltip()) {
                            layer.bindTooltip(feature.properties._texts.tooltip, { direction: "top", className: "oscars-tooltip", permanent: false })
                            bound.push(s)
                        }
                        break
                    case "popup":
                        layer.bindPopup(feature.properties._texts.popup)
                        bound.push(s)
                        break
                    case "sidebar":
                        if (DEFAULTS.info_content_id) {
                            layer.on("contextmenu", function() {
                                if (feature.properties._texts.hasOwnProperty("sidebar")) {
                                    let container = document.getElementById(DEFAULTS.info_content_id)
                                    if (container) {
                                        container.innerHTML = feature.properties._texts["sidebar"]
                                    } else {
                                        console.warn("Style::bindTexts: Sidebar text container not found", DEFAULTS.info_content_id, feature)

                                    }
                                } else {
                                    console.log("Style::bindTexts: Warning - No sidebar text", feature)
                                }
                            })
                            bound.push(s)
                        }
                        break
                }
                feature.properties._bound = bound // debug
            }
        })
    }
}