/**
 * @author Johan Delhomme Montorfano <me@johanmontorfano.com>
 * @description Types and JSDoc descriptions.
**/ 

/**
 * @param {Object} entry - Entry that has been manipulated
 * @param {string} entry.key
 * @param {any} entry.value
 * @param {number} entry.writedate
 * @param {number} entry.expire
**/ 
export declare function ControllerCallback(entry: {
    key: string,
    value: any,
    writedate: number,
    expire: number
}): void;

/**
 * Solid Operation Cache driver to use with `Database`
 * ```js
 * const db = new Database();
 * 
 * db.use(SOCDriver, {path: <filename>});
 * ```
 *
 * @param {Database} db - Database to operate on
 * @param {Object} config - Configuration of the driver
 * @param {string} config.path - Cache storage file path
**/
export declare function SOCDriver(db: Database, config: {path: string}): void;

/**
 *  Driver for the `Database` class used to periodically
 *  save read content to a text file.
 *
 *  Usage:
 *  ```js
 *  const db = new Database();
 *
 *  db.use(PersistentDriver, { path: <filename> });
 *  ```
 * 
 * @param {Database} db - Database to operate on.
 * @param {Object} config - Driver configuration.
 * @param {string} config.path - Path of the file to save data to.
 * 
 * Adds the following public properties to db:
 * @property {Function} fromStorage - Reset the database with file content.
**/
export declare function PersistentDriver(
    db: Database,
    config: {path: string}
): void;

/**
 * @class
 * Database instance.
**/
export declare class Database {
    constructor();
    /**
     * Add a event listener for specific events.
     * 
     * @param {string} eventName - Event to subscribe to. Events sent by
     * default are "ready, "set" and "delete".
     * @param {Function} callback - Callback function that takes an infinite
     * number of arguments.
    **/
    on(eventName: string, callback: (...args: any) => void): void;
    /**
     * Emit an event to listeners.
     *
     * @param {string} eventName
     * @param {...any} args - Arguments to submit to listeners.
    **/
    emit(eventName: string, ...args: any): void;
    /**
     * Set a key/pair to the database.
     *
     * @param {any} key
     * @param {any} value
     * @param {number} expire - Cache expiration
    **/
    set(key: any, value: any, expire: number): void;
    /**
     * Key/pair to delete from the database.
     *
     * @param {any] key
    **/
    delete(key: any): void;
    /**
     * Retrieve the value of a key.
     *
     * @param {any} key
     * @returns {any}
    **/
    get(key: any): any;
    /**
     * Search for matching key/pair by values.
     *
     * @param {any} query
     * @returns {Array<Object>} - List of results
     * @returns {Array<Object>[i].key}
     * @returns {Array<Object>[i].value}
    **/
    find(query: any): {key: any, value: any}[];
    /**
     * Determine if a key exist.
     *
     * @param {any} key
     * @returns {boolean}
    **/
    has(key: any): boolean;
    /**
     * Emit a "ready" event and mark the database as ready.
    **/
    login(): void;
    /**
     * Determines if a key has expired in cache.
     *
     * @param {any} key
     * @returns {boolean}
    **/
    isExpired(key: any): boolean;
    /**
     * Implement a plugin/driver methods to the instance. Default drivers
     * are `SOCDriver` and `PersistentDriver`.
     *
     * @param {Function} callback - Plugin/driver initializer
    **/
    use(callback: (instance: Database, options: any) => void): void;
    beforeSet(callback: ControllerCallback): void;
    beforeGet(callback: ControllerCallback): void;
    beforeDelete(callback: ControllerCallback): void;
    beforeReady(callback: ControllerCallback): void;
    keys(): any[];
    values(): any[];
    entries(): [any, any][];
}
