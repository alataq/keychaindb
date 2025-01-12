const SOCDriver = require("./driver/soc")

class Database {
    constructor (config = {}) {
        this.events = []
        this.cache = new Map()
        this.config = config
        this.isReady = false
    }

    on(eventName, callback) {
        this.events.push({ eventName, callback });
    }

    emit(eventName, ...args) {
        for(let event of this.events) {
            if(event.eventName === eventName) {
                event.callback(...args);
            }
        }
    }

    set(key, value, expire = 0) {
        let writedate = Date.now()
        this.cache.set(key, {
            value,
            writedate,
            expire
        });
        this.emit('set', key, value, writedate, expire);
    }

    delete(key){
        this.cache.delete(key);
        this.emit('delete', key);
    }

    get(key){
        return this.cache.has(key) && !this.isExpired(key) ? this.cache.get(key).value : null;
    }

    has(key){
        return this.cache.has(key);
    }

    login() {
            this.isReady = true;
            this.emit('ready');
    }

    isExpired(key) {
        const cacheEntry = this.cache.get(key);
        if (!cacheEntry) {
            return false;
        }
    
        const expireDate = cacheEntry.expire;
        const currentDate = Date.now();
    
        return (expireDate <= currentDate) && (expireDate !== 0);
    }

    use(callback, options = {}) {
        try {
            callback(this, options)
        } catch (error) {
            throw new Error(`Impossible to load a plugin or driver : ${error.message}`);
        }
    }

}

module.exports = {Database, SOCDriver}