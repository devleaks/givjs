/*  Base class for HTML rendered dashboard elements
 */

import JSONFormatter from "json-formatter-js"
import { Subscriber } from "./Subscriber"

/**
 * A Tile is a HTML rendered "widget" that respond to messages sent to it.
 *
 * @class      Tile (name)
 */
export class Tile extends Subscriber {

    constructor(elemid, message_type) {
        super(message_type)
        this.elemid = elemid

    }

    /**
     * Utility function to shows the JSON in strutured way.
     *
     * @param      {String}  msg     The message
     * @param      {Object}  data    The JSON object to display
     * @param      {Document Node}  hook    Document node where to show JSON object.
     */
    showJson(msg, data, hook) {
        console.log("Tile::listener", msg, data)
        // add wire
        const formatter = new JSONFormatter(data)
        let newel = document.createElement("div")
        newel.appendChild(formatter.render())
        hook.appendChild(newel)
    }

}