/*  Tests
 *  Should only consider: Pie, Donut, Radial, Bars, Lines.
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


export function randomSparklineDemo(el, t = false) {
    let types = Object.keys(SPARKLINES)
    let type = t ? t : types[Math.floor(Math.random() * types.length)]
    var chart = new ApexCharts(document.querySelector("#" + el), SPARKLINES[type]);
    chart.render();
}


export function sparkline(el, type, data, width = 40, height = 20) {
    let options = SPARKLINES[type]
    if(["radialBar", "donut", "pie"].indexOf(type) > -1 ) {
        options.series = data
    } else {
        options.series = [
            {
                data:data
            }
        ]
    }
    options.chart.width = width
    options.chart.height = height
    // chart.render();
    return new ApexCharts(document.querySelector("#" + el), options);
}