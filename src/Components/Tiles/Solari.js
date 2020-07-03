/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */

import { Tile } from "../Tile"
import { FlapperDisplay, VESTABOARD_PRESET } from "../Utilities/FlapperDisplay"

import { deepExtend } from "../Utilities/Utils"

const DEFAULTS = {
    width: 23,
    height: 7,
    size: "XXS",
    preset: VESTABOARD_PRESET
}

/**
 * This class describes the HTML page footer.
 *
 * @class      Footer (name)
 */
export class Solari extends Tile {

    /**
     * Constructs a new Solari instance.
     *
     * @param      {<type>}  msgtype  The msgtype
     * @param      {<type>}  message  The message
     */
    constructor(elemid, msgtype, message, options) {
        super(elemid, msgtype)
        this.options = deepExtend(DEFAULTS, options)
        this.fd = new FlapperDisplay(elemid, message, this.options)
        this.install()
        this.fd.display(message)
    }


    /**
     * Installs the footer on the HTML page.
     * (Template should be externalized in <template> or pug file.)
     */
    install() {
        this.listen(this.update.bind(this))
    }


    /**
     * Listener for Solari message board.
     *
     * @param      {<type>}  msg     The message
     * @param      {<type>}  data    The data
     */
    update(msg, data) {
        console.log("Solari::update",data)
        this.fd.display(data)
    }

}