/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import { Subscriber } from "../Subscriber"

import moment from "moment"
import PubSub from "pubsub-js"

import { FLIGHTBOARD_MSG, FLIGHTBOARD_UPDATE_MSG, MOVEMENTBOARD_MSG, MOVEMENTBOARD_UPDATE_MSG, ROTATION_MSG, SCHEDULED, PLANNED, ACTUAL, DEPARTURE, ARRIVAL } from "../Constant"

const UNSCHEDULED = "UNSCHEDULED"

/**
 * This class describes a movement.
 * 
 * Movement record:
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
 * @class      Movement (name)
 */
export class Movement extends Subscriber {

    /**
     * Creates a new Movement object
     *
     * @param      {<type>}  base     The base
     * @param      {<type>}  msgtype  The msgtype
     */
    constructor(base, msgtype) {
        super(msgtype)
        this.base = base
        this.movements = new Map()

        this.install()
    }


    /**
     * Installs the movement.
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
            case MOVEMENTBOARD_MSG:
                this.updateOnMovementboard(data)
                break
            default:
                console.warn("Movement::listen: no listener", msgtype)
                break
        }
    }


    /**
     * Creates a new movement identifier composed from the movement id and its scheduled date/time in ISO8601 format.
     *
     * @param      {<type>}  movement  The movement
     * @return     {<type>}  { description_of_the_return_value }
     */
    static mkMovementId(name, time) {
        return "T::" + name + "|" + time
    }


    /**
     * Get a movement record for a supplied movement
     *
     * @type       {<type>}
     */
    get(movement) {
        let tr = false
        if (movement.hasOwnProperty(SCHEDULED) && movement.scheduled !== false) {
            let id = Movement.mkMovementId(movement.name, movement.scheduled.toISOString(true))
            tr = this.movements.get(id)
        } else {
            let id = Movement.mkMovementId(movement.name, UNSCHEDULED)
            tr = this.movements.get(id)
        }
        return tr
    }


    /**
     * Finds a movement scheduled around that time (24h). Will NOT work if the same movement is scheduled DAILY with the same movement number.
     *
     * @param      {<type>}  name    The name
     * @param      {<type>}  time    The time
     */
    findMovementOnParking(move, parking, time, margin = 24) {
        let found = false
        this.movements.forEach((value) => {
            if (!found && value.move == move && value.parking == parking) {
                let tt = Movement.getTime(value)
                let duration = Math.floor(moment.duration(tt.diff(time)).asHours())
                if (Math.abs(duration) <= margin) {
                    found = value
                }
            }
        })
        return found
    }

    /**
     * Finds a movement scheduled around that time (24h). Will NOT work if the same movement is scheduled DAILY with the same movement number.
     *
     * @param      {<type>}  name    The name
     * @param      {<type>}  time    The time
     */
    findMovement(move, name, time, margin = 24) {
        let found = false
        this.movements.forEach((value) => {
            if (!found && value.name == name && value.move == move) {
                let tt = Movement.getTime(value)
                let duration = Math.floor(moment.duration(tt.diff(time)).asHours())
                if (Math.abs(duration) <= margin) {
                    found = value
                }
            }
        })
        console.assert(found, "Movement::findMovement", "not found", found, name, time)
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
            id = Movement.mkMovementId(data.flight, timekey)
            f = this.movements.get(id)
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
            f = this.findMovement(data.move, data.flight, time)
            if (!f) { // we received PLANNED or ACTUAL but flight was not seen before. We create it with UNSCHEDULED keyword
                id = Movement.mkMovementId(data.name, UNSCHEDULED)
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
                console.warn("Movement::updateOnFlightboard", "unscheduled", data, f)
            } else {
                id = f.id
            }
        }

