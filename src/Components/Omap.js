/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Install map in div
 */
const VERSION = "5.0.0"
const MODULE_NAME = "Omap"

import L from 'leaflet'

// these just "load" js and hook to L.control
import * as groupedLayers from 'leaflet-groupedlayercontrol'
import * as betterScale from 'leaflet-betterscale/L.Control.BetterScale.js'


import PubSub from 'pubsub-js'
import { deepExtend } from './Utilities'

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

/**
 *  PRIVATE letIABLES
 */
let _options = false
let _map = false
let _layerControl = false


/**
 *  PRIVATE FUNCTIONS
 */
function init(options) {
    if (_options)
        return _options

    _options = deepExtend(DEFAULTS, options)

    console.log("init", _options)

    install()

    if (_options.debug) {
        console.log(MODULE_NAME, "inited")
    }

    return _options
}

function install() {
    /*
     *  M A P
     */
    let OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let OpenStreetMap_France = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    let Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    });

    let Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    let CartoDB_DarkMatterNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    });

    let baseLayers = {
        "OSM France": OpenStreetMap_France,
        "OpenTopo": OpenTopoMap,
        "Stadia Alidade Smooth Dark": Stadia_AlidadeSmoothDark,
        "CartoDB Dark Matter": CartoDB_DarkMatterNoLabels,
        "ESRI World Imagery": Esri_WorldImagery
    };

    let airportOverlay = new L.ImageOverlay("test/data/EBLG_GMC01_v13.svg", new L.LatLngBounds(
        new L.LatLng(50.62250, 5.41630), // en bas à gauche
        new L.LatLng(50.65655, 5.47567)), { // en haut à droite 
        opacity: 0.8
    });

    // S W N E: 50.62250,5.41630,50.65655,5.47567

    let airportNightOverlay = new L.ImageOverlay("test/data/EBLG_GMC01_v13-night.svg", new L.LatLngBounds(
        new L.LatLng(50.62250, 5.41630), // en bas à gauche
        new L.LatLng(50.65655, 5.47567)), { // en haut à droite 
        opacity: 1
    });

    /*    const rabbit = {
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

        var r1 = antPath([
            [50.65367800515634, 5.469925403594971],
            [50.645977340713586, 5.457737445831299]
        ], rabbit)
        var r2 = antPath([
            [50.62299029225287, 5.421152114868163],
            [50.63156581667872, 5.434885025024414]
        ], rabbit)
        var r3 = antPath([
            [50.651766562235494, 5.462635159492493],
            [50.64411320922499, 5.450441837310791]
        ], rabbit)
    */
    var night = L.layerGroup([airportNightOverlay /*, r1, r2, r3*/ ])
    var day = airportOverlay

    _options.layers = [OpenStreetMap_France]

    _options.layerControl = {
        baseLayers: baseLayers,
        overlays: {
            "<span style='color: #0C64AF;'><img src='src/i/liegeairport-14.png'>&nbsp;Liège Airport</span>": {
                "<span style='color: #EE850A;'>Day</span>": day,
                "<span style='color: #EE850A;'>Night</span>": night
            }
        },
        options: { groupCheckboxes: true, collapsed: false }
    }


    _map = L.map(_options.elemid, {
        center: _options.center,
        zoom: _options.zoom,
        layers: _options.layers,
        zoomSnap: 0.5,
        attributionControl: false // will be displayed in sidebar
    })

    _map.setView(_options.center, _options.zoom)


    _layerControl = L.control.groupedLayers(
        _options.layerControl.baseLayers,
        _options.layerControl.overlays,
        _options.layerControl.options ? _options.layerControl.options : _options.layerControlOptions).addTo(_map)
    L.control.betterscale({ metric: true, imperial: false, position: "bottomleft" }).addTo(_map) // either one or the other but not both

    console.log(MODULE_NAME, "installed")
}

/**
 *  MODULE EXPORTS
 */
function version() {
    console.log(MODULE_NAME, VERSION);
}

export {
    version,
    init
}