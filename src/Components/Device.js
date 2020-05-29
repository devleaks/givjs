/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import { deepExtend } from "./Utils/Utilities"

/**
 *  DEFAULT VALUES

"OO-123": {
    name: "OO-123",
    lastseen: moment(),
    lastposition: { type: "Feature" ...},
    status: [ "moving", "stopped", "just-stopped", "just-moved", "expired"]
}
 */

export class Device {

    constructor() {
        this.devices = new Map()
    }


    add(device) {
        this.devices.set(device.id, device)
    }
    /*
     */
    update(device) {
        if (this.devices.has(device.id)) {
            let f = this.get(device)
            f = deepExtend(f, device)
            this.devices.set(f.id, f)
        } else {
            this.devices.set(device.id, device)
        }
    }

    /*
     */
    get(device) {
        return typeof device == "object" ? this.devices.get(device.id) : this.devices.get(device)
    }

}