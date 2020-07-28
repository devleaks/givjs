/**
 */


export class Occupancy extends State {

    constructor(zone, device, timestamp) {
        super()
        this.zone_id = zone
        this.device_id = device_id
        this.enter = timestamp
        this.last_update = timestamp
        this.exit = null
    }

    update(timestamp) {
        this.last_update = timestamp
    }

    quit(timestamp) {
        this.last_update = timestamp
        this.exit = timestamp
    }

}