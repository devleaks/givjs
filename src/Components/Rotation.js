/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import { deepExtend } from "./Utilities"

/**
 *  DEFAULT VALUES

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
export function mkRotationId(rotation) {
    return rotation.name + "-" + rotation.start_scheduled.toISOString()
}


export class Rotation {

    constructor() {
        this.rotations = new Map()
    }


    add(rotation) {
        this.rotations.set(rotation.name, rotation)
    }
    /*
     */
    update(rotation) {
        if (this.rotations.has(rotation.name)) {
            let f = this.get(rotation)
            f = deepExtend(f, rotation)
            this.rotations.set(f.name, f)
        } else {
            this.rotations.set(rotation.name, rotation)
        }
    }

    /*  rotation = "SN123" or { name: "SN123" ... }
     */
    get(rotation) {
        return typeof rotation == "object" ? this.rotations.get(rotation.name) : this.rotations.get(rotation)
    }

}