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

import pkg from "../package.json"

process.env.NODE_ENV = "development"

const CWD = process.cwd()
const Paths = {
    SRC: `${CWD}/src`,
    DIST: `${CWD}/dist`,
    NODE_MODULES: `${CWD}/node_modules`
}
Object.assign(Paths, {
    INPUT: Paths.SRC + "/index.js",
    OUTPUT: Paths.DIST + "/index.js"
})


export default {
    plugins: [
        clean(),
        resolve(),
        commonjs(),
        json(),
        pug(),
        image(),
        postcss({
            extract: true,
            plugins: [
                postcssImport(),
                ...postcssUrl({ // https://github.com/pashaigood/bundlers-comparison
                    basePath: [
                        Paths.SRC + "/css",
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
                "src/app.js",
                "src/Components/**.js"
            ]
        }),
        {   // https://github.com/patarapolw/minimal-rollup-ts-pug-sass-template
            name: "emitPug",
            generateBundle() {
                fs.writeFileSync(path.join(`${ CWD }`, "index.html"), pugAPI.compileFile("src/index.pug")({
                    description: pkg.description,
                    title: pkg.name
                }))
            }
        },
        ...(process.env.NODE_ENV === "production" ? [
            terser()
        ] : [])
    ],
    input: "src/app.js",
    output: {
        file: "dist/app.js",
        format: "iife"
    }
};