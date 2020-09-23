/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import { deepExtend } from "./Utilities/Utils"
import { Channel } from "./Channel"

// Form https://github.com/mqttjs/MQTT.js
// https://unpkg.com/mqtt/dist/mqtt.min.js
import * as mqtt from "../assets/js/mqtt.min.js"

const DEFAULTS = {
    reconnect_retry: 30 // tries to reconnect every x seconds
}

/**
 * This class describes a MQTT channel for data acquisition
 *
 * @class      ChannelMQTT (name)
 */
export class ChannelMQTT extends Channel {

    /**
     * Constructs a new ChannelMQTT instance.
     *
     * @param      {<type>}  dispatcher  The dispatcher
     * @param      {<type>}  options     The options
     * {
     *  reonnect_retry: 30 seconds
     *  url: URL "mqtt://localhost/"
     *  topics: [ "topic1", "topic2"]
     * }
     */
    constructor(dispatcher, options) {
        super(dispatcher)
        this.options = deepExtend(DEFAULTS, options)
        this.install()
    }


    /**
     * Installs the ChannelMQTT.
     */
    install() {
        const that = this
        const client = mqtt.connect(that.options.uri, { reconnectPeriod: that.options.reconnect_retry * 1000 })

        client.on("connect", function() {
            console.log("ChannelMQTT::install: connected", that.options.uri)
            if (this.options.topics) {
                this.options.topics.forEach((topic) => {
                    client.subscribe(topic)
                    console.log("ChannelMQTT::install: listerner added for topic ", topic)
                })
            } else { // subscribe to all
                client.subscribe("#")
                console.log("ChannelMQTT::install: listerner added for all topics")
            }
        })


        client.on("close", function() {
            console.log("ChannelMQTT::install: Socket is closed. Reconnect will be attempted in " + that.options.reconnect_retry + " seconds.", that.options.uri)
        })

        client.on("error", function(error) {
            console.log("ChannelMQTT::install: error", that.options.uri, error)
        })

        client.on("message", (topic, payload) => {
            // console.log("ChannelMQTT::onMessage", topic, payload.toString());
            try {
                this.dispatcher.dispatch(payload.toString())
            } catch (e) {
                console.error("ChannelMQTT::install: onMessage: cannot dispatch message", e)
            }
        });

        console.log("ChannelMQTT::install: listening", new Date(), this.options.topics)
    }

}