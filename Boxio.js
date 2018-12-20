'use strict'

class Storage {

    constructor(config = { namespace: 'global', debug: false }) {
        this.namespace = config.namespace ? config.namespace : 'global'
        this.debug = config.debug ? true : false
    }

    static init() {
        let originalSetItem = sessionStorage.setItem
        sessionStorage.setItem = function () {
            let event = new Event('boxio')
            originalSetItem.apply(this, arguments)
            document.dispatchEvent(event)
        }
    }

    init() {
        let originalSetItem = sessionStorage.setItem
        sessionStorage.setItem = function () {
            let event = new Event('boxio-'+this.namespace)
            originalSetItem.apply(this, arguments)
            document.dispatchEvent(event)
        }
    }

    static listen(operation) {
        return document.addEventListener('boxio', operation)
    }

    listen(operation) {
        return document.addEventListener('boxio-'+this.namespace, operation)
    }

    static hash(s) {
        return s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0).toString()
    }

    hash(s) {
        return this.debug ? s : (s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)).toString()
    }

    static clear() {
        sessionStorage.clear()
    }

    clear() {
        sessionStorage.clear()
    }

    static get(st) {
        st = sessionStorage.getItem(Storage.byNamespace(st))
        return st === null ? st : atob(st)
    }

    get(st) {
        st = sessionStorage.getItem(this.byNamespace(st))
        return this.debug ? st : st === null ? st : atob(st)
    }

    static merge(st, obj) {
        Storage.set(Object.assign(JSON.parse(sessionStorage.get(st)), ...obj))
    }

    merge(st, obj) {
        this.set(Object.assign(JSON.parse(sessionStorage.get(st)), ...obj))
    }

    static byNamespace(st) {
        const namespace = this.namespace ? this.namespace : 'global'
        return Storage.hash(`${namespace}-${st}`)
    }

    byNamespace(st) {
        const namespace = this.namespace ? this.namespace : 'global'
        return this.hash(`${namespace}-${st}`)
    }
    
    static set(st, value) {
        value = btoa(value)
        return sessionStorage.setItem(Storage.byNamespace(st), value)
    }

    set(st, value) {
        value = this.debug ? value : btoa(value)
        return sessionStorage.setItem(this.byNamespace(st), value)
    }

    static page(page) {
        Storage.set('previous', Storage.get(Storage.byNamespace('page')))
        Storage.set('page', page)
    }

    page(page) {
        this.set('previous', this.get(this.byNamespace('page')))
        this.set('page', page)
    }
}

class Helper {

    constructor(storage = false) {
        this.storage = storage ? storage : new Storage()
    }

    static write(e, action) {
        switch (action) {
            case "write":
                const val = Storage.get([e.target.name]) !== null ? Storage.get([e.target.name]) : ''
                Storage.set([e.target.name], val + e.target.value)
                break
            case "clear":
                Storage.set([e.target.name], '')
                break
            default:
                this.setState({ [e.target.name]: e.target.value })
                break
        }
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