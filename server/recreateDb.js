const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
    const passwords = ['', 'root', 'password', '123456', 'admin'];
    let connection;

    for (const p of passwords) {
        try {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: p,
                multipleStatements: true
            });
            console.log(`Connected with password: "${p}"`);
            // Write it back to .env if we found it
            if (p !== '') {
                const envPath = path.join(__dirname, '.env');
                let envFile = fs.readFileSync(envPath, 'utf8');
                envFile = envFile.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${p}`);
                fs.writeFileSync(envPath, envFile);
            }
            break;
        } catch (e) {
            // ignore
        }
    }

    if (!connection) {
        console.error('Could not connect with any known passwords');
        return;
    }

    try {
        await connection.query('DROP DATABASE IF EXISTS ims_db;');
        console.log('Dropped ims_db');
        
        const schema = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
        await connection.query(schema);
        console.log('Recreated database from schema.sql');
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}
run();
