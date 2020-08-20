/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import { Subscriber } from "../Subscriber"
import { deepExtend } from "../Utilities/Utils"

const TILE_CSS_CLASS = "tile"
const TEMPLATE_PREFIX = ""
const TEMPLATE_SUFFIX = "-elem"


const DEFAULT_ICON = "icons"
const DEFAULT_TITLE = "Dashboard"

const TEMPL_ICON_PLACEHOLDER = "la-icon"
const TEMPL_ELEMID_PLACEHOLDER = "here"

/**
 * A Tile is a HTML rendered "widget" that respond to messages sent to it.
 *
 * @class      Tile (name)
 */

const DEFAULTS = {
    elemid: "tileid",
    messages: "message_type",
    icon: "icons",
    title: "Tile"
}

export class Tile extends Subscriber {

    constructor(areaid, elemid, message_type, options) {
        super(message_type)

        this.areaid = areaid
        this.elemid = elemid

        this.options = deepExtend(DEFAULTS, options)
    }


    /**
     * Installs the object.
     */
    install() {
        let area = document.getElementById(this.areaid)
        if (area) {
            let tn = TEMPLATE_PREFIX + this.areaid + TEMPLATE_SUFFIX
            let template = document.querySelector("template#" + tn) // should be "area-name template#templ-id"
            if (template) {
                var clone = template.content.cloneNode(true)
                let el = clone.querySelector("." + TEMPL_ELEMID_PLACEHOLDER)
                if (el) {
                    el.setAttribute("id", this.elemid)
                    el.classList.remove(TEMPL_ELEMID_PLACEHOLDER)

                    let icon = this.icon
                    if (icon) {
                        let els = clone.querySelectorAll("." + TEMPL_ICON_PLACEHOLDER)
                        els.forEach((e) => {
                            e.classList.remove(TEMPL_ICON_PLACEHOLDER)
                            e.classList.add("la-" + icon)
                            e.setAttribute("title", this.options.title)
                        })
                    }

                    area.appendChild(clone)
                    // console.log("Tile::install: added with template", tn, this.areaid, this.elemid)
                }
            } else {
                let el = document.createElement("div")
                el.setAttribute("id", this.elemid)
                el.classList.add(TILE_CSS_CLASS)
                area.appendChild(el)
                // console.log("Tile::install: added", this.areaid, this.elemid)
            }
        } else {
            console.warn("Tile::install", "element not found", this.areaid)
        }
    }


    /**
     * Sample listener function
     *
     * @param      {String}  msgtype  The message type
     * @param      {Object}  msg      The message, a JavaScript string or object.
     */
    listener(msgtype, payload) {
        if (Array.isArray(this.message_type)) {
            switch (msgtype) {
                case "MSG":
                    this.updateOnMsg(payload)
                    break
                default:
                    console.warn("Tile::listener: No handler found for message type", msgtype)
                    break
            }
        } else {
            this.update(payload)
        }
    }


    update(data) {
        console.log("Tile::update", data)
    }

    updateOnMsg(data) {
        console.log("Tile::updateOnMsg", data)
    }


    /**
     * Save Tile state to localStorage
     */
    passivate() {
        console.log("Tile::passivate")
    }


    /**
     * Some tile info for display and rendering
     */
    get icon() {
        return this.options.hasOwnProperty("icon") ? this.options.icon : DEFAULT_ICON
    }

    get title() {
        return this.options.hasOwnProperty("title") ? this.options.title : DEFAULT_TITLE
    }

}