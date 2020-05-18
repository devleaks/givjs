/*
 *
 */
import PubSub from "pubsub-js"
import { distance } from "@turf/turf"

import { getFeatureId } from "../GeoJSON"
import { STOPPED, JUST_STOPPED, JUST_STARTED, MOVED } from "../Constant"

const SPEED = "speed"
const MOVED_DISTANCE = 0.050 // km

let _devices = new Map()

export function stopped(feature) {
    const fid = getFeatureId(feature)
    var lastseen = _devices.get(fid)

    if (feature.properties.hasOwnProperty(SPEED)) {
        if (!lastseen) {
            if (feature.properties.speed == 0) { // device is stopped, we don't know how it was before...
                PubSub.publish(STOPPED, feature)
            } // else MOVING
        } else {
            if (lastseen.properties.speed > 0 && feature.properties.speed == 0) { // device has stopped
                PubSub.publish(JUST_STOPPED, feature)
            } else if (lastseen.properties.speed == 0 && feature.properties.speed > 0) {
                PubSub.publish(JUST_STARTED, feature)
            } else if (lastseen.properties.speed == 0 && feature.properties.speed == 0) {
                let moved = distance(lastseen.geometry.coordinates, feature.geometry.coordinates, { units: "kilometers" })
                if (moved > MOVED_DISTANCE) { // still stopped but moved 50 meters
                    PubSub.publish(MOVED, feature)
                } else {
                    PubSub.publish(STOPPED, feature)
                }
            }
        }
        // note: we store old position only if it has speed property
        _devices.set(fid, feature)
    }
}