/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import { deepExtend } from "../../Utils/Utilities"
import { ApexTile } from "../ApexTile"

import { BUSY, APRONS_COLORS } from "../../Constant"

import ApexCharts from "apexcharts"

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    elemid: "ParkingOccupancyChart",
    msgtype: "parking"
}

export class ParkingOccupancyChart extends ApexTile {

    constructor(elemid, message_type, options) {
        super(elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.install()
    }


    /*  installs the HTML code in the document
     */
    install() {
        let data = Array(6).fill(0)
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
        this.listen(this.update.bind(this))
    }


    /**
     * Update chart from ParkingOccupancy.
     * Note: Since both ParkingOccupancy and ParkingOccupancyChart respond to "parking" messages,
     * there might be a race condition where ParkingOccupancyChart gets the data while it has not been updated
     * in ParkingOccupancy yet. We'll fix that one day by adding a message (parking-chart-update).
     *
     * @param      {<type>}  msgtype  The msgtype
     * @param      {<type>}  parking  The parking
     */
    update(msgtype, occupancy) {
        let data = occupancy.busy
        let aprons_max = occupancy.max
        let pcts = data.map((x, i) => (aprons_max[i] > 0 ? Math.round(100 * x / aprons_max[i]) : 0))
        let total = data.reduce((a, v) => a + v)

        this.chart.updateSeries(pcts.slice(1, data.length))
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