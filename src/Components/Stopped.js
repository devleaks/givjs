/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import PubSub from "pubsub-js"
import { distance } from "@turf/turf"

import { Subscriber } from "./Subscriber"

import { getFeatureId } from "./Utilities/GeoJSON"
import { deepExtend } from "./Utilities/Utils"

import { STOPPED, JUST_STOPPED, JUST_STARTED, MOVED } from "./Constant"

const DEFAULTS = {
    SPEED: "speed",
    MOVED_DISTANCE: 0.050 // km
}

/**
 *  Stopped class respond to the same map update messages and emit stopped message
 *  when a device is stopped, or has moved.
 *  The stopped message contains the list of areas of interest where the device has stopped.
 *
 * @class      Stopped(msgtype, areas, options)
 * @param      {String}  msgtype  The message type
 * @param      {Array<FeatureCollection>}  areas      Areas to check interest for.
 * @param      {Object}  options  Class options
 */
export class Stopped extends Subscriber {

    constructor(msgtype, areas, options) {
        super(msgtype)

        this.options = deepExtend(DEFAULTS, options)
        this.areas = areas
        this.devices = new Map()

        this.install()
    }


    install() {
        this.listen(this.update.bind(this))
    }


    update(msgtype, feature) {
        const fid = getFeatureId(feature)
        var lastseen = this.devices.get(fid)

        if (feature.properties.hasOwnProperty(this.options.SPEED)) {
            if (!lastseen) {
                if (feature.properties[this.options.SPEED] == 0) { // device is stopped, we don't know how it was before...

                    PubSub.publish(STOPPED, {
                        feature: feature,
                        areas: this.places(feature)
                    })

                } // else MOVING
            } else {
                if (lastseen.properties[this.options.SPEED] > 0 && feature.properties[this.options.SPEED] == 0) { // device has stopped
                    PubSub.publish(JUST_STOPPED, {
                        feature: feature,
                        areas: this.places(feature)
                    })
                } else if (lastseen.properties[this.options.SPEED] == 0 && feature.properties[this.options.SPEED] > 0) {
                    PubSub.publish(JUST_STARTED, {
                        feature: feature,
                        areas: this.places(feature)
                    })
                } else if (lastseen.properties[this.options.SPEED] == 0 && feature.properties[this.options.SPEED] == 0) {
                    let moved = distance(lastseen.geometry.coordinates, feature.geometry.coordinates, { units: "kilometers" })
                    if (moved > this.options.MOVED_DISTANCE) { // still stopped but moved 50 meters
                        PubSub.publish(MOVED, {
                            feature: feature,
                            areas: this.places(feature)
                        })
                    } else {
                        PubSub.publish(STOPPED, {
                            feature: feature,
                            areas: this.places(feature)
                        })
                    }
                }
            }
            // note: we store old position only if it has speed property
            this.devices.set(fid, feature)
        }
    }


    places(feature) {
        let pos = []

        this.areas.forEach((fc) => {
            let areas = fc.contains(feature.geometry)
            pos = pos.concat(areas)
        })

        return pos
    }
}