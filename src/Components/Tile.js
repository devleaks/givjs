/*  Base class for HTML rendered dashboard elements
 */

import JSONFormatter from "json-formatter-js"
import { Subscriber } from "./Subscriber"

export class Tile extends Subscriber {

    constructor(elemid, message_type) {
        super(message_type)
        this.elemid = elemid

    }

    showJson(msg, data, hook) {
        console.log("Tile::listener", msg, data)
        // add wire
        const formatter = new JSONFormatter(data)
        let newel = document.createElement("div")
        newel.appendChild(formatter.render())
        hook.appendChild(newel)
      }
      
}