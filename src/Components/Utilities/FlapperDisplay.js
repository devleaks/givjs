/*
 * Stolen from https://github.com/jayKayEss/Flapper
 * Cleaned, minimized, migrated to zepto. Only use jquery.flapper.js, flapdemo.js and css
 * Original code contains a lot of jQuery stuff, so I might not replace it anytime soon...
 * 
 */
import "zepto"
import "../../assets/css/flapperdisplay.css"
import { deepExtend } from "./Utils"


/* Custom VESTABOARD preset (See www.vestaboard.com)
 * Notes
 * Only uppercase characters
 * Lower case wroygbp produce blank white, red, orange, yellow, green, blue or purple "sign".
 * 
 * FlapperDisplay and Flapper default to this new custom VESTABOARD preset.
 * 
 */
export const VESTABOARD_PRESET = "vestaboard"

const VESTACOLORS = {
    w: VESTABOARD_PRESET + "-white",
    r: VESTABOARD_PRESET + "-red",
    o: VESTABOARD_PRESET + "-orange",
    y: VESTABOARD_PRESET + "-yellow",
    g: VESTABOARD_PRESET + "-green",
    b: VESTABOARD_PRESET + "-blue",
    p: VESTABOARD_PRESET + "-purple"
}
const _VESTAVALIDCHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$()^-_+&=;:*'" + '"' + ",.<>/" + String.fromCharCode(92) + "?|%"; // \ = ASCII 92
const VESTASET = _VESTAVALIDCHARS + Object.keys(VESTACOLORS).join("");




