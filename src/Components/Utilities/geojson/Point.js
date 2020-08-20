import { Geometry } from "./Geometry"

export class Point extends Geometry {

    constructor(coords) {
        super("Point", coords)
    }

}