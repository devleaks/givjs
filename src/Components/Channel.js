/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


/**
 * Parent class for data acquisition channels. ABSTRACT CLASS.
 *
 * @class      Channel (name)
 */
export class Channel {

    /**
     * Constructs a new channel instance.
     *
     * @param      {<Dispatcher>}  dispatcher  The dispatcher listening on this channel.
     */
    constructor(dispatcher) {
        this.dispatcher = dispatcher
    }

}