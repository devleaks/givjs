/*
 *  Stolen from https://codepen.io/dope/pen/KJYMZz
 */
import PubSub from "pubsub-js"
import moment from "moment"

import { Subscriber } from "./Subscriber"
import { deepExtend } from "./Utils/Utilities"


import { CLOCK_MSG, SIMULATION_MSG } from "./Constant"

import "../assets/css/clock.css"

const DEFAULTS = {
    refresh: 1, //seconds
    inc: 1, // seconds
    log: false,
    morethan: [ // minutes
        1,
        2,
        5,
        10,
        15,
        20,
        30,
        60,
        120
    ]
}

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
     * Update clokc
     *
     * @param      {String}  msgtype  The msgtype
     * @param      {String}  data     The time as ISO 8601 formatted string.
     */
    update(msgtype, data) {
        if (this.options.log) {
            console.log("Clock::updateClock", msgtype, data)
        }
        switch (msgtype) {
            case CLOCK_MSG:
                this.setClock(moment(data, moment.ISO_8601))
                this.morethanEmit()
                break
            case SIMULATION_MSG:
                this.setClock(moment(data.timestamp, moment.ISO_8601))
                this.setInc(data.speed)
                break
            default:
                console.log("Clock::update: Received default", msgtype)
                break
        }
    }

    /**
     * Generates CLOCK_MSG.{DELAY} messages for Tile updates.
     * Example: CLOCK_MSG.15 generates a message whenever 15 minutes elapsed since last generation of CLOCK_MSG.15.
     */
    morethanEmit() {
        this.options.morethan.forEach((delay) => {
            let lasttime = this.morethan.get(delay)
            if (lasttime) {
                const d = moment.duration(this.date.diff(lasttime)).asMinutes()

                console.log("Clock::morethan", delay, d, d > delay, lasttime.toISOString(true), this.date.toISOString(true))
                if (d > delay) {
                    console.log("Clock::morethan: EMIT", CLOCK_MSG + "." + delay, this.date.toISOString(true))
                    this.morethan.set(delay, this.date)
                    PubSub.publish(CLOCK_MSG + "." + delay, this.date.toISOString(true))
                }
            } else {
                console.log("Clock::morethan: setting", delay, this.date.toISOString(true))
                this.morethan.set(delay, this.date)
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