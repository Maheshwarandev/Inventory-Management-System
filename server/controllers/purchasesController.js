const pool = require('../config/db');

exports.getPurchases = async (req, res) => {
    try {
        const query = `
            SELECT p.*, s.name as supplier_name 
            FROM purchase_orders p 
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            ORDER BY p.id DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getPurchase = async (req, res) => {
    try {
        const [purchaseRows] = await pool.query(`
            SELECT p.*, s.name as supplier_name 
            FROM purchase_orders p 
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.id = ?
        `, [req.params.id]);
        
        if(purchaseRows.length === 0) return res.status(404).json({ message: 'Purchase not found' });
        
        const [itemRows] = await pool.query(`
            SELECT pi.*, pr.name as product_name 
            FROM purchase_order_items pi
            JOIN products pr ON pi.product_id = pr.id
            WHERE pi.purchase_id = ?
        `, [req.params.id]);

        const purchase = purchaseRows[0];
        purchase.items = itemRows;

        res.json(purchase);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createPurchase = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { supplier_id, total_amount, items, initial_payment } = req.body;
        
        const paidAmount = parseFloat(initial_payment) || 0;
        let paymentStatus = 'unpaid';
        if (paidAmount >= total_amount) paymentStatus = 'paid';
        else if (paidAmount > 0) paymentStatus = 'partial';
        
        const [purchaseResult] = await connection.query(
            'INSERT INTO purchase_orders (supplier_id, total_amount, paid_amount, payment_status, status) VALUES (?, ?, ?, ?, ?)',
            [supplier_id, total_amount, paidAmount, paymentStatus, 'completed']
        );
        const purchaseId = purchaseResult.insertId;

        for (const item of items) {
            await connection.query(
                'INSERT INTO purchase_order_items (purchase_id, product_id, quantity, unit_cost) VALUES (?, ?, ?, ?)',
                [purchaseId, item.product_id, item.quantity, item.unit_cost]
            );

            await connection.query(
                'UPDATE products SET stock_qty = stock_qty + ? WHERE id = ?',
                [item.quantity, item.product_id]
            );

            await connection.query(
                'INSERT INTO inventory_logs (product_id, change_qty, type, ref_id) VALUES (?, ?, ?, ?)',
                [item.product_id, item.quantity, 'purchase', purchaseId]
            );
        }

        if (paidAmount > 0) {
            await connection.query(
                'INSERT INTO payments (reference_type, reference_id, amount, payment_method, created_by) VALUES (?, ?, ?, ?, ?)',
                ['purchase', purchaseId, paidAmount, 'Cash', req.user.id]
            );
        }

        await connection.commit();
        res.status(201).json({ id: purchaseId, message: 'Purchase created successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

exports.addPayment = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const purchaseId = req.params.id;
        const { amount, payment_method } = req.body;

        const [purchases] = await connection.query('SELECT total_amount, paid_amount FROM purchase_orders WHERE id = ? FOR UPDATE', [purchaseId]);
        if (purchases.length === 0) throw new Error('Purchase not found');

        const purchase = purchases[0];
        const newPaidAmount = parseFloat(purchase.paid_amount) + parseFloat(amount);
        let paymentStatus = 'partial';
        if (newPaidAmount >= parseFloat(purchase.total_amount)) paymentStatus = 'paid';

        await connection.query(
            'UPDATE purchase_orders SET paid_amount = ?, payment_status = ? WHERE id = ?',
            [newPaidAmount, paymentStatus, purchaseId]
        );

        await connection.query(
            'INSERT INTO payments (reference_type, reference_id, amount, payment_method, created_by) VALUES (?, ?, ?, ?, ?)',
            ['purchase', purchaseId, amount, payment_method || 'Cash', req.user.id]
        );

        await connection.commit();
        res.json({ message: 'Payment added successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

exports.getPayments = async (req, res) => {
    try {
        const [payments] = await pool.query(`
            SELECT p.*, u.name as created_by_name 
            FROM payments p 
            LEFT JOIN users u ON p.created_by = u.id 
            WHERE p.reference_type = 'purchase' AND p.reference_id = ?
            ORDER BY p.created_at DESC
        `, [req.params.id]);
        res.json(payments);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.approvePurchase = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        await pool.query(
            'UPDATE purchase_orders SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        
        res.json({ message: 'Purchase order status updated successfully' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
