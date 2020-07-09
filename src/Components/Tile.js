/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import { Subscriber } from "./Subscriber"

const TILE_CSS_CLASS = "tile"

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
     * Installs the object.
     */
    install() {
        let el = document.getElementById(this.elemid)
        el.classList.add(TILE_CSS_CLASS)
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


    /**
     * Save Tile state to localStorage
     */
    passivate() {
        console.log("Tile::passivate")
    }

}