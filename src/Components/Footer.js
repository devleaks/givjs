/*
 *  Stolen here: https://codepen.io/dope/pen/KJYMZz
 */
import moment from "moment"
import { Subscriber } from "./Subscriber"

import "../css/footer.css"

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


    update(msg, data) {
        this.say(data)
    }


    say(message) {
        this.message = message
        this.install()
    }
}