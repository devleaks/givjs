/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */
import "../assets/css/app.css" // load it first as its sets css variables (colors)
import "../assets/css/layout.css"

import { Dashboard } from "./Dashboard"

// Tiles
import { Omap } from "./Tiles/Omap"
import { Wire } from "./Tiles/Wire"
import { Flightboard } from "./Tiles/Flightboard"
//import { Transportboard } from "./Tiles/Transportboard"

// Information boards
import { Footer } from "./Tiles/Footer"
import { Solari } from "./Tiles/Solari"

import { MovementForecastChart } from "./Tiles/Charts/MovementForecastChart"
import { ParkingOccupancyChart } from "./Tiles/Charts/ParkingOccupancyChart"
import { TurnaroundGantt } from "./Tiles/Charts/TurnaroundGantt"

// Utilities
import { Transport } from "./States/Transport"
import { Rotation } from "./States/Rotation"
import { ParkingOccupancy } from "./States/ParkingOccupancy"

import { Stopped } from "./Pipelines/Stopped"

import { Dark } from "./Dark"
import { Clock } from "./Clock"
import { FeatureCollection } from "./FeatureCollection"

// Shared constant
import { WS_URL, HOME, PARKINGS, APRONS_MAXCOUNT } from "./Config"
import { DEPARTURE, ARRIVAL } from "./Constant"
import { STOPPED, JUST_STOPPED, JUST_STARTED, MOVED } from "./Constant"
import {
    CLOCK_MSG,
    SIMULATION_MSG,
    FOOTER_MSG,
    SOLARI_MSG,
    FLIGHTBOARD_MSG,
    FLIGHTBOARD_UPDATE_MSG,
    //       TRANSPORTBOARD_MSG, TRANSPORTBOARD_UPDATE_MSG,
    ROTATION_MSG,
    WIRE_MSG,
    MAP_MSG,
    PARKING_MSG,
    PARKING_UPDATE_MSG,
    DARK_MSG
} from "./Constant"


/**
 * This class describes an application.
 *
 * @class      App (name)
 */
export class App {

    /**
     * Viewer Application. Initiates a dashboard and registers Tile in it.
     *
     * @param      {<Object>}  options  The options
     */
    constructor(options) {
        this.options = options
        this.install()
        this.test()
    }

    /**
     * Creates the application.
     */
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

        // eslint-disable-next-line no-unused-vars
        let solariBoard = new Solari("solariboard", SOLARI_MSG, [
            "WELCOME TO OSCARS'",
            "GEO INTELLIGENT PLATFORM",
            "roy VIEWER gbp"
        ], { /*
            preset: 'alphanum',
            width: 100,
            height: 6,
            size: "XXS" */
        })

        let clock = new Clock("clock", [CLOCK_MSG, SIMULATION_MSG])
        this.dashboard.register("datetime", clock)

        this.omap = new Omap("map", [MAP_MSG, DARK_MSG], {
            center: [50.64, 5.445],
            zoom: 14,
            zoom_overview: 8
        })

        this.dashboard.register("map", this.omap)

        // Add layers of information on map
        let parkings = new FeatureCollection(PARKINGS)
        parkings.addProperties({ // tooltip APRON / PARKING
            "_templates": {
                "show_label": true,
                "tooltip": "{{feature.properties.apron}} / {{feature.properties.name}}"
            }
        })

        this.omap.addLayer("APRONS", "Airport")
        this.omap.add("APRONS", parkings)

        /* Parallels and meridian lines to match svg geoloc.
        this.omap.addLayer("Lines", "Airport")
        let lines = new FeatureCollection("src/data/lines.json")
        this.omap.add("Lines", lines)
        */


        this.dashboard.register("stopped", new Stopped(MAP_MSG, [parkings], {}))

        this.dashboard.register("wire", new Wire("wire", WIRE_MSG, {}))

        let flights = new Transport(HOME, FLIGHTBOARD_MSG)
        this.dashboard.register("flightboard", flights)

        //let transports = new Transport(HOME, TRANSPORTBOARD_MSG)
        //this.dashboard.register("transportboard", transports)

        // flightboard and related charts gets updated every 15 minutes in simulation.
        const board_update = 15
        const board_update_message = Clock.clock_message(board_update)
        this.dashboard.register("flightboard", new Flightboard("flightboard-arrival", [FLIGHTBOARD_UPDATE_MSG, board_update_message], ARRIVAL, flights, clock, { update_time: board_update }))
        this.dashboard.register("flightboard", new Flightboard("flightboard-departure", [FLIGHTBOARD_UPDATE_MSG, board_update_message], DEPARTURE, flights, clock, { update_time: board_update }))

        //this.dashboard.register("transportboard", new Transportboard("transportboard-arrival", [TRANSPORTBOARD_UPDATE_MSG,board_update_message], ARRIVAL, transports, clock, {update_time: board_update}))
        //this.dashboard.register("transportboard", new Transportboard("transportboard-departure", [TRANSPORTBOARD_UPDATE_MSG,board_update_message], DEPARTURE, transports, clock, {update_time: board_update}))

        this.dashboard.register("flightboard", new MovementForecastChart("forecast-arrival", [FLIGHTBOARD_UPDATE_MSG, board_update_message], ARRIVAL, flights, clock, { update_time: board_update }))
        this.dashboard.register("flightboard", new MovementForecastChart("forecast-departure", [FLIGHTBOARD_UPDATE_MSG, board_update_message], DEPARTURE, flights, clock, { update_time: board_update }))

        //this.dashboard.register("transportboard", new MovementForecastChart("forecast-transport-arrival", [TRANSPORTBOARD_UPDATE_MSG,board_update_message], ARRIVAL, transports, clock, {update_time: board_update}))
        //this.dashboard.register("transportboard", new MovementForecastChart("forecast-transport-departure", [TRANSPORTBOARD_UPDATE_MSG,board_update_message], DEPARTURE, transports, clock, {update_time: board_update}))

        let parkingOccupancy = new ParkingOccupancy(PARKING_MSG, parkings, { aprons_max: APRONS_MAXCOUNT, aprons_layer_name: "APRONS" })
        this.dashboard.register("parking", parkingOccupancy)
        this.dashboard.register("parking", new ParkingOccupancyChart("parking-occupancy", PARKING_UPDATE_MSG))


        let rotations = new Rotation([ROTATION_MSG, STOPPED, JUST_STOPPED, JUST_STARTED, MOVED], flights, parkings)

        this.dashboard.register([ROTATION_MSG, STOPPED, JUST_STOPPED, JUST_STARTED, MOVED], rotations)

        this.dashboard.register("stopped", new TurnaroundGantt("turnaround-gantts", "ROTATION_UPDATED", parkings, rotations))

        // eslint-disable-next-line no-unused-vars
        let dark = new Dark("dark-toggle") // just installs day/night toggle
        //this.dashboard.register("datetime", new Dark("dark-toggle"))

        footer.say("Geo Intelligent Viewer ready")
    }


    /**
     * Runs the application.
     */
    run() {
        console.log("App::run", "running...")
    }


    /**
     * Tests the application.
     */
    test() {

    }
}