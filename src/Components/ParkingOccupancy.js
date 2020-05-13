/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import { deepExtend } from "./Utilities"
import { Subscriber } from "./Subscriber"

import { BUSY, APRONS_COLORS } from "./Constant"

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    msgtype: "flightboard",
    parking_id: "name",
    aprons_max: []
}

export class ParkingOccupancy extends Subscriber {

    constructor(message_type, parkings, map, options) {
        super(message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.parkings = parkings
        this.map = map
        this.aprons = Array(this.options.aprons_max.length).fill(0)
        this.install()
    }


    /*  installs the HTML code in the document
     */
    install() {
        this.listen(this.updateParking.bind(this))
    }


    updateParking(msgtype, parking) {
        const box = this.parkings.find(this.options.parking_id, parking.name)
        if (box) {
            box.properties._style = {
                color: APRONS_COLORS[box.properties.apron], // stroke color
                opacity: 0.4, // stroke opacity 0 = transparent
                weight: 1, // stroke width
                fillColor: "green", // fill color
                fillOpacity: 0.4 // fill opacity 1 = opaque
            }
            if (parking.available == BUSY) {
                this.aprons[box.properties.apron]++
                box.properties._style.fillColor = "red"
            } else {
                this.aprons[box.properties.apron] = this.aprons[box.properties.apron] == 0 ? 0 : this.aprons[box.properties.apron] - 1
            }
        }
        this.map.update(box, "APRONS")
    }
}