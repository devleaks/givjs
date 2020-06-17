/*
 * GIP Viewer
 * 2017-2020 Pierre M
 * License: MIT
 *
 * Starts main viewer application.
 * Look ma, no jquery.
 */
import "line-awesome/dist/font-awesome-line-awesome/css/all.css"
import "line-awesome/dist/line-awesome/css/line-awesome.css"

import { App } from "./Components/App"

let app = new App({})

app.run()