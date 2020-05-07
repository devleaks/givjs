/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
import "../css/map.css"

import L from "leaflet"
import "../../node_modules/leaflet/dist/leaflet.css"

// these just "load" js and hook to L.control
import "leaflet-groupedlayercontrol"
import "../../node_modules/leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.css"

import "leaflet-betterscale/L.Control.BetterScale.js"
import "../../node_modules/leaflet-betterscale/L.Control.BetterScale.css"

import antPath from "leaflet-ant-path"

import { deepExtend } from "./Utilities"
import { Tile } from "./Tile"

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    elemid: "map",
    msgtype: "map",

    center: [50.64, 5.445],
    zoom: 15,
    zoom_overview: 8,

    layers: [],

    layerControl: {},
    layerControlOptions: { useGrouped: true, groupCheckboxes: true, collapsed: false },

    betterScale: false,

    themes: {
        dark: [],
        light: []
    }
}


export class Omap extends Tile {

    constructor(elemid, message_type, options) {
        super(elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.install()
    }

    /*  installs the HTML code in the document
     */
    install() {
        let OpenStreetMap_France = L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
            maxZoom: 20,
            attribution: "&copy; Openstreetmap France | &copy; <a href='https://www.openstreetmap.org/copyright0'>OpenStreetMap</a> contributors"
        });

        let OpenTopoMap = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
            maxZoom: 17,
            attribution: "Map data: &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, <a href='http://viewfinderpanoramas.org'>SRTM</a> | Map style: &copy; <a href='https://opentopomap.org'>OpenTopoMap</a> (<a href='https://creativecommons.org/licenses/by-sa/3.0/'>CC-BY-SA</a>)"
        });

        let Stadia_AlidadeSmoothDark = L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
            maxZoom: 20,
            attribution: "&copy; <a href='https://stadiamaps.com/''>Stadia Maps</a>, &copy; <a href='https://openmaptiles.org/''>OpenMapTiles</a> &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors"
        });

        let Esri_WorldImagery = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
            attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        });

        let CartoDB_DarkMatterNoLabels = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
            attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>",
            subdomains: "abcd",
            maxZoom: 19
        });

        let baseLayers = {
            "OSM France": OpenStreetMap_France,
            "OpenTopo": OpenTopoMap,
            "Stadia Alidade Smooth Dark": Stadia_AlidadeSmoothDark,
            "CartoDB Dark Matter": CartoDB_DarkMatterNoLabels,
            "ESRI World Imagery": Esri_WorldImagery
        };

        let airportOverlay = new L.ImageOverlay("src/data/EBLG_GMC01_v13.svg", new L.LatLngBounds(
            new L.LatLng(50.62250, 5.41630), // en bas à gauche
            new L.LatLng(50.65655, 5.47567)), { // en haut à droite 
            opacity: 0.8
        });

        // S W N E: 50.62250,5.41630,50.65655,5.47567

        let airportNightOverlay = new L.ImageOverlay("src/data/EBLG_GMC01_v13-night.svg", new L.LatLngBounds(
            new L.LatLng(50.62250, 5.41630), // en bas à gauche
            new L.LatLng(50.65655, 5.47567)), { // en haut à droite 
            opacity: 1
        });

        const rabbit = {
            "delay": 15,
            "dashArray": [
                2,
                1500
            ],
            "weight": 3,
            "color": "rgba(30,30,30,1)",
            "pulseColor": "rgba(255,255,255,1)",
            "paused": false,
            "reverse": false,
            "hardwareAccelerated": true
        }

        let r1 = antPath.antPath([
            [50.65367800515634, 5.469925403594971],
            [50.645977340713586, 5.457737445831299]
        ], rabbit),
            r2 = antPath.antPath([
            [50.62299029225287, 5.421152114868163],
            [50.63156581667872, 5.434885025024414]
        ], rabbit),
            r3 = antPath.antPath([
            [50.651766562235494, 5.462635159492493],
            [50.64411320922499, 5.450441837310791]
        ], rabbit)

        let night = L.layerGroup([airportNightOverlay, r1, r2, r3]),
            day = airportOverlay

        this.options.layers = [ OpenStreetMap_France ]

        this.options.layerControl = {
            baseLayers: baseLayers,
            overlays: {
                "<span style='color: #0C64AF;''><img src='src/i/liegeairport-14.png'>&nbsp;Liège Airport</span>": {
                    "<span style='color: #EE850A;''>Day</span>": day,
                    "<span style='color: #EE850A;''>Night</span>": night
                }
            },
            options: { groupCheckboxes: true, collapsed: false }
        }

        this.options.themes = {
            dark:  [night, CartoDB_DarkMatterNoLabels],
            light: [day,   OpenStreetMap_France]
        }


        this.map = L.map(this.options.elemid, {
            center: this.options.center,
            zoom: this.options.zoom,
            layers: this.options.layers,
            zoomSnap: 0.5,
            attributionControl: false // will be displayed in sidebar
        })

        this.map.setView(this.options.center, this.options.zoom)


        this.layerControl = L.control.groupedLayers(
            this.options.layerControl.baseLayers,
            this.options.layerControl.overlays,
            this.options.layerControl.options ? this.options.layerControl.options : this.options.layerControlOptions).addTo(this.map)
        L.control.betterscale({ metric: true, imperial: false, position: "bottomleft" }).addTo(this.map) // either one or the other but not both

        this.listen(this.listener)

        console.log("Map", "installed")
    }

    listener(msg, data) {
        console.log("Map::listener", msg, data);
    }



    /*  update/insert HTML code on event
     */
    update() {

    }

}