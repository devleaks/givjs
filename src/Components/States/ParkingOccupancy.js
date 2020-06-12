/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import PubSub from "pubsub-js"

import { deepExtend } from "../Utilities/Utils"
import { Subscriber } from "../Subscriber"

import { BUSY, APRONS_COLORS, MAP_MSG, PARKING_UPDATE_MSG } from "../Constant"

PubSub.immediateExceptions = true;

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    msgtype: "parking",
    parking_id: "name",
    aprons_max: [],
    aprons_layer_name: ""
}

export class ParkingOccupancy extends Subscriber {

    constructor(message_type, parkings, options) {
        super(message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.parkings = parkings
        this.aprons = Array(this.options.aprons_max.length).fill(0)
        this.install()
    }


    /**
     * Installs the tile.
     */
    install() {
        this.listen(this.update.bind(this))
    }


    /**
     * Listener for "parking" messages.
     *
     * @param      {String}  msgtype  The msgtype
     * @param      {Object}  parking  The parking. Parking object is as follow:
     * {
     *   name: "A51",
     *   available: {"busy"|"available"}
     * }
     */
    update(msgtype, parking) {
        const box = this.parkings.find(this.options.parking_id, parking.name)
        if (box) {
            box.properties._style = {
                color: APRONS_COLORS[box.properties.apron], // stroke color
                opacity: 0.4, // stroke opacity 0 = transparent
                weight: 1, // stroke width
                fillColor: "darkgrey", // fill color
                fillOpacity: 0.2 // fill opacity 1 = opaque
            }
            box.properties.layerName = this.options.aprons_layer_name
            if (parking.available == BUSY) {
                this.aprons[box.properties.apron]++
                box.properties._style.fillColor = "red"
            } else {
                this.aprons[box.properties.apron] = this.aprons[box.properties.apron] == 0 ? 0 : this.aprons[box.properties.apron] - 1
            }
            PubSub.publish(MAP_MSG, box)
            PubSub.publish(PARKING_UPDATE_MSG, {
                busy: this.aprons,
                max: this.options.aprons_max
            })
        }
    }


    /**
     * Save class instance essentials for restoration
     */
    passivate() {
        let content = {
            parkings: this.parkings,
            aprons: this.aprons
        }
        localStorage.setItem("parking-occupancy", JSON.stringify(content))
    }


}