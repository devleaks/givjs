/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Starts main viewer application.
 */
// import "../css/dashboard.css"

import { Dispatcher } from "./Dispatcher"

export class Dashboard {

    constructor(options) {
        this.options = options
        this.tiles = new Map()
        this.install()
    }

    install() {
        this.dispatcher = new Dispatcher(this.options.dispatcher)
    }


    register(name, tile) {
        this.tiles.set(name, tile)
    }


    changeTheme(theme) {
        this.theme = theme
    }


}