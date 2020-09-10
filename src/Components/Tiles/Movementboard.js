/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import "../../assets/css/movementboard.css"

import { deepExtend } from "../Utilities/Utils"
import { Tile } from "./Tile"
import { Clock } from "../Clock"
import moment from "moment"

import { MOVEMENTBOARD_MSG, SCHEDULED, PLANNED, ACTUAL, DEPARTURE } from "../Constant"


/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    elemid: "movementboard",
    msgtype: "movementboard",
    maxcount: 12,
    announce_delay: 15, // min. After, announce movement is delayed.
    announce_boarding: 40,
    announce_lastcall: 20,
    update_time: 15,
    movements_ahead: 360 // min
}

/**
 * Display an HTML table as a Movementboard.
 *
 * @class      Movementboard (name)
 */
export class Movementboard extends Tile {

    /**
     * Constructs a new Movementboard instance.
     *
     * @param      {<type>}  elemid        The elemid
     * @param      {<type>}  message_type  The message type
     * @param      {<type>}  move          The move
     * @param      {<type>}  movement     The movement
     * @param      {<type>}  clock         The clock
     * @param      {<type>}  options       The options
     */
    constructor(elemid, message_type, move, movement, clock, options) {
        super(elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.move = move
        this.movements = movement
        this.clock = clock
        this.lastLength = 0
        this.install()
    }


    /**
     * Installs the Movementboard.
     */
    install() {
        // let elhtml = document.getElementById("template-"+this.elemid)
        // let html == elhtml.innerHTML
        let html = `
            <div id='${ this.elemid }' class="movementboard">
                <table>
                    <caption>${ this.move }</caption>
                    <thead>
                        <tr>
                            <th>Movement</th>
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
     * Listerner function for msgtype Movementboard events.
     *
     * @param      {<type>}   msgtype  The msgtype
     * @param      {<type>}   data     The data
     * @return     {boolean}  { description_of_the_return_value }
     */
    update(msgtype, data) {
        if (msgtype == MOVEMENTBOARD_MSG && this.move != data.move) {
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
        if (msgtype == Clock.clock_message(this.options.update_time)) {
            ts = moment(data, moment.ISO_8601)
            // console.log("Movementboard::update_time: Updating for",data)
        }

        // sort movements to show most maxcount relevant movements for move
        // 1. Recently arrived
        // 2. Arriving soon
        // 3. Arriving later
        // Remove arrived more than 30min earlier
        let farr = []
        let that = this
        let maxahead = moment(ts).add(this.options.movements_ahead, "minutes")
        let movements = this.movements.getScheduledMovements(this.move, maxahead)

        movements.forEach(f => {
            let movement = that.movements.get(f)
            if (movement) {
                let showmovement = true
                if (movement.hasOwnProperty("removeAt")) {
                    if (movement.removeAt.isBefore(ts)) {
                        showmovement = false
                    }
                }
                if (showmovement) {
                    farr.push(movement)
                }
            } else {
                console.warn("Movementboard::update", "cannot find movement", f)
            }
        })

        //farr = farr.sort((a, b) => (moment(getTime(a)).isAfter(moment(getTime(b)))))
        farr = farr.sort((a, b) => (moment(a[SCHEDULED]).isAfter(moment(b[SCHEDULED]))))
        farr = farr.splice(0, this.options.maxcount)

        // build table
        let tbody = document.createElement("tbody")
        for (let i = 0; i < farr.length; i++) {
            let movement = farr[i]

            if (true
                /*(count++ < maxcount)
                &&
                ((!movement.hasOwnProperty('removeAt')) ||
                    (movement.hasOwnProperty('removeAt') && movement.removeAt.isBefore(ts)))*/
            ) {
                let t = false
                let scolor = ""
                if (movement.hasOwnProperty(ACTUAL)) {
                    t = movement[ACTUAL]
                    if (movement.hasOwnProperty(SCHEDULED)) {
                        let diff = moment.duration(movement[ACTUAL].diff(movement[SCHEDULED])).asMinutes()
                        if (diff > this.options.announce_delay) {
                            movement.note = (this.move == DEPARTURE ? "Delayed +" : "Arrived +") + diff + " min"
                            scolor = "red"
                        }
                    }
                } else if (movement.hasOwnProperty(PLANNED)) {
                    t = movement[PLANNED]
                    if (movement.hasOwnProperty(SCHEDULED)) {
                        let diff = moment.duration(movement[PLANNED].diff(movement[SCHEDULED])).asMinutes()
                        if (diff > this.options.announce_delay) {
                            movement.note = "Delayed" // "Delayed "+diff+" min"
                        }
                    }
                }

                let tr = document.createElement("tr")
                tr.appendChild(createTD(movement.name))
                tr.appendChild(createTD(movement.destination))
                tr.appendChild(createTD(movement.hasOwnProperty(SCHEDULED) ? movement[SCHEDULED].format("HH:mm") : ""))
                tr.appendChild(createTD(t ? t.format("HH:mm") : ""))
                tr.appendChild(createTD(movement.note ? movement.note : "", scolor))
                tbody.appendChild(tr)
            }
        }

        // add empty lines to the board
        if (farr.length < this.options.maxcount) {
            const SPACE = "&nbsp;"
            for (let i = farr.length; i < this.options.maxcount; i++) {
                let tr = document.createElement("tr")
                tr.appendChild(createTD(SPACE))
                tr.appendChild(createTD(SPACE))
                tr.appendChild(createTD(SPACE))
                tr.appendChild(createTD(SPACE))
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