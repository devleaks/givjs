/*  Base class for subscriber to Dispatcher messages
 */

export class Store {

    constructor() {
        this.store = new Map()
    }

    set(k, v) {
      this.store.set(k,v)
    }

    get(k) {
      this.store.get(k)
    }


    find(c) {
      
    }

}