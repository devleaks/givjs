/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import { deepExtend } from "../Utilities"
import { ApexTile } from "./ApexTile"

import { booleanPointInPolygon } from "@turf/turf"
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
        let hook = document.querySelector("#" + this.elemid)
        let newel = document.createElement("ul")
        hook.appendChild(newel)
        this.listen(this.listener.bind(this))
    }


    listener(msg, feature) {
        const parr = this.parkings.features.filter(f => booleanPointInPolygon(feature.geometry.coordinates, f))
        if (parr.length > 0) {
            const box = parr[0]
            this.update({
                parking: box.properties.name,
                feature: feature
            })
        } else {
            console.log("TurnaroundGantt::listener:stopped: not parked", feature)
        }
        //console.log("TurnaroundGantt::listener", msg, data)
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

            chart = new ApexCharts(document.querySelector("#" + id), {
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
        if (stopped.feature.properties.type == "SERVICE") {
            const vehicle = stopped.feature.id
            const sarr = vehicle.split(':') // id = "catering:0"
            const service = sarr[0]
            let r = this.gantt.get('' + stopped.parking)
            let create = false

            if (!r) { // we see a service vehicle before the plane, we need to record it...
                r = {
                    services: {}
                }
                create = true
                console.log("TurnaroundGantt::update", "service arrived before plane?", stopped)
            }

            if (!r.departure) {
                if (r.arrival) {
                    console.log("TurnaroundGantt::update", "service has arrival", r, stopped)
                    r.departure = Oscars.Util.getDepartureFlight(r.arrival.name)
                    if (r.departure) {
                        console.log("TurnaroundGantt::update", "service has departure", r, stopped)
                    }
                } else {
                    console.log("TurnaroundGantt::update", "service has no flight assigned", r, stopped)
                }
            }

            r.services[service] = r.services.hasOwnProperty(service) ?
                r.services[service] : {}
            let thisservice = r.services[service]

            thisservice[vehicle] = thisservice.hasOwnProperty(vehicle) ?
                thisservice[vehicle] : {}

            let thisvehicle = thisservice[vehicle]

            console.log("TurnaroundGantt::update", moment().valueOf(), stopped.feature)

            if (!thisvehicle.hasOwnProperty("firstseen")) {
                // console.log("TurnaroundGantt::update: First visit...", moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf(), stopped.feature)
                // console.log("TurnaroundGantt::update: First visit...", StackTrace.getSync())
                thisvehicle.firstseen = moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf()
            } else {
                console.log("TurnaroundGantt::update: Second visit...", thisvehicle.firstseen, moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf(), stopped.feature)
                // console.log("TurnaroundGantt::update: Second visit...", StackTrace.getSync())
            }
            thisvehicle.lastseen = moment(stopped.feature.properties._timestamp_emission, moment.ISO_8601).valueOf()

            // do we need to push r back on map??
            this.gantt.set('' + stopped.parking, r)

            create_update_chart(parking)
        }
    }

}