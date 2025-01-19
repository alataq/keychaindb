// Solid Operation Cache
const { openSync, appendFileSync, readFileSync, closeSync, unlinkSync, renameSync } = require("node:fs");
const path = require("path");

function appendOperationToFile(fd, key, data) {
    let valueType;
    let stringValue;

    if (Array.isArray(data.value)) {
        valueType = 'array';
        stringValue = JSON.stringify(data.value);
    } else if (typeof data.value === 'object') {
        valueType = 'json';
        stringValue = JSON.stringify(data.value);
    } else if (typeof data.value === 'number') {
        valueType = 'integer';
        stringValue = data.value.toString();
    } else if (typeof data.value === 'boolean') {
        valueType = 'boolean';
        stringValue = data.value.toString();
    } else {
        valueType = 'string';
        stringValue = data.value.toString();
    }

    const operation = {
        type: valueType,
        value: stringValue,
        createdAt: data.writedate,
        expireAt: data.expire,
    };

    const fileData = `SET ${key} ${JSON.stringify(operation)}\n`;
    appendFileSync(fd, fileData);
}

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
            return new Promise((resolve, reject) => {
                db.SOCManager.writing = true;
        
                const tempFilePath = `${db.SOCfilePath}.temp`;
                const tempFile = openSync(tempFilePath, 'a+'); // Open in write mode, create if not exists
        
                // Write all operations to the temp file
                for (const [key, entry] of db.cache) {
                    appendOperationToFile(tempFile, key, {
                        value: entry.value,
                        writedate: entry.writedate,
                        expire: entry.expire,
                    });
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
                resolve()
            })
        },
        queue: [],
        writing: false,
    };

    // Listen for 'set' events
    db.on('set', (key, value, writedate, expire) => {
        if (db.SOCManager.writing) {
            db.SOCManager.queue.push({ key, value, writedate, expire });
        } else {
            appendOperationToFile(db.fileSOC, key, { value, writedate, expire });
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