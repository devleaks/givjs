import { GeoJSON } from "./GeoJSON"
import { GEOMETRY_TYPES } from "./Geometry"

export class GeometryCollection extends GeoJSON {

    constructor(geometries = []) {
        super("GeometryCollection")
        this.geometries = geometries
    }

    add(g) {
        if (GEOMETRY_TYPES.constais(g.type)) {
            this.geometries.push(g)
        }
    }

    get length() {
        return this.geometries.length
    }

    get geometries() {
        return this.geometries
    }

    get json() {
        return JSON.stringify({
            type: this.type,
            geometries: this.geometries
        })
    }

}