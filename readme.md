# KeychainDB

KeychainDB is a fast, lightweight, and modular key-value database. Its new `v2` architecture is built on a simple core that uses a powerful plugin system, allowing you to add features like persistence, caching, and more without changing the core database logic.

## Features

- **Fast Key-Value Storage**: Store and retrieve data quickly using simple key-value pairs.
- **Modular & Plugin-based**: The core database provides fundamental operations, and all advanced functionality (like persistence) is handled by plugins.
- **Flexible Data Types**: Supports any valid **JSON data type**, including strings, numbers, booleans, arrays, and nested JSON objects.
- **Event-Driven**: Listen for events like `set`, `get`, and `delete` to trigger custom logic.

## Installation

To install KeychainDB you simply need to use npm.

```bash
npm install keychaindb
```

## Usage

### Initialization
To start using KeychainDB, initialize the database.

```typescript
import { Database } from "keychaindb";

const db = new Database();
```

### Setting Values
You can set values for any valid JSON data type.

```typescript
db.set("user:1", { name: "John", age: 30 });
db.set("product:123", { name: "Laptop", price: 1200 });
db.set("status", true);
db.set("numbers", [10, 20, 30]);
db.set("message", "Hello World");
```

### Getting Values
Retrieve values using the `get` method.

```typescript
const user = db.get("user:1");
console.log(user.name); // Output: John

const price = db.get("product:123");
console.log(price); // Output: 1200
```

### Deleting Values
Delete values using the `delete` method.

```typescript
db.delete("user:1");
```

## Plugin System

The `v2` architecture uses plugins to extend functionality. You use the `db.use()` method to add a plugin.

```typescript
import { Database, MyPlugin } from "keychaindb";

const db = new Database();

// Use your custom plugin to add functionality
db.use(new MyPlugin());
```

### Event Handling

You can listen for database events using the `on` or `once` methods. All events are now **asynchronous**.

```typescript
db.on("set", (key, data) => {
    console.log(`[Event] Key ${key} was set with value: ${data.value}`);
});

db.on("delete", (key) => {
    console.log(`[Event] Key ${key} was deleted`);
});

// To listen for an event only one time
db.once("get", (key, data) => {
    console.log(`[Event] Key ${key} was retrieved for the first time`);
});
```

To stop listening for events, use `db.off()`.

```typescript
db.off("set");
```

## Built-in Plugins

KeychainDB offers a simple built-in driver for persistence.

### BasePersistencePlugin

This plugin provides basic persistence functionality and serves as a template for more complex drivers.

#### Usage
To add this plugin, you use the `db.use` method.

```typescript
import { Database, BasePersistencePlugin } from "keychaindb";

const db = new Database();
db.use(new BasePersistencePlugin());
```
This will enable the `afterSet` and `afterDelete` hooks, which can be extended to write to disk.

# License
KeychainDB is licensed under the ISC License. See the LICENSE file for more details.

# Contributing
Contributions are welcome! Please open an issue or submit a pull request on GitHub.

# Author
Made with ❤️ by Alataq

*Project owned by [Nerexon](https://nerexon.com/)*