const pool = require('../config/db');

exports.getSalesReport = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DATE(created_at) as date, SUM(total_amount) as total_sales, COUNT(id) as total_orders
            FROM sales_orders 
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getPurchaseReport = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DATE(created_at) as date, SUM(total_amount) as total_purchases, COUNT(id) as total_orders
            FROM purchase_orders 
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getProfitReport = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                DATE(so.created_at) as date,
                SUM(so.total_amount) as total_revenue,
                COUNT(DISTINCT so.id) as total_sales,
                SUM(
                    SELECT COALESCE(SUM(poi.quantity * poi.unit_cost), 0)
                    FROM purchase_order_items poi
                    WHERE poi.purchase_id IN (
                        SELECT id FROM purchase_orders WHERE created_at <= so.created_at
                    )
                ) as cost_of_goods,
                SUM(so.total_amount) - COALESCE(
                    SELECT COALESCE(SUM(poi.quantity * poi.unit_cost), 0)
                    FROM purchase_order_items poi
                    WHERE poi.purchase_id IN (
                        SELECT id FROM purchase_orders WHERE created_at <= so.created_at
                    ), 0
                ) as gross_profit
            FROM sales_orders so
            GROUP BY DATE(so.created_at)
            ORDER BY date DESC
        `);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getInventoryValuation = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.id,
                p.name,
                p.sku,
                p.stock_qty,
                p.cost_price,
                p.price,
                (p.stock_qty * p.cost_price) as valuation
            FROM products p
            ORDER BY p.name ASC
        `);
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
