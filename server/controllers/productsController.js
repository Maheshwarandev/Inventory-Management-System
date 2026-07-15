const pool = require('../config/db');

exports.getProducts = async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name, s.name as supplier_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            ORDER BY p.id DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getProduct = async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name, s.name as supplier_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.id = ?
        `;
        const [rows] = await pool.query(query, [req.params.id]);
        if(rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, sku, barcode, category_id, supplier_id, price, cost_price, stock_qty, min_stock } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;
        
        const [result] = await pool.query(
            'INSERT INTO products (name, sku, barcode, category_id, supplier_id, price, cost_price, stock_qty, min_stock, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, sku, barcode, category_id || null, supplier_id || null, price, cost_price, stock_qty || 0, min_stock || 10, image]
        );
        res.status(201).json({ id: result.insertId, name, message: 'Product created' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, sku, barcode, category_id, supplier_id, price, cost_price, stock_qty, min_stock } = req.body;
        let updateQuery = 'UPDATE products SET name=?, sku=?, barcode=?, category_id=?, supplier_id=?, price=?, cost_price=?, stock_qty=?, min_stock=?';
        let queryParams = [name, sku, barcode, category_id || null, supplier_id || null, price, cost_price, stock_qty, min_stock];
        
        if (req.file) {
            updateQuery += ', image=?';
            queryParams.push(`/uploads/${req.file.filename}`);
        }
        updateQuery += ' WHERE id=?';
        queryParams.push(req.params.id);

        await pool.query(updateQuery, queryParams);
        res.json({ message: 'Product updated' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteProduct = async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