        if (!f.hasOwnProperty("linked")) {
            let linked = (f.move == DEPARTURE) ? this.getPreviousMovement(f) : this.getNextMovement(f)
            if (linked) {
                f.linked = linked
                linked.linked = f // we  reverse-link the other movement
                this.movements.set(linked.id, linked)
                // console.log("Movement::updateOnFlightboard", "linked flights", data, f, linked)
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
        this.movements.set(f.id, f)

        if (f.hasOwnProperty("_key") && data.move == ARRIVAL) { // movement was just just created
            const key = (" " + f._key).slice(1)
            delete f._key
            this.movements.set(f.id, f)
            PubSub.publish(ROTATION_MSG, {
                _key: key,
                arrival: f
            })
        }

        PubSub.publish(FLIGHTBOARD_UPDATE_MSG, data)

    }



    updateOnMovementboard(data) {
        let time = moment(data.date + " " + data.time, data.info == SCHEDULED ? "YYYY-MM-DD HH:mm" : "DD/MM HH:mm")
        let f = false
        let id

        if (data.info == SCHEDULED) { // may be a new movement?
            let timekey = time.toISOString(true)
            id = Movement.mkMovementId(data.name, timekey)
            f = this.movements.get(id)
            if (!f) { // new movement
                f = {
                    _key: timekey,
                    id: id,
                    name: data.name,
                    parking: data.parking,
                    destination: data.destination,
                    isnew: true,
                    type: "movement",
                    to:   (data.move == DEPARTURE) ? data.destination : this.base,
                    from: (data.move == DEPARTURE) ? this.base : data.destination,
                    move: (data.move == DEPARTURE) ? DEPARTURE : ARRIVAL
                }
            }
        } else { // tries to find it...
            f = this.findMovement(data.move, data.name, time)
            if (!f) { // we received PLANNED or ACTUAL but movement was not seen before. We create it with UNSCHEDULED keyword
                id = Movement.mkMovementId(data.name, UNSCHEDULED)
                f = {
                    _key: UNSCHEDULED,
                    id: id,
                    name: data.name,
                    parking: data.parking,
                    destination: data.destination,
                    isnew: true,
                    type: "movement",
                    to:   (data.move == DEPARTURE) ? data.destination : this.base,
                    from: (data.move == DEPARTURE) ? this.base : data.destination,
                    move: (data.move == DEPARTURE) ? DEPARTURE : ARRIVAL
                }
                console.warn("Movement::updateOnMovementboard", "unscheduled", data, f)
            } else {
                id = f.id
            }
        }

        if (!f.hasOwnProperty("linked")) {
            let linked = (f.move == DEPARTURE) ? this.getPreviousMovement(f) : this.getNextMovement(f)
            if (linked) {
                f.linked = linked
                linked.linked = f // we  reverse-link the other movement
                this.movements.set(linked.id, linked)
                // console.log("Movement::updateOnFlightboard", "linked movements", data, f, linked)
            }
        }

        if ([SCHEDULED, PLANNED, ACTUAL].indexOf(data.info) > -1) {
            f[data.info] = time // data.info must be SCHEDULED, PLANNED, or ACTUAL
        }
        if (data.info == ACTUAL && data.move == ARRIVAL) {
            f.note = "Arrived"
        }
        if (data.info == ACTUAL) { // if move completed, schedule removal from movementboard
            f.removeAt = moment(time).add(data.move == ARRIVAL ? 30 : 10, "minutes")
        }
        this.movements.set(f.id, f)

        if (f.hasOwnProperty("_key") && data.move == ARRIVAL) { // movement was just just created
            const key = (" " + f._key).slice(1)
            delete f._key
            this.movements.set(f.id, f)
            PubSub.publish(ROTATION_MSG, {
                _key: key,
                arrival: f
            })
        }

        PubSub.publish(MOVEMENTBOARD_UPDATE_MSG, data)
    }



    /**
     * Get next departure movement from same parking space if known
     *
     * @param      {<type>}  movement  The movement
     * @return     {Array}   The next movement.
     */
    getNextMovement(arrival) {
        let here = this.base
        let trarr = [ ...this.movements.values() ]
        let departing = trarr.filter((f) => ((f.parking == arrival.parking) && (f.from = here) && (f.scheduled.isAfter(arrival.scheduled))))
        departing = departing.sort((a, b) => a.scheduled.isBefore(b.scheduled))
        return departing[0]
    }


    /**
     * Get previous arrival movement from same parking space if known
     *
     * @param      {<type>}  movement  The movement
     * @return     {Array}   The next movement.
     */
    getPreviousMovement(departure) {
        let here = this.base
        let trarr = [ ...this.movements.values() ]
        let arriving = trarr.filter((f) => ((f.parking == departure.parking) && (f.to = here) && (f.scheduled.isBefore(departure.scheduled))))
        arriving = arriving.sort((a, b) => a.scheduled.isAfter(b.scheduled))
        return arriving[0]
    }


    /**
     * Filter Movement Map() and returns array of movement data
     *
     * @param      {<type>}  move      The move
     * @param      {<type>}  datefrom  The datefrom
     * @param      {<type>}  maxcount  The maxcount
     * @return     {<type>}  The scheduled movements.
     */
    getScheduledMovements(move, datefrom, maxcount) {
        //let local = (move == ARRIVAL) ? "to" : "from"
        //let here = this.base
        let movements = []
        // eslint-disable-next-line no-unused-vars
        this.movements.forEach((value, key, map) => {
        //    if (value[local] == here) {
            if (value.move == move) {
                if (value.hasOwnProperty(SCHEDULED)) {
                    if (datefrom && value[SCHEDULED].isSameOrBefore(datefrom)) {
                        movements.push(value)
                    } else if (!datefrom) {
                        movements.push(value)
//                    } else {
//                       console.log("Movement::getScheduledMovements", "too early", value, datefrom)
                    }
                } else {
                    console.warn("Movement::getScheduledMovements", "no schedule", value, datefrom)
                }
            }
        })
        movements = movements.sort((a, b) => a.scheduled.isBefore(b.scheduled))
        return movements.slice(0, maxcount)
    }


    /**
     * Gets the "most recent" time of the movement (actual, or planned, or scheduled)
     *
     * @param      {<type>}   movement  The movement
     * @return     {boolean}  The time.
     */
    static getTime(movement) {
        let t = false
        if (!t && movement.hasOwnProperty(ACTUAL)) {
            t = movement[ACTUAL]
        }
        if (!t && movement.hasOwnProperty(PLANNED)) {
            t = movement[PLANNED]
        }
        if (!t && movement.hasOwnProperty(SCHEDULED)) {
            t = movement[SCHEDULED]
        }
        console.assert(t, "Movement::getTime", "has no time", movement)
        return t
    }


    /**
     * Save class instance essentials for restoration
     */
    passivate() {
        let content = {
            base: this.base,
            movements: this.movements
        }
        localStorage.setItem("movements", JSON.stringify(content))
    }

}