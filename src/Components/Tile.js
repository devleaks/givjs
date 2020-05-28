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
    static showJson(msg, data, hook) {
        const formatter = new JSONFormatter(data)
        let newel = document.createElement("div")
        newel.appendChild(formatter.render())
        hook.appendChild(newel)
    }


    /**
     * Sample listener function
     *
     * @param      {String}  msgtype  The message type
     * @param      {Object}  msg      The message, a JavaScript string or object.
     */
    listener(msgtype, msg) {
        switch(msgtype) {
            case MSG1:
                updateOnMsg1(msg)
                break
            default:
                console.warn("Tile::listener: No handler found for message type", msgtype)
                break
        }
    } 


    updateOnMsg1(data) {
        console.log("Tile::updateOnMsg1",data)
    }

}