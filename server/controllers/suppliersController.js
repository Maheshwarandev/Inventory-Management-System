const pool = require('../config/db');

exports.getSuppliers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY id DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.getSupplier = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
        if(rows.length === 0) return res.status(404).json({ message: 'Supplier not found' });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.createSupplier = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const [result] = await pool.query('INSERT INTO suppliers (name, email, phone, address) VALUES (?, ?, ?, ?)', [name, email, phone, address]);
        res.status(201).json({ id: result.insertId, name, email, phone, address });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.updateSupplier = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        await pool.query('UPDATE suppliers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?', [name, email, phone, address, req.params.id]);
        res.json({ message: 'Supplier updated' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.deleteSupplier = async (req, res) => {
    try {
        await pool.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
        res.json({ message: 'Supplier deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
