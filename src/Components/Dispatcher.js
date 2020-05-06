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
const VERSION = "5.0.0"
const MODULE_NAME = "Dispatcher"

import PubSub from 'pubsub-js'
import { deepExtend } from './Utilities'

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    debug: false,
    elemprefix: "",
    // message prefix, to avoid message name collision
    msgprefix: "GIP-",
    // field names
    msgTYPE: "type",
    msgPAYLOAD: "payload",

    // Websocket feeds
    websocket: null, // 'ws://localhost:8051', 'ws://hostname.local:8051', null means no conncetion
    reconnect_retry: 10 // seconds
}

/**
 *  PRIVATE letIABLES
 */
let _listeners = new Map()
let _options = false


/**
 *  PRIVATE FUNCTIONS
 */

// Start ws connection
function wsStart() {
    let ws = new WebSocket(_options.websocket)

    ws.onopen = function() {
        console.log(MODULE_NAME, "wsStart::onopen: Socket is opened", new Date())
    }
    ws.onclose = function(e) {
        console.log(MODULE_NAME, "wsStart::onclose: Socket is closed. Reconnect will be attempted in " + _options.reconnect_retry + " second.", e.reason)
        setTimeout(function() {
            wsStart()
        }, _options.reconnect_retry * 1000)

    }
    ws.onmessage = function(evt) {
        try {
            broadcast(evt.data)
        } catch (e) {
            console.log(MODULE_NAME, 'wsStart::onmessage: cannot send message', e)
        }
    }
}


/**
 *  PUBLIC FUNCTIONS
 */

// Internal initialisation of Dashboard
function init(options) {
    if (_options)
        return _options

    _options = deepExtend(DEFAULTS, options)

    // install()
    if (_options.websocket !== null) {
        wsStart()
    }

    if (_options.debug) {
        console.log(MODULE_NAME, "inited")
    }

    return _options
}


function register(elemid, msgtype) {
    if (!_listeners.has(msgtype)) {
        _listeners.set(msgtype, [])
    }
    let msglisteners = _listeners.get(msgtype)
    if (msglisteners.indexOf(elemid) < 0) {
        msglisteners.push(elemid)
    }
    if (_options.debug)
        console.log(MODULE_NAME, "register", elemid, msgtype)
}


function unregister(elemid, msgtype) {
    if (_listeners.has(msgtype)) {
        let msglisteners = _listeners.get(msgtype)
        const i = msglisteners.indexOf(elemid)
        if (i >= 0) {
            msglisteners.splice(i, 1)
        }
        if(msglisteners.length == 0) {
            _listeners.delete(msgtype)
        }
    }
}


// data = {type: "string", payload: "string"}
function broadcast(data) {
    let msg = null
    if (typeof data == "string") {
        try {
            msg = JSON.parse(data)
        } catch (e) {
            console.log(MODULE_NAME, "broadcast: cannot decode message", data, e)
        }
    } else {
        msg = data
    }

    if (msg.hasOwnProperty(_options.msgTYPE) && msg.hasOwnProperty(_options.msgPAYLOAD)) {
        const msgtype = msg[_options.msgTYPE]

        if (_listeners.has(msgtype)) { // if array of listener is 0, we remove the map element
             _listeners.get(msgtype).forEach(function(dst, idx) {
                if (_options.debug)
                    console.log(MODULE_NAME, "broadcast", "#" + _options.elemprefix + dst, _options.msgprefix + msgtype)
                try {
                    PubSub.publish(_options.msgprefix + msgtype, msg[PAYLOAD])
                } catch (e) {
                    console.log(MODULE_NAME, "broadcast: problem during broadcast", msg[_options.msgPAYLOAD], e)
                }
            })
        } else {
            console.log(MODULE_NAME, "broadcast: no listener for message type", msgtype, msg[_options.msgPAYLOAD], _listeners)
        }

    } else {
        console.log(MODULE_NAME, "broadcast: message has no type or no payload", data)
    }
}


function getElemPrefix() {
    return _options.elemprefix
}


function getMessagePrefix() {
    return _options.msgprefix
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
    getElemPrefix,
    getMessagePrefix,
    register,
    unregister,
    broadcast
}