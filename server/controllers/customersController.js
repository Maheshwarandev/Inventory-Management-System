const pool = require('../config/db');

exports.getCustomers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM customers ORDER BY id DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.getCustomer = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
        if(rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.createCustomer = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const [result] = await pool.query('INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)', [name, email, phone, address]);
        res.status(201).json({ id: result.insertId, name, email, phone, address });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.updateCustomer = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        await pool.query('UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?', [name, email, phone, address, req.params.id]);
        res.json({ message: 'Customer updated' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.deleteCustomer = async (req, res) => {
    try {
        await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
        res.json({ message: 'Customer deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
