/*
 *
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
 *
 *
 * @class      Stopped(msgtype, areas, options)
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
        var lastseen = _devices.get(fid)

        if (feature.properties.hasOwnProperty(SPEED)) {
            if (!lastseen) {
                if (feature.properties.speed == 0) { // device is stopped, we don't know how it was before...

                    PubSub.publish(STOPPED, {
                        feature: feature,
                        areas: places(feature)
                    })

                } // else MOVING
            } else {
                if (lastseen.properties.speed > 0 && feature.properties.speed == 0) { // device has stopped
                    PubSub.publish(JUST_STOPPED, {
                        feature: feature,
                        areas: places(feature)
                    })
                } else if (lastseen.properties.speed == 0 && feature.properties.speed > 0) {
                    PubSub.publish(JUST_STARTED, {
                        feature: feature,
                        areas: places(feature)
                    })
                } else if (lastseen.properties.speed == 0 && feature.properties.speed == 0) {
                    let moved = distance(lastseen.geometry.coordinates, feature.geometry.coordinates, { units: "kilometers" })
                    if (moved > MOVED_DISTANCE) { // still stopped but moved 50 meters
                        PubSub.publish(MOVED, {
                            feature: feature,
                            areas: places(feature)
                        })
                    } else {
                        PubSub.publish(STOPPED, {
                            feature: feature,
                            areas: places(feature)
                        })
                    }
                }
            }
            // note: we store old position only if it has speed property
            _devices.set(fid, feature)
        }
    }


    places(feature) {
        let pos = []

        this.areas.forEach((fc) => {
            let areas = fc.contains(feature.geometry)
            pos = pos.concat(areas)
        })

        console.log("Stopped::places", pos.length)

        return pos
    }
}