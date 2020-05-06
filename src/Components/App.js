/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Starts main viewer application.
 */
const VERSION = "5.0.0"
const MODULE_NAME = "App"

import L from 'leaflet'
import { deepExtend } from './Utilities'
import * as Dispatcher from './Dispatcher'
import * as Omap from './Omap'


/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
}

/**
 *  PRIVATE letIABLES
 */
let _options = false

function init(options) {
    if (_options)
        return _options

    _options = deepExtend(DEFAULTS, options)

//    install()

    if (_options.debug) {
        console.log(MODULE_NAME, "inited")
    }

    return _options
}

function run(options) {
    /*
     *  D I S P A T C H E R
     */
    Dispatcher.init({
        elemprefix: "",
        msgprefix: "GIP-",
        websocket: 'ws://localhost:8051',
        reconnect_retry: 300, // seconds
        debug: false
    })

    /*  M A P
     */
    Omap.init({
        elemid: "map",
        msgtype: "map",

        center: [50.64, 5.445],
        zoom: 14,
        zoom_overview: 8
    })

}

function changeTheme(theme) {
    ;
}

/**
 *  MODULE EXPORTS
 */
function version() {
    console.log(MODULE_NAME, VERSION);
}

export {
    version,
    init,
    run
}