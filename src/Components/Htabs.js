/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import "../assets/css/tabs-h.css"

/*
 *
    <input type="radio" name="tabs" id="tabone" checked="checked">
    <label for="tabone">Tab One</label>
    <div class="tab">
        <h1>Tab One Content</h1>
        <p></p>
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
            b.setAttribute("name", "tabs")
            b.setAttribute("id", "tab" + i)
            if(i == 0) {
                b.setAttribute("checked", "checked")
            }
            el.appendChild(b)

            // tab label
            let l = document.createElement("label")
            l.setAttribute("for", "rad" + i)
            l.innerHTML = label.text
            el.appendChild(l)

            // content
            let c = document.createElement("div")
            c.classList.add("tab")

            // title
            let t = document.createElement("h1")
            t.innerHTML = label.text
            c.appendChild(t)

            // div for actual content of tab
            let d = document.createElement("div")
            d.setAttribute("id", label.elemid)
            d.classList.add("tab-content")
            c.appendChild(d)

            el.push(c)
        })

    }

}