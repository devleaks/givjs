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
//import L from "leaflet"

// Tiles
import { Omap } from "./Omap"
import { Wire } from "./Wire"
import { Transport } from "./Transport"
import { Flightboard } from "./Flightboard"
import { MovementForecastChart } from "./Charts/MovementForecastChart"
import { ParkingOccupancyChart } from "./Charts/ParkingOccupancyChart"
import { ParkingOccupancy } from "./ParkingOccupancy"

import { FeatureCollection } from "./FeatureCollection"

import { APRONS_MAXCOUNT } from "./Constant"
import { HOME, PARKINGS } from "./Config"


export class App {

    constructor(options) {
        this.options = options
        this.install()
        this.test()
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

        this.omap = new Omap("map", "map", {
            center: [50.64, 5.445],
            zoom: 14,
            zoom_overview: 8
        })

        this.dashboard.register("map", this.omap)

        // Add layers of information on map
        //this.taxiways = new FeatureCollection("src/data/eblg-taxiways.geojson")
        this.parkings = new FeatureCollection(PARKINGS)
        this.omap.addLayer("APRONS", "Airport")
        this.omap.add("APRONS", this.parkings)

        this.omap.addLayer("SERVICES", "Airport")
        this.omap.addLayer("AIRCRAFTS", "Aircrafts")

        this.dashboard.register("wire", new Wire("wire", "wire", {}))

        let transport = new Transport(HOME, "flightboard")

        this.dashboard.register("flightboard", transport)

        this.dashboard.register("flightboard", new Flightboard("flightboard-arrival", "flightboard", "arrival", transport, {}))
        this.dashboard.register("flightboard", new Flightboard("flightboard-departure", "flightboard", "departure", transport, {}))

        this.dashboard.register("flightboard", new MovementForecastChart("forecast-arrival", "flightboard", "arrival", transport, {}))
        this.dashboard.register("flightboard", new MovementForecastChart("forecast-departure", "flightboard", "departure", transport, {}))
        //                                                                                                                            1   2   3   4   5   6
        this.dashboard.register("parking", new ParkingOccupancy("parking", this.parkings, this.omap, { aprons_max: APRONS_MAXCOUNT }))
        this.dashboard.register("parking", new ParkingOccupancyChart("parking-occupancy", "parking", this.parkings, { aprons_max: APRONS_MAXCOUNT }))
    }


    test() {
        ;
    }


    changeTheme(theme) {
        console.log("theme changed", theme)
    }
}