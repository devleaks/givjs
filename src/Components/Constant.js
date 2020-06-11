/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


export const DEPARTURE = "departure"
export const ARRIVAL = "arrival"

export const SCHEDULED = "scheduled"
export const PLANNED = "planned"
export const ACTUAL = "actual"

export const BUSY = "busy"
export const AVAILABLE = "available"


// Feature properties
export const HIDE_FEATURE = "_feature"
export const HIDE_LAYER = "_layer"
export const HIDE_STYLE = "_style"
export const HIDE_TOUCHED = "_touched"
export const HASDATA = "_data"

export const APRONS_COLORS = ["#DDDDDD", "#008FFB", "#00E396", "#FEB019", "#DDDDDD", "#FF4560", "#775DD0"]

// stopped messages
export const STOPPED = "stopped"
export const JUST_STOPPED = "just_stopped"
export const JUST_STARTED = "just_started"
export const MOVED = "moved"
export const ROTATION_MSG = "rotation"

// other messages
export const FLIGHTBOARD_MSG = "flightboard"
export const PARKING_MSG = "parking"
export const PARKING_UPDATE_MSG = "parking-update"
export const MAP_MSG = "map"
export const WIRE_MSG = "wire"
export const DARK_MSG = "dark"
export const FOOTER_MSG = "footer"
export const CLOCK_MSG = "clock"
export const SIMULATION_MSG = "siminfo"

export const CLOCK_TICKS = [ // minutes
    1,
    2,
    5,
    10,
    15,
    20,
    30,
    60,
    120
]

//
export const LOCALSTORAGE_DARK = "theme"
export const DARK = "dark"
export const LIGHT = "light"