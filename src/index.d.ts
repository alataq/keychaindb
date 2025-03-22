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
export declare function SOCDriver(
    db: Database,
    config?: Partial<{path: string}>
): void;

/**
 * @class
 * Database instance.
**/
export declare class Database {
    constructor(config: {});
    on(eventName: string, callback: (...args: any) => void): void;
    emit(eventName: string, ...args: any): void;
    set(key: string, value: any, expire: number): void;
    delete(key: string): void;
    get(key: string): any;
    find(query: any): any[];
    has(key: string): boolean;
    login(): void;
    isExpired(key: string): boolean;
    use(callback: (instance: Database, options: any) => void): void;
    beforeSet(callback: ControllerCallback): void;
    beforeGet(callback: ControllerCallback): void;
    beforeDelete(callback: ControllerCallback): void;
    beforeReady(callback: ControllerCallback): void;
    keys(): any[];
    values(): any[];
    entries(): [any, any][];
}