const PRESETS = {
    vestaboard: VESTASET.split(""),
    num: [" ", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    hexnum: [" ", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "0"],
    alpha: [" ", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    alphanum: [" ", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"
    ]
}

const DEFAULTS = {
    width: 23,
    format: null,
    align: "left",
    padding: " ",
    chars: null,
    chars_preset: VESTABOARD_PRESET,
    timing: 250,
    min_timing: 10,
    threshhold: 100,
    transform: false,
    on_anim_start: null,
    on_anim_end: null,
    prependToId: "Flap",
    colons: [],
    light: false
}

var _flappers = {}

class Flapper {

    constructor($ele, options) {
        let _this = this;
        this.id = Math.floor(Math.random() * 1000) + 1;
        this.$ele = $ele;
        this.options = $.extend({}, DEFAULTS, options);

        // is transform loaded?
        this.options.transform = this.options.transform && $.transform;

        this.$div = $("<div></div>");
        this.$div.attr("class", "flapper " + this.$ele.attr("class"));
        this.$ele.hide().after(this.$div);

        this.$ele.bind("change.flapper", function() {
            _this.update();
        });

        let flapperId = this.$ele[0].id || this.options.prependToId + this.id;
        this.$ele.attr("id", flapperId);
        _flappers[flapperId] = this;

        this.init();
    }

    init() {
        var _this = this;
        this.digits = [];

        for (let i = 0; i < this.options.width; i++) {
            this.digits[i] = new FlapDigit(null, this.options);
            this.$div.append(this.digits[i].$ele);
            this.$div.append($("<span>").addClass("vestacolon"));

            if(this.options.colons.indexOf(i) > -1) {
                this.$div.append($("<span>").html(":"));
                console.log("added span",i)
            }
        }

        this.$div.on("digitAnimEnd", function(e) {
            _this.onDigitAnimEnd(e);
        });

        if (this.options.on_anim_start) {
            this.$div.on("animStart", this.options.on_anim_start);
        }

        if (this.options.on_anim_end) {
            this.$div.on("animEnd", this.options.on_anim_end);
        }

        this.update();
    }

    update() {
        var value = this.$ele.val().replace(/[\s|\u00a0]/g, " ");
        var digits = this.getDigits(value);
        this.digitsFinished = 0;

        this.$div.trigger("animStart");

        for (var i = 0; i < this.digits.length; i++) {
            this.digits[i].goToChar(digits[i]);
        }
    }

    onDigitAnimEnd(e) {
        this.digitsFinished++;

        if (this.digitsFinished == this.options.width) {
            this.$div.trigger("animEnd");
        }
    }

    getDigits(val, length) {
        var strval = val + "";

        var digits = strval.split("");

        if (digits.length < this.options.width) {
            while (digits.length < this.options.width) {
                if (this.options.align == "left") {
                    digits.push(this.options.padding);
                } else {
                    digits.unshift(this.options.padding);
                }
            }
        } else if (digits.length > this.options.width) {
            var overage = digits.length - this.options.width;
            if (this.options.align == "left") {
                digits.splice(-1, overage);
            } else {
                digits.splice(0, overage);
            }
        }

        return digits;
    }

    addDigit() {
        var flapDigit = new FlapDigit(null, this.options);
        if (this.options.align === "left") {
            this.digits.push(flapDigit);
            this.$div.append(flapDigit.$ele);
        } else {
            this.digits.unshift(flapDigit);
            this.$div.prepend(flapDigit.$ele);
        }
        this.options.width = this.digits.length;
        return flapDigit;
    }

    removeDigit() {
        var flapDigit = (this.options.align === "left") ? this.digits.pop() : this.digits.shift();
        flapDigit.$ele.remove();
        this.options.width = this.digits.length;
    }

    performAction(action) {
        switch (action) {
            case "add-digit":
                this.addDigit();
                break;
            case "remove-digit":
                this.removeDigit();
                break;
        }
    }
}


class FlapDigit {

    constructor($ele, opts) {
        const htmlTemplate = "<div class='digit'><div class='back top'>&nbsp;</div>" +
            "<div class='back bottom'>&nbsp;</div>" +
            "<div class='front top'>&nbsp;</div>" +
            "<div class='front bottom'>&nbsp;</div></div>"

        this.options = opts;

        if (!this.options.chars) {
            this.options.chars = PRESETS[this.options.chars_preset];
        }

        this.pos = 0;
        this.timeout;

        if (!$ele) {
            this.$ele = $(htmlTemplate);
        } else {
            this.$ele = $ele;
        }

        this.$prev = this.$ele.find(".front.top, .back.bottom");
        this.$next = this.$ele.find(".back.top, .front.bottom");
        this.$back_top = this.$ele.find(".back.top");
        this.$back_bottom = this.$ele.find(".back.bottom");
        this.$front_top = this.$ele.find(".front.top");
        this.$front_bottom = this.$ele.find(".front.bottom");

        this.initialize();
    }


    initialize() {
        this.$prev.html(this.options.chars[0]);
        this.$next.html(this.options.chars[0]);
    }

    increment(speed) {
        var next = this.pos + 1;
        if (next >= this.options.chars.length) {
            next = 0;
        }

        this.removeVestaClass(this.$prev.parent())
        if (this.pos >= _VESTAVALIDCHARS.length) {
            this.$prev.html(" ").show();
            this.$prev.parent().addClass(VESTACOLORS[this.options.chars[this.pos]])
        } else {
            this.$prev.html(this.options.chars[this.pos]).show();
        }

        this.$front_bottom.hide();

        if (next >= _VESTAVALIDCHARS.length) {
            this.$next.html(" ").show();
            this.removeVestaClass(this.$next.parent())
            this.$next.parent().addClass(VESTACOLORS[this.options.chars[next]])
        } else {
            if (next == 0) {
                this.removeVestaClass(this.$next.parent())
            }
            this.$next.html(this.options.chars[next]);
        }


        var speed1 = Math.floor(Math.random() * speed * .4 + speed * .3);
        var speed2 = Math.floor(Math.random() * speed * .1 + speed * .2);

        if (speed >= this.options.threshhold) {
            if (this.options.transform) {
                this.animateSlow(speed1, speed2);
            } else {
                this.animateFast(speed1, speed2);
            }
        }

        this.pos = next;
    }

    animateSlow(speed1, speed2) {
        var _this = this;

        this.$back_top.show();
        this.$front_bottom.transform({ scaleY: 0.0 });
        this.$front_top.transform({ scaleY: 1.0 }).stop().show().animate({ scaleY: 0.0 }, speed1, "swing", function() {
            _this.$front_bottom.stop().show().animate({ scaleY: 1.0 }, speed2, "linear");
            _this.$front_top.hide().transform({ scaleY: 1.0 });
        });
    }

    animateFast(speed1, speed2) {
        var _this = this;

        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(function() {
            _this.$front_top.hide();

            _this.timeout = setTimeout(function() {
                _this.$front_bottom.show();

            }, speed2);
        }, speed1);
    }

    goToPosition(pos) {
        var _this = this;

        var frameFunc = function() {
            if (_this.timing_timer) {
                clearInterval(_this.timing_timer);
                _this.timing_timer = null;
            }

            var distance = pos - _this.pos;
            if (distance < 0) {
                distance += _this.options.chars.length;
            }

            if (_this.pos == pos) {
                clearInterval(_this.timing_timer);
                _this.timing_timer = null;
                _this.$ele.trigger("digitAnimEnd");
            } else {
                var duration = Math.floor(
                    (_this.options.timing - _this.options.min_timing) / distance + _this.options.min_timing
                );
                _this.increment(duration);
                _this.timing_timer = setTimeout(frameFunc, duration);
            }

        }

        frameFunc();
    }


    removeVestaClass(el) {
        Object.values(VESTACOLORS).forEach((color) => {
            if (el.hasClass(color)) {
                el.removeClass(color)
            }
        })
    }

    doVestaColor(c) {
        var pos = $.inArray(c, this.options.chars);
        var spc = $.inArray(" ", this.options.chars);

        if (pos == -1) {
            pos = spc
        }

        if (VESTACOLORS.hasOwnProperty(c)) {
            this.goToPosition(pos);
            this.$ele.addClass(VESTACOLORS[c])
        } else {
            this.goToPosition(pos);
            this.removeVestaClass(this.$ele)
        }
        return true;
    }

    goToChar(c) {
        var pos = $.inArray(c, this.options.chars);

        if (pos == -1) {
            if (this.options.chars_preset == VESTABOARD_PRESET) { // in vestaboard, replace non existant chars with SPACE
                pos = $.inArray(" ", this.options.chars);
            } else {
                this.options.chars.push(c);
                pos = this.options.chars.length - 1;
            }
        }

        this.goToPosition(pos);
    }
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


const FLAPPER_DISPLAY_DEFAULTS = {
    width: 20,
    height: 6,
    size: "S",
    preset: VESTABOARD_PRESET
}

export class FlapperDisplay {

    /**
     * Constructs a new Solari instance.
     *
     * @param      {<type>}  msgtype  The msgtype
     * @param      {<type>}  message  The message
     */
    constructor(elemid, message, options) {
        this.elemid = elemid
        this.options = deepExtend(FLAPPER_DISPLAY_DEFAULTS, options)

        console.log("FlapperDisplay::constructor", this.options)

        this.timers = []
        this.line_delay = 300;
        this.screen_delay = 7000;

        let el = document.getElementById(this.elemid)

        let div = document.createElement("div")
        div.classList.add("displays")
        for (let i = 0; i < this.options.height; i++) {
            let line = document.createElement("input")
            line.classList.add("display")
            line.classList.add(this.options.size)
            if (this.options.light) {
                line.classList.add("display")
            }
            div.appendChild(line)
        }
        el.appendChild(div)

        // install custom/modified Flapper
        this.flappers = []
        this.displays = $("input.display")
        this.num_lines = this.displays.length

        this.displays.forEach((d) => {
            let f = new Flapper($(d), {
                chars_preset: this.options.preset,
                align: "left",
                width: this.options.width
            })
            this.flappers.push(f)
        })

        this.display(message)
    }


    updateDisplay() {
        var that = this
        var timeout = 100

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


    display(text) {
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