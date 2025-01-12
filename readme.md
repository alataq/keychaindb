# KeychainDB

KeychainDB is a fast and lightweight key-value database designed for simplicity and efficiency. It supports various data types, including strings, numbers, booleans, arrays, and JSON objects. The database also includes features like data expiration and event-driven operations.

## Features

- **Fast Key-Value Storage**: Store and retrieve data quickly using simple key-value pairs.
- **Multiple Data Types**: Supports strings, numbers, booleans, arrays, and JSON objects.
- **Data Expiration**: Set expiration times for keys to automatically remove stale data.
- **Event-Driven**: Listen for events like `set`, `delete`, and `ready` to trigger custom logic.
- **Persistence**: Uses the SOCDriver to persist data to a file, ensuring data is not lost between sessions.

## Installation

To install KeychainDB you simply need to use npm.

```bash
npm install keychaindb
```

## Usage
### Initialization
To start using KeychainDB, initialize the database and use the SOCDriver for persistence:

```js
const { Database, SOCDriver } = require("keychaindb");
const path = require("path");

const db = new Database();
db.use(SOCDriver, { path: path.join(__dirname, "data.kcdb") });
```
### Setting Values
You can set values with an optional expiration time (in milliseconds):

```js
db.set("key", "value", Date.now() + 10000); // expires in 10 seconds
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

## License
KeychainDB is licensed under the ISC License. See the LICENSE file for more details.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## Author
Made with love by Alataq
