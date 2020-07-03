/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */

import { Tile } from "../Tile"
import { deepExtend } from "../Utilities/Utils"

import "../../assets/css/solari.css"

import "zepto"
import "../../assets/js/flapper.js"

const DEFAULTS = {
    width: 23,
    format: null,
    align: "left",
    padding: " ",
    chars: null,
    chars_preset: "vestaboard",
    timing: 250,
    min_timing: 10,
    threshhold: 100,
    transform: false,
    on_anim_start: null,
    on_anim_end: null
}


class FlapBuffer {

    constructor(wrap, num_lines) {
        this.wrap = wrap
        this.num_lines = num_lines
        this.line_buffer = ""
        this.buffers = []
        this.cursor = 0
        this.buffers.push([])
    }

    pushLine(line) {
        if (this.buffers[this.cursor].length < this.num_lines) {
            this.buffers[this.cursor].push(line)
        } else {
            this.buffers.push([])
            this.cursor++
            this.pushLine(line)
        }
    }

    pushWord(word) {
        if (this.line_buffer.length == 0) {
            this.line_buffer = word
        } else if ((word.length + this.line_buffer.length + 1) <= this.wrap) {
            this.line_buffer += " " + word
        } else {
            this.pushLine(this.line_buffer)
            this.line_buffer = word
        }
    }

    flush() {
        if (this.line_buffer.length) {
            this.pushLine(this.line_buffer)
            this.line_buffer = ""
        }
    }

    getBuffers() {
        return this.buffers
    }

}

/**
 * This class describes the HTML page footer.
 *
 * @class      Footer (name)
 */
export class Solari extends Tile {

    /**
     * Constructs a new Solari instance.
     *
     * @param      {<type>}  msgtype  The msgtype
     * @param      {<type>}  message  The message
     */
    constructor(elemid, msgtype, message, options) {
        super(elemid, msgtype)
        this.options = deepExtend(DEFAULTS, options)

        this.timers = []
        this.line_delay = 300;
        this.screen_delay = 7000;

        this.install()
        this.say(message)
    }


    /**
     * Installs the footer on the HTML page.
     * (Template should be externalized in <template> or pug file.)
     */
    install() {
        let el = document.getElementById(this.elemid)

        let div = document.createElement("div")
        div.classList.add("displays")
        for (let i = 0; i < 7; i++) {
            let line = document.createElement("input")
            line.classList.add("display")
            line.classList.add("XXS")
            div.appendChild(line)
        }
        el.appendChild(div)

        // install custom/modified Flapper
        this.displays = $("input.display")
        this.num_lines = this.displays.length
        this.displays.flapper({
            chars_preset: "vestaboard",
            align: "left",
            width: 23
        })

        this.listen(this.update.bind(this))
    }


    updateDisplay() {
        var that = this
        var timeout = 100

        console.log("Solari::updateDisplay", that.buffers)

        for (let i in that.buffers) {

            that.displays.each(function(j) {

                var display = $(that.displays[j]);

                (function(i, j) {
                    that.timers.push(setTimeout(function() {
                        if (that.buffers[i][j]) {
                            display.val(that.buffers[i][j]).change();
                        } else {
                            display.val("").change();
                        }
                    }, timeout));
                }(i, j));

                timeout += that.line_delay
            });

            timeout += that.screen_delay
        }
    }


    stopDisplay() {
        for (let i in this.timers) {
            clearTimeout(this.timers[i])
        }
        this.timers = []
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
     * Update footer"s central text message. Should be one liner, max ~60 character long. (No check.)
     *
     * @param      {String}  message  The message to display.
     */
    say(text) {
        let buffer = new FlapBuffer(this.options.width, this.num_lines);
        var lines = Array.isArray(text) ? text : text.split(/\n/);

        for (let i in lines) {
            var words = lines[i].split(/\s/)
            for (let j in words) {
                buffer.pushWord(words[j])
            }
            buffer.flush()
        }

        buffer.flush()
        this.buffers = buffer.getBuffers()
        this.stopDisplay()
        this.updateDisplay()
    }
}