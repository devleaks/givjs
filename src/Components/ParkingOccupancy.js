/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import { deepExtend } from "./Utilities"
import { Subscriber } from "./Subscriber"

import { BUSY } from "./Constant"

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    msgtype: "flightboard",
    parking_id: "name",
    aprons_max: []
}

const PARKING_AVAILABLE = {
        markerSymbol: "map-marker",
        markerSize: 24, // px
        markerColor: "rgb(0,128,256)", // lighter blue
        color: "#E6E04F", // stroke color
        opacity: 0.6, // stroke opacity 0 = transparent
        weight: 1, // stroke width
        fillColor: "green", // fill color
        fillOpacity: 0.2, // fill opacity 1 = opaque
        fillPattern: "solid", // fill pattern (currently unused)
        inactiveMarkerColor: "darkgrey"
    },
    PARKING_BUSY = {
        markerSymbol: "map-marker",
        markerSize: 24, // px
        markerColor: "rgb(0,128,256)", // lighter blue
        color: "red", // stroke color
        opacity: 0.6, // stroke opacity 0 = transparent
        weight: 1, // stroke width
        fillColor: "red", // fill color
        fillOpacity: 0.2, // fill opacity 1 = opaque
        fillPattern: "solid", // fill pattern (currently unused)
        inactiveMarkerColor: "darkgrey"
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
            if (parking.available == BUSY) {
                this.aprons[box.properties.apron]++
                box.properties._style = PARKING_BUSY
            } else {
                this.aprons[box.properties.apron] = this.aprons[box.properties.apron] == 0 ? 0 : this.aprons[box.properties.apron] - 1
                box.properties._style = PARKING_AVAILABLE
            }
        }
        this.map.update(box, "APRONS")
    }
}