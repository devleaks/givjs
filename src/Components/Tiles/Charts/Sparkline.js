/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import ApexCharts from "apexcharts"

const SPARKLINES = {
    line: {
        series: [{
            data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54]
        }],
        chart: {
            type: "line",
            width: 50,
            height: 25,
            sparkline: {
                enabled: true
            }
        },
        stroke: {
            width: 2
        },
        tooltip: {
            fixed: {
                enabled: false
            },
            x: {
                show: false
            },
            y: {
                title: {
                    // eslint-disable-next-line no-unused-vars
                    formatter: function(seriesName) {
                        return ""
                    }
                }
            },
            marker: {
                show: false
            }
        }
    },
    pie: {
        series: [43, 32, 12, 9],
        chart: {
            type: "pie",
            width: 25,
            height: 25,
            sparkline: {
                enabled: true
            }
        },
        stroke: {
            width: 1
        },
        tooltip: {
            fixed: {
                enabled: false
            },
        }
    },
    donut: {
        series: [43, 32, 12, 9],
        chart: {
            type: "donut",
            width: 25,
            height: 25,
            sparkline: {
                enabled: true
            }
        },
        stroke: {
            width: 1
        },
        tooltip: {
            fixed: {
                enabled: false
            },
        }
    },
    bar: {
        series: [{
            data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54]
        }],
        chart: {
            type: "bar",
            width: 50,
            height: 25,
            sparkline: {
                enabled: true
            }
        },
        plotOptions: {
            bar: {
                columnWidth: "80%"
            }
        },
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        xaxis: {
            crosshairs: {
                width: 1
            },
        },
        tooltip: {
            fixed: {
                enabled: false
            },
            x: {
                show: false
            },
            y: {
                title: {
                    // eslint-disable-next-line no-unused-vars
                    formatter: function(seriesName) {
                        return ""
                    }
                }
            },
            marker: {
                show: false
            }
        }
    },
    radialBar: {
        series: [53, 67],
        chart: {
            type: "radialBar",
            width: 25,
            height: 25,
            sparkline: {
                enabled: true
            }
        },
        dataLabels: {
            enabled: false
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    margin: 0,
                    size: "50%"
                },
                track: {
                    margin: 0
                },
                dataLabels: {
                    show: false
                }
            }
        }
    }
}


/**
 * Creates a sparkline based on a template.
 *
 * @class      Sparkline (name)
 */
export class Sparkline {

    /**
     * Constructs a new Sparkline instance. Chart is NOT rendered.
     *
     * @param      {<type>}      el           HTML element identified holding the sparkline
     * @param      {<type>}      type         Sparkline type {line|bar|pie|donut|radialBar}
     * @param      {Array}       data         The data
     * @param      {number}      [width=40]   The width of sparkline
     * @param      {number}      [height=20]  The height of sparkline
     * @return     {ApexCharts}  The apex charts.
     */
    constructor(el, type, data, width = 40, height = 20) {
        let options = Object.assign({}, SPARKLINES[type])
        if (["radialBar", "donut", "pie"].indexOf(type) > -1) {
            options.series = data
        } else {
            options.series = [{
                data: data
            }]
        }
        options.chart.width = width
        options.chart.height = height
        this._chart = new ApexCharts(document.getElementById(el), options)
    }

    /*
        this.chart = new ApexCharts(document.getElementById(el), options)
    }
    */

    /**
     * Renders the sparkline
     */
    render() {
        this._chart.render()
    }


    /**
     * Getter for chart object
     *
     * @type       {<type>}
     */
    get chart() {
        return this._chart
    }

}