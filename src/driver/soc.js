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
        } else {
            valueType = typeof value;
            stringValue = value.toString();
        }

        const data = `SET ${key} ${valueType} '${stringValue}' ${writedate} ${expire}\n`;
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

            const [command, key, valueType, ...value] = line.split(' ');
            if (command === 'SET') {
                let parsedValue;
                switch (valueType) {
                    case 'string':
                        parsedValue = value[0].replace(/'/g, '');
                        break;
                    case 'number':
                        parsedValue = parseFloat(value[0].replace(/'/g, ''));
                        break;
                    case 'boolean':
                        parsedValue = value[0].replace(/'/g, '').toLowerCase() === 'true';
                        break;
                    case 'array':
                        parsedValue = JSON.parse(value[0].replace(/'/g, ''));
                        break;
                    case 'json':
                        parsedValue = JSON.parse(value[0].replace(/'/g, ''));
                        break;
                    default:
                        throw new Error(`Unsupported value type: ${valueType}`);
                }
                const writedate = parseInt(value[value.length - 2]);
                const expire = parseInt(value[value.length - 1]);

                db.cache.set(key, {
                    value: parsedValue,
                    writedate,
                    expire
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