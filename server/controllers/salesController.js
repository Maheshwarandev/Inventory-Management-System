const pool = require('../config/db');

exports.getSales = async (req, res) => {
    try {
        const query = `
            SELECT s.*, c.name as customer_name, u.name as user_name 
            FROM sales_orders s 
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.id DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getSale = async (req, res) => {
    try {
        const [saleRows] = await pool.query(`
            SELECT s.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone, c.address as customer_address, u.name as user_name 
            FROM sales_orders s 
            LEFT JOIN customers c ON s.customer_id = c.id
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.id = ?
        `, [req.params.id]);
        
        if(saleRows.length === 0) return res.status(404).json({ message: 'Sale not found' });
        
        const [itemRows] = await pool.query(`
            SELECT si.*, pr.name as product_name 
            FROM sales_order_items si
            JOIN products pr ON si.product_id = pr.id
            WHERE si.sale_id = ?
        `, [req.params.id]);

        const sale = saleRows[0];
        sale.items = itemRows;

        res.json(sale);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createSale = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { customer_id, total_amount, discount, tax, items, initial_payment } = req.body;
        const invoice_no = 'INV-' + Date.now();
        
        const paidAmount = parseFloat(initial_payment) || 0;
        let paymentStatus = 'unpaid';
        if (paidAmount >= total_amount) paymentStatus = 'paid';
        else if (paidAmount > 0) paymentStatus = 'partial';
        
        const [saleResult] = await connection.query(
            'INSERT INTO sales_orders (customer_id, user_id, total_amount, discount, tax, paid_amount, payment_status, invoice_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [customer_id || null, req.user.id, total_amount, discount || 0, tax || 0, paidAmount, paymentStatus, invoice_no]
        );
        const saleId = saleResult.insertId;

        for (const item of items) {
            await connection.query(
                'INSERT INTO sales_order_items (sale_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
                [saleId, item.product_id, item.quantity, item.unit_price]
            );

            await connection.query(
                'UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );

            await connection.query(
                'INSERT INTO inventory_logs (product_id, change_qty, type, ref_id) VALUES (?, ?, ?, ?)',
                [item.product_id, -item.quantity, 'sale', saleId]
            );
        }

        if (paidAmount > 0) {
            await connection.query(
                'INSERT INTO payments (reference_type, reference_id, amount, payment_method, created_by) VALUES (?, ?, ?, ?, ?)',
                ['sale', saleId, paidAmount, 'Cash', req.user.id]
            );
        }

        await connection.commit();
        res.status(201).json({ id: saleId, invoice_no, message: 'Sale created successfully' });
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
        const saleId = req.params.id;
        const { amount, payment_method } = req.body;

        const [sales] = await connection.query('SELECT total_amount, paid_amount FROM sales_orders WHERE id = ? FOR UPDATE', [saleId]);
        if (sales.length === 0) throw new Error('Sale not found');

        const sale = sales[0];
        const newPaidAmount = parseFloat(sale.paid_amount) + parseFloat(amount);
        let paymentStatus = 'partial';
        if (newPaidAmount >= parseFloat(sale.total_amount)) paymentStatus = 'paid';

        await connection.query(
            'UPDATE sales_orders SET paid_amount = ?, payment_status = ? WHERE id = ?',
            [newPaidAmount, paymentStatus, saleId]
        );

        await connection.query(
            'INSERT INTO payments (reference_type, reference_id, amount, payment_method, created_by) VALUES (?, ?, ?, ?, ?)',
            ['sale', saleId, amount, payment_method || 'Cash', req.user.id]
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
            WHERE p.reference_type = 'sale' AND p.reference_id = ?
            ORDER BY p.created_at DESC
        `, [req.params.id]);
        res.json(payments);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
