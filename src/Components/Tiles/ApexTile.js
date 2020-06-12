/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import "apexcharts/dist/apexcharts.css"
import "../../assets/css/chart.css"

import { Tile } from "../Tile"

/**
 * "Abstract" class for all charting tiles
 *
 * @class      ApexTile (name)
 */
export class ApexTile extends Tile {

    /**
     * Constructs a new Apex chart tile instance.
     *
     * @param      {<type>}  elemid        The elemid
     * @param      {<type>}  message_type  The message type
     */
    constructor(elemid, message_type) {
        super(elemid, message_type)
    }

    /**
     * Stores data for state restore
     * (Nothing to store, data is in Transport)
     */
    passivate() {
      console.error("ApexTile::passivate", "You did not implement passivate for your class.")
      return null
    }


}