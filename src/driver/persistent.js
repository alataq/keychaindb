/**
 * @author Johan Delhomme Montorfano <me@johanmontorfano.com>
 * @description PersistentDriver file definition to allow for non-cache based
 * storage.
 * @deprecated Use the SSC driver instead.
**/ 

const { openSync, writeFileSync, readFileSync } = require("node:fs");

/**
 * Open/Create a file.
 * 
 * @param {string} path
**/
function createPath(path) {
    try {
        return openSync(path, "w+");
    } catch ({message: msg}) {
        throw new Error(`PersistentDriver: filesystem error! ${msg}`);
    }
}

/**
 * Write the database to a text file.
 *
 * @param {Database} db
**/
function writeDatabase(db) {
    let outContent = "";

    db.entries().forEach(([key, {value}]) => {
        if (typeof key === "string" && key.indexOf("\t") > -1)
            throw new Error("PersistentDriver: Found tabs in a key");
        outContent += `${JSON.stringify(key)}\t${JSON.stringify(value)}\n`;
    });
    console.log("$", outContent, "$");
    writeFileSync(db._persistentPath, outContent, {flag: "w"});
}

/**
 * Reads the database file to a database instance.
 *
 * @param {Database} db
*/
function readDatabase(db) {
    const readContent = readFileSync(db._persistentFile);
    const lines = readContent.split("\n");

    db._changes = -lines.length;
    lines.forEach(lines => {
        const [key, value] = lines.split("\t");
        db.set(JSON.parse(key), JSON.parse(value));
    });
    db._changes = 0;
}

/**
 *  Driver for the `Database` class used to periodically
 *  save content to a text file.
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
function PersistentDriver(db, config) {
    if (!config.path)
        throw new Error("PersistentDriver: Missing database path");
    db._persistentPath = config.path;
    db._changes = 0;
    db.fromStorage = () => readDatabase(db);
    db.on("set", () => db._changes++);
    db.on("delete", () => db._changes++);
    setInterval(() => {
        if (db._changes > 0) {
            writeDatabase(db);
            db._changes = 0;
        }
    }, 100);
}

module.exports = PersistentDriver;
