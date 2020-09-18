/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


export const HOME = "LGG"
export const HOME_IATA = "EBLG"


export const WS_CONFIG = {
    websocket: "ws://localhost:8051"
}

export const MQTT_CONFIG = {
    host: "localhost",
    port: "8502",
    url: "mqtt://localhost/",
    uri: "ws://localhost:8052/ws",
    topics: ["#"] // ["map", "flightboard", "wire", "parking"]
}

export const PARKINGS = "src/data/eblg-parking-boxes.geojson"

export const APRONS_MAXCOUNT = [0, 29, 24, 22, 0, 5, 5]