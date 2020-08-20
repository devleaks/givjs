import { Mixin, Multi } from "./Multi"
import { Geometry } from "./Geometry"
import { Point } from "./Point"

export class MultiPoint extends Mixin(Geometry, Multi, Point) {

    constructor(coords) {
        super("MultiPoint", coords)
    }

}