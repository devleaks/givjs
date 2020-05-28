/*
 *  Stolen here: https://codepen.io/dope/pen/KJYMZz
 */
import { Subscriber } from "./Subscriber"
import { deepExtend } from "./Utilities"
import moment from "moment"


import { CLOCK_MSG, SIMULATION_MSG } from "./Constant"

import "../css/clock.css"

const DEFAULTS = {
    refresh: 1, //seconds
    inc: 1 // seconds
}

export class Clock extends Subscriber {

    constructor(elemid, msgtype, options) {
        super(msgtype)
        this.options = deepExtend(DEFAULTS, options)
        this.elemid = elemid
        this.date = moment()
        this.install()
        this.run()
    }


    install() {
        let el = document.getElementById(this.elemid)
        el.innerHTML = `
                    <div class="clock">
                      <div class="wrap">
                        <span class="hour"></span>
                        <span class="minute"></span>
                        <span class="second"></span>
                        <span class="dot"></span>
                      </div>
                    </div>`

        this.listen(this.update.bind(this))
    }


    /**
     * Starts clock ticking.
     */
    run() {
        let refresh = this.options.refresh * 1000;
        if (this.running) {
            clearInterval(this.running)
            delete this.running
        }
        this.clock() // now
        this.running = setInterval(this.clock.bind(this), refresh)
    }


    /**
     * Update clokc
     *
     * @param      {String}  msgtype  The msgtype
     * @param      {String}  data     The time as ISO 8601 formatted string.
     */
    update(msgtype, data) {
        console.log("Clock::updateClock", msgtype, data)
        switch(msgtype) {
            case CLOCK_MSG:
            this.setClock(moment(data), moment.ISO_8601)
            break
            case SIMULATION_MSG:
            this.setClock(moment(data.timestamp), moment.ISO_8601)
            this.setInc(data.speed)
        }
    }


    /**
     * Paint updated clock
     */
    clock() {
        this.date.add(this.options.inc, "seconds")
        this.date.local()

        const seconds = this.date.seconds() * 6
        const minutes = this.date.minutes() * 6
        const hours = this.date.hours() * 30 + Math.floor( this.date.minutes() / 2 )

        document.querySelector(".second").style.transform = `rotate(${seconds}deg)`
        document.querySelector(".minute").style.transform = `rotate(${minutes}deg)`
        document.querySelector(".hour").style.transform = `rotate(${hours}deg)`
    }


    setClock(d) {
        this.date = d
        this.run()
    }


    setInc(inc) {
        this.options.inc = inc
        this.run()
    }

    setRefresh(refresh) {
        this.options.refresh = refresh
        let refreshms = this.options.refresh * 1000;
        if (this.running) {
            clearInterval(this.running)
            delete this.running
        }
        this.running = setInterval(this.clock.bind(this), refreshms)
        this.run()
    }


    /**
     * Return clock's current date/time as moment object.
     *
     * @type       {Object}     Simulated clock date/time as moment object.
     */
    get() {
        return this.date
    }
}