/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import moment from "moment"
import ApexCharts from "apexcharts"

import { deepExtend } from "../../Utilities/Utils"
import { ApexTile } from "./ApexTile"
import { Transport } from "../../States/Transport"

import "../../../assets/css/turnaround-gantts.css"

const DEFAULTS = {
    elemid: "turnaround-gantts",
    msgtype: "ROTATION_UPDATED"
}


export class TurnaroundGantt extends ApexTile {

    constructor(areaid, elemid, message_type, parkings, rotations, options) {
        super(areaid, elemid, message_type, options)

        this.parkings = parkings
        this.rotations = rotations
        this.charts = new Map()
        this.install()
    }

    /*  installs the HTML code in the document
     */
    install() {
        super.install()
        // prepare wire element
        let hook = document.getElementById(this.elemid)
        let newel = document.createElement("ul")
        hook.appendChild(newel)
        this.listen(this.update.bind(this))
    }


    update(msg, rotation) {
        //console.log("TurnaroundGantt::update", msg, rotation)
        this.create_update_chart(rotation)
    }


    create_update_chart(rotation) {
        let chartdata = this.getServices(rotation)
        let chart = this.charts.get("" + rotation.parking)

        if (chart) {
            chart.updateSeries(chartdata)
        } else { // creates it            
            let hook = document.querySelector("#" + this.elemid + " ul")
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
            this.charts.set("" + rotation.parking, chart)
        }
    }

    /*  update/insert HTML code on event
     */
    getServices(rotation) {
        const colors = {
            plane: "#db2004",
            fuel: "#008FFB",
            catering: "#00E396",
            sewage: "#775DD0",
            cargo: "#FEB019",
            default: "#FF4560"
        }

        let arrt = false,
            dept = false,
            data = []

        if (rotation.arrival) {
            arrt = Transport.getTime(rotation.arrival)
            // arrt.subtract(60, "minutes")
            if (rotation.departure) {
                dept = Transport.getTime(rotation.departure)
                // dept.add(60, "minutes")
//            } else {
//                dept = moment(arrt)
//                dept.add(120, "minutes")
            }
        }

        if (arrt && dept) {
            data.push({
                x: rotation.name, // r.id?
                y: [arrt.valueOf(), dept.valueOf()],
                fillColor: colors["plane"]
            })
        } else {
            console.log("TurnaroundGantt::getServices", "no service range", rotation.id)
        }

        rotation.services.forEach((service, sname) => {
            service.forEach((vehicle, vname) => {
                let e = vehicle.firstseen == vehicle.lastseen ? 20 * 60 * 1000 : 0
                data.push({
                    x: vname,
                    y: [vehicle.firstseen, vehicle.lastseen + e],
                    fillColor: colors[sname]
                })
            })
        })


        /* template for development
        let now = moment()
        let data2 = [{
                x: "Plane",
                y: [
                    moment(now).subtract(60, "minutes").valueOf(),
                    moment(now).subtract(60, "minutes").valueOf()
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
        ]*/

        //console.log("TurnaroundGantt::getServices", rotation, data)
        return [{
            data: data
        }];

    }

}