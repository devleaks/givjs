/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import PubSub from "pubsub-js"
import moment from "moment"

import { Subscriber } from "./Subscriber"

import { ROTATION_MSG, PARKING_MSG, STOPPED, JUST_STOPPED, JUST_STARTED, MOVED, DEPARTURE, ARRIVAL } from "./Constant"

const UNSCHEDULED = "UNSCHEDULED"

/** Rotation record:

"A51-2020-05-10T12:34:56.789+02:00": {
    parking: "A51",
    from: {
        ...
        scheduled: moment(), // "2020-05-10T12:34:56.789+02:00"
        ...
    },
    to: {},
    services: { // map?
        type: [{
                name: "type:01",
                firstseen: moment(),
                lastseend: moment()
            },
            {
            ...
            }
        ]
    },
    //scheduled (optional, for later, for planning services)
    {
        type: [{
                name: "type:01",
                qty:
            },
            {
            ...
            }
        ]
    },
    //started
    start_scheduled: moment(),
    start_planned: moment(),
    start_actual: moment()
    //finished
    finish_scheduled: moment(),
    finish_planned: moment(),
    finish_actual: moment()
}
 */
export class Rotation extends Subscriber {

    /**
     * Constructs a new rotation instance.
     *
     * @param      {<type>}  msgtype     Message types handled by this Subscriber
     * @param      {<type>}  transports  The transport containing all transports
     * @param      {<type>}  parkings    The parkings containing rotation rendez-vous point
     */
    constructor(msgtype, transports, parkings) {
        super(msgtype)
        this.transports = transports
        this.parkings = parkings
        this.rotations = new Map()
        this.install()
    }

    /**
     * Installs the Rotation
     */
    install() {
        this.listen(this.update.bind(this))
    }


    /**
     * Rotation listener. Dispatches to approprriate function.
     *
     * @param      {<type>}  msgtype  The msgtype
     * @param      {<type>}  stopped  The stopped
     * 
     * {
     *  feature: Device
     *  areas: Array of Feature<Polygon>
     * }
     */
    update(msgtype, data) {
        //console.log("Rotation::listen", msgtype, feature)
        switch (msgtype) {
            case ROTATION_MSG:
                this.create(data)
                break
            case JUST_STOPPED:
            case STOPPED:
                this.updateOnStopped(data)
                break
            case JUST_STARTED:
            case MOVED:
            case PARKING_MSG:
                break
            default:
                console.warn("Rotation::no listener", msgtype)
                break
        }
    }


    /**
     * Geneates unique rotation identifier, with parking, and time of arrival of scheduled transport
     *
     * @param      {<type>}  rotation  The rotation
     * @return     {string}  { description_of_the_return_value }
     */
    static mkRotationId(name, time) {
        return "R::" + name + "|" + time
    }


    /**
     * Finds a transport scheduled around that time (24h). Will NOT work if the same transport is scheduled DAILY with the same transport number.
     *
     * @param      {<type>}  name    The name
     * @param      {<type>}  time    The time
     */
    findRotation(parking, time, margin = 6) {
        let found = false
        this.rotations.forEach((value, key, map) => {
            if (!found && value.parking == parking) { // temporarily only check on parking
                found = value
                /*
                let duration = Math.floor(moment.duration(value[SCHEDULED].diff(time)).asHours())
                if (Math.abs(duration) <= margin) {
                    found = value
                }
                */
            }

        })
        //console.warn("Rotation::findRotation", "not found", parking, time)
        return found
    }

    /**
     * Create a new rotation
     *
     * @param      {<Object>}  rotation  The rotation
     */
    create(rotation) {
        const id = Rotation.mkRotationId(rotation.arrival.parking, rotation._key)
        let r = {
            _key: rotation._key,
            id: id,
            parking: rotation.arrival.parking,
            arrival: rotation.arrival,
            services: new Map()
        }
        if (rotation.arrival.hasOwnProperty("linked")) {
            r.departure = rotation.arrival.linked
        }
        this.rotations.set(id, r)
        console.log("Rotation::create", "created", r)
    }


