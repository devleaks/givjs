/*  Module dedicated to the update of feature and visuals.
 *
 */

import { getFeatureId } from "./GeoJSON"
import { getLayerForFeatureId } from "./Style"


// modified to update a single feature but should work with a featurecollection
export function update(layer, feature) {
    let l = getLayerForFeatureId(layer, getFeatureId(feature))
    layer.addData(feature)
    if (l) {
        layer.removeLayer(l)
    }
    console.log("update", feature)
}