/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import "../../assets/css/flightboard.css"

import { deepExtend } from "../Utilities/Utils"
import { Tile } from "../Tile"
import { Clock } from "../Clock"
import moment from "moment"

import { FLIGHTBOARD_MSG, SCHEDULED, PLANNED, ACTUAL, DEPARTURE } from "../Constant"

import { flipper } from "../../assets/js/flipper.js"

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    elemid: "flightboard",
    msgtype: "flightboard",
    maxcount: 12,
    solari: true,
    announce_delay: 15,  // min. After, announce flight is delayed.
    announce_boarding: 40,
    announce_lastcall: 20,
    update_time: 15,
    flights_ahead: 360 // min
}

const SOLARI = "solari",
    Mdefault = "<span class='left off'></span><span class='right off'></span>",
    Msuccess = "<span class='left green'></span><span class='right off'></span>",
    Mdanger = "<span class='left off'></span><span class='right red'></span>",
    Mboarding = "<span class='left off boarding-left'></span><span class='right off boarding-right'></span>"



export class Flightboard extends Tile {

    constructor(elemid, message_type, move, transport, options) {
        super(elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.move = move
        this.flights = transport
        this.lastLength = 0
        this.install()
    }


    /*  installs the HTML code in the document
     */
    install() {
        // let elhtml = document.getElementById("template-"+this.elemid)
        // let html == elhtml.innerHTML
        let html = `
<div id='${ this.elemid }' class="flightboard">
    <table>
        <caption>${ this.move }</caption>
        <thead>
            <tr>
                <th>Flight</th>
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


    // update display (html table)
    update(msgtype, data) {
        /*
        function getTime(f) { // returns the most recent known time for flight
            let t = f.hasOwnProperty(SCHEDULED) ? f[SCHEDULED] : false
            if (f[ACTUAL]) {
                t = f[ACTUAL]
            } else if (f[PLANNED]) {
                t = f[PLANNED]
            }
            return t
        }
        */
        if (msgtype == FLIGHTBOARD_MSG && this.move != data.move) {
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


        let ts = moment() // default to now
        if(msgtype == Clock.clock_message(this.options.update_time)) {
            ts = moment(data, moment.ISO_8601)
            console.log("Flightboard::update_time: Updating for",data)
        }

        // sort flights to show most maxcount relevant flights for move
        // 1. Recently landed
        // 2. Arriving soon
        // 3. Arriving later
        // Remove landed more than 30min earlier
        let scroll = true // will flip true if first line is removed (and all subsequent lines move up)
        let farr = []
        let that = this
        let maxahead = moment(ts).add(this.options.flights_ahead, "minutes")
        let flights = this.flights.getScheduledTransports(this.move, maxahead)

        flights.forEach(f => {
            let flight = that.flights.get(f.name)
            let showflight = true
            if (flight.hasOwnProperty("removeAt")) {
                if (flight.removeAt.isBefore(ts)) {
                    showflight = false
                }
            }
            if (showflight) {
                farr.push(flight)
            }
        })

        //farr = farr.sort((a, b) => (moment(getTime(a)).isAfter(moment(getTime(b)))))
        farr = farr.sort((a, b) => (moment(a[SCHEDULED]).isAfter(moment(b[SCHEDULED]))))
        farr = farr.splice(0, this.options.maxcount)

        //update simple graph
        /* 
        let hourNow = ts.hours()
        hours = hours.concat(hours)
        let forecast = hours.slice(hourNow, hourNow + 6)
        Oscars.Omap.updateChart(move, [{
            name: "Arrival',
            data: forecast
        }])
        */

        // build table
        let tbody = document.createElement("tbody")
        for (let i = 0; i < farr.length; i++) {
            let flight = farr[i]

            if (true
                /*(count++ < maxcount)
                &&
                ((!flight.hasOwnProperty('removeAt')) ||
                    (flight.hasOwnProperty('removeAt') && flight.removeAt.isBefore(ts)))*/
            ) {
                let t = false
                let s = true
                let cnew = ""
                let cupd = ""
                let status = Mdefault
                let scolor = ""
                if (flight.hasOwnProperty(ACTUAL)) {
                    t = flight[ACTUAL]
                    if (flight.hasOwnProperty(SCHEDULED)) {
                        let diff = moment.duration(flight[ACTUAL].diff(flight[SCHEDULED])).asMinutes()
                        if (diff > this.options.announce_delay) {
                            flight.note = (this.move == DEPARTURE ? "Delayed +" : "Landed +") + diff + " min"
                            s = false
                            scolor = "red"
                        }
                    }
                    status = Mdefault
                    if (flight.isnew) {
                        flight.isnew = false
                        cupd = SOLARI
                    }
                } else if (flight.hasOwnProperty(PLANNED)) {
                    t = flight[PLANNED]
                    if (flight.hasOwnProperty(SCHEDULED)) {
                        let diff = moment.duration(flight[PLANNED].diff(flight[SCHEDULED])).asMinutes()
                        if (diff > this.options.announce_delay) {
                            flight.note = "Delayed" // "Delayed "+diff+" min"
                            s = false
                        }
                    }
                    if (flight.isnew) {
                        flight.isnew = false
                        cupd = SOLARI
                    }
                    status = s ? Msuccess : Mdanger
                    if (this.move == DEPARTURE && !flight.hasOwnProperty(ACTUAL)) {
                        let boarding = moment.duration(flight[PLANNED].diff(ts)).asMinutes()
                        if (boarding < this.options.announce_boarding) {
                            status = Mboarding // :-)
                            flight.note = boarding < this.options.announce_lastcall ? "LAST CALL" : "Boarding"
                            scolor = boarding < this.options.announce_lastcall ? "red" : "green"
                        }
                    }
                } else {
                    if (flight.isnew) {
                        flight.isnew = false
                        cnew = SOLARI
                    }
                }

                if (scroll && flight.hasOwnProperty("position") && flight.position != i) { // the entire line moves and changes
                    cnew = SOLARI
                    cupd = SOLARI
                }

                let tr = document.createElement("tr")
                tbody.appendChild(tr)

                tr.appendChild(createTD(flight.name, cnew))
                tr.appendChild(createTD(flight.airport, cnew))
                tr.appendChild(createTD(flight.hasOwnProperty(SCHEDULED) ? flight[SCHEDULED].format("HH.mm") : ".".repeat(5), cnew))
                tr.appendChild(createTD(t ? t.format("HH.mm") : ".".repeat(5), cupd))
                tr.appendChild(createTD(flight.note ? flight.note : "", scolor))

                let td = document.createElement("td")
                let sdiv = document.createElement("div")
                sdiv.classList.add("status")
                sdiv.innerHTML = status
                td.appendChild(sdiv)
                tr.appendChild(td)

                flight.newposition = i
            }
        }

        // add empty lines to the board
        if (farr.length < this.options.maxcount) {
            for (let i = farr.length; i < this.options.maxcount; i++) {
                let tr = document.createElement("tr")
                let clin = i < this.lastLength ? SOLARI : "" // simulate return to blank
                tr.appendChild(createTD(".".repeat(7), clin))
                tr.appendChild(createTD(".".repeat(3), clin))
                tr.appendChild(createTD(".".repeat(5), clin))
                tr.appendChild(createTD(".".repeat(5), clin))
                tr.appendChild(createTD(""))

                let td = document.createElement("td")
                let sdiv = document.createElement("div")
                sdiv.classList.add("status")
                sdiv.innerHTML = Mdefault
                td.appendChild(sdiv)

                tr.appendChild(td)
                tbody.appendChild(tr)
            }
        }

        this.lastLength = farr.length


        // Reset position of lines off the board...
        flights.forEach(f => {
            delete f.position
            if (f.hasOwnProperty("newposition")) {
                f.position = f.newposition
                delete f.newposition
            }
        })

        /*$('.scrolling').textMarquee({
            mode: "loop"
        })*/
        let table = document.querySelector("#" + this.elemid + " table")
        let oldtbody = document.querySelector("#" + this.elemid + " tbody")
        table.replaceChild(tbody, oldtbody)

        // sugar flipper
        if (this.options.solari) {
            let els = document.getElementsByClassName(SOLARI)
            if (els && els.length > 0) {
                for (let i = 0; i < els.length; i++) {
                    let el = els[i]
                    el.classList.remove(SOLARI)
                    let s = new flipper(el);
                    s.start();
                }
            } else {
                console.warn("Flightboard::update: no solari class")
            }
        }
    }

}