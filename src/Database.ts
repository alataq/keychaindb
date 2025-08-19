import { PluginManager } from "./PluginManager";
import { BasePlugin, Data, Value } from "./BasePlugin";

export class Database {
    private pluginManager: PluginManager;
    private cache: Map<string, Data> = new Map;

    constructor() {
        this.pluginManager = new PluginManager(this);
    }

    use(plugin: BasePlugin): object | undefined {
        return this.pluginManager.use(plugin);
    }

    set(key: string, value: Value) {
        let data: Data = { value: value };

        this.pluginManager.beforeSet(key, value, data, (newKey?: string, newValue?: Value, newData?: Data) => {
            if (newKey) key = newKey;
            if (newValue) data.value = newValue;
            if (newData) data = newData;

            this.cache.set(key, data);
            
            this.pluginManager.afterSet(key, data);
            this.pluginManager.onSet(key, data);
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
                this.pluginManager.onGet(key, data);
            }
        });

        return result;
    }

    delete(key: string): void {
        this.pluginManager.beforeDelete(key, (newKey?: string) => {
            if (newKey) key = newKey;
            
            if (this.cache.delete(key)) {
                this.pluginManager.afterDelete(key);
                this.pluginManager.onDelete(key);
            }
        });
    }
}