    /**
     * Update a rotation
     *
     * @param      {Object}  rotation  The rotation
     * 
     * {
     *  feature: Device
     *  parking: First Feature<Polygon> of type parking (hasOwnProperty("apron"))
     * }
     */
    updateOnStopped(stopped) {
        const FIRSTSEEN = "firstseen"
        const LASTSEEN = "lastseen"
        let time = moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601)
        let parkings = stopped.areas.filter((f) => f.hasOwnProperty("properties") && f.properties.hasOwnProperty("apron"))
        let id = false
        let r = false
        let parking = false
        let that = this

        if (parkings.length == 0) {
            return
        } else if (parkings.length == 1) {
            r = this.findRotation(parkings[0].properties.name, time)
            if(r) {
                parking = r.parking
            }
        } else { // Sometimes, parking 41 is split in 41A/41B and also simultaneously 41C/41D/41E, so a feature can be at the same time on 41, 41A et 41C.
            parkings.forEach((f) => { // try to find a rotation for one of the parkings under the feature
                let r0 = that.findRotation(f.properties.name, time)
                if (r0) {
                    r = r0
                }
            })
        }

        if (!r && !parking) { // we see a service vehicle before the plane, we need to record it...
            console.warn("Rotation::update", "no rotation found", stopped)
            return
        }

        if (!r) { // we see a service vehicle before the plane, we need to record it...
            id = Rotation.mkRotationId(parking, UNSCHEDULED)
            r = {
                id: id,
                parking: parking,
                services: new Map()
            }
            console.log("Rotation::update", "service arrived before plane?", stopped, r)
        }

        if(!r.arrival) {
            let arrt = this.transports.findTransportOnParking(ARRIVAL, r.parking, time)
            if(arrt) {
                r.arrival = arrt
                console.log("Rotation::updateOnStopped","found arrival",r.id,arrt)
            }
        }

        if(!r.departure) {
            let dept = this.transports.findTransportOnParking(DEPARTURE, r.parking, time)
            if(dept) {
                r.departure = dept
                console.log("Rotation::updateOnStopped","found departure",r.id,dept)
            }
        }

        /*
        if (!r.departure) {
            if (r.arrival) {
                console.log("Rotation::update", "service has arrival", r, stopped)
                r.departure = this.transports.getNextTransport(r.arrival.name)
                if (r.departure) {
                    console.log("Rotation::update", "service has departure", r, stopped)
                }
            } else {
                console.log("Rotation::update", "service has no transport assigned", r, stopped)
            }
        }
        */

        if (stopped.feature.properties.type == "SERVICE") {
            const vehicle = stopped.feature.properties.name
            const sarr = vehicle.split(":") // id = "catering:0"
            const service = sarr[0]

            let thisservice = r.services.has(service) ? r.services.get(service) : new Map()
            let thisvehicle = thisservice.has(vehicle) ? thisservice.get(vehicle) : new Map()

            if (!thisvehicle.hasOwnProperty(FIRSTSEEN)) {
                // console.log("Rotation::update: First visit...", moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf(), stopped.feature)
                // console.log("Rotation::update: First visit...", StackTrace.getSync())
                thisvehicle[FIRSTSEEN] = moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf()
//            } else {
//                console.log("Rotation::update: Second visit...", thisvehicle, moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf(), stopped.feature)
                // console.log("Rotation::update: Second visit...", StackTrace.getSync())
            }
            thisvehicle[LASTSEEN] = moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf()

            thisservice.set(vehicle, thisvehicle)
            r.services.set(service, thisservice)

        } else if (stopped.feature.properties.type == "AIRCRAFT" || stopped.feature.properties.type == "TRUCK") {
            if (!r.hasOwnProperty(FIRSTSEEN)) {
                // console.log("Rotation::update: First visit...", moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf(), stopped.feature)
                // console.log("Rotation::update: First visit...", StackTrace.getSync())
                r[FIRSTSEEN] = moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf()
                r.name = stopped.feature.properties.name
//            } else {
//                console.log("Rotation::update: Second visit", r.firstseen, moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf(), stopped.feature)
                // console.log("Rotation::update: Second visit...", StackTrace.getSync())
            }
            r[LASTSEEN] = moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf()
        }

        // do we need to push r back on map??
        r._touched = time
        this.rotations.set(r.id, r)
        PubSub.publish("ROTATION_UPDATED", r)
    }

}