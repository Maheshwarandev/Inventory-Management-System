const pool = require('../config/db');

// @desc    Get inventory stock levels overview
// @route   GET /api/inventory
// @access  Private
exports.getInventory = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id, p.name, p.sku, p.stock_qty, p.min_stock, p.price, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.name ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Private
exports.getLowStock = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id, p.name, p.sku, p.stock_qty, p.min_stock 
            FROM products p 
            WHERE p.stock_qty <= p.min_stock AND p.stock_qty > 0
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get out of stock items
// @route   GET /api/inventory/out-of-stock
// @access  Private
exports.getOutofStock = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.id, p.name, p.sku, p.stock_qty 
            FROM products p 
            WHERE p.stock_qty = 0
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Adjust stock quantity (Stock In / Stock Out / Adjustment) and log movement
// @route   POST /api/inventory/adjust
// @access  Private/Admin
exports.adjustStock = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { product_id, change_qty, type, ref_id } = req.body;

        if (!product_id || typeof change_qty !== 'number' || change_qty === 0) {
            return res.status(400).json({ message: 'Valid product_id and non-zero change_qty are required' });
        }

        const validTypes = ['purchase', 'sale', 'adjustment'];
        const movementType = validTypes.includes(type) ? type : 'adjustment';

        // Fetch current product
        const [products] = await connection.query('SELECT id, stock_qty FROM products WHERE id = ? FOR UPDATE', [product_id]);
        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Product not found' });
        }

        const currentStock = products[0].stock_qty;
        const newStock = currentStock + change_qty;

        if (newStock < 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Stock quantity cannot be negative' });
        }

        // Update product stock quantity
        await connection.query(
            'UPDATE products SET stock_qty = stock_qty + ? WHERE id = ?',
            [change_qty, product_id]
        );

        // Record stock movement in inventory_logs
        const [logResult] = await connection.query(
            'INSERT INTO inventory_logs (product_id, change_qty, type, ref_id) VALUES (?, ?, ?, ?)',
            [product_id, change_qty, movementType, ref_id || null]
        );

        await connection.commit();
        res.status(200).json({
            message: 'Stock adjusted successfully',
            log_id: logResult.insertId,
            product_id,
            previous_stock: currentStock,
            new_stock: newStock,
            change_qty
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// @desc    Get stock movement logs
// @route   GET /api/inventory/logs
// @access  Private
exports.getInventoryLogs = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT il.*, p.name as product_name, p.sku 
            FROM inventory_logs il
            JOIN products p ON il.product_id = p.id
            ORDER BY il.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
