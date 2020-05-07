/*
 * Oscars Geo Intelligent Platform Viewer
 * 
 * 2020 Pierre M
 * License: MIT
 *
 *  Dashboard helper connects external sources (currently websocket)
 *  and broadcast events inside a web page to the destination element.
 *  Elements first need to register with the dispatcher to receive messages.
 *  Messages with no receving element are reported on console and discarded.
 */
import PubSub from "pubsub-js"
import { deepExtend } from "./Utilities"


import { ChannelWebsocket } from "./ChannelWebsocket"

/**
 *  DEFAULT VALUES

expected message format: {
    type: "map",            // <== destination of message
    payload: {              // <== payload sent to destination
        type: "Feature",
        geometry: {},
        properties: {},
        id: "-=id=-"    
    }
}

 */
const DEFAULTS = {
    debug: false,
    TYPE: "type",
    PAYLOAD: "payload",
    channels: {}
}


export class Dispatcher {

    constructor(options) {
        this.options = deepExtend(DEFAULTS, options)
        this.channels = new Map()
        this.install()
    }


    install() {
        for (var channel in this.options.channels) {
            if (this.options.channels.hasOwnProperty(channel)) {
               let channelOptions = this.options.channels[channel]
                let channelConnector = false
                switch (channel) {
                    case "websocket":
                        console.log("Dispatcher", channel, channelOptions)
                        channelConnector = new ChannelWebsocket(this, channelOptions)
                        break
                    default:
                        channelConnector = false
                }
                if (channelConnector !== false) {
                    this.channels.set(channel, channelConnector)
                }
            }
        }
    }


    dispatch(data) {
        let msg = null

        if (typeof data == "string") {
            try {
                msg = JSON.parse(data)
            } catch (e) {
                console.log("dispatch: cannot decode message", data, e)
            }
        } else {
            msg = data
        }

        if (msg.hasOwnProperty(this.options.TYPE) && msg.hasOwnProperty(this.options.PAYLOAD)) {
            const msgtype = msg[this.options.TYPE]
            try {
                PubSub.publish(msgtype, msg[this.options.PAYLOAD])
                // console.log("Dispatcher::published", msgtype, msg[this.options.PAYLOAD])
            } catch (e) {
                console.log("dispatch: problem during broadcast", msg[this.options.PAYLOAD], e)
            }
        } else {
            console.log("dispatch: message has no type or no payload", this.options.TYPE, this.options.PAYLOAD, data)
        }
    }

}