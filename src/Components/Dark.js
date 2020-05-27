/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */

import PubSub from "pubsub-js"
import { DARK_MSG } from "./Constant"

import "../css/dark.css"

/**
 *  DEFAULT VALUES
 */

export class Dark {

    constructor(elemid) {
        this.elemid = elemid

        this.dark = localStorage.getItem("theme")
        if (this.dark === null) {
            this.dark = false
            localStorage.setItem("theme", this.dark)
        }
        this.install()
    }

    /*  installs the HTML code in the document
     */
    install() { // "<div class='toggle-btn' id='light-dark-toggle-btn'><input id='ilight-dark-toggle-btn' type='checkbox'><span></span></div>"
        const BUTTON_ID = "ilight-dark-toggle-btn"
        let button = document.createElement("div")
        button.setAttribute("id", "light-dark-toggle-btn")
        button.classList.add("toggle-btn")
        let input = document.createElement("input")
        input.setAttribute("id", BUTTON_ID)
        input.setAttribute("type", "checkbox")
        input.checked = this.dark

        let span = document.createElement("span")

        const that = this
        input.addEventListener("change", function() {
            that.dark = !that.dark
            localStorage.setItem("theme", that.dark)
            PubSub.publish(DARK_MSG, that.dark)
        })

        button.appendChild(input)
        button.appendChild(span)
        let el = document.getElementById(this.elemid)
        el.appendChild(button)
    }


    get() {
        return this.dark
    }

}