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
import JSONFormatter from "json-formatter-js"

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

export class Wire extends Tile {

    constructor(elemid, message_type, options) {
        super(elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.install()
    }

    /*  installs the HTML code in the document
     */
    install() {
        // prepare wire element
        let hook = document.querySelector("#"+this.elemid)
        let newel = document.createElement("ul")
        hook.appendChild(newel)
        this.listen(this.listener.bind(this))
    }

    listener(msg, data) {
        //console.log("Wire::listener", msg, data)
        // add wire
        let hook = document.querySelector("#wire ul")
        let newel = document.createElement("li")
        newel.innerHTML = data.subject

        let first = document.querySelector("#wire ul li:first-child")

        if (!first) { // we insert the first elem
            hook.appendChild(newel)
        } else {
            hook.insertBefore(newel, first)
        }

        let allwires = document.querySelectorAll("#wire ul li")
        while (allwires.length > this.options.maxentries) {
            let last = document.querySelector("#wire ul li:last-child")
            hook.removeChild(last)
            allwires = document.querySelector("#wire ul li")
        }



        const formatter = new JSONFormatter(data);
        newel.appendChild(formatter.render());

    }

    /*  update/insert HTML code on event
     */
    update() {
        this.cb = BOOTSTRAP_COLORS[0]
    }

}