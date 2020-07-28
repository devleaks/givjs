/**
 */

export class device extends State {

    constructor(id, e) {
        super()
        this.id = id
        this.feature = e
        this.devicelist = new Map()
        this.deviceleft = []
    }

    addOn(newdevicelist, timestamp) {
      let newdeviceids = []

      // create or update devices device is "in"
      newdevicelist.forEach( (d) => {
        newdeviceids.push(d.id)

        let oldd = this.devicelist.get(d.id)
        if(oldd) {
          oldd.update(timestamp)
        } else { // entered new device
          let newd = new Occupancy(this.id, d.id, timestamp)
          this.devicelist.set(d.id, newd)
        }

      })

      // are there device in current status where device no longer resides?
      const olddeviceids = this.devicelist.keys()
      let difference = olddeviceids.filter(x => newdeviceids.indexOf(x) === -1)

      if(difference.length > 0) {
        difference.forEach( (d) => {
          let oldd = this.devicelist.get(d)
          oldd.quit(timestamp)
          this.deviceleft.push(oldd)
          this.devicelist.delete(d)
        })
      }

    }

    get contains() {
      return this.devicelist
    }

}