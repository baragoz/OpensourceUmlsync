class Blackboard {
    listeners = {};
    storageMap = new Map();

    constructor() {}

    notify(name, data, extra) {
        if (this.listeners[name]) {
            this.listeners[name].forEach((listener) => {
                if (typeof listener === "function") {
                    listener(data, extra || {})
                } else if (typeof listener.onBlackboardChange === "function") {
                    listener.onBlackboardChange(name, data, extra || {});
                }
            });
        }
    }

    addEventListener(eventNames, listener) {
        if (typeof eventNames === "string") {
            this.#addEventListenerInternal(eventNames, listener);
        } else if (Array.isArray(eventNames)) {
            eventNames.forEach(name => {
                this.#addEventListenerInternal(name, listener);
            });
        }
    }

    // Private method
    #addEventListenerInternal(eventName, listener) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(listener);
    }

    //
    // Uses for values which we do not want to cache in each add on
    //
    setStorageValue(key, value) {
        let oldValue = this.storageMap.get(key);

        if (oldValue != value) {
            this.storageMap.set(key, value);
            this.notify("storage:" + key, {
                oldValue: oldValue,
                newValue: value
            }, {});
        }
    }

    getStorageValue(key) {
        return this.storageMap.get(key);
    }

}

export { Blackboard };
