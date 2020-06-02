/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import "../../assets/css/wire.css"

import { deepExtend } from "../Utils/Utilities"
import { Tile } from "../Tile"

import { showJson } from "../Utils/Display"

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    elemid: "wire",
    msgtype: "wire",
    voice: false,
    wire_container: "ul",
    "icon-set": "la-",
    size: "medium",
    speed: 500,
    maxentries: 20,
    dateReminder: 3, // minutes
    // More
    numWords: 50,
    ellipsestext: "<i class='fa la-ellipsis-h'></i>",
    moretext: "<i class='fa la-angle-double-right'></i>",
    lesstext: "<i class='fa la-angle-double-left'></i>",
    //
    ignoreTags: ["default", "unknown"],
    filterNewMessage: false
}

const BOOTSTRAP_COLORS = [
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
    "accent",
    "muted",
    "light",
    "dark",
    "default"
]

/**
 * Class that implement a list of messages (wire-elements) to display.
 *
 * @class      Wire (name)
 */
export class Wire extends Tile {

    constructor(elemid, message_type, options) {
        super(elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.install()
    }

    /**
     * installs the HTML code in the document
     */
    install() {
        let hook = document.querySelector("#" + this.elemid)
        let newel = document.createElement("ul")
        hook.appendChild(newel)
        this.listen(this.listener.bind(this))
    }

    /**
     * Wire message handler
     *
     * @param      {String}  msg     The message's type
     * @param      {Object}  data    The message
     * {
            source: 'aodb',
            type: 'flightboard',
            subject: move + " " + payload.flight + (payload.move == "departure" ? " to " : " from ") + payload.airport,
            body: msgtype + " " + payload.time,
            created_at: objcsv.timestamp,
            priority: 2,
            icon: "la-plane-" + payload.move,
            "icon-color": msgcolor
        }
     */
    listener(msg, data) {
        //console.log("Wire::listener", msg, data)
        // add wire
        let hook = document.querySelector("#" + this.elemid + " ul")
        let newel = document.createElement("li")
        newel.innerHTML = data.subject

        let first = document.querySelector("#" + this.elemid + " ul li:first-child")

        if (!first) { // we insert the first elem
            hook.appendChild(newel)
        } else {
            hook.insertBefore(newel, first)
        }

        let allwires = document.querySelectorAll("#" + this.elemid + " ul li")
        while (allwires.length > this.options.maxentries) {
            let last = document.querySelector("#" + this.elemid + " ul li:last-child")
            hook.removeChild(last)
            allwires = document.querySelector("#" + this.elemid + " ul li")
        }

        const formatter = showJson(data, newel)
        formatter.openAtDepth(0) // all closed. See https://github.com/mohsen1/json-formatter-js

    }

    /*  update/insert HTML code on event
     */
    update() {
        this.cb = BOOTSTRAP_COLORS[0]
    }

}