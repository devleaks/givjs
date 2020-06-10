/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import { Subscriber } from "./Subscriber"

import moment from "moment"
import PubSub from "pubsub-js"

import { FLIGHTBOARD_MSG, CLOCK_MSG, SCHEDULED, PLANNED, ACTUAL, DEPARTURE, ARRIVAL } from "./Constant"


export function mkTransfortId(transport) {
    return transport.name + "-" + transport.scheduled.toISOString()
}


/** Transport record:
"SN123-2020-05-10T12:34:56.789+02:00": {
    name: "SN123",
    from: "EBBR",       // either is === this.base
    to: "EBLG",
    scheduled: moment(),
    planned: moment(),
    actual: moment()
}
*/
export class Transport extends Subscriber {

    constructor(base, msgtype) {
        super(msgtype)
        this.base = base
        this.transports = new Map()

        this.install()
    }


    install() {
        let that = this
        this.listen((msgtype, data) => {
            switch (msgtype) {
                case FLIGHTBOARD_MSG:
                    that.updateOnFlightboard(data)
                    break
                default:
                    console.warn("Transport::listen: no listener", msgtype)
                    break
            }
        })
    }


    /**
     * Update for flights
     *
     * @param      {Object}  data    The data.
     * {
     *   flight: "SN123",
     *   parking: "A51",
     *   airport: "BRU",
     *   move: {"departure"|"arrival"},
     *   date: "2020-05-29",
     *   time: "17:35",
     *   info: {"scheduled"|"planned"|"actual"}
     * }
     */
    updateOnFlightboard(data) {
        let f = this.transports.get(data.flight)
        let time = moment(data.date + " " + data.time, data.info == SCHEDULED ? "YYYY-MM-DD HH:mm" : "DD/MM HH:mm")
        let id = data.flight + "-" + time.toISOString(true)
        if (!f) {
            f = {
                id: id,
                name: data.flight,
                parking: data.parking,
                airport: data.airport,
                isnew: true,
                type: "flight"
            }
        }
        if (data.move == DEPARTURE) {
            f["to"] = data.airport
            f["from"] = this.base
        } else {
            f["from"] = data.airport
            f["to"] = this.base
        }
        f["move"] = data.move

        if ([SCHEDULED, PLANNED, ACTUAL].indexOf(data.info) > -1) {
            f[data.info] = time // data.info must be SCHEDULED, PLANNED, or ACTUAL
        }
        if (data.info == ACTUAL && data.move == ARRIVAL) {
            f.note = "landed"
        }
        if (data.info == ACTUAL) { // if move completed, schedule removal from flightboard
            f.removeAt = moment(time).add(data.move == ARRIVAL ? 30 : 10, "minutes")
        }
        this.transports.set(data.flight, f)
    }


    /*
     */
    isDeparture(transport) {
        return transport.from == this.base
    }


    /*
     */
    isArrival(transport) {
        return transport.to == this.base
    }


    /*  transport = "SN123" or { name: "SN123" ... }
     */
    get(transport) {
        return this.transports.get(transport)
    }


    /*  get next departure transport from same parking space if known
     */
    getNextTransport(transport) {
        let arrival = this.transports.get(transport)
        let departing = []
        if (arrival) {
            let here = this.base
            departing = this.transports.filter((f) => ((f.parking == arrival.parking) && (f.from = here) && (f.scheduled.isBefore(arrival.scheduled))))
            console.log("Transport::getNextTransport", transport, departing)
            departing = departing.sort((a, b) => a.scheduled.isBefore(b.scheduled))
        }
        return departing[0]
    }


    // filter Map() and returns array of flight data
    getScheduledTransports(move, datefrom, maxcount) {
        let local = (move == ARRIVAL) ? "to" : "from"
        let here = this.base
        let transports = []
        // eslint-disable-next-line no-unused-vars
        this.transports.forEach((value, key, map) => {
            if (value[local] == here) {
                if (datefrom && value.scheduled.isBefore(datefrom)) {
                    transports.push(value)
                } else if (!datefrom) {
                    transports.push(value)
                }
            }
        })
        transports = transports.sort((a, b) => a.scheduled.isBefore(b.scheduled))
        return transports.slice(0, maxcount)
    }


    static getTime(flight) { // returns the most recent known time for flight
        let t = false
        if(!t && flight.hasOwnProperty(ACTUAL)) {
            t = flight[ACTUAL]
        }
        if(!t && flight.hasOwnProperty(PLANNED)) {
            t = flight[PLANNED]
        }
        if(!t && flight.hasOwnProperty(SCHEDULED)) {
            t = flight[SCHEDULED]
        }
        return t
    }


    /**
     * Save class instance essentials for restoration
     */
    passivate() {
        let content = {
            base: this.base,
            transports: this.transports
        }
        localStorage.setItem("transports", JSON.stringify(content))
    }

}