const SOCDriver = require("./driver/soc")
const PersistentDriver = require("./driver/persistent")
const SSCDriver = require("./driver/ssc")

const EventType = Object.freeze({
    REPEATABLE: 0,
    ONCE: 1
  });

/**
 * @description The only class you'll ever need.
 */
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
        this.events.push({ eventName, callback, type: EventType.REPEATABLE });
    }

    once(eventName, callback){
        this.events.push({ eventName, callback, type: EventType.ONCE });
    }

    emit(eventName, ...args) {
        // Iterate backwards to safely remove items while iterating
        for (let i = this.events.length - 1; i >= 0; i--) {
            const event = this.events[i];
            if (event.eventName === eventName) {
                // Execute the callback first
                event.callback(...args);
                
                // Remove if it's a once-time event
                if (event.type === EventType.ONCE) {
                    this.events.splice(i, 1);
                }
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
            ...entry
        };
    
        for (const hook of this.controller.beforeGet) {
            const modifiedEntry = hook(entryJson)
            if (modifiedEntry) {
                entryJson = { ...entryJson, ...modifiedEntry }
            }
        }
    
        return entryJson.value
    }

    find(query) {
        const results = [];
    
        for (const [key, entry] of this.cache) {
            if (this.isExpired(key)) continue;
    
            let match = false;
    
            if (typeof query === 'object') {
                for (const [field, value] of Object.entries(query)) {
                    if (entry.value[field] === value) {
                        match = true;
                    } else {
                        match = false;
                        break;
                    }
                }
            } else if (typeof query === 'function') {
                match = query(entry.value);
            } else if (query instanceof RegExp) {
                match = query.test(entry.value);
            } else {
                match = entry.value === query;
            }
    
            if (match) {
                results.push({ key, value: entry.value });
            }
        }
    
        return results;
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

    keys(){
        return this.cache.keys()
    }

    values(){
        return this.cache.values()
    }

    entries(){
        return this.cache.entries()
    }
}

module.exports = {Database, SOCDriver, PersistentDriver, SSCDriver, EventType}