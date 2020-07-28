/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import { deepExtend } from "./Utilities/Utils"
import { Channel } from "./Channel"
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
        let client = mqtt.connect(this.options.url)
        let that = this
        console.log("ChannelMQTT::installing...", this.options)

        this.options.topics.forEach( (t) => {
            client.on(t, function(topic, message) {
                console.log("ChannelMQTT::on", topic, message)
                that.dispatcher.dispatch(message)
            })
            console.log("ChannelMQTT::listerner", t)
        })

        console.log("ChannelMQTT::install: listening", new Date(), this.options.topics)
    }
}