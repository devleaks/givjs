import { GeoJSON } from "./GeoJSON"

export class FeatureCollection extends GeoJSON {

    constructor() {
        super("FeatureCollection")
        this.features = []
    }

    add(f) {
        if (f.type == "Feature") {
            this.features.push(f)
        }
    }

    get length() {
        return this.features.length
    }

    get features() {
        return this.features
    }

}