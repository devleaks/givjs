/*
 *  Stolen from https://codepen.io/dope/pen/KJYMZz
 */
import PubSub from "pubsub-js"
import moment from "moment"

import { Subscriber } from "./Subscriber"
import { deepExtend } from "./Utilities/Utils"


import { CLOCK_MSG, CLOCK_TICKS, SIMULATION_MSG } from "./Constant"

import "../assets/css/clock.css"

const DEFAULTS = {
    refresh: 1, //seconds
    inc: 1, // seconds
    log: false
}

/**
 * This class describes the dashboard's clock, whether it is live or simulated.
 * The Clock udpate mechanism exploit the wonderful message type hierarchy of pubsubjs.
 * The clock eats all messages of its type and spit messages when a certain number of minutes have elapsed.
 *
 * @class      Clock (name)
 */
export class Clock extends Subscriber {

    constructor(elemid, msgtype, options) {
        super(msgtype)
        this.options = deepExtend(DEFAULTS, options)
        this.elemid = elemid
        this.date = moment()
        this.morethan = new Map()
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
     * Update clock
     *
     * @param      {String}  msgtype  The msgtype
     * @param      {String}  data     The time as ISO 8601 formatted string.
     */
    update(msgtype, data) {
        if (this.options.log) {
            console.log("Clock::update", msgtype, data)
        }
        switch (msgtype) {
            case CLOCK_MSG:
                this.setClock(moment(data, moment.ISO_8601))
                break
            case SIMULATION_MSG:
                this.setClock(moment(data.timestamp, moment.ISO_8601))
                this.setInc(data.speed)
                break
            default: // Ignore CLOCK_MSG.{DELAY} messages
                break
        }
    }

    /**
     * Generates CLOCK_MSG.{DELAY} messages for Tile updates.
     * Example: CLOCK_MSG.15 generates a message whenever 15 minutes elapsed since last generation of CLOCK_MSG.15.
     */
    morethanEmit() {
        CLOCK_TICKS.forEach((delay) => {
            let lasttime = this.morethan.get(delay)
            // console.log("Clock::morethanEmit: get", CLOCK_MSG + "." + delay, lasttime)
            if (lasttime) {
                lasttime = moment(lasttime)
                const d = moment.duration(this.date.diff(lasttime)).asMinutes()
                if (d > delay) {
                    /*if (this.options.log) {
                        console.log("Clock::morethanEmit", Clock.clock_message(delay), this.date.toISOString(true), lasttime.toISOString(true), d)
                    }*/
                    // console.log("Clock::morethanEmit: EMIT", CLOCK_MSG + "." + delay, this.date.toISOString(true), lasttime.toISOString(true), d)
                    this.morethan.set(delay, this.date.toISOString())
                    PubSub.publish(Clock.clock_message(delay)
                        , this.date.toISOString(true))
                }
            } else {
                // console.log("Clock::morethanEmit: set", CLOCK_MSG + "." + delay, this.date.toISOString(true))
                this.morethan.set(delay, this.date.toISOString())
            }
        })
    }

    /**
     * Paint updated clock
     */
    clock() {
        this.date.add(this.options.inc, "seconds")
        this.date.local()

        const seconds = this.date.seconds() * 6
        const minutes = this.date.minutes() * 6
        const hours = this.date.hours() * 30 + Math.floor(this.date.minutes() / 2)

        document.querySelector(".second").style.transform = `rotate(${seconds}deg)`
        document.querySelector(".minute").style.transform = `rotate(${minutes}deg)`
        document.querySelector(".hour").style.transform = `rotate(${hours}deg)`

        this.morethanEmit()
    }


    setClock(d) {
        if (this.running) {
            clearInterval(this.running)
            delete this.running
        }
        // console.log("Clock::setClock:", d.isBefore(this.date), d.toISOString(true), this.date.toISOString(true))
        if (d.isBefore(this.date)) { //back to the future
            console.log("Clock::setClock: rewinding time")
            CLOCK_TICKS.forEach((delay) => {
                let lasttime = this.morethan.get(delay)
                if (lasttime) {
                    lasttime = moment(lasttime)
                    if (lasttime.isAfter(d)) {
                        // console.log("Clock::setClock: back to the future", delay, lasttime.toISOString(), d.toISOString())
                        this.morethan.set(delay, d.toISOString())
                    }
                }
            })
        }
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
    get time() {
        return this.date
    }

    static clock_message(i) {
        return CLOCK_TICKS.indexOf(i) > -1 ? CLOCK_MSG + "." + i : CLOCK_MSG
    }
}