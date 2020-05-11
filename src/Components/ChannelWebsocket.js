/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * GIP Viewer Application. Initiates a dashboard and registers Tile in it.
 */
import { deepExtend } from "./Utilities"
import { Channel } from "./Channel"

const DEFAULTS = {
    reconnect_retry: 30 // tries to reconnect every x seconds
}

export class ChannelWebsocket extends Channel {

    constructor(dispatcher, options) {
        super(dispatcher)
        this.options = deepExtend(DEFAULTS, options)
        this.install()
    }

    install() {
        let ws = new WebSocket(this.options.websocket)
        let that = this

        ws.onopen = function() {
            console.log("ChannelWebsocket: Socket is opened", new Date())
        }
        ws.onclose = function(e) {
            console.log("ChannelWebsocket: Socket is closed. Reconnect will be attempted in " + that.options.reconnect_retry + " second.", e.reason)
            setTimeout(function() {
                that.install()
            }, that.options.reconnect_retry * 1000)

        }
        ws.onmessage = function(evt) {
            try {
                that.dispatcher.dispatch(evt.data)
            } catch (e) {
                console.log("ChannelWebsocket: cannot send message", e)
            }
        }
    }
}