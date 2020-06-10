/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import PubSub from "pubsub-js"

export class Subscriber {

    constructor(message_type) {
        this.message_type = message_type
    }

    listen(f) {
        if (Array.isArray(this.message_type)) {
            this.message_type.forEach(function(t) {
                PubSub.subscribe(t, f)
            })

        } else {
            PubSub.subscribe(this.message_type, f)
        }
    }

}