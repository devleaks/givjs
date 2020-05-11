/*
 *
 */
import moment from "moment"
import BeautifyIcon from "leaflet-beautify-icon"

const DEFAULTS = {
        MARKER_MIN_SIZE: 15, // px
        BACKGROUND_COLOR: "transparent",
        ICON_STYLE: "border: none;",
        TOOLTIP_CLASSNAME: "oscars-label",
        SPEED_VECTOR: {
            weight: 2,
            color: '#f30',
            fillOpacity: 0.06,
            vectorLength: 5
        },
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
        },
        INFO_ID: "info",
        INFO_CONTENT_ID: "device-info"
    }

/*  LEAFLET SPECIFIC STYLING FUNCTIONS
 *
 */
// Spawn layer from feature
export function pointToLayer(feature, latlng) {
    touch(feature)
    feature.properties = feature.hasOwnProperty("properties") ? feature.properties : {}
    feature.properties._marker = getMarker(feature)
    return feature.properties._marker
}

export onEachFeature(feature, layer) {
    feature.properties = feature.hasOwnProperty("properties") ? feature.properties : {}
    feature.properties._featureLayer = layer // feature.properties._layer = layer where feature is added
    // bindTexts(feature, layer)
}


// specific to L.realtime
export function updateFeature(feature, oldLayer) {
    touch(feature)
    feature.properties = feature.hasOwnProperty("properties") ? feature.properties : {}
    feature.properties._icon = Oscars.Util.getIcon(feature)
}


function touch(feature) {
    feature.properties._touched = moment()
}

// Compute rotation if requested
function getRotation(feature) {
    var style = feature.properties._style
    var rotation = 0.0
    var notdone = true
    const ROATION_PROPERTIES = ['heading', 'bearing', 'orientation', 'orient']
    ROATION_PROPERTIES.forEach(function(prop) {
        if (feature.properties.hasOwnProperty(prop) && notdone) { // has rotation
            var r = parseFloat(feature.properties[prop])
            if (!isNaN(r)) {
                rotation = r
                notdone = false
            }
        }
    })

    if (style.hasOwnProperty("markerRotationOffset")) { // has rotation offset = need to rotate icon
        var r = parseFloat(style.markerRotationOffset)
        if (!isNaN(r)) {
            rotation += r
        }
    }
    return rotation
}


// Returns properly sized & styled icon from Point feature type, status, and display_status.
function getIcon(feature) {
    if (!isSet(feature.properties._style)) {
        console.log("Oscars.Util::getIcon: Warning - Feature has no style, using default", feature)
        feature.properties._style = _options.STYLE
    }
    if (isSet(feature.properties._data)) {
        return getSparkline(feature)
    }
    var style = feature.properties._style
    var size = getFontSizePx(feature)
    return L.BeautifyIcon.icon({
        icon: (isSet(style.markerSymbol)) ? style.markerSymbol : _options.STYLE.markerSymbol,
        prefix: "la",
        textColor: (isSet(style.markerColor)) ? style.markerColor : _options.STYLE.markerColor,
        innerIconStyle: "font-size: " + (size < _options.MARKER_MIN_SIZE ? _options.MARKER_MIN_SIZE : size) + 'px',
        backgroundColor: (isSet(style.backgroundColor)) ? style.backgroundColor : _options.BACKGROUND_COLOR,
        iconStyle: (isSet(style.iconStyle)) ? style.iconStyle : _options.ICON_STYLE
    })
}

// Returns oriented marker with icon for Point feature. Always returns a marker (defaults if needed).
function getMarker(feature) {
    // Get styled icon or sparkline graph. If feature contains data, icon is always regenerated (sparkline from data).
    if (!isSet(feature.properties._icon) || isSet(feature.properties._data)) {
        feature.properties._icon = getIcon(feature)
    }

    var markerOptions = {
        icon: feature.properties._icon
    }

    // Add vector
    var vector = getVector(feature)
    if (vector) {
        markerOptions.vector = vector
    }

    // Rotate marker
    var rotation = getRotation(feature)
    if (rotation != 0.0) {
        markerOptions.rotationAngle = rotation
    }

    // Assemble marker appearance and behavior
    var layer = L.marker(getLatLng(feature), markerOptions)

    // Add texts
    bindTexts(feature, layer)

    // Add vector
    Oscars.Omap.vector(vector, layer)

    return layer ? layer : L.marker(latlng, _options.MARKER)
}