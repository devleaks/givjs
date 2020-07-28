/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import { deepExtend } from "./Utilities/Utils"
import { Channel } from "./Channel"

const DEFAULTS = {
    reconnect_retry: 30 // tries to reconnect every x seconds
}

/**
 * This class describes a websocket channel for data acquisition
 *
 * @class      ChannelWebsocket (name)
 */
export class ChannelWebsocket extends Channel {

    /**
     * Constructs a new ChannelWebsocket instance.
     *
     * @param      {<type>}  dispatcher  The dispatcher
     * @param      {<type>}  options     The options
     * {
     *  reonnect_retry: 30 seconds
     *  websocket: Web socket URL "ws://localhost:8051"
     * }
     */
    constructor(dispatcher, options) {
        super(dispatcher)
        this.options = deepExtend(DEFAULTS, options)
        this.install()
    }


    /**
     * Installs the ChannelWebsocket.
     */
    install() {
        let ws = new WebSocket(this.options.websocket)
        let that = this

        ws.onopen = function() {
            console.log("ChannelWebsocket::install: Socket is opened", new Date())
        }
        ws.onclose = function(e) {
            console.log("ChannelWebsocket::install: Socket is closed. Reconnect will be attempted in " + that.options.reconnect_retry + " second.", e.reason)
            setTimeout(function() {
                that.install()
            }, that.options.reconnect_retry * 1000)

        }
        ws.onmessage = function(evt) {
            try {
                that.dispatcher.dispatch(evt.data)
            } catch (e) {
                console.error("ChannelWebsocket::install cannot dispatch message", e)
            }
        }
    }
}