/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
//import "../assets/css/flightboard.css"

import { deepExtend } from "../../Utils/Utilities"
import { ApexTile } from "../ApexTile"
import { Transport } from "../../Transport"
import moment from "moment"

import { ACTUAL } from "../../Constant"

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


    /**
     *   Installs the HTML code in the document
     */
    install() {
        this.chart = new ApexCharts(document.getElementById(this.elemid), {
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
                    that.update()
                }
            } else {
                console.warn("MovementForecastChart::listener: data has no move info", data)
            }
        }
        this.listen(locallistener)
    }


    /**
     * Update chart for supplied date/time. Default to now (live operations.)
     *
     * @param      {boolean}  [datetime=false]  The datetime
     */
    update(datetime = false) {
        let ts = datetime ? datetime : moment() // default to now

        let hours = Array(24).fill(0)
        let flights = this.flights.getScheduledTransports(this.move, datetime)

        flights.forEach(f => {
            if (!f.hasOwnProperty(ACTUAL)) { // if not arrived/departed
                let t = Transport.getTime(f)
                t.local()
                hours[t.hours()]++
            }
        })

        ts.local()
        let hourNow = ts.hours()
        hours = hours.concat(hours) // cycle for across midnight runs
        let forecast = hours.slice(hourNow, hourNow + this.options.maxcount)
        this.chart.updateSeries([{
            name: this.move,
            data: forecast
        }])
    }
}