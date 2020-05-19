/*
 *
 */
import { Subscriber } from "../Subscriber"
import { deepExtend } from "../Utilities"
import moment from "moment"

import "../../css/clock.css"

const DEFAULTS = {
    inc: 1000
}

export class Clock extends Subscriber {

    constructor(elemid, msgtype, options) {
        super(msgtype)
        this.options = deepExtend(DEFAULTS, options)
        this.elemid = elemid
        this.install()
        this.run()
    }


    run() {
        let inc = this.options.inc;
        this.clock()
        setInterval(this.clock.bind(this), inc)
    }


    clock(d = false) {
        const date = d ? d : new Date();

        const hours = ((date.getHours() + 11) % 12 + 1);
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        const hour = hours * 30;
        const minute = minutes * 6;
        const second = seconds * 6;

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


    // update display (html table)
    updateClock(msgtype, date) {
        let dt = moment(date)
        clock(dt.toDate())
    }
}