const SOCDriver = require("./driver/soc")

class Database {
    constructor (config = {}) {
        this.events = []
        this.cache = new Map()
        this.config = config
        this.isReady = false

        this.controller = {
            beforeReady: [],
            beforeSet: [],
            beforeGet: [],
            beforeDelete: []
        }
    }

    on(eventName, callback) {
        this.events.push({ eventName, callback })
    }

    emit(eventName, ...args) {
        for(let event of this.events) {
            if(event.eventName === eventName) {
                event.callback(...args)
            }
        }
    }

    set(key, value, expire) {
        let entry = {
            key,
            value,
            expire,
            writedate: Date.now(),
        };
    
        // Execute beforeSet hooks
        for (const hook of this.controller.beforeSet) {
            const modifiedEntry = hook(entry)
            if (modifiedEntry) {
                entry = { ...entry, ...modifiedEntry }
            }
        }
    
        this.cache.set(entry.key, {
            value: entry.value,
            writedate: entry.writedate,
            expire: entry.expire ? entry.writedate + entry.expire : 0,
        });
    
        this.emit('set', entry.key, entry.value, entry.writedate, entry.expire)
    }

    delete(key) {
        const entry = this.cache.get(key)
        if (!entry) return
    
        let entryJson = {
            key,
            value: entry.value,
            writedate: entry.writedate,
            expire: entry.expire,
        };
    
        for (const hook of this.controller.beforeDelete) {
            const modifiedEntry = hook(entryJson)
            if (modifiedEntry) {
                entryJson = { ...entryJson, ...modifiedEntry }
            }
        }
    
        this.cache.delete(key)
        this.emit('delete', key)
    }

    get(key) {
        const entry = this.cache.get(key)
        if (!entry || this.isExpired(key)) return null
    
        let entryJson = {
            key,
            value: entry.value,
            writedate: entry.writedate,
            expire: entry.expire,
        };
    
        for (const hook of this.controller.beforeGet) {
            const modifiedEntry = hook(entryJson)
            if (modifiedEntry) {
                entryJson = { ...entryJson, ...modifiedEntry }
            }
        }
    
        return entryJson.value
    }

    has(key){
        return this.cache.has(key)
    }

    login() {
            this.isReady = true
            this.emit('ready')
    }

    isExpired(key) {
        const cacheEntry = this.cache.get(key)
        if (!cacheEntry) {
            return false
        }
    
        const expireDate = cacheEntry.expire;
        const currentDate = Date.now();
    
        return (expireDate <= currentDate) && (expireDate !== 0)
    }

    use(callback, options = {}) {
        try {
            callback(this, options)
        } catch (error) {
            throw new Error(`Impossible to load a plugin or driver : ${error.message}`)
        }
    }

    beforeSet(callback) {
        this.controller.beforeSet.push(callback)
    }

    beforeGet(callback) {
        this.controller.beforeGet.push(callback)
    }

    beforeDelete(callback) {
        this.controller.beforeDelete.push(callback)
    }

    beforeReady(callback) {
        this.controller.beforeReady.push(callback)
    }

}

module.exports = {Database, SOCDriver}