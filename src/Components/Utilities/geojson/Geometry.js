import { GeoJSON } from "./GeoJSON"

export const GEOMETRY_TYPES = [
    "Point",
    "MultiPoint",
    "LineString",
    "MultiLineString",
    "Polygon",
    "MultiPolygon",
    "GeometryCollection"
]

export class Geometry extends GeoJSON {

    constructor(type, coords) {
        super(type)
        this.coordinates = coords
    }

    get json() {
        return JSON.stringify({
            type: this.type,
            coordinates: this.coordinates
        })
    }

}