/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import { booleanPointInPolygon } from "@turf/turf"
import moment from "moment"

import { Subscriber } from "./Subscriber"

import { STOPPED, JUST_STOPPED, JUST_STARTED, MOVED } from "./Constant"

/** Rotation record:

"A51-2020-05-10T12:34:56.789+02:00": {
    name: "A51",
    from: {},
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

    constructor(msgtype, parkings) {
        super(msgtype)
        this.parkings = parkings
        this.rotations = new Map()
        this.install()
    }


    install() {
        let that = this
        this.listen((msgtype, feature) => {
            //console.log("Rotation::listen", msgtype, feature)
            switch (msgtype) {
                case JUST_STOPPED:
                case STOPPED:
                    const parr = that.parkings.features.filter(f => booleanPointInPolygon(feature.geometry.coordinates, f))
                    if (parr.length > 0) {
                        const box = parr[0]
                        this.update({
                            parking: box.properties.name,
                            feature: feature
                        })
                    //} else {
                    //    console.log("Rotation::listener:stopped: not parked", feature)
                    }
                    break
                case JUST_STARTED:
                case MOVED:
                    break
                default:
                    console.warn("Rotation::no listener", msgtype)
                    break
            }
            /*
            if (feature.hasOwnProperty("timestamp")) {
                PubSub.publish(CLOCK_MSG, data.timestamp)
            }
            */
        })
    }


    static mkRotationId(rotation) {
        return "R::" + rotation.parking // + "-" + rotation.start_scheduled.toISOString()
    }


    /**
     * Update a rotation
     *
     * @param      {Object}  rotation  The rotation
     */
    update(stopped) {
        let rid = Rotation.mkRotationId(stopped)
        //console.log("Rotation::updating..", rid, stopped)

        if (stopped.feature.properties.type == "SERVICE") {
            const vehicle = stopped.feature.properties.name
            const sarr = vehicle.split(":") // id = "catering:0"
            const service = sarr[0]
            let r = this.rotations.get(rid)
            let create = false

            if (!r) { // we see a service vehicle before the plane, we need to record it...
                r = {
                    services: {}
                }
                create = true
                console.log("Rotation::update", "service arrived before plane?", stopped)
            }

            if (!r.departure) {
                if (r.arrival) {
                    console.log("Rotation::update", "service has arrival", r, stopped)
                    r.departure = Oscars.Util.getDepartureFlight(r.arrival.name)
                    if (r.departure) {
                        console.log("Rotation::update", "service has departure", r, stopped)
                    }
                } else {
                    console.log("Rotation::update", "service has no flight assigned", r, stopped)
                }
            }

            r.services[service] = r.services.hasOwnProperty(service) ?
                r.services[service] : {}
            let thisservice = r.services[service]

            thisservice[vehicle] = thisservice.hasOwnProperty(vehicle) ?
                thisservice[vehicle] : {}

            let thisvehicle = thisservice[vehicle]

            console.log("Rotation::update", moment().valueOf(), stopped.feature)

            if (!thisvehicle.hasOwnProperty("firstseen")) {
                // console.log("Rotation::update: First visit...", moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf(), stopped.feature)
                // console.log("Rotation::update: First visit...", StackTrace.getSync())
                thisvehicle.firstseen = moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf()
            } else {
                console.log("Rotation::update: Second visit...", thisvehicle.firstseen, moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf(), stopped.feature)
                // console.log("Rotation::update: Second visit...", StackTrace.getSync())
            }
            thisvehicle.lastseen = moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf()

            // do we need to push r back on map??
            this.rotations.set(rid, r)

            //console.log("Rotation::..updated", rid, r, create)
            // create_update_chart(parking)
        }
    }


    /**
     * Get a rotation
     *
     * @type       {String|Object}  If an object if given, lookups up by its name property.
     */
    get(rotation) {
        return typeof rotation == "object" ? this.rotations.get(rotation.name) : this.rotations.get(rotation)
    }

}