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
import { TurnaroundGantt } from "./Charts/TurnaroundGantt"
import { Clock } from "./Charts/Clock"
import { FeatureCollection } from "./FeatureCollection"

import { WS_URL, HOME, PARKINGS, APRONS_MAXCOUNT } from "./Config"
import { STOPPED, JUST_STOPPED, JUST_STARTED, MOVED } from "./Constant"
import { FLIGHTBOARD_MSG, WIRE_MSG, MAP_MSG, PARKING_MSG } from "./Constant"


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
                        websocket: WS_URL
                    }
                }
            }
        })

        this.omap = new Omap("map", MAP_MSG, {
            center: [50.64, 5.445],
            zoom: 14,
            zoom_overview: 8
        })

        this.dashboard.register("map", this.omap)

        // Add layers of information on map
        //this.taxiways = new FeatureCollection("src/data/eblg-taxiways.geojson")
        this.parkings = new FeatureCollection(PARKINGS)

        this.parkings.addProperties({ // tooltip APRON / PARKING
            "_templates": {
                "show_label": true,
                "tooltip": "{{feature.properties.apron}} / {{feature.properties.name}}"
            }
        })

        this.omap.addLayer("APRONS", "Airport")
        this.omap.add("APRONS", this.parkings)

        //this.omap.addLayer("SERVICES", "Airport") // now created antomagically
        //this.omap.addLayer("AIRCRAFTS", "Aircrafts")

        this.dashboard.register("wire", new Wire("wire", WIRE_MSG, {}))

        let transport = new Transport(HOME, FLIGHTBOARD_MSG)

        this.dashboard.register("flightboard", transport)

        this.dashboard.register("flightboard", new Flightboard("flightboard-arrival", FLIGHTBOARD_MSG, "arrival", transport, {}))
        this.dashboard.register("flightboard", new Flightboard("flightboard-departure", FLIGHTBOARD_MSG, "departure", transport, {}))

        this.dashboard.register("flightboard", new MovementForecastChart("forecast-arrival", FLIGHTBOARD_MSG, "arrival", transport, {}))
        this.dashboard.register("flightboard", new MovementForecastChart("forecast-departure", FLIGHTBOARD_MSG, "departure", transport, {}))
        //                                                                                                                            1   2   3   4   5   6
        this.dashboard.register("parking", new ParkingOccupancy("parking", this.parkings, this.omap, { aprons_max: APRONS_MAXCOUNT }))
        this.dashboard.register("parking", new ParkingOccupancyChart("parking-occupancy", PARKING_MSG, this.parkings, { aprons_max: APRONS_MAXCOUNT }))

        this.dashboard.register("stopped", new TurnaroundGantt("turnaround-gantts", [STOPPED, JUST_STOPPED, JUST_STARTED, MOVED], this.parkings))

        this.dashboard.register("datetime", new Clock("clock",["datetime","siminfo"]))

    }


    test() {
    }


    changeTheme(theme) {
        console.log("theme changed", theme)
    }
}