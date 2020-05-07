/*  Base class for subscriber to Dispatcher messages
 */

import PubSub from 'pubsub-js'


export class Subscriber {

  constructor(message_type) {
    this.message_type = message_type
    PubSub.subscribe(this.message_type, this.listener);
  }

  listener(message, data) {
    console.log(this.message_type, message, data)
  }

}