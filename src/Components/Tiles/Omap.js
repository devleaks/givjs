/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 */


import "leaflet/dist/leaflet.css"
import "../../assets/css/map.css"

// older libs:
// these just "load" js and hook to L.control
import L from "leaflet"

import "leaflet-groupedlayercontrol"
import "leaflet-groupedlayercontrol/dist/leaflet.groupedlayercontrol.min.css"

import "leaflet-betterscale/L.Control.BetterScale.js"
import "leaflet-betterscale/L.Control.BetterScale.css"

import "@ansur/leaflet-pulse-icon"
import "@ansur/leaflet-pulse-icon/dist/L.Icon.Pulse.css"

import "leaflet-easybutton"

// newer libs
// import as module
import { Map as LeafletMap, TileLayer, LayerGroup, GeoJSON as GeoJSONLAyer, Marker, Circle, ImageOverlay, LatLng, LatLngBounds } from "leaflet"

import "leaflet-rotatedmarker"

import { AntPath } from "leaflet-ant-path"

import { deepExtend } from "../Utilities/Utils"
import { Tile } from "./Tile"

import { getFeatureLayerName } from "../Utilities/GeoJSON"
import { style, onEachFeature, pointToLayer, getFeatureLayer } from "../Utilities/Style"


import { MAP_MSG, DARK_MSG, DARK, LIGHT } from "../Constant"

/**
 *  DEFAULT VALUES
 */
const DEFAULTS = {
    elemid: "map",
    msgtype: "map",

    icon: "map",
    title: "EBLG",

    center: [50.64, 5.445],
    zoom: 15,
    zoom_overview: 8,

    layers: [],

    layerControl: {},
    layerControlOptions: {
        useGrouped: true,
        groupCheckboxes: true,
        collapsed: true
    },

    betterScale: false,

    themes: {
        dark: [],
        light: []
    }
}

/**
 * Map widget
 *
 * @class      Omap (name)
 */
export class Omap extends Tile {

    constructor(areaid, elemid, message_type, options) {
        super(areaid, elemid, message_type)
        this.options = deepExtend(DEFAULTS, options)
        this.layers = new Map()
        this.install()
    }

    get icon() {
        return this.options.icon
    }

    get icon() {
        return this.options.title
    }

    /**
     *  installs the HTML code in the document
     */
    install() {
        super.install()
        let OpenStreetMap_France = new TileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
            maxZoom: 20,
            attribution: "&copy; Openstreetmap France | &copy; <a href='https://www.openstreetmap.org/copyright0'>OpenStreetMap</a> contributors"
        });

        let OpenTopoMap = new TileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
            maxZoom: 17,
            attribution: "Map data: &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, <a href='http://viewfinderpanoramas.org'>SRTM</a> | Map style: &copy; <a href='https://opentopomap.org'>OpenTopoMap</a> (<a href='https://creativecommons.org/licenses/by-sa/3.0/'>CC-BY-SA</a>)"
        });

        let Stadia_AlidadeSmoothDark = new TileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
            maxZoom: 20,
            attribution: "&copy; <a href='https://stadiamaps.com/''>Stadia Maps</a>, &copy; <a href='https://openmaptiles.org/''>OpenMapTiles</a> &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors"
        });

        let Esri_WorldImagery = new TileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
            attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        });

        let CartoDB_DarkMatterNoLabels = new TileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
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

        // S W N E: 50.62250,5.41630,50.65655,5.47567
        function oscarsAttributions() {
            return "<span style='color: #db2004;'>&copy;" + /* "2015-"+((new Date()).getFullYear())+ */ "&nbsp;</span><a href='https://www.oscars-sa.eu/' title='Awesome Geo Intelligent Platform Creator' style='color: #db2004;'>Powered by Oscars\' Geo Intelligent Platform</a>&nbsp;";
        }

        let airportOverlay = new ImageOverlay("src/data/eblg-day.svg", new LatLngBounds(
            new LatLng(50.62250, 5.41630), // en bas à gauche
            new LatLng(50.65655, 5.47567)), { // en haut à droite 
            opacity: 0.8
        });
        airportOverlay.getAttribution = oscarsAttributions

        let airportNightOverlay = new ImageOverlay("src/data/eblg-night.svg", new LatLngBounds(
            new LatLng(50.62250, 5.41630), // en bas à gauche
            new LatLng(50.65655, 5.47567)), { // en haut à droite 
            opacity: 1
        });
        airportNightOverlay.getAttribution = oscarsAttributions

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

        let r1 = new AntPath([
                [50.65367800515634, 5.469925403594971],
                [50.645977340713586, 5.457737445831299]
            ], rabbit),
            r2 = new AntPath([
                [50.62299029225287, 5.421152114868163],
                [50.63156581667872, 5.434885025024414]
            ], rabbit),
            r3 = new AntPath([
                [50.651766562235494, 5.462635159492493],
                [50.64411320922499, 5.450441837310791]
            ], rabbit)

        let night = new LayerGroup([airportNightOverlay, r1, r2, r3]),
            day = airportOverlay

        this.options.layers = [OpenStreetMap_France]

        this.options.layerControl = {
            baseLayers: baseLayers,
            overlays: {
                "<span style='color: #0C64AF;''><img src='src/data/eblg-logo.svg' width='14' height='14'>&nbsp;Liège Airport</span>": {
                    "<span style='color: #EE850A;''>Day</span>": day,
                    "<span style='color: #EE850A;''>Night</span>": night
                }
            },
            options: {
                groupCheckboxes: true,
                collapsed: true,
                exclusiveGroups: ["<span style='color: #0C64AF;''><img src='src/data/eblg-logo.svg' width='14' height='14'>&nbsp;Liège Airport</span>"]
            }
        }

        this.options.themes = {
            dark: [night, CartoDB_DarkMatterNoLabels],
            light: [day, OpenStreetMap_France]
        }


        this.map = new LeafletMap(this.options.elemid, { // Map() is JS ES6 object
            center: this.options.center,
            zoom: this.options.zoom,
            layers: this.options.layers,
            zoomSnap: 0.5,
            attributionControl: true
        })

        this.map.setView(this.options.center, this.options.zoom)

        L.control.betterscale({ metric: true, imperial: false, position: "bottomleft" }).addTo(this.map) // either one or the other but not both

        this.layerControl = L.control.groupedLayers(
            this.options.layerControl.baseLayers,
            this.options.layerControl.overlays,
            this.options.layerControl.options ? this.options.layerControl.options : this.options.layerControlOptions).addTo(this.map)


        // Easy button
        let that = this
        var stateChangingButton = L.easyButton({
            states: [{
                stateName: "zoom-to-area",
                icon: "fa-map",
                title: "Airport area",
                onClick: function(btn, map) {
                    map.setView(that.options.center, that.options.zoom_overview);
                    btn.state("zoom-to-airport");
                }
            }, {
                stateName: "zoom-to-airport", // name the state
                icon: "fa-plane", // and define its properties
                title: "Airport ground", // like its title
                onClick: function(btn, map) { // and its callback
                    map.setView(that.options.center, that.options.zoom);
                    btn.state("zoom-to-area"); // change state on click!
                }
            }]
        });
        stateChangingButton.addTo(this.map);


        // decoration
        const tower = [50.63725474594362, 5.453993082046508]
        let radar = new LayerGroup()
        radar.addTo(this.map)

        let redCircle = new Circle(tower, { radius: 80000, color: "red", opacity: 0.3, weight: 1, fill: false })
        redCircle.addTo(radar)
        let blueCicle = new Circle(tower, { radius: 160000, color: "blue", opacity: 0.3, weight: 1, fill: false })
        blueCicle.addTo(radar)
        let towerPulse = new Marker(tower, { icon: L.icon.pulse({ iconSize: [10, 10], color: "red" }) })
        towerPulse.addTo(radar);

        this.listen(this.update.bind(this))

        console.log("Omap::install", "ready")
    }


    /**
     * Listener entry point
     *
     * @param      {String}  msg     The message
     * @param      {Object}  data    The data
     */
    update(msg, data) {
        switch (msg) {
            case MAP_MSG:
                this.updateOnMap(data)
                break
            case DARK_MSG:
                this.updateOnDark(data)
                break
            default:
                console.warn("Omap::update", "unhandled messages received", msg, data)
        }
    }


    /**
     * Update single GeoJSON feature in optionnaly supplied layer.
     * If leayer name is not supplied, try to guess it from feature's properties.
     * If not found, use default generic layer (named "Other").
     *
     * @param      {Object}   feature     The feature
     * @param      {String}  [ln=false]   The layer name
     */
    updateOnMap(feature, ln = false) {
        let layerName = ln || getFeatureLayerName(feature)
        let layer = this.layers.get(layerName)
        if (!layer) { // we create a new layer for these things
            layer = this.addLayer(layerName, "Other")
        }
        if (layer) {
            let featureOldLayer = getFeatureLayer(feature)
            layer.addData(feature)
            if (featureOldLayer) {
                layer.removeLayer(featureOldLayer)
            }
        } else {
            console.warn("Omap::update", "layer not found", layerName)
        }
    }


    /**
     * Update map layers on day/night light/dark mode switch.
     *
     * @param      {String}  mode    The mode {DARK|LIGHT}.
     */
    updateOnDark(mode) {
        const that = this
        if (mode == DARK) {
            this.options.themes.dark.forEach(function f(l) {
                l.addTo(that.map)
            })
            this.options.themes.light.forEach(function f(l) {
                that.map.removeLayer(l)
            })
        } else if (mode == LIGHT) {
            this.options.themes.light.forEach(function f(l) {
                l.addTo(that.map)
            })
            this.options.themes.dark.forEach(function f(l) {
                that.map.removeLayer(l)
            })
        } else {
            console.warn("Omap::dark: invalid mode", mode)
        }
    }


    /**
     * Adds a layer.
     *
     * @param      {<type>}  layerName  The layer name
     * @param      {<type>}  groupName  The group name
     * @return     {<type>}  { description_of_the_return_value }
     */
    addLayer(layerName, groupName) {
        let layer = new GeoJSONLAyer(undefined, {
            pointToLayer: pointToLayer,
            style: style,
            onEachFeature: onEachFeature
        }).addTo(this.map)
        this.layers.set(layerName, layer)
        this.layerControl.addOverlay(layer, layerName, groupName)
        console.log("Omap::addLayer", "added", layerName, groupName)
        return layer
    }


    /**
     * Add GeoJSON to named layer.
     *
     * @param      {String}  layerName  The layer name
     * @param      {Object}  geojson    GeoJSON object
     */
    add(layerName, geojson) {
        let layer = this.layers.get(layerName)
        if (layer) {
            layer.addData(geojson)
        } else {
            console.warn("Omap::add", "layer not found", layerName, layer)
        }
    }


    /**
     * Save class instance essentials for restoration
     */
    passivate() {
        let content = {}

        this.layers.forEach((n, l) => {
            content[n] = l.toGeoJSON()
        })

        localStorage.setItem(this.elemid, JSON.stringify(content))
    }

}