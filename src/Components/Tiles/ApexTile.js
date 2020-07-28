/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import "apexcharts/dist/apexcharts.css"
import "../../assets/css/chart.css"

import { Tile } from "../Tile"

const APEXTILE_CSS_CLASS = "apextile"

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
    constructor(areaid, elemid, message_type, options) {
        super(areaid, elemid, message_type, options)
    }


    /**
     * Installs the object.
     */
    install() {
        super.install()
        let el = document.getElementById(this.elemid)
        if (el) {
            el.classList.add(APEXTILE_CSS_CLASS)
        }
    }


    /**
     * Stores data for state restore
     * (Nothing to store, data is in Transport)
     */
    passivate() {
        super.passivate()
        console.error("ApexTile::passivate", "You did not implement passivate for your class.")
        return null
    }


}