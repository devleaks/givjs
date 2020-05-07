/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import "../css/wire.css"

import { deepExtend } from "./Utilities"
import { Tile } from "./Tile"

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    elemid: "flightboard",
    msgtype: "flightboard"
}

export class Flightboard extends Tile {

    constructor(elemid, message_type, move, options) {
        super(elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.move = move
        this.install()
    }

    /*  installs the HTML code in the document
     */
    install() {
        let that = this
        var locallistener = function(msg, data) {
            if (that.move == data.move)
                that.update(msg, data)
        }
        this.listen(locallistener)
    }

    /*  update/insert HTML code on event
     */
    update(msg, data) {
        console.log(msg, data)
    }

}