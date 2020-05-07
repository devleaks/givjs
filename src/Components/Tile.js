/*  Base class for HTML rendered dashboard elements
 */

import { Subscriber } from './Subscriber'
import { deepExtend } from './Utilities'

export class Tile extends Subscriber {

    constructor(elemid, message_type) {
        super(message_type)
        this.elemid = elemid
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