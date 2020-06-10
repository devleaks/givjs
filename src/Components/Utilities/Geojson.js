/*  GeoJSON Utility Functions
 *
 */
const LAYERNAME_PROPERTIES = ["layer", "layerName", "group_name"]

const VALID_GEOMETRY_TYPES = [
    "Point",
    "LineString",
    "Polygon",
    "MultiPoint",
    "MultiLineString",
    "MultiPolygon",
    "GeometryCollection"
]


/**
 * Gets GeoJSON feature identifier.
 *
 * @param      {<type>}  feature  The feature
 * @return     {<type>}  The feature identifier.
 */
export function getFeatureId(feature) {
    if (feature.hasOwnProperty("id")) {
        return feature.id
    } else if (feature.hasOwnProperty("properties")) {
        if (feature.properties.hasOwnProperty("id")) {
            return feature.properties.id
        } else if (feature.properties.hasOwnProperty("name")) {
            return feature.properties.name
        }
    }
    return null
}


/**
 * Gets the feature layer name. A property of LAYERNAME_PROPERTIES holds the name of the layer.
 *
 * @param      {<type>}   feature          The feature
 * @param      {string}   [dflt="Things"]  The default layer name if not found
 * @return     {boolean}  The feature layer name.
 */
export function getFeatureLayerName(feature, dflt = "Things") {
    let layerName = false
    if (feature.hasOwnProperty("properties")) {
        LAYERNAME_PROPERTIES.forEach(function(prop) {
            if (feature.properties.hasOwnProperty(prop) && !layerName) { // has name
                layerName = feature.properties[prop]
            }
        })
    }
    return layerName ? layerName : dflt
}


/**
 * Determines whether the specified geojson is geometry.
 *
 * @param      {<type>}   geojson  The geojson
 * @return     {boolean}  True if the specified geojson is geometry, False otherwise.
 */
function isGeometry(geojson) {
    return geojson.hasOwnProperty("type") ? VALID_GEOMETRY_TYPES.indexOf(geojson.type) > -1 : false
}


/**
 * Normalise a geojson object as a feature or a feature collection. Does not work on arrays of geojson.
 *
 * @param      {<type>}  geojson  The geojson
 * @return     {Object}  { description_of_the_return_value }
 */
function asFeature(geojson) {
    if (geojson.type === "Feature" || geojson.type === "FeatureCollection") {
        return geojson
    }

    return {
        type: "Feature",
        properties: {},
        geometry: geojson
    }
}

/**
 * Normalise a geojson object of an array of geojson objects as an array of features.
 *
 * @param      {<type>}  geojson  The geojson
 * @return     {Array<FEature>}   An array of GeoJSON Feature
 */
export function asArrayOfFeatures(geojson) {
    if (geojson.hasOwnProperty("type")) {
        if (geojson.type === "FeatureCollection") {
            return geojson.features
        } else if (geojson.type === "Feature") {
            return [geojson]
        } else if (Array.isArray(geojson)) {
            return geojson.reduce(function(flat, toFlatten) {
                return flat.concat(asArrayOfFeatures(toFlatten));
            }, [])
        }
    } else if (isGeometry(geojson)) {
        return asFeature(geojson)
    }
    console.warn("asArrayOfFeatures: Invalid geojson", geojson)
}