import { Database, BasePlugin } from './src';
import { type Data, type Value } from './src/BasePlugin';
import { EventType } from './src/EventManager';

// Helper function to create a mock function
const mockFn = () => {
    const fn = (...args: any[]) => {
        fn.called = true;
        fn.calls.push(args);
    };
    fn.called = false;
    fn.calls = [] as any[]; // Explicitly type 'calls'
    return fn;
};

// ANSI color codes
const color = {
    green: (text: string) => `\x1b[32m${text}\x1b[0m`,
    red: (text: string) => `\x1b[31m${text}\x1b[0m`,
    cyan: (text: string) => `\x1b[36m${text}\x1b[0m`
};
const pass = color.green("PASS");
const fail = color.red("FAIL");
const testStatus = (name: string, condition: boolean) => {
    console.log(`${condition ? pass : fail} - ${name}`);
};

// A simple persistence plugin for demonstration
class BasePersistencePlugin extends BasePlugin {
    onLoad(db: Database) {
        console.log("Persistence plugin loaded. Ready to track database changes.");
    }

    afterSet(key: string, data: Data) {
        // Simulate saving to a file or other storage
        console.log(`[Persistence] Data for key '${key}' was updated. Value:`, data.value);
    }

    afterDelete(key: string) {
        // Simulate deleting from a file or other storage
        console.log(`[Persistence] Data for key '${key}' was deleted.`);
    }
}

// ----------------------------------------------------------------------
// Main Demonstration Script
// ----------------------------------------------------------------------

(async () => {
    // Initialize the database
    const db = new Database();
    const persistencePlugin = new BasePersistencePlugin();
    db.use(persistencePlugin);

    // Event listener for when a value is set
    db.on("set", (key: string, data: any) => {
        console.log(`[Event] Key ${key} set with value ${data.value}`);
    });

    // Event listener for when a value is deleted
    db.on("delete", (key: string) => {
        console.log(`[Event] Key ${key} deleted`);
    });

    console.log(color.cyan("--- Database Test Start ---"));
    
    // Test 1: set, get, and delete a value correctly without plugins
    const key1 = 'testKey';
    const value1 = 'testValue';
    db.set(key1, value1);
    const result1 = db.get(key1);
    testStatus("should set and get a value correctly", result1 === value1);

    db.delete(key1);
    const result2 = db.get(key1);
    testStatus("should delete a value correctly", result2 === undefined);

    // Test 2: Set multiple values
    db.set("key1", "value1");
    db.set("key2", 42);
    db.set("key3", true);
    db.set("key4", [1, 2, 3]);
    db.set("key5", { name: "John", age: 30 } as any); // Type assertion for object
    db.set("key6", { name: "Jane", age: 25 } as any); // Type assertion for object
    db.set("key7", { name: "John", age: 35 } as any); // Type assertion for object
    db.set("key8", "Hello World");

    // Test 3: Get multiple values
    console.log("\nInitial values:");
    console.log("key1 (string):", db.get("key1"));
    console.log("key2 (number):", db.get("key2"));
    console.log("key3 (boolean):", db.get("key3"));
    console.log("key4 (array):", db.get("key4"));
    console.log("key5 (json):", db.get("key5"));
    testStatus("should get all values correctly", 
        db.get("key1") === "value1" && 
        db.get("key2") === 42 &&
        db.get("key3") === true &&
        (db.get("key4") as any)[0] === 1
    );

    // Test 4: Deletion after a short delay
    console.log("\nAfter 2 seconds (delete key2):");
    await new Promise(resolve => setTimeout(resolve, 2000));
    db.delete("key2");
    console.log("key2 (number):", db.get("key2"));
    testStatus("should delete a value after a delay", db.get("key2") === undefined);
    
    console.log("\n--- Database Test Complete ---");
})();