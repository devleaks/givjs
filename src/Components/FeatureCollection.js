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