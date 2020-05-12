/*  Base class for subscriber to Dispatcher messages
 */
import { booleanPointInPolygon, booleanWithin } from "@turf/turf"


export class FeatureCollection {

    constructor(url) {
        let that = this

        let request = new XMLHttpRequest()
        request.open("GET", url, false) // async = false

        request.onload = function() {
            if ((this.status >= 200 && this.status < 400) || (this.status == 0)) {
                that.fc = JSON.parse(this.response)
            } else {
                console.log("FeatureCollection::request.onload", this)
            }
        }

        request.onerror = function() {
            console.log("FeatureCollection::request.onerror")
        }

        request.send()

        console.log("FeatureCollection:loaded", this.fc)
    }

    get collection() {
        return this.fc
    }

    get features() {
        return this.fc.features
    }

    find(n, k) { // note: find returns the first match only
        return this.fc.features.find(f => f.properties[n] == k)
    }

    filter(n, k) { // note: find returns all matches (array of Features)
        return this.fc.features.filter(f => f.properties[n] == k)
    }

    count(n, k) {
        let r = this.filter(n, k)
        return r.length
    }

    distinct(n) { // note: find all values of a property
        let ret = []
        this.fc.features.forEach( (f) => {
            if(ret.indexOf(f.properties[n]) == -1) {
                ret.push(f.properties[n])
            }
        })
        return ret
    }

    filterAndSort(n, k, s, rev = false) { // note: find returns all matches (array of Features)
        let a = this.fc.features.filter(f => f.properties[n] == k)
        a = a.sort( (a,b) => (a[s] > b[s]))
        return rev ? a.reverse() : a
    }

    /*  Returns features that contain the supplied point
     */
    contains(point) {
        this.fc.features.filter(f => booleanPointInPolygon(point.coordinates, f))
    }

    /*  Returns features that are inside the bbox feature (a polygon)
     */
    inside(bbox) {
        this.fc.features.filter(f => 
            booleanWithin(f, bbox))
    }

}