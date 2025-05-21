const { Database, SOCDriver } = require("./src/index");
const path = require("path");

// Initialize the database
const db = new Database();

// Use the SOCDriver to create a new database file
db.use(SOCDriver, { path: path.join(__dirname, "data.kcdb") });

// Event listener for when the database is ready
db.once("ready", () => {
    console.log("Database is ready");

    // Test setting values of all types
    db.set("key1", "value1", 5000); // string
    db.set("key2", 42, 10000); // number
    db.set("key3", true, 15000); // boolean
    db.set("key4", [1, 2, 3], 20000); // array
    db.set("key5", { name: "John", age: 30 }, 25000); // json
    db.set("key6", { name: "Jane", age: 25 }, 25000); // json
    db.set("key7", { name: "John", age: 35 }, 25000); // json
    db.set("key8", "Hello World", 25000); // string

    // Test getting values immediately
    console.log("Initial values:");
    console.log("key1 (string):", db.get("key1"));
    console.log("key2 (number):", db.get("key2"));
    console.log("key3 (boolean):", db.get("key3"));
    console.log("key4 (array):", db.get("key4"));
    console.log("key5 (json):", db.get("key5"));

    // Test find method with object query
    console.log("\nFind all entries with name 'John':");
    const results1 = db.find({ name: "John" });
    console.log(results1);

    // Test find method with function query
    console.log("\nFind all entries with age greater than 25:");
    const results2 = db.find((value) => value.age > 25);
    console.log(results2);

    // Test find method with regex query
    console.log("\nFind all entries with value containing 'Hello':");
    const results3 = db.find(/Hello/);
    console.log(results3);

    // Test find method with value query
    console.log("\nFind all entries with value 'value1':");
    const results4 = db.find("value1");
    console.log(results4);

    // Test keys method
    console.log("\nAll keys:");
    console.log(db.keys());

    // Test values method
    console.log("\nAll values:");
    console.log(db.values());

    // Test entries method
    console.log("\nAll entries:");
    console.log(db.entries());

    // Test expiration
    setTimeout(() => {
        console.log("\nAfter 6 seconds (key1 should expire):");
        console.log("key1 (string):", db.get("key1"));
        console.log("key2 (number):", db.get("key2"));
        console.log("key3 (boolean):", db.get("key3"));
        console.log("key4 (array):", db.get("key4"));
        console.log("key5 (json):", db.get("key5"));
    }, 6000);

    // Test deletion
    setTimeout(() => {
        console.log("\nAfter 11 seconds (delete key2):");
        db.delete("key2");
        console.log("key2 (number):", db.get("key2")); // Should be undefined
    }, 11000);

    // Test expiration of all keys
    setTimeout(() => {
        console.log("\nAfter 26 seconds (all keys should expire):");
        console.log("key1 (string):", db.get("key1"));
        console.log("key2 (number):", db.get("key2"));
        console.log("key3 (boolean):", db.get("key3"));
        console.log("key4 (array):", db.get("key4"));
        console.log("key5 (json):", db.get("key5"));
    }, 26000);

    // Test reconstruct method
    setTimeout(() => {
        console.log("\nReconstructing database...");
        db.SOCManager.reconstruct();
        console.log("Database reconstructed.");
    }, 30000);
});

// Event listener for when a value is set
db.on("set", (key, value, writedate, expire) => {
    console.log(`Key ${key} set with value ${value} and expire at ${expire}`);
});

// Event listener for when a value is deleted
db.on("delete", (key) => {
    console.log(`Key ${key} deleted`);
});

// Log in to the database
db.login();