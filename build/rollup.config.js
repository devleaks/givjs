import fs from "fs"
import path from "path"

import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import image from "@rollup/plugin-image"

import pugAPI from "pug"
import pug from "rollup-plugin-pug"

import { eslint } from "rollup-plugin-eslint"
import { terser } from "rollup-plugin-terser"
import postcss from "rollup-plugin-postcss"
import postcssImport from "postcss-import"
import postcssUrl from "./plugins/postcssUrl"
import clean from "rollup-plugin-clean"
import copy from "rollup-plugin-copy"

import pkg from "../package.json"

const DEVELOPMENT = "development"
const PRODUCTION = "production"

process.env.NODE_ENV = DEVELOPMENT

const CWD = process.cwd()
const Paths = {
    SRC: `${CWD}/src`,
    DIST: `${CWD}/dist`,
    NODE_MODULES: `${CWD}/node_modules`
}
Object.assign(Paths, {
    INPUT: Paths.SRC + "/app.js",
    OUTPUT: Paths.DIST + "/app.js"
})


export default {
    plugins: [
        clean(),
        resolve(),
        commonjs(),
        json(),
        pug(),
        image(),
        copy({
            targets: [
                { src: "index.html", dest: "dist/" },
                { src: ["assets/assets/i/favicon.ico"], dest: "dist/" },
                {
                    src: [
                        "src/data/eblg-logo.svg",
                        "src/data/eblg-parking-boxes.geojson",
                        "src/data/EBLG_GMC01_v13.svg",
                        "src/data/EBLG_GMC01_v13-night.svg"
                    ],
                    dest: "dist/src/data/"
                }
            ]
        }),
        postcss({
            extract: true,
            plugins: [
                postcssImport(),
                ...postcssUrl({ // https://github.com/pashaigood/bundlers-comparison
                    basePath: [
                        Paths.SRC + "/assets/css",
                        Paths.NODE_MODULES + "/line-awesome/dist/font-awesome-line-awesome/css",
                        Paths.NODE_MODULES + "/line-awesome/dist/line-awesome/css",
                        Paths.NODE_MODULES + "/leaflet/dist"
                    ],
                    assetsPath: Paths.DIST + "/assets",
                    dest: Paths.DIST
                })
            ]
        }),
        eslint({
            include: [
                "src/**.js"
            ]
        }),
        { // https://github.com/patarapolw/minimal-rollup-ts-pug-sass-template
            name: "emitPug",
            generateBundle() {
                fs.writeFileSync(path.join(Paths.DIST, "index.html"), pugAPI.compileFile("src/index.pug")({
                    description: pkg.description,
                    title: pkg.name
                }))
            }
        },
        ...(process.env.NODE_ENV === PRODUCTION ? [
            terser()
        ] : [])
    ],
    input: Paths.INPUT,
    output: {
        file: Paths.OUTPUT,
        format: "iife"
    }
};