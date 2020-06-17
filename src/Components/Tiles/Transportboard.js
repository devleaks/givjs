/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import "../../assets/css/transportboard.css"

import { deepExtend } from "../Utilities/Utils"
import { Tile } from "../Tile"
import { Clock } from "../Clock"
import moment from "moment"

import { TRANSPORTBOARD_MSG, SCHEDULED, PLANNED, ACTUAL, DEPARTURE } from "../Constant"

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    elemid: "transportboard",
    msgtype: "transportboard",
    maxcount: 12,
    announce_delay: 15,  // min. After, announce transport is delayed.
    announce_boarding: 40,
    announce_lastcall: 20,
    update_time: 15,
    transports_ahead: 360 // min
}

/**
 * Display an HTML table as a transportboard.
 *
 * @class      Transportboard (name)
 */
export class Transportboard extends Tile {

    /**
     * Constructs a new Transportboard instance.
     *
     * @param      {<type>}  elemid        The elemid
     * @param      {<type>}  message_type  The message type
     * @param      {<type>}  move          The move
     * @param      {<type>}  transport     The transport
     * @param      {<type>}  clock         The clock
     * @param      {<type>}  options       The options
     */
    constructor(elemid, message_type, move, transport, clock, options) {
        super(elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.move = move
        this.transports = transport
        this.clock = clock
        this.lastLength = 0
        this.install()
    }


    /**
     * Installs the Transportboard.
     */
    install() {
        // let elhtml = document.getElementById("template-"+this.elemid)
        // let html == elhtml.innerHTML
        let html = `
            <div id='${ this.elemid }' class="transportboard">
                <table>
                    <caption>${ this.move }</caption>
                    <thead>
                        <tr>
                            <th>Transport</th>
                            <th>${ this.move == "arrival" ? "From" : "To "}</th>
                            <th>Time</th>
                            <th>Estimated</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>`

        let el = document.getElementById(this.elemid)
        el.innerHTML = html

        this.listen(this.update.bind(this))
    }


    /**
     * Listerner function for msgtype Transportboard events.
     *
     * @param      {<type>}   msgtype  The msgtype
     * @param      {<type>}   data     The data
     * @return     {boolean}  { description_of_the_return_value }
     */
    update(msgtype, data) {
        if (msgtype == TRANSPORTBOARD_MSG && this.move != data.move) {
            return false
        }


        function createTD(text, classes = "") {
            let td = document.createElement("td")
            classes.split(" ").forEach(classname => {
                if (classname && classname != "") {
                    td.classList.add(classname)
                }
            })
            td.innerHTML = text
            return td
        }


        let ts = this.clock.time
        if(msgtype == Clock.clock_message(this.options.update_time)) {
            ts = moment(data, moment.ISO_8601)
            // console.log("Transportboard::update_time: Updating for",data)
        }

        // sort transports to show most maxcount relevant transports for move
        // 1. Recently arrived
        // 2. Arriving soon
        // 3. Arriving later
        // Remove arrived more than 30min earlier
        let farr = []
        let that = this
        let maxahead = moment(ts).add(this.options.transports_ahead, "minutes")
        let transports = this.transports.getScheduledTransports(this.move, maxahead)

        transports.forEach(f => {
            let transport = that.transports.get(f)
            if(transport) {
                let showtransport = true
                if (transport.hasOwnProperty("removeAt")) {
                    if (transport.removeAt.isBefore(ts)) {
                        showtransport = false
                    }
                }
                if (showtransport) {
                    farr.push(transport)
                }
            } else {
                console.warn("Transportboard::update","cannot find transport", f)
            }
        })

        //farr = farr.sort((a, b) => (moment(getTime(a)).isAfter(moment(getTime(b)))))
        farr = farr.sort((a, b) => (moment(a[SCHEDULED]).isAfter(moment(b[SCHEDULED]))))
        farr = farr.splice(0, this.options.maxcount)

        // build table
        let tbody = document.createElement("tbody")
        for (let i = 0; i < farr.length; i++) {
            let transport = farr[i]

            if (true
                /*(count++ < maxcount)
                &&
                ((!transport.hasOwnProperty('removeAt')) ||
                    (transport.hasOwnProperty('removeAt') && transport.removeAt.isBefore(ts)))*/
            ) {
                let t = false
                let s = true
                let scolor = ""
                if (transport.hasOwnProperty(ACTUAL)) {
                    t = transport[ACTUAL]
                    if (transport.hasOwnProperty(SCHEDULED)) {
                        let diff = moment.duration(transport[ACTUAL].diff(transport[SCHEDULED])).asMinutes()
                        if (diff > this.options.announce_delay) {
                            transport.note = (this.move == DEPARTURE ? "Delayed +" : "Arrived +") + diff + " min"
                            s = false
                            scolor = "red"
                        }
                    }
                } else if (transport.hasOwnProperty(PLANNED)) {
                    t = transport[PLANNED]
                    if (transport.hasOwnProperty(SCHEDULED)) {
                        let diff = moment.duration(transport[PLANNED].diff(transport[SCHEDULED])).asMinutes()
                        if (diff > this.options.announce_delay) {
                            transport.note = "Delayed" // "Delayed "+diff+" min"
                            s = false
                        }
                    }
                    if (this.move == DEPARTURE && !transport.hasOwnProperty(ACTUAL)) {
                        let boarding = moment.duration(transport[PLANNED].diff(ts)).asMinutes()
                        if (boarding < this.options.announce_boarding) {
                            transport.note = boarding < this.options.announce_lastcall ? "LAST CALL" : "Loading"
                            scolor = boarding < this.options.announce_lastcall ? "red" : "green"
                        }
                    }
                }

                let tr = document.createElement("tr")
                tbody.appendChild(tr)

                tr.appendChild(createTD(transport.name, cnew))
                tr.appendChild(createTD(transport.airport, cnew))
                tr.appendChild(createTD(transport.hasOwnProperty(SCHEDULED) ? transport[SCHEDULED].format("HH.mm") : ".".repeat(5), cnew))
                tr.appendChild(createTD(t ? t.format("HH.mm") : ".".repeat(5), cupd))
                tr.appendChild(createTD(transport.note ? transport.note : "", scolor))
            }
        }

        // add empty lines to the board
        if (farr.length < this.options.maxcount) {
            const SPACE = "&nbsp;"
            for (let i = farr.length; i < this.options.maxcount; i++) {
                let tr = document.createElement("tr")
                tr.appendChild(createTD(SPACE.repeat(7)))
                tr.appendChild(createTD(SPACE.repeat(3)))
                tr.appendChild(createTD(SPACE.repeat(5)))
                tr.appendChild(createTD(SPACE.repeat(5)))
                tr.appendChild(createTD(SPACE))
                tbody.appendChild(tr)
            }
        }

        this.lastLength = farr.length

        let table = document.querySelector("#" + this.elemid + " table")
        let oldtbody = document.querySelector("#" + this.elemid + " tbody")
        table.replaceChild(tbody, oldtbody)
    }

}