/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
//import "../assets/css/flightboard.css"
import moment from "moment"
import ApexCharts from "apexcharts"

import { deepExtend } from "../../Utilities/Utils"
import { ApexTile } from "../ApexTile"
import { Transport } from "../../Transport"
import { Clock } from "../../Clock"

import { FLIGHTBOARD_MSG, ACTUAL } from "../../Constant"


/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    elemid: "movementforecast",
    msgtype: "flightboard",
    maxcount: 6,
    flights_ahead: 360 // mins
}

export class MovementForecastChart extends ApexTile {

    constructor(elemid, message_type, move, transport, clock, options) {
        super(elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.move = move
        this.flights = transport
        this.clock = clock
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

        this.listen(this.update.bind(this))
    }


    /**
     * Update chart for supplied date/time. Default to now (live operations.)
     *
     * @param      {boolean}  [datetime=false]  The datetime
     */
    update(msgtype, data) {

        if (msgtype == FLIGHTBOARD_MSG && this.move != data.move) {
            return false
        }

        let ts = this.clock.time
        if (msgtype == Clock.clock_message(this.options.update_time)) {
            ts = moment(data, moment.ISO_8601)
        }

        let maxahead = moment(ts).add(this.options.flights_ahead, "minutes")
        let hours = Array(this.options.maxcount).fill(0)
        let flights = this.flights.getScheduledTransports(this.move, maxahead)

        flights.forEach(f => {
            if (!f.hasOwnProperty(ACTUAL)) { // if not arrived/departed
                const t = Transport.getTime(f)
                const i = Math.floor(moment.duration(t.diff(ts)).asHours())
                if (i > -1 && i < this.options.maxcount) {
                    hours[i]++
                }
            }
        })
        this.chart.updateSeries([{
            name: this.move,
            data: hours
        }])
    }
}