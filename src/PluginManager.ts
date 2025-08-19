import { BasePlugin, Data, Value } from "./BasePlugin";
import { Database } from "./Database";

export class PluginManager {
    private plugins: BasePlugin[] = [];
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    use(plugin: BasePlugin) {
        this.plugins.push(plugin);
        plugin.onLoad(this.db);
    }

    private runHookChain(hooks: (Function | undefined)[], initialArgs: any[], finalCallback: (...args: any[]) => void) {
        let index = 0;
        const callNext = (...args: any[]) => {
            if (index < hooks.length) {
                const hook = hooks[index];
                index++;
                if (typeof hook === 'function') {
                    hook(...args, callNext);
                } else {
                    callNext(...args);
                }
            } else {
                finalCallback(...args);
            }
        };
        callNext(...initialArgs);
    }

    beforeSet(key: string, value: Value, data: Data, callback: (newKey?: string, newValue?: Value, newData?: Data) => void) {
        const hooks = this.plugins.map(p => p.beforeSet);
        this.runHookChain(hooks, [key, value, data], callback);
    }

    afterSet(key: string, data: Data) {
        for (const plugin of this.plugins) {
            if (plugin.afterSet) {
                plugin.afterSet(key, data);
            }
        }
    }

    beforeGet(key: string, callback: (newKey?: string) => void) {
        const hooks = this.plugins.map(p => p.beforeGet);
        this.runHookChain(hooks, [key], callback);
    }

    afterGet(key: string, data: Data) {
        for (const plugin of this.plugins) {
            if (plugin.afterGet) {
                plugin.afterGet(key, data);
            }
        }
    }

    beforeDelete(key: string, callback: (newKey?: string) => void) {
        const hooks = this.plugins.map(p => p.beforeDelete);
        this.runHookChain(hooks, [key], callback);
    }

    afterDelete(key: string) {
        for (const plugin of this.plugins) {
            if (plugin.afterDelete) {
                plugin.afterDelete(key);
            }
        }
    }

    onSet(key: string, data: Data) {
        for (const plugin of this.plugins) {
            if (plugin.onSet) {
                plugin.onSet(key, data);
            }
        }
    }

    onGet(key: string, data: Data) {
        for (const plugin of this.plugins) {
            if (plugin.onGet) {
                plugin.onGet(key, data);
            }
        }
    }

    onDelete(key: string) {
        for (const plugin of this.plugins) {
            if (plugin.onDelete) {
                plugin.onDelete(key);
            }
        }
    }
}