require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function seed() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Maheshwaran@01',
            database: process.env.DB_NAME || 'ims_db',
            multipleStatements: true
        });

        console.log('Connected to DB...');

        const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
        await connection.query(seedSql);

        console.log('Database seeded successfully!');
        connection.end();
    } catch (err) {
        console.error('Seeding failed:', err);
    }
}

seed();
