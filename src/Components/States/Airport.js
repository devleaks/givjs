/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */

import { deepExtend } from "./Utilities/Utils"

/**
 *  DEFAULT VALUES
 */

/**
 * This class is a container for an Airport.
 *
 * @class      Airport (name)
 */
export class Airport {

    /**
     * Constructs a new Airport instance.
     */
    constructor(icao, name, options) {
        this.options = deepExtend(DEFAULTS, options)
        this.airport = {
            id: icao,
            name: name,
            devices: {
                aircrafts: {},
                gse: {
                    fuel: {},
                    catering: {},
                    sewage: {}
                }
            },
            aoi: {
                parkings: {},
                taxiways: {},
                runway_segments: {},
                runways: {}
            },
            sensors: {},
            forecast: {
                movements: {
                    arrivals: {},
                    departures: {}
                },
                weather: {}
            },
            _last_updated: null
        }
        this.install()
    }


    /**
     * Loads all airport characteristics necessary for the display
     */
    install() {

    }


    /**
     * Returns the property's value
     *
     * Example: get("airport.devices.aircrafts.34ea68") returns a Feature object
     */
    get(path) {
        let paths = path.split(".")

        const value = paths.reduce((object, path) => {
            return (object || {})[path]; // Oliver Steele's pattern
        }, this.airport)
        console.log(path, value)

        return value
    }



}