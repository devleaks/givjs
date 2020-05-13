/*  GeoJSON Utility Functions
 *
 */
const LAYERNAME_PROPERTIES = ["layer", "layerName", "GROUP_NAME"]

// assumed of type Feature, returns Feature's id or null
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


export function getFeatureLayerName(feature, dflt = "Things") {
    let layerName = false
    if (feature.hasOwnProperty("properties")) {
        let notdone = true
        LAYERNAME_PROPERTIES.forEach(function(prop) {
            if (feature.properties.hasOwnProperty(prop) && notdone) { // has name
                layerName = feature.properties[prop]
            }
        })
    }
    return layerName ? layerName : dflt
}


// assumed of type FeatureCollection or Feature, returns an array of ids
export function getFeatureIds(geojson) {
    let ids = []
    if (geojson.type == "FeatureCollection") {
        geojson.features.forEach(function(f) {
            let fid = getFeatureId(f)
            if (fid) {
                ids.push(fid)
            }
        })
    } else if (geojson.type == "Feature") {
        let fid = getFeatureId(geojson)
        if (fid) {
            ids.push(fid)
        }
    }
    return ids
}