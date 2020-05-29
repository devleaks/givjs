/*  Base class for HTML rendered dashboard elements
 */
import "apexcharts/dist/apexcharts.css"
import "../../assets/css/chart.css"

import { Tile } from "../Tile"

export class ApexTile extends Tile {

    constructor(elemid, message_type) {
        super(elemid, message_type)
    }

}