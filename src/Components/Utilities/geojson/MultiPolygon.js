import { Geometry } from "./Geometry"

export class MultiPolygon extends Geometry {

    constructor(coords) {
        super("MultiPolygon", coords)
    }

}