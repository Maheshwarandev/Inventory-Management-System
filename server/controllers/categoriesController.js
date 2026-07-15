const pool = require('../config/db');

exports.getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY id DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.getCategory = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
        if(rows.length === 0) return res.status(404).json({ message: 'Category not found' });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await pool.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
        res.status(201).json({ id: result.insertId, name, description });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        await pool.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description, req.params.id]);
        res.json({ message: 'Category updated' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
exports.deleteCategory = async (req, res) => {
    try {
        await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Category deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
