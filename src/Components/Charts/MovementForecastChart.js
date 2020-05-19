/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
//import "../css/flightboard.css"

import { deepExtend } from "../Utilities"
import { ApexTile } from "./ApexTile"
import { Transport } from "../Transport"
import moment from "moment"

import { ACTUAL } from "../Constant"

import ApexCharts from "apexcharts"

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    elemid: "movementforecast",
    msgtype: "flightboard",
    maxcount: 6
}

export class MovementForecastChart extends ApexTile {

    constructor(elemid, message_type, move, transport, options) {
        super(elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.move = move
        this.flights = transport
        this.install()
    }


    /*  installs the HTML code in the document
     */
    install() {
        this.chart = new ApexCharts(document.querySelector("#" + this.elemid), {
            series: [{
                name: this.move,
                data: [0, 0, 0, 0, 0, 0]
            }],
            chart: {
                type: "bar"
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: "55%",
                    endingShape: "rounded"
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ["transparent"]
            },
            xaxis: {
                categories: [0, 1, 2, 3, 4, 5]
            },
            yaxis: {
                decimalsInFloat: 0
            },
            fill: {
                opacity: 1
            }
        });
        this.chart.render()

        let that = this
        let locallistener = function(msgtype, data) {
            //console.log("MovementForecastChart::listener", msgtype, data, that.move)
            if (data.hasOwnProperty("move")) {
                if (that.move == data.move) {
                    that.updateChart()
                }
            } else {
                console.warn("MovementForecastChart::listener: data has no move info", data)
            }
        }
        this.listen(locallistener)
    }


    // update display (html table)
    updateChart(datetime = false) {
        let ts = datetime ? datetime : moment() // default to now

        // sort flights to show most maxcount relevant flights for move
        // 1. Recently landed
        // 2. Arriving soon
        // 3. Arriving later
        // Remove landed more than 30min earlier
        let that = this
        let hours = Array(24).fill(0)
        let flights = this.flights.getScheduledTransports(this.move, datetime)

        flights.forEach(f => {
            if (!f.hasOwnProperty(ACTUAL)) { // if not arrived/departed
                let t = Transport.getTime(f)
                hours[t.hours()]++
            }
        })


        //update simple graph
        let hourNow = ts.hours()
        hours = hours.concat(hours) // cycle for across midnight runs
        let forecast = hours.slice(hourNow, hourNow + this.options.maxcount)
        // console.log("MovementForecastChart::updateChart", this.move, forecast)
        this.chart.updateSeries([{
            name: this.move,
            data: forecast
        }])
    }
}