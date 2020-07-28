/**
 */

import { STOPPED, JUST_STOPPED, JUST_STARTED, MOVED, MOVING } from "../Constant"

const DEFAULTS = {
    SPEED: "speed",
    MOVED_DISTANCE: 0.050 // km
}

export class Device extends State {

    constructor(id, e) {
        super()
        this.id = id
        this.options = DEFAULTS
        this.last = e
        this.penult = null
        this.zonelist = new Map()
        this.zoneleft = []
    }

    log(e) {
        this.penult = this.last
        this.last = e
    }

    addOn(newzonelist, timestamp) {
      let newzoneids = []

      // create or update zones device is "in"
      newzonelist.forEach( (z) => {
        newzoneids.push(z.id)

        let oldz = this.zonelist.get(z.id)
        if(oldz) {
          oldz.update(timestamp)
        } else { // entered new zone
          let newz = new Occupancy(this.id, z.id, timestamp)
          this.zonelist.set(z.id, newz)
        }

      })

      // are there zone in current status where device no longer resides?
      const oldzoneids = this.zonelist.keys()
      let difference = oldzoneids.filter(x => newzoneids.indexOf(x) === -1)

      if(difference.length > 0) {
        difference.forEach( (z) => {
          let oldz = this.zonelist.get(z)
          oldz.quit(timestamp)
          this.zoneleft.push(oldz)
          this.zonelist.delete(z)
        })
      }

    }

    get on() {
      return this.zonelist
    }

    move() {
        let status = false
        const feature = this.last
        const lastseen = this.penult

        if (feature.properties.hasOwnProperty(this.options.SPEED)) {
            if (!lastseen) {
                status = (feature.properties[this.options.SPEED] == 0) ? STOPPED : MOVING
            } else {
                if (lastseen.properties[this.options.SPEED] > 0 && feature.properties[this.options.SPEED] == 0) { // device has stopped
                    status = JUST_STOPPED
                } else if (lastseen.properties[this.options.SPEED] == 0 && feature.properties[this.options.SPEED] > 0) {
                    status = JUST_STARTED
                } else if (lastseen.properties[this.options.SPEED] == 0 && feature.properties[this.options.SPEED] == 0) {
                    let moved = distance(lastseen.geometry.coordinates, feature.geometry.coordinates, { units: "kilometers" })
                    if (moved > this.options.MOVED_DISTANCE) { // still stopped but moved 50 meters
                        status = MOVED
                    } else {
                        status = STOPPED
                    }
                } else if (lastseen.properties[this.options.SPEED] > 0 && feature.properties[this.options.SPEED] > 0) {
                    status = MOVING
                }
            }
        }
        return status
    }

}