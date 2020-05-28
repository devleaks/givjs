/*
 *  Stolen here: https://codepen.io/dope/pen/KJYMZz
 */
import moment from "moment"
import { Subscriber } from "./Subscriber"

import "../css/footer.css"

/**
 * This class describes the HTML page footer.
 *
 * @class      Footer (name)
 */
export class Footer extends Subscriber {

    constructor(msgtype, message) {
        super(msgtype)
        this.message = message
        this.install()
    }


    install() {
        let el = document.getElementsByTagName("footer")
        if (el) { // there should only be one footer...
            let message = this.message
            el[0].innerHTML = `
            <div class="footer_copyright">&copy; 2015—-${ moment().year() } <a href="http://www.oscars-sa.eu/" title="Oscars s.a." alt="Oscars s.a.">Oscars s.a.</a></div>
            <div class="footer_message">${ message }</div>
            <div class="footer_byline">designed by <a href="https://github.com/devleaks" title="Devleaks' github" alt="Devleaks' github">devleaks</a></div>
            `
        }
        this.listen(this.update.bind(this))
    }


    /**
     * Listener for footer update messages.
     *
     * @param      {<type>}  msg     The message
     * @param      {<type>}  data    The data
     */
    update(msg, data) {
        this.say(data)
    }


    /**
     * Update footer's central text message. Should be one liner, max ~60 character long. (No check.)
     *
     * @param      {String}  message  The message to display.
     */
    say(message) {
        this.message = message
        this.install()
    }
}