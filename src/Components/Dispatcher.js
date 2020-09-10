/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import PubSub from "pubsub-js"
import { deepExtend } from "./Utilities/Utils"

import { ChannelWebsocket } from "./ChannelWebsocket"
import { ChannelMQTT } from "./ChannelMQTT"

import { CLOCK_MSG } from "./Constant"

PubSub.immediateExceptions = true;

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    debug: false,
    TYPE: "type",
    PAYLOAD: "payload",
    TIMESTAMP: "timestamp",
    channels: {}
}

/**
 * This class describes a dispatcher.
 *  Dashboard helper connects external sources (currently websocket)
 *  and broadcast events inside a web page to the destination element.
 *  Elements first need to register with the dispatcher to receive messages.
 *  Messages with no receving element are reported on console and discarded.
 *
 * @class      Dispatcher (name)
 */
export class Dispatcher {

    constructor(options) {
        this.options = deepExtend(DEFAULTS, options)
        this.channels = new Map()
        this.install()
    }


    install() {
        for (let channel in this.options.channels) {
            let channelOptions = this.options.channels[channel]
            let channelConnector = false
            switch (channel) {

                case "websocket":
                    channelConnector = new ChannelWebsocket(this, channelOptions)
                    console.log("Dispatcher::installed", channel, channelOptions)
                    break

                case "mqtt":
                    channelConnector = new ChannelMQTT(this, channelOptions)
                    console.log("Dispatcher::installed", channel, channelOptions)
                    break

                default:
                    console.warn("Dispatcher::install", "no connector for channel", channel)
                    break

            }
            if (channelConnector !== false) {
                this.channels.set(channel, channelConnector)
            }
        }
    }


    /**
     * Dispatch message to viewer
     *
     * @param      {Object}  data    The data
    *  expected data format:
        {
            type: "map",            // <== destination of message (or message "type")
            timestamp: "",          // <== ISO 8861 formatted (original) date/time of emission of message
            payload: {              // <== payload sent to destination (variable, depends on message type.)
                type: "Feature",
                geometry: {},
                properties: {},
                id: "-=id=-"    
            }
        }
     */
    dispatch(data) {
        let msg = null

        if (typeof data == "string") {
            try {
                msg = JSON.parse(data)
            } catch (e) {
                console.error("Dispatcher::dispatch: cannot decode message", data, e)
            }
        } else {
            msg = data
        }

        if (msg.hasOwnProperty(this.options.TYPE) && msg.hasOwnProperty(this.options.PAYLOAD)) {
            const msgtype = msg[this.options.TYPE]
            try {
                PubSub.publish(msgtype, msg[this.options.PAYLOAD])
                // console.log("Dispatcher::dispatch",msgtype, msg[this.options.PAYLOAD])
                if (msg.hasOwnProperty(this.options.TIMESTAMP)) { // adjust simulation clock
                    PubSub.publish(CLOCK_MSG, msg[this.options.TIMESTAMP])
                }
            } catch (e) {
                console.error("Dispatcher::dispatch: problem during broadcast", msg[this.options.PAYLOAD], e)
            }
        } else {
            console.warn("Dispatcher::dispatch: message has no type or no payload", this.options.TYPE, this.options.PAYLOAD, data)
        }
    }

}