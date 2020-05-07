/*  Base class for HTML rendered dashboard elements
 */

import { Subscriber } from "./Subscriber"

export class Tile extends Subscriber {

    constructor(elemid, message_type) {
        super(message_type)
        this.elemid = elemid
    }

}