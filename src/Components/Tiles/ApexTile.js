/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import "apexcharts/dist/apexcharts.css"
import "../../assets/css/chart.css"

import { Tile } from "../Tile"

export class ApexTile extends Tile {

    constructor(elemid, message_type) {
        super(elemid, message_type)
    }

    /**
     * Stores data for state restore
     * (Nothing to store, data is in Transport)
     */
    passivate() {

    }


}