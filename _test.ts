import { describe, test, expect, mock } from "bun:test";
import { Database, BasePlugin } from './src';
import type { Data, Value } from './src/BasePlugin';

// --- Helper for async tests ---
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

// --- Test Suite ---

describe("Database Core Functionality", () => {
    let db: Database;

    // Initialize a new database before each test
    test("Initialization", () => {
        db = new Database();
        expect(db).toBeInstanceOf(Database);
    });

    // Test basic set and get operations
    test("should set and get a value", () => {
        db = new Database();
        db.set("key1", "value1");
        expect(db.get("key1")).toBe("value1");
    });

    // Test updating an existing value
    test("should update an existing value", () => {
        db = new Database();
        db.set("key1", "value1");
        db.set("key1", "newValue");
        expect(db.get("key1")).toBe("newValue");
    });

    // Test deleting a value
    test("should delete a value", () => {
        db = new Database();
        db.set("key1", "value1");
        db.delete("key1");
        expect(db.get("key1")).toBeUndefined();
    });

    // Test getting a non-existent value
    test("should return undefined for a non-existent key", () => {
        db = new Database();
        expect(db.get("nonexistent")).toBeUndefined();
    });
});

describe("Database Data Types", () => {
    let db: Database;

    test("should handle various data types", () => {
        db = new Database();
        const testData = {
            string: "hello world",
            number: 123,
            boolean: true,
            nullValue: null,
            array: [1, "test", { a: 1 }],
            object: { b: 2, c: "nested" }
        };

        for (const [key, value] of Object.entries(testData)) {
            db.set(key, value as Value);
        }

        for (const [key, value] of Object.entries(testData)) {
            expect(db.get(key)).toEqual(value);
        }
    });
});

describe("Database Events", () => {
    let db: Database;

    test("should emit 'set' event", async () => {
        db = new Database();
        const mockCallback = mock((key, data) => {
            expect(key).toBe("key1");
            expect(data.value).toBe("value1");
        });
        db.on("set", mockCallback);
        db.set("key1", "value1");
        await tick();
        expect(mockCallback).toHaveBeenCalled();
    });

    test("should emit 'get' event", async () => {
        db = new Database();
        const mockCallback = mock((key, data) => {
            expect(key).toBe("key1");
            expect(data.value).toBe("value1");
        });
        db.on("get", mockCallback);
        db.set("key1", "value1");
        db.get("key1");
        await tick();
        expect(mockCallback).toHaveBeenCalled();
    });

    test("should emit 'delete' event", async () => {
        db = new Database();
        const mockCallback = mock((key) => {
            expect(key).toBe("key1");
        });
        db.on("delete", mockCallback);
        db.set("key1", "value1");
        db.delete("key1");
        await tick();
        expect(mockCallback).toHaveBeenCalled();
    });

    test("should handle 'once' events correctly", async () => {
        db = new Database();
        const mockCallback = mock(() => {});
        db.once("set", mockCallback);
        db.set("key1", "value1");
        db.set("key2", "value2");
        await tick();
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test("should remove event listeners with 'off'", async () => {
        db = new Database();
        const mockCallback = mock(() => {});
        db.on("set", mockCallback);
        db.off("set");
        db.set("key1", "value1");
        await tick();
        expect(mockCallback).not.toHaveBeenCalled();
    });
});

describe("Database Plugins", () => {
    let db: Database;

    class TestPlugin extends BasePlugin {
        public api = {
            getPluginName: () => "TestPlugin"
        };

        onLoad = mock(() => {});
        beforeSet = mock((key, value, data, next) => next(key, value, data));
        afterSet = mock(() => {});
        beforeGet = mock((key, next) => next(key));
        afterGet = mock(() => {});
        beforeDelete = mock((key, next) => next(key));
        afterDelete = mock(() => {});
    }

    let plugin: TestPlugin;

    test("should load a plugin and call onLoad", () => {
        db = new Database();
        plugin = new TestPlugin();
        const api = db.use(plugin);
        expect(plugin.onLoad).toHaveBeenCalledWith(db);
        expect(api?.getPluginName()).toBe("TestPlugin");
    });

    test("should trigger plugin hooks for set, get, and delete", () => {
        db = new Database();
        plugin = new TestPlugin();
        db.use(plugin);

        db.set("key1", "value1");
        expect(plugin.beforeSet).toHaveBeenCalled();
        expect(plugin.afterSet).toHaveBeenCalled();

        db.get("key1");
        expect(plugin.beforeGet).toHaveBeenCalled();
        expect(plugin.afterGet).toHaveBeenCalled();

        db.delete("key1");
        expect(plugin.beforeDelete).toHaveBeenCalled();
        expect(plugin.afterDelete).toHaveBeenCalled();
    });

    test("plugin can modify data before setting", () => {
        db = new Database();
        class ModifyPlugin extends BasePlugin {
            beforeSet(key: string, value: Value, data: Data, next: (k: string, v: Value, d: Data) => void) {
                next(key, `modified-${value}`, data);
            }
            onLoad(db: Database): void {}
        }
        db.use(new ModifyPlugin());
        db.set("key1", "value1");
        expect(db.get("key1")).toBe("modified-value1");
    });
});