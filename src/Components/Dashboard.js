/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import { Dispatcher } from "./Dispatcher"


/**
 * This class collects a Dashboard's elements.
 *
 * @class      Dashboard (name)
 */
export class Dashboard {

    /**
     * Constructs a new Dashboard instance.
     *
     * @param      {<Object>}  options  Dashboard options
     */
    constructor(options) {
        this.options = options
        this.tiles = new Map()
        this.install()
    }


    /**
     * Installs the dashboard object.
     */
    install() {
        this.dispatcher = new Dispatcher(this.options.dispatcher)
    }


    /**
     * Register an element in the Dashboard.
     */
    register(name, tile) {
        if (Array.isArray(name)) {
            name.forEach((n) => this.tiles.set(n, tile))
        } else {
            this.tiles.set(name, tile)
        }
    }


    /**
     * Save ths Dashboard state to an object
     */
    passivate() {
        let tiles = []
        this.tiles.forEach((tile) => { tiles.push(tile.passivate()) })
        return {
            dashboard: this.options,
            tiles: tiles
        }
    }

}