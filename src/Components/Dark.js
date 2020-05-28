/*
 *  Stolen from https://codepen.io/himalayasingh/pen/PdqbqV
 */

import PubSub from "pubsub-js"
import { DARK_MSG, DARK, LIGHT, LOCALSTORAGE_DARK } from "./Constant"

import "../css/dark.css"


/**
 *  DEFAULT VALUES
 */

export class Dark {

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
        input.checked = (this.dark == DARK) // checked, true if DARK

        let span = document.createElement("span")

        const that = this
        input.addEventListener("change", function() {
            that.dark = (that.dark == DARK ? LIGHT : DARK)
            localStorage.setItem(LOCALSTORAGE_DARK, that.dark)
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