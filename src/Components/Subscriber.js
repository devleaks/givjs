/*  Base class for subscriber to Dispatcher messages
 */

import PubSub from "pubsub-js"


export class Subscriber {

    constructor(message_type) {
        this.message_type = message_type
    }

    listen(f) {
      PubSub.subscribe(this.message_type, f)
    }

}