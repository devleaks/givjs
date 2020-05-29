/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import { deepExtend } from "../Utils/Utilities"
import { ApexTile } from "./ApexTile"
import { Transport } from "../Transport"
import moment from "moment"

import { BUSY, APRONS_COLORS } from "../Constant"

import ApexCharts from "apexcharts"

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    elemid: "ParkingOccupancyChart",
    msgtype: "flightboard",
    parking_id: "name",
    aprons_max: []
}

export class ParkingOccupancyChart extends ApexTile {

    constructor(elemid, message_type, parkings, options) {
        super(elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.parkings = parkings
        this.aprons = Array(this.options.aprons_max.length).fill(0)
        this.install()
    }


    /*  installs the HTML code in the document
     */
    install() {
        let data = this.aprons.slice(1, this.aprons.length)
        this.chart = new ApexCharts(document.getElementById(this.elemid), {
            series: data,
            colors: APRONS_COLORS.slice(1, APRONS_COLORS.length),
            chart: {
                type: "radialBar"
            },
            plotOptions: {
                radialBar: {
                    dataLabels: {
                        name: {
                            fontSize: "22px",
                        },
                        value: {
                            fontSize: "16px",
                        },
                        total: {
                            show: true,
                            label: "Occupied",
                            formatter: function(w) {
                                // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
                                return data.reduce((a, v) => a + v)
                            }
                        }
                    }
                }
            },
            labels: ["APRON 1", "APRON 2", "APRON 3", "APRON 4", "APRON 5", "APRON 6"],
        })
        this.chart.render()

        let that = this
        let locallistener = function(msgtype, data) {
            //console.log("ParkingOccupancyChart::listener", msgtype, data)
            that.updateParking(data)
        }
        this.listen(locallistener)
    }


    updateParking(parking) {
        const box = this.parkings.find(this.options.parking_id, parking.name)
        if (box) {
            if (parking.available == BUSY) {
                this.aprons[box.properties.apron]++
            } else {
                this.aprons[box.properties.apron] = this.aprons[box.properties.apron] == 0 ? 0 : this.aprons[box.properties.apron] - 1
            }
        }
        this.updateChart()
    }


    // update chart
    updateChart() {
        let aprons_max = this.options.aprons_max
        let data = this.aprons
        let pcts = data.map((x, i) => (aprons_max[i] > 0 ? Math.round(100 * x / aprons_max[i]) : 0))
        let total = data.reduce((a, v) => a + v)

        this.chart.updateSeries(pcts.slice(1, this.aprons.length))
        this.chart.updateOptions({
            plotOptions: {
                radialBar: {
                    dataLabels: {
                        total: {
                            formatter: function(w) {
                                return total
                            }
                        }
                    }
                }
            }
        })
    }
}