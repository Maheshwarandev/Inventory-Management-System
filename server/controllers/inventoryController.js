const pool = require('../config/db');

exports.getInventory = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id, p.name, p.sku, p.stock_qty, p.min_stock, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.name ASC
        `);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getLowStock = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id, p.name, p.sku, p.stock_qty, p.min_stock 
            FROM products p 
            WHERE p.stock_qty <= p.min_stock AND p.stock_qty > 0
        `);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getOutofStock = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id, p.name, p.sku, p.stock_qty 
            FROM products p 
            WHERE p.stock_qty = 0
        `);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
