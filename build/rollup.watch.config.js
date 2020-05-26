import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import image from "@rollup/plugin-image"

import { eslint } from "rollup-plugin-eslint"
import postcss from "rollup-plugin-postcss"
import postcssImport from "postcss-import"
import postcssUrl from "./plugins/postcssUrl" // copied from https://github.com/pashaigood/bundlers-comparison

import serve from "rollup-plugin-serve"
import livereload from "rollup-plugin-livereload"

process.env.NODE_ENV = "development"

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
// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false

export default {
    plugins: [
        resolve(),
        commonjs(),
        json(),
        image(),
        postcss({
            extract: true,
            plugins: [
                postcssImport(),
                ...postcssUrl({
                    basePath: [
                        Paths.SRC+"/css",
                        Paths.NODE_MODULES+"/line-awesome/dist/font-awesome-line-awesome/css",
                        Paths.NODE_MODULES+"/line-awesome/dist/line-awesome/css",
                        Paths.NODE_MODULES+"/leaflet/dist"
                    ],
                    assetsPath: Paths.DIST + "/assets",
                    dest: Paths.DIST
                })
            ]
        }),
        eslint({
            include: [
                Paths.SRC+"/app.js",
                Paths.SRC+"/Components/**.js"
            ]
        }),
        serve(),      // index.html should be in root of project
        livereload()
    ],
    input: Paths.INPUT,
    output: {
        file: Paths.OUTPUT,
        format: "iife"
    }
};