const { Database, SOCDriver } = require("./src/index");
const path = require("path");

// Initialize the database
const db = new Database();

// Use the SOCDriver to create a new database file
db.use(SOCDriver, { path: path.join(__dirname, "data.kcdb") })

// Event listener for when the database is ready
db.on("ready", () => {
    console.log("Database is ready");

    // Test setting values of all types
    db.set("key1", "value1", Date.now() + 5000); // string
    db.set("key2", 42, Date.now() + 10000); // number
    db.set("key3", true, Date.now() + 15000); // boolean
    db.set("key4", [1, 2, 3], Date.now() + 20000); // array
    db.set("key5", { name: "John", age: 30 }, Date.now() + 25000); // json

    // Test getting values immediately
    console.log("Initial values:");
    console.log("key1 (string):", db.get("key1"));
    console.log("key2 (number):", db.get("key2"));
    console.log("key3 (boolean):", db.get("key3"));
    console.log("key4 (array):", db.get("key4"));
    console.log("key5 (json):", db.get("key5"));

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
});

// Log in to the database
db.login();