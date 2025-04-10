# KeychainDB

KeychainDB is a fast and lightweight key-value database designed for simplicity and efficiency. It supports various data types, including strings, numbers, booleans, arrays, and JSON objects. The database also includes features like data expiration and event-driven operations.

## Features

- **Fast Key-Value Storage**: Store and retrieve data quickly using simple key-value pairs.
- **Multiple Data Types**: Supports strings, numbers, booleans, arrays, and JSON objects.
- **Data Expiration**: Set expiration times for keys to automatically remove stale data.
- **Event-Driven**: Listen for events like `set`, `delete`, and `ready` to trigger custom logic.
- **Persistence**: Uses the SOCDriver or SSCDriver to persist data to a file, ensuring data is not lost between sessions.

## Installation

To install KeychainDB you simply need to use npm.

```bash
npm install keychaindb
```

## Usage
### Initialization
To start using KeychainDB, initialize the database :

```js
const { Database } = require("keychaindb");

const db = new Database();
```
### Setting Values
You can set values with an optional expiration time (in milliseconds):

```js
db.set("key", "value", 10000); // expires in 10 seconds
```

### Getting Values
Retrieve values using the get method:

```js
db.get("key")
```
### Deleting Values
Delete values using the delete method:

```js
db.delete("key");
```

### Finding Values
Find values using the find method:

**You can find all keys having a specific value**

```js
db.find("value")
```

**You can use json to find values**

```js
db.find({ name: "John", age: 30 });
```

**You can use a function to find values**

```js
db.find((value) => value.name === "John" && value.age > 25);
```

**You can use a regex to find values**

```js
db.find(/hello/);
```

### Getting all Keys
You can get all keys using the keys method:

```js
db.keys()
```

### Getting all Values
You can get all values using the values method:
```js
db.values()
```

### Getting all Entries
You can get all entries using the entries method:

```js
db.entries()
```

### Event Handling
Listen for events like ready, set, and delete:

```js
db.on("ready", () => {
    console.log("Database is ready");
});

db.on("set", (key, value, writedate, expire) => {
    console.log(`Key ${key} set with value ${value}`);
});

db.on("delete", (key) => {
    console.log(`Key ${key} deleted`);
});
```

### Logging In
To start the database, call the login method:

```js
db.login();
```

# Builtin Drivers
KeychainDB offer some builtin drivers for your databases. The following drivers are available:

## Solid Operation Cache (SOC)
The SOC driver store every write operation in a file to allow reconstruction of the database in case of reboot.

### Initialization
You first need to import the SOC driver and initialize it. You need to have path for the file name. :

```js
const { SOCDriver } = require("keychainedb");
const path = require("path");

db.use(SOCDriver, { path: path.join(__dirname, "fileName.kcdb") });
```

### Rebuilding
You can rebuild the database by calling the reconstruct method on the SOC manager. It will return a promise. :

```js
db.SOCManager.reconstruct()
```

## Persistent
The Persistent driver stores database content into a key/value file periodically, to recover from shutdowns
with a concise representation of the database.

### Initialization
You first need to import the Persistent driver and initialize it. You need to give if a path to save to:

```js
const { PersistentDriver } = require("keychaindb");
const path = require("path");

db.use(PersistentDriver, { path: path.join(__dirname, "persistent.db") });
```

### Rebuilding
You can rebuild the database instance from the content stored on the disk by calling:
```js
db.fromStorage();
```

The operation is synchronous.

# License
KeychainDB is licensed under the ISC License. See the LICENSE file for more details.

# Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

# Author
Made with ❤️ by Alataq

*Project owned by [Nerexon](https://nerexon.com/)*
