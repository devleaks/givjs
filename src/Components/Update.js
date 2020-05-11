import { getFeatureId } from "./GeoJSON"
import { getLayerFeatureId } from "./Style"


// modified to update a single feature but should work with a featurecollection
export function update(layer, feature) {
        let fid = getFeatureId(feature)
        let layers_to_delete = []
        let ls = layer.getLayers()
        ls.forEach(function(layer) {
            let lfid = getLayerFeatureId(layer)
            if (lfid == fid) {
                layers_to_delete.push(layer)
            }
        })
        layer.addData(feature)
        layers_to_delete.forEach(function(l) {
            layer.removeLayer(l)
        })
        console.log("update", feature)
}