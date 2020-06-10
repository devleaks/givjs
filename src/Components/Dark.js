/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import PubSub from "pubsub-js"
import { DARK_MSG, DARK, LIGHT, LOCALSTORAGE_DARK } from "./Constant"

import "../assets/css/dark.css"

/**
 * This class deals with light/dark or day/night switch.
 *  Stolen from https://codepen.io/himalayasingh/pen/PdqbqV
 *
 * @class      Dark (name)
 */
export class Dark {

    /**
     * Constructs a new Dark instance.
     *
     * @param      {<String>}  elemid  HTML element identifier where to hang the dark theme switch (styled HTML input tag of type checkbox).
     */
    constructor(elemid) {
        this.elemid = elemid

        this.dark = localStorage.getItem(LOCALSTORAGE_DARK)
        if (this.dark != LIGHT && this.dark != DARK) {
            this.dark = LIGHT // can't localstore true or false
            localStorage.setItem(LOCALSTORAGE_DARK, this.dark)
        }
        this.install()
        PubSub.publish(DARK_MSG, this.dark)
    }


    /**
     * Installs the Dark object.
     */
    install() { // "<div class='toggle-btn' id='light-dark-toggle-btn'><input id='ilight-dark-toggle-btn' type='checkbox'><span></span></div>"
        const BUTTON_ID = "ilight-dark-toggle-btn"
        let button = document.createElement("div")
        button.setAttribute("id", "light-dark-toggle-btn")
        button.classList.add("toggle-btn")
        let input = document.createElement("input")
        input.setAttribute("id", BUTTON_ID)
        input.setAttribute("type", "checkbox")
        input.checked = (this.dark == DARK) // checked, true if DARK

        let span = document.createElement("span")

        const that = this
        input.addEventListener("change", function() {
            that.dark = (that.dark == DARK ? LIGHT : DARK)
            localStorage.setItem(LOCALSTORAGE_DARK, that.dark)
            // sets a global set of variables to console styles
            document.documentElement.setAttribute("data-theme", that.dark)
            document.documentElement.className = that.theme;
            PubSub.publish(DARK_MSG, that.dark)
        })

        button.appendChild(input)
        button.appendChild(span)
        let el = document.getElementById(this.elemid)
        el.appendChild(button)

        // set it for now
        document.documentElement.setAttribute("data-theme", this.dark)
        document.documentElement.className = this.theme;
    }


    /**
     * Returns the current Dark value
     *
     * @return       {<String>}     Returns dark or light.
     */
    get() {
        return this.dark
    }


    /**
     * Returns Dark's theme name
     *
     * @type       {string}
     */
    get theme() {
        return "theme-" + this.dark
    }

}