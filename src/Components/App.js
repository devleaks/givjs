/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * GIP Viewer Application. Initiates a dashboard and registers Tile in it.
 */
import "line-awesome/dist/font-awesome-line-awesome/css/all.css"
import "line-awesome/dist/line-awesome/css/line-awesome.css"

import "../assets/css/app.css"
import "../assets/css/layout.css"

import { Dashboard } from "./Dashboard"
//import L from "leaflet"

// Tiles
import { Omap } from "./Tiles/Omap"
import { Wire } from "./Tiles/Wire"
import { Flightboard } from "./Tiles/Flightboard"

import { Footer } from "./Tiles/Footer"

import { MovementForecastChart } from "./Tiles/Charts/MovementForecastChart"
import { ParkingOccupancyChart } from "./Tiles/Charts/ParkingOccupancyChart"
import { TurnaroundGantt } from "./Tiles/Charts/TurnaroundGantt"

// Utilities
import { Transport } from "./Transport"
import { Rotation } from "./Rotation"
import { ParkingOccupancy } from "./ParkingOccupancy"

import { Dark } from "./Dark"
import { Clock } from "./Clock"
import { FeatureCollection } from "./FeatureCollection"

// Shared constant
import { WS_URL, HOME, PARKINGS, APRONS_MAXCOUNT } from "./Config"
import { DEPARTURE, ARRIVAL } from "./Constant"
import { STOPPED, JUST_STOPPED, JUST_STARTED, MOVED } from "./Constant"
import { CLOCK_MSG, SIMULATION_MSG, FOOTER_MSG, FLIGHTBOARD_MSG, WIRE_MSG, MAP_MSG, PARKING_MSG, PARKING_UPDATE_MSG, DARK_MSG } from "./Constant"


/**
 * Main
 *
 * @class      App (name)
 */
export class App {

    constructor(options) {
        this.options = options
        this.install()
        this.test()
    }


    run() {
        console.log("App::run", "running...")
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

        let footer = new Footer(FOOTER_MSG, "Welcome") // just installs day/night toggle

        this.omap = new Omap("map", [MAP_MSG, DARK_MSG], {
            center: [50.64, 5.445],
            zoom: 14,
            zoom_overview: 8
        })

        this.dashboard.register("map", this.omap)

        // Add layers of information on map
        this.parkings = new FeatureCollection(PARKINGS)
        this.parkings.addProperties({ // tooltip APRON / PARKING
            "_templates": {
                "show_label": true,
                "tooltip": "{{feature.properties.apron}} / {{feature.properties.name}}"
            }
        })

        this.omap.addLayer("APRONS", "Airport")
        this.omap.add("APRONS", this.parkings)

        this.dashboard.register("wire", new Wire("wire", WIRE_MSG, {}))

        let transport = new Transport(HOME, FLIGHTBOARD_MSG)

        this.dashboard.register("flightboard", transport)

        // flightboard and related charts gets updated every 15 minutes in simulation.
        const flightboard_update = 15
        const flightboard_update_message = Clock.clock_message(flightboard_update)
        this.dashboard.register("flightboard", new Flightboard("flightboard-arrival", [FLIGHTBOARD_MSG,flightboard_update_message], ARRIVAL, transport, {update_time: flightboard_update}))
        this.dashboard.register("flightboard", new Flightboard("flightboard-departure", [FLIGHTBOARD_MSG,flightboard_update_message], DEPARTURE, transport, {update_time: flightboard_update}))

        this.dashboard.register("flightboard", new MovementForecastChart("forecast-arrival", [FLIGHTBOARD_MSG,flightboard_update_message], ARRIVAL, transport, {update_time: flightboard_update}))
        this.dashboard.register("flightboard", new MovementForecastChart("forecast-departure", [FLIGHTBOARD_MSG,flightboard_update_message], DEPARTURE, transport, {update_time: flightboard_update}))

        let parkingOccupancy = new ParkingOccupancy(PARKING_MSG, this.parkings, { aprons_max: APRONS_MAXCOUNT, aprons_layer_name: "APRONS" })
        this.dashboard.register("parking", parkingOccupancy)
        this.dashboard.register("parking", new ParkingOccupancyChart("parking-occupancy", PARKING_UPDATE_MSG))


        let rotations = new Rotation([STOPPED, JUST_STOPPED, JUST_STARTED, MOVED], this.parkings)

        this.dashboard.register([STOPPED, JUST_STOPPED, JUST_STARTED, MOVED], rotations)

        this.dashboard.register("stopped", new TurnaroundGantt("turnaround-gantts", [STOPPED, JUST_STOPPED, JUST_STARTED, MOVED], this.parkings, rotations))

        this.dashboard.register("datetime", new Clock("clock", [CLOCK_MSG, SIMULATION_MSG]))

        // eslint-disable-next-line no-unused-vars
        let dark = new Dark("dark-toggle") // just installs day/night toggle
        //this.dashboard.register("datetime", new Dark("dark-toggle"))

        footer.say("Geo Intelligent Viewer ready")

    }


    test() {

    }
}