

const APP_NAME_KEY="chess_dapp"

// FIXME:
export default class localStorageUtils {

    constructor() {
        this.refresh();
    }

    refresh() {
        var localStore = localStorage.getItem(APP_NAME_KEY);
        this.store = {}

        if (localStore == null) {
            this.store = {}
        } else {
            this.store = JSON.parse(localStore)
        }
    }

    setValue(key, value) {
        this.refresh()
        this.store[key] = value
        localStorage.setItem(APP_NAME_KEY, JSON.stringify(this.store));
    }

    getValue(key) {
        this.refresh()
        return this.store[key]
    }
}