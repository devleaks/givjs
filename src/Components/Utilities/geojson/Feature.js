import { GeoJSON } from "./GeoJSON"

export class Feature extends GeoJSON {

    constructor(geometry, properties = {}, id = false) {
        super("Feature")
        this.geometry = geometry
        this.properties = properties
        if (id)
            this.id = id
    }

    // returns id or false if no id is found.
    // lookup of potential props is performed until an id is found
    get id() {
        if(this.id) {
            return this.id
        }
        let id = false
        ["id","ID"/*you can add prop to search here like "name","identifier","serial"...*/].forEach( (name) => {
            if(id === false && this.properties.hasOwnProperty(name)) {
                id = this.properties[name]
            }
        })
        if(id !== false) {
            this.id = id
        }
        return id // or this.id? to return undefined?
    }

    get geometry() {
        return this.geometry
    }

    setProperty(name, value) {
        this.properties.set(name, value)
    }

    hasProperty(name) {
        return this.properties.hasOwnProperty(name)
    }

    getProperty(name, dft = false) {
        return this.hasProperty(name) ? this.properties[name] : dft
    }

    delProperty(name, dft = false) {
        if (this.hasProperty(name)) {
            delete this.properties[name]
        }
    }

}