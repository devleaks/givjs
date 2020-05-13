import resolve from "rollup-plugin-node-resolve"
import commonjs from "rollup-plugin-commonjs"
import json from "rollup-plugin-json"
import { eslint } from "rollup-plugin-eslint"
import postcss from "rollup-plugin-postcss"
import postcssImport from "postcss-import"
import postcssUrl from "./plugins/postcssUrl"

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
// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false

export default {
    plugins: [
        resolve(),
        commonjs(),
        json(),
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
                "src/app.js",
                "src/Components/**.js"
            ]
        })
    ],
    input: "src/app.js",
    output: {
        file: "dist/app.js",
        format: "iife"
    }
};