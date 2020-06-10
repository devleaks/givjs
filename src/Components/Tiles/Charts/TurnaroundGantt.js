/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import { deepExtend } from "../../Utilities/Utils"
import { ApexTile } from "../ApexTile"

import moment from "moment"

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    elemid: "turnaround-gantts",
    msgtype: "stopped"
}


export class TurnaroundGantt extends ApexTile {

    constructor(elemid, message_type, parkings, options) {
        super(elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.parkings = parkings
        this.charts = new Map()
        this.gantt =  new Map()
        this.install()
    }

    /*  installs the HTML code in the document
     */
    install() {
        // prepare wire element
        let hook = document.getElementById(this.elemid)
        let newel = document.createElement("ul")
        hook.appendChild(newel)
        // this.listen(this.listener.bind(this))
    }


    listener(msg, feature) {
        console.log("TurnaroundGantt::listener", msg, feature)
    }


    create_update_chart(parking) {
        let chartdata = this.getServices(parking)
        let chart = this.charts.get(parking)

        if (!chart) {
            let hook = document.querySelector("#wire ul")
            let newel = document.createElement("li")
            let newdiv = document.createElement("div")
            let id = "gantchart" + Math.floor(Math.random() * 1000000)
            newdiv.setAttribute("id", id)
            newel.appendChild(newdiv)
            hook.appendChild(newel)

            chart = new ApexCharts(document.getElementById(id), {
                series: chartdata,
                chart: {
                    height: 150,
                    type: "rangeBar"
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                        distributed: true,
                        dataLabels: {
                            hideOverflowingLabels: false
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    formatter: function(val, opts) {
                        let label = opts.w.globals.labels[opts.dataPointIndex]
                        let a = moment(val[0])
                        let b = moment(val[1])
                        let diff = moment.duration(b.diff(a)).humanize()
                        return label + ": " + diff
                    },
                    style: {
                        colors: ["#f3f4f5", "#fff"]
                    }
                },
                xaxis: {
                    type: "datetime"
                },
                yaxis: {
                    show: false
                },
                grid: {
                    row: {
                        colors: ["#f3f4f5", "#fff"],
                        opacity: 1
                    }
                }
            })
            chart.render()
            this.charts.set(data.parking, chart)

        } else {
            chart.updateSeries(chartdata)
        }
    }

    /*  update/insert HTML code on event
     */
    getServices(parking) {
        const colors = {
            plane: "#db2004",
            fuel: "#008FFB",
            catering: "#00E396",
            sewage: "#775DD0",
            cargo: "#FEB019",
            default: "#FF4560"
        }
        let r = this.gantt.get("" + parking)
        console.log("getServices::r", r)
        let now = moment()
        let data = [],
            data2,
            arrt = false,
            dept = false

        if (r.arrival) {
            arrt = moment(r.arrival.scheduled).subtract(60, "minutes")
            if (r.departure) {
                dept = moment(r.arrival.scheduled).add(60, "minutes")
            }
        }

        if (arrt && dept) {
            data.push({
                x: "Plane OO-123",
                y: [arrt.valueOf(), dept.valueOf()],
                fillColor: colors["plane"]
            })
        }

        if (r) {
            for (let service in r.services) {
                if (r.services.hasOwnProperty(service)) {
                    let s = r.services[service]
                    for (let vehicle in s) {
                        if (s.hasOwnProperty(vehicle)) {
                            let v = s[vehicle]
                            let e = v.firstseen == v.lastseen ? 20 * 60 * 1000 : 0
                            data.push({
                                x: service,
                                y: [v.firstseen, v.lastseen + e],
                                fillColor: colors[service]
                            })
                        }
                    }
                }
            }
        }

        // console.log("getServices::data", data)

        data2 = [{
                x: "Plane",
                y: [
                    arrt.valueOf(),
                    dept.valueOf()
                ],
                fillColor: "#008FFB"
            },
            {
                x: "Deboarding",
                y: [
                    moment(now).subtract(40, "minutes").valueOf(),
                    moment(now).subtract(5, "minutes").valueOf()
                ],
                fillColor: "#008FFB"
            },
            {
                x: "Fuel",
                y: [
                    moment(now).subtract(15, "minutes").valueOf(),
                    moment(now).add(15, "minutes").valueOf()
                ],
                fillColor: "#00E396"
            },
            {
                x: "Catering",
                y: [
                    moment(now).subtract(25, "minutes").valueOf(),
                    moment(now).add(1, "minutes").valueOf()
                ],
                fillColor: "#775DD0"
            },
            {
                x: "Boarding",
                y: [
                    moment(now).add(15, "minutes").valueOf(),
                    moment(now).add(45, "minutes").valueOf()
                ],
                fillColor: "#FEB019"
            },
            {
                x: "Cleaning",
                y: [
                    moment(now).subtract(25, "minutes").valueOf(),
                    moment(now).add(10, "minutes").valueOf()
                ],
                fillColor: "#FF4560"
            }
        ]

        // console.log("getServices::returned", data)

        return [{
            data: data
        }];

    }

    update(stopped) {
        console.log("TurnaroundGantt::update", stopped)
        return;
    }

}