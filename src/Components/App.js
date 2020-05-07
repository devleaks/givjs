/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * GIP Viewer Application. Initiates a dashboard and registers Tile in it.
 */
import '../css/app.css'

import { Dashboard } from './Dashboard'

// Tiles
import { Omap } from './Omap'
import { Wire } from './Wire'


export class App {

    constructor(options) {
        this.options = options
        this.install()
    }


    run() {
        console.log('app is running...')
    }


    install() {

        this.dashboard = new Dashboard({
            dispatcher: {
                channels: {
                    websocket: {
                        websocket: 'ws://localhost:8051',
                        reconnect_retry: 300, // seconds
                        debug: false
                    }
                }
            }
        })

        this.dashboard.register("map", new Omap("map", "map", {
            center: [50.64, 5.445],
            zoom: 14,
            zoom_overview: 8
        }))

        this.dashboard.register("wire", new Wire("wire", "wire", {}))

    }


    changeTheme(theme) {
        console.log('theme changed', theme)
    }
}