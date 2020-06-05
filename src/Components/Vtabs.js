/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 */
import "../assets/css/tabs-v.css"

/*
 * https://codepen.io/_massimo/pen/oYWbqL
 * https://codepen.io/tari/pen/mVdLXy/

  <input type="radio" name="name" checked="checked">
  <div class='tab-card'>
    <h1>Wire</h1>
    <div class="aside-card" id="wire"></div>
  </div>

 *
 */

export class Vtabs {

    constructor(elemid, labels) {
        this.elemid = elemid
        this.labels = labels
        this.install()
    }

    install() {
        let el = document.getElementById(this.elemid)

        this.labels.forEach( (label, i) => {
            // tab "button"
            let b = document.createElement("input")
            b.setAttribute("type", "radio")
            b.setAttribute("name", "rad")
            b.setAttribute("id", "rad" + i)
            el.appendChild(b)

            // tab label
            let l = document.createElement("label")
            l.setAttribute("for", "rad" + i)
            l.setAttribute("data-text", label.text)
            el.appendChild(l)

            // tab content
            let c = document.createElement("div")
            c.classList.add("tab-card")

            // tab title
            let t = document.createElement("h1")
            t.innerHTML = label
            c.appendChild(t)

            // div for actual content of tab
            let d = document.createElement("div")
            d.setAttribute("id", label.elemid)
            d.classList.add("tab-content")
            c.appendChild(d)

            el.appendChild(c)
        })
    }

}