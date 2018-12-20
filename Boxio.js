'use strict'

class Storage {

    constructor(config = { namespace: 'global', debug: false }) {
        this.namespace = config.namespace ? config.namespace : 'global'
        this.debug = config.debug ? true : false
    }

    static init() {
        let originalSetItem = sessionStorage.setItem
        sessionStorage.setItem = function () {
            let event = new Event('boxen-'+this.namespace)
            originalSetItem.apply(this, arguments)
            document.dispatchEvent(event)
        }
    }

    static listen(operation) {
        return document.addEventListener('unbox', operation)
    }

    static hash(s) {
        return this.debug ? s : (s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)).toString()
    }

    static clear() {
        Storage.page('outofservice')
        sessionStorage.clear()
    }

    static get(st) {
        st = sessionStorage.getItem(Storage.byNamespace(st))
        return this.debug ? st : st === null ? st : atob(st)
    }

    static merge(st, obj) {
        Storage.set(Object.assign(JSON.parse(sessionStorage.get(st)), ...obj))
    }

    static byNamespace(st) {
        const namespace = this.namespace ? this.namespace : 'global'
        return Storage.hash(`${namespace}-${st}`)
    }

    static set(st, value) {
        value = this.debug ? value : btoa(value)
        return sessionStorage.setItem(Storage.byNamespace(st), value)
    }

    static page(page) {
        Storage.set('previous', Storage.get(Storage.byNamespace('page')))
        Storage.set('page', page)
    }
}

class Helper {

    constructor(storage = false) {
        this.storage = storage ? storage : new Storage()
    }

    write(e, action) {
        switch (action) {
            case "write":
                const val = this.storage.get([e.target.name]) !== null ? this.storage.get([e.target.name]) : ''
                this.storage.set([e.target.name], val + e.target.value)
                break
            case "clear":
                this.storage.set([e.target.name], '')
                break
            default:
                this.setState({ [e.target.name]: e.target.value })
                break
        }
    }
}

module.exports = {
    Storage,
    Helper
}