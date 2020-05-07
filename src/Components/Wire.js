/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import '../css/wire.css'

import { deepExtend } from './Utilities'
import { Tile } from './Tile'

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    elemid: "wire",
    msgtype: "wire",
    voice: false,
    wire_container: "ul",
    "icon-set": "la-",
    size: 'medium',
    speed: 500,
    dateReminder: 3, // minutes
    // More
    numWords: 50,
    ellipsestext: '<i class="fa la-ellipsis-h"></i>',
    moretext: '<i class="fa la-angle-double-right"></i>',
    lesstext: '<i class="fa la-angle-double-left"></i>',
    //
    ignoreTags: ['default', 'unknown'],
    filterNewMessage: false
}

const BOOTSTRAP_COLORS = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'accent',
    'default'
]
const BOOTSTRAP_COLOR_VARIANTS = [
    'bright',
    'light',
    'normal',
    'dark'
]

export class Wire extends Tile {

    constructor(elemid, message_type, options) {
        super(elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
    }

    /*  installs the HTML code in the document
     */
    install() {

    }

    /*  update/insert HTML code on event
     */
    update() {

    }

}



