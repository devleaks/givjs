/*  Base class for subscriber to Dispatcher messages
 */
export class FeatureCollection {

    constructor(url) {
        let that = this

        let request = new XMLHttpRequest()
        request.open("GET", url, false)

        request.onload = function() {
            if ((this.status >= 200 && this.status < 400) || (this.status == 0)) {
                that.fc = JSON.parse(this.response)
            } else {
                console.log("FeatureCollection::error", this)
            }
        }

        request.onerror = function() {
            // There was a connection error of some sort
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

    find(n, k) {
        return this.fc.features.find(f => f.properties[n] == k)
    }

}