/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import { Subscriber } from "../Subscriber"

import moment from "moment"
import PubSub from "pubsub-js"

import { FLIGHTBOARD_MSG, FLIGHTBOARD_UPDATE_MSG, TRANSPORTBOARD_MSG, TRANSPORTBOARD_UPDATE_MSG, ROTATION_MSG, SCHEDULED, PLANNED, ACTUAL, DEPARTURE, ARRIVAL } from "../Constant"

const UNSCHEDULED = "UNSCHEDULED"

/**
 * This class describes a transport.
 * 
 * Transport record:
 * 
 * "SN123-2020-05-10T12:34:56.789+02:00": {
        name: "SN123",
        from: "EBBR",       // either is === this.base
        to: "EBLG",
        scheduled: moment(), // "2020-05-10T12:34:56.789+02:00"
        planned: moment(),
        actual: moment()
    }
 *
 * @class      Transport (name)
 */
export class Transport extends Subscriber {

    /**
     * Creates a new Transport object
     *
     * @param      {<type>}  base     The base
     * @param      {<type>}  msgtype  The msgtype
     */
    constructor(base, msgtype) {
        super(msgtype)
        this.base = base
        this.transports = new Map()

        this.install()
    }


    /**
     * Installs the transport.
     */
    install() {
        this.listen(this.update.bind(this))
    }


    /**
     * Main listener entry. Dispatches according to msgtype
     *
     * @param      {<type>}  msgtype  The msgtype
     * @param      {<type>}  data     The data
     */
    update(msgtype, data) {
        switch (msgtype) {
            case FLIGHTBOARD_MSG:
                this.updateOnFlightboard(data)
                break
            case TRANSPORTBOARD_MSG:
                this.updateOnTransportboard(data)
                break
            default:
                console.warn("Transport::listen: no listener", msgtype)
                break
        }
    }


    /**
     * Creates a new transport identifier composed from the transport id and its scheduled date/time in ISO8601 format.
     *
     * @param      {<type>}  transport  The transport
     * @return     {<type>}  { description_of_the_return_value }
     */
    static mkTransportId(name, time) {
        return "T::" + name + "|" + time
    }


    /**
     * Get a transport record for a supplied transport
     *
     * @type       {<type>}
     */
    get(transport) {
        let tr = false
        if (transport.hasOwnProperty(SCHEDULED) && transport.scheduled !== false) {
            let id = Transport.mkTransportId(transport.name, transport.scheduled.toISOString(true))
            tr = this.transports.get(id)
        } else {
            let id = Transport.mkTransportId(transport.name, UNSCHEDULED)
            tr = this.transports.get(id)
        }
        return tr
    }


    /**
     * Finds a transport scheduled around that time (24h). Will NOT work if the same transport is scheduled DAILY with the same transport number.
     *
     * @param      {<type>}  name    The name
     * @param      {<type>}  time    The time
     */
    findTransportOnParking(move, parking, time, margin = 24) {
        let found = false
        this.transports.forEach((value) => {
            if (!found && value.move == move && value.parking == parking) {
                let tt = Transport.getTime(value)
                let duration = Math.floor(moment.duration(tt.diff(time)).asHours())
                if (Math.abs(duration) <= margin) {
                    found = value
                }
            }
        })
        return found
    }

    /**
     * Finds a transport scheduled around that time (24h). Will NOT work if the same transport is scheduled DAILY with the same transport number.
     *
     * @param      {<type>}  name    The name
     * @param      {<type>}  time    The time
     */
    findTransport(move, name, time, margin = 24) {
        let found = false
        this.transports.forEach((value) => {
            if (!found && value.name == name && value.move == move) {
                let tt = Transport.getTime(value)
                let duration = Math.floor(moment.duration(tt.diff(time)).asHours())
                if (Math.abs(duration) <= margin) {
                    found = value
                }
            }
        })
        console.assert(found, "Transport::findTransport", "not found", found, name, time)
        return found
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
     *   info: {"scheduled"|"planned"|"actual"},
     *   linked: 
     * }
     */
    updateOnFlightboard(data) {
        let time = moment(data.date + " " + data.time, data.info == SCHEDULED ? "YYYY-MM-DD HH:mm" : "DD/MM HH:mm")
        let f = false
        let id

        if (data.info == SCHEDULED) { // may be a new flight?
            let timekey = time.toISOString(true)
            id = Transport.mkTransportId(data.flight, timekey)
            f = this.transports.get(id)
            if (!f) { // new flight
                f = {
                    _key: timekey,
                    id: id,
                    name: data.flight,
                    parking: data.parking,
                    airport: data.airport,
                    isnew: true,
                    type: "flight",
                    to:   (data.move == DEPARTURE) ? data.airport : this.base,
                    from: (data.move == DEPARTURE) ? this.base : data.airport,
                    move: (data.move == DEPARTURE) ? DEPARTURE : ARRIVAL
                }
            }
        } else { // tries to find it...
            f = this.findTransport(data.move, data.flight, time)
            if (!f) { // we received PLANNED or ACTUAL but flight was not seen before. We create it with UNSCHEDULED keyword
                id = Transport.mkTransportId(data.name, UNSCHEDULED)
                f = {
                    _key: UNSCHEDULED,
                    id: id,
                    name: data.flight,
                    parking: data.parking,
                    airport: data.airport,
                    isnew: true,
                    type: "flight",
                    to:   (data.move == DEPARTURE) ? data.airport : this.base,
                    from: (data.move == DEPARTURE) ? this.base : data.airport,
                    move: (data.move == DEPARTURE) ? DEPARTURE : ARRIVAL
                }
                console.warn("Transport::updateOnFlightboard", "unscheduled", data, f)
            } else {
                id = f.id
            }
        }

        if (!f.hasOwnProperty("linked")) {
            let linked = (f.move == DEPARTURE) ? this.getPreviousTransport(f) : this.getNextTransport(f)
            if (linked) {
                f.linked = linked
                linked.linked = f // we  reverse-link the other transport
                this.transports.set(linked.id, linked)
                // console.log("Transport::updateOnFlightboard", "linked flights", data, f, linked)
            }
        }

        if ([SCHEDULED, PLANNED, ACTUAL].indexOf(data.info) > -1) {
            f[data.info] = time // data.info must be SCHEDULED, PLANNED, or ACTUAL
        }
        if (data.info == ACTUAL && data.move == ARRIVAL) {
            f.note = "landed"
        }
        if (data.info == ACTUAL) { // if move completed, schedule removal from flightboard
            f.removeAt = moment(time).add(data.move == ARRIVAL ? 30 : 10, "minutes")
        }
        this.transports.set(f.id, f)

        if (f.hasOwnProperty("_key") && data.move == ARRIVAL) { // transport was just just created
            const key = (" " + f._key).slice(1)
            delete f._key
            this.transports.set(f.id, f)
            PubSub.publish(ROTATION_MSG, {
                _key: key,
                arrival: f
            })
        }

        PubSub.publish(FLIGHTBOARD_UPDATE_MSG, data)

    }



    updateOnTransportboard(data) {
        let time = moment(data.date + " " + data.time, data.info == SCHEDULED ? "YYYY-MM-DD HH:mm" : "DD/MM HH:mm")
        let f = false
        let id

        if (data.info == SCHEDULED) { // may be a new transport?
            let timekey = time.toISOString(true)
            id = Transport.mkTransportId(data.name, timekey)
            f = this.transports.get(id)
            if (!f) { // new transport
                f = {
                    _key: timekey,
                    id: id,
                    name: data.name,
                    parking: data.parking,
                    destination: data.destination,
                    isnew: true,
                    type: "transport",
                    to:   (data.move == DEPARTURE) ? data.destination : this.base,
                    from: (data.move == DEPARTURE) ? this.base : data.destination,
                    move: (data.move == DEPARTURE) ? DEPARTURE : ARRIVAL
                }
            }
        } else { // tries to find it...
            f = this.findTransport(data.move, data.name, time)
            if (!f) { // we received PLANNED or ACTUAL but transport was not seen before. We create it with UNSCHEDULED keyword
                id = Transport.mkTransportId(data.name, UNSCHEDULED)
                f = {
                    _key: UNSCHEDULED,
                    id: id,
                    name: data.name,
                    parking: data.parking,
                    destination: data.destination,
                    isnew: true,
                    type: "transport",
                    to:   (data.move == DEPARTURE) ? data.destination : this.base,
                    from: (data.move == DEPARTURE) ? this.base : data.destination,
                    move: (data.move == DEPARTURE) ? DEPARTURE : ARRIVAL
                }
                console.warn("Transport::updateOnTransportboard", "unscheduled", data, f)
            } else {
                id = f.id
            }
        }

        if (!f.hasOwnProperty("linked")) {
            let linked = (f.move == DEPARTURE) ? this.getPreviousTransport(f) : this.getNextTransport(f)
            if (linked) {
                f.linked = linked
                linked.linked = f // we  reverse-link the other transport
                this.transports.set(linked.id, linked)
                // console.log("Transport::updateOnFlightboard", "linked transports", data, f, linked)
            }
        }

        if ([SCHEDULED, PLANNED, ACTUAL].indexOf(data.info) > -1) {
            f[data.info] = time // data.info must be SCHEDULED, PLANNED, or ACTUAL
        }
        if (data.info == ACTUAL && data.move == ARRIVAL) {
            f.note = "Arrived"
        }
        if (data.info == ACTUAL) { // if move completed, schedule removal from transportboard
            f.removeAt = moment(time).add(data.move == ARRIVAL ? 30 : 10, "minutes")
        }
        this.transports.set(f.id, f)

        if (f.hasOwnProperty("_key") && data.move == ARRIVAL) { // transport was just just created
            const key = (" " + f._key).slice(1)
            delete f._key
            this.transports.set(f.id, f)
            PubSub.publish(ROTATION_MSG, {
                _key: key,
                arrival: f
            })
        }

        PubSub.publish(TRANSPORTBOARD_UPDATE_MSG, data)
    }



    /**
     * Get next departure transport from same parking space if known
     *
     * @param      {<type>}  transport  The transport
     * @return     {Array}   The next transport.
     */
    getNextTransport(arrival) {
        let here = this.base
        let trarr = [ ...this.transports.values() ]
        let departing = trarr.filter((f) => ((f.parking == arrival.parking) && (f.from = here) && (f.scheduled.isAfter(arrival.scheduled))))
        departing = departing.sort((a, b) => a.scheduled.isBefore(b.scheduled))
        return departing[0]
    }


    /**
     * Get previous arrival transport from same parking space if known
     *
     * @param      {<type>}  transport  The transport
     * @return     {Array}   The next transport.
     */
    getPreviousTransport(departure) {
        let here = this.base
        let trarr = [ ...this.transports.values() ]
        let arriving = trarr.filter((f) => ((f.parking == departure.parking) && (f.to = here) && (f.scheduled.isBefore(departure.scheduled))))
        arriving = arriving.sort((a, b) => a.scheduled.isAfter(b.scheduled))
        return arriving[0]
    }


    /**
     * Filter Transport Map() and returns array of transport data
     *
     * @param      {<type>}  move      The move
     * @param      {<type>}  datefrom  The datefrom
     * @param      {<type>}  maxcount  The maxcount
     * @return     {<type>}  The scheduled transports.
     */
    getScheduledTransports(move, datefrom, maxcount) {
        //let local = (move == ARRIVAL) ? "to" : "from"
        //let here = this.base
        let transports = []
        // eslint-disable-next-line no-unused-vars
        this.transports.forEach((value, key, map) => {
        //    if (value[local] == here) {
            if (value.move == move) {
                if (value.hasOwnProperty(SCHEDULED)) {
                    if (datefrom && value[SCHEDULED].isSameOrBefore(datefrom)) {
                        transports.push(value)
                    } else if (!datefrom) {
                        transports.push(value)
//                    } else {
//                       console.log("Transport::getScheduledTransports", "too early", value, datefrom)
                    }
                } else {
                    console.warn("Transport::getScheduledTransports", "no schedule", value, datefrom)
                }
            }
        })
        transports = transports.sort((a, b) => a.scheduled.isBefore(b.scheduled))
        return transports.slice(0, maxcount)
    }


    /**
     * Gets the "most recent" time of the transport (actual, or planned, or scheduled)
     *
     * @param      {<type>}   transport  The transport
     * @return     {boolean}  The time.
     */
    static getTime(transport) {
        let t = false
        if (!t && transport.hasOwnProperty(ACTUAL)) {
            t = transport[ACTUAL]
        }
        if (!t && transport.hasOwnProperty(PLANNED)) {
            t = transport[PLANNED]
        }
        if (!t && transport.hasOwnProperty(SCHEDULED)) {
            t = transport[SCHEDULED]
        }
        console.assert(t, "Transport::getTime", "has no time", transport)
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