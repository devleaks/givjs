/*  GeoJSON Utility Functions
 *
 */
const LAYERNAME_PROPERTIES = ["layer", "layerName", "group_name"]

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


// get layer in which we display this feature from properties
// (one property of LAYERNAME_PROPERTIES holds the name of the layer)
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

