/*  Base class for HTML rendered dashboard elements
 */
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