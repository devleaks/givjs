/**
 *
 */

import JSONFormatter from "json-formatter-js"

/**
 * Utility function to shows the JSON in strutured way.
 *
 * @param      {Object}  data    The JSON object to display
 * @param      {Document Node}  hook    Document node where to show JSON object.
 * @return     {JSONFormatter}  The json formatter.
 */
export function showJson(data, newel) {
    const formatter = new JSONFormatter(data)
    newel.appendChild(formatter.render())
    return formatter
}