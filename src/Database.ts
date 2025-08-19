import { PluginManager } from "./PluginManager";
import { BasePlugin, type Data, type Value } from "./BasePlugin";
import { EventManager, EventType } from "./EventManager";

export class Database {
    private pluginManager: PluginManager;
    private cache: Map<string, Data> = new Map;
    private eventManager: EventManager = new EventManager;

    constructor() {
        this.pluginManager = new PluginManager(this);
    }

    use(plugin: BasePlugin): object | undefined {
        return this.pluginManager.use(plugin);
    }

    on(name: string, callback: (...args: any[]) => void): void {
        this.eventManager.register({ name, type: EventType.REPEATABLE, callback });
    }

    once(name: string, callback: (...args: any[]) => void): void {
        this.eventManager.register({ name, type: EventType.ONCE, callback });
    }

    off(name: string): void {
        this.eventManager.purge(name);
    }

    set(key: string, value: Value) {
        let data: Data = { value: value };

        this.pluginManager.beforeSet(key, value, data, (newKey?: string, newValue?: Value, newData?: Data) => {
            if (newKey) key = newKey;
            if (newValue) data.value = newValue;
            if (newData) data = newData;

            this.cache.set(key, data);
            
            this.pluginManager.afterSet(key, data);

            setTimeout(() => {
                this.pluginManager.onSet(key, data);
                this.eventManager.emit("set", key, data);
            }, 0);
        });
    }

    get(key: string): Value | undefined {
        let result: Value | undefined = undefined;

        this.pluginManager.beforeGet(key, (newKey?: string) => {
            if (newKey) key = newKey;
            
            const data = this.cache.get(key);
            if (data) {
                result = data.value;
                this.pluginManager.afterGet(key, data);

                setTimeout(() => {
                    this.pluginManager.onGet(key, data);
                    this.eventManager.emit("get", key, data);
                }, 0);
            }
        });

        return result;
    }

    delete(key: string): void {
        this.pluginManager.beforeDelete(key, (newKey?: string) => {
            if (newKey) key = newKey;
            
            if (this.cache.delete(key)) {
                this.pluginManager.afterDelete(key);

                setTimeout(() => {
                    this.pluginManager.onDelete(key);
                    this.eventManager.emit("delete", key);
                }, 0);
            }
        });
    }
}