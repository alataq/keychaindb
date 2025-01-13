// Solid Operation Cache
const { openSync, appendFileSync, readFileSync, closeSync, unlinkSync, renameSync } = require("node:fs");
const path = require("path");

function SOCDriver(db, config) {
    if (!config.path) {
        throw new Error("Path to the database file is required for SOC driver.")
    }
    db.SOCfilePath = config.path
    db.fileSOC = null

    // Initialize the database file
    try {
        db.fileSOC = openSync(db.SOCfilePath, 'a+'); // Open in append mode, create if not exists
    } catch (error) {
        throw new Error(`Failed to initialize database file: ${error.message}`)
    }

    db.SOCManager = {
        reconstruct: () => {
            db.SOCManager.writing = true;
        
            const tempFilePath = `${db.SOCfilePath}.temp`;
            const tempFile = openSync(tempFilePath, 'w+'); // Open in write mode, create if not exists
        
            // Write all operations to the temp file
            for (const [key, entry] of db.cache) {
                let valueType = typeof entry.value;
                let stringValue;
        
                if (Array.isArray(entry.value)) {
                    valueType = 'array';
                    stringValue = JSON.stringify(entry.value);
                } else if (typeof entry.value === 'object') {
                    valueType = 'json';
                    stringValue = JSON.stringify(entry.value);
                } else if (typeof entry.value === 'number') {
                    valueType = 'integer';
                    stringValue = entry.value.toString();
                } else if (typeof entry.value === 'boolean') {
                    valueType = 'boolean';
                    stringValue = entry.value.toString();
                } else {
                    valueType = 'string';
                    stringValue = entry.value.toString();
                }
        
                const operation = {
                    type: valueType,
                    value: stringValue,
                    createdAt: entry.writedate,
                    expireAt: entry.expire,
                };
        
                const data = `SET ${key} ${JSON.stringify(operation)}\n`;
                appendFileSync(tempFile, data);
            }
        
            // Close the temp file
            closeSync(tempFile);

            // Close the original file
            closeSync(db.fileSOC);
        
            // Delete the old file
            unlinkSync(db.SOCfilePath);
        
            // Rename the temp file to the original file name
            renameSync(tempFilePath, db.SOCfilePath);
        
            // Reopen the file in append mode
            db.fileSOC = openSync(db.SOCfilePath, 'a+');
        
            // Process the queue
            while (db.SOCManager.queue.length > 0) {
                const operation = db.SOCManager.queue.shift();
                if (operation.type === 'delete') {
                    db.delete(operation.key);
                } else {
                    db.set(operation.key, operation.value, operation.expire);
                }
            }
        
            db.SOCManager.writing = false;
        },
        queue: [],
        writing: false,
    }

    // Listen for 'set' events
db.on('set', (key, value, writedate, expire) => {
    if (db.SOCManager.writing) {
        db.SOCManager.queue.push({ key, value, writedate, expire });
    } else {
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
            expireAt: expire,
        };

        const data = `SET ${key} ${JSON.stringify(operation)}\n`;
        appendFileSync(db.fileSOC, data);
    }
});

// Listen for 'delete' events
db.on('delete', (key) => {
    if (db.SOCManager.writing) {
        db.SOCManager.queue.push({ key, type: 'delete' });
    } else {
        const data = `DELETE ${key}\n`;
        appendFileSync(db.fileSOC, data);
    }
});

    // Parse the database file and reconstruct the cache
    try {
        const fileContent = readFileSync(db.SOCfilePath, 'utf8')
        const lines = fileContent.split('\n')

        for (const line of lines) {
            if (line.trim() === '') continue

            const [command, key, ...operationJson] = line.split(' ')
            if (command === 'SET') {
                const operation = JSON.parse(operationJson.join(' '))
                let parsedValue

                switch (operation.type) {
                    case 'string':
                        parsedValue = operation.value
                        break
                    case 'integer':
                        parsedValue = parseInt(operation.value)
                        break
                    case 'boolean':
                        parsedValue = operation.value.toLowerCase() === 'true'
                        break
                    case 'array':
                        parsedValue = JSON.parse(operation.value)
                        break
                    case 'json':
                        parsedValue = JSON.parse(operation.value)
                        break
                    default:
                        throw new Error(`Unsupported value type: ${operation.type}`)
                }

                db.cache.set(key, {
                    value: parsedValue,
                    writedate: operation.createdAt,
                    expire: operation.expireAt
                });
            } else if (command === 'DELETE') {
                db.cache.delete(key)
            }
        }
    } catch (error) {
        throw new Error(`Failed to parse database file: ${error.message}`)
    }
}

module.exports = SOCDriver;