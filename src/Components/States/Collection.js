/**
 *
 */

import { Client } from "node-rest-client"

export const IDENTIFIER = "id"

import { RESTBASEURL } from "../Config"

/**
 * Remote "Map()" object accessed throught REST API
 *
 * @class      Collection (name)
 */

export class Collection {

    constructor(name) {
        this.name = name
        this.client = new Client()
        this.install()
    }


    install() {
        this.client.registerMethod("objGet", [RESTBASEURL, this.name, "${id}"].join("/"), "GET");
        this.client.registerMethod("objPut", [RESTBASEURL, this.name, "${id}"].join("/"), "PUT");
        this.client.registerMethod("objPost", [RESTBASEURL, this.name].join("/"), "POST");
    }


    set(id, obj) {
        obj[IDENTIFIER] = id

        this._upsert(obj)
    }


    _upsert(obj) {
        let old = get(obj[IDENTIFIER])
        let resp

        if (old) {
            obj = deepExtend(old, obj)
            const args = {
                path: { "id": id },
                data: obj
            }
            // eslint-disable-next-line no-unused-vars
            this.client.objPut(args, function(data, response) {
                resp = data
            })
        } else {
            const args = {
                data: obj
            }
            // eslint-disable-next-line no-unused-vars
            this.client.objPost(args, function(data, response) {
                resp = data
            })
        }
        return resp
    }


    get(id) {
        const args = {
            path: { "id": id } // path substitution var
        }
        let resp
        // eslint-disable-next-line no-unused-vars
        this.client.objGet(args, function(data, response) {
            resp = data
        })
        return resp
    }


    select(grahpql) {
        return this.client.q(grahpql)
    }

}