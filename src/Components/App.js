/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * GIP Viewer Application. Initiates a dashboard and registers Tile in it.
 */
import "../../node_modules/line-awesome/dist/font-awesome-line-awesome/css/all.css"
import "../../node_modules/line-awesome/dist/line-awesome/css/line-awesome.css"

import "../css/app.css"
import { Dashboard } from "./Dashboard"

// Tiles
import { Omap } from "./Omap"
import { Wire } from "./Wire"
import { Transport } from "./Transport"
import { Flightboard } from "./Flightboard"
import { MovementForecastChart } from "./Charts/MovementForecastChart"

import { FeatureCollection } from "./FeatureCollection"


export class App {

    constructor(options) {
        this.options = options
        this.install()
    }


    run() {
        console.log("app is running...")
    }


    install() {

        this.dashboard = new Dashboard({
            dispatcher: {
                channels: {
                    websocket: {
                        websocket: "ws://localhost:8051",
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

        let transport = new Transport("LGG", "flightboard")

        this.dashboard.register("flightboard", transport)

        this.dashboard.register("flightboard", new Flightboard("flightboard-arrival", "flightboard", "arrival", transport, {}))
        this.dashboard.register("flightboard", new Flightboard("flightboard-departure", "flightboard", "departure", transport, {}))

        this.dashboard.register("flightboard", new MovementForecastChart("forecast-arrival", "flightboard", "arrival", transport, {}))
        this.dashboard.register("flightboard", new MovementForecastChart("forecast-departure", "flightboard", "departure", transport, {}))

        this.parkings = new FeatureCollection("src/data/eblg-parking-boxes.geojson")
        this.taxiways = new FeatureCollection("src/data/eblg-taxiways.geojson")
        console.log(this.parkings.find("name","29D"))
    }


    changeTheme(theme) {
        console.log("theme changed", theme)
    }
}