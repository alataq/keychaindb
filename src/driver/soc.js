// Solid Operation Cache
const { openSync, appendFileSync, readFileSync } = require("node:fs");
const path = require("path");

function SOCDriver(db, config) {
    if (!config.path) {
        throw new Error("Path to the database file is required for SOC driver.");
    }
    db.SOCfilePath = config.path;
    db.fileSOC = null;

    // Initialize the database file
    try {
        db.fileSOC = openSync(db.SOCfilePath, 'a+'); // Open in append mode, create if not exists
    } catch (error) {
        throw new Error(`Failed to initialize database file: ${error.message}`);
    }

    // Listen for 'set' events
    db.on('set', (key, value, writedate, expire) => {
        let valueType;
        let stringValue;

        if (Array.isArray(value)) {
            valueType = 'array';
            stringValue = JSON.stringify(value);
        } else if (typeof value === 'object') {
            valueType = 'json';
            stringValue = JSON.stringify(value);
        } else if (typeof value === 'number') {
            valueType = 'integer';
            stringValue = value.toString();
        } else if (typeof value === 'boolean') {
            valueType = 'boolean';
            stringValue = value.toString();
        } else {
            valueType = 'string';
            stringValue = value.toString();
        }

        const operation = {
            type: valueType,
            value: stringValue,
            createdAt: writedate,
            expireAt: expire
        };

        const data = `SET ${key} ${JSON.stringify(operation)}\n`;
        appendFileSync(db.SOCfilePath, data);
    });

    // Listen for 'delete' events
    db.on('delete', (key) => {
        const data = `DELETE ${key}\n`;
        appendFileSync(db.SOCfilePath, data);
    });

    // Parse the database file and reconstruct the cache
    try {
        const fileContent = readFileSync(db.SOCfilePath, 'utf8');
        const lines = fileContent.split('\n');

        for (const line of lines) {
            if (line.trim() === '') continue;

            const [command, key, ...operationJson] = line.split(' ');
            if (command === 'SET') {
                const operation = JSON.parse(operationJson.join(' '));
                let parsedValue;

                switch (operation.type) {
                    case 'string':
                        parsedValue = operation.value;
                        break;
                    case 'integer':
                        parsedValue = parseInt(operation.value);
                        break;
                    case 'boolean':
                        parsedValue = operation.value.toLowerCase() === 'true';
                        break;
                    case 'array':
                        parsedValue = JSON.parse(operation.value);
                        break;
                    case 'json':
                        parsedValue = JSON.parse(operation.value);
                        break;
                    default:
                        throw new Error(`Unsupported value type: ${operation.type}`);
                }

                db.cache.set(key, {
                    value: parsedValue,
                    writedate: operation.createdAt,
                    expire: operation.expireAt
                });
            } else if (command === 'DELETE') {
                db.cache.delete(key);
            }
        }
    } catch (error) {
        throw new Error(`Failed to parse database file: ${error.message}`);
    }
}

module.exports = SOCDriver;