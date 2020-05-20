/*
 *
 */
import { Subscriber } from "../Subscriber"
import { deepExtend } from "../Utilities"
import moment from "moment"

import "../../css/clock.css"

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


    run() {
        let refresh = this.options.refresh * 1000;
        this.clock()
        if (this.running) {
            clearInterval(this.running)
            delete this.running
        }
        this.running = setInterval(this.clock.bind(this), refresh)
    }


    clock() {
        this.date.add(this.options.inc, "seconds")

        const hour = this.date.hours() * 30
        const minute = this.date.minutes() * 6
        const second = this.date.seconds() * 6

        document.querySelector('.hour').style.transform = `rotate(${hour}deg)`
        document.querySelector('.minute').style.transform = `rotate(${minute}deg)`
        document.querySelector('.second').style.transform = `rotate(${second}deg)`
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

        this.listen(this.updateClock.bind(this))
    }


    setClock(d) {
        this.date = d
        this.run()
    }


    setInc(inc) {
        this.options.inc = inc
        this.run()
    }

    setRefresh(inc) {
        this.options.refresh = refresh
        this.run()
    }


    // update display (html table)
    updateClock(msgtype, data) {
        console.log("Clock::updateClock", msgtype, data)
        switch(msgtype) {
            case "datetime":
            this.setClock(moment(data), moment.ISO_8601)
            break
            case "siminfo":
            this.setClock(moment(data.timestamp), moment.ISO_8601)
            this.setInc(data.speed)
        }
    }
}