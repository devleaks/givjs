/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import { deepExtend } from "./Utilities/Utils"

/**
 *  DEFAULT VALUES

"OO-123": {
    name: "OO-123",
    lastseen: moment(),
    lastposition: { type: "Feature" ...},
    status: [ "moving", "stopped", "just-stopped", "just-moved", "expired"]
}
 */

/**
 * This class is a container for device.
 *
 * @class      Device (name)
 */
export class Devices {

    /**
     * Constructs a new Device instance.
     */
    constructor() {
        this.devices = new Map()
    }


    /**
     * Adds the specified device.
     *
     * @param      {<Feature>}  device  The device
     */
    add(device) {
        this.devices.set(device.id, device)
    }


    /**
     * Updates the given device.
     *
     * @param      {<Feature>}  device  The device
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


    /**
     * Returns a device object
     *
     * @param      {<String>}     The device's identifier
     * @return     {<Feature>}    The device
     */
    get(device) {
        return typeof device == "object" ? this.devices.get(device.id) : this.devices.get(device)
    }

}