const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const [counts] = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM products) AS total_products,
                (SELECT COUNT(*) FROM categories) AS total_categories,
                (SELECT COUNT(*) FROM suppliers) AS total_suppliers,
                (SELECT COUNT(*) FROM customers) AS total_customers,
                (SELECT COUNT(*) FROM sales_orders) AS total_sales,
                (SELECT COUNT(*) FROM products WHERE stock_qty <= min_stock AND stock_qty > 0) AS low_stock_count
        `);

        const [revenueRows] = await pool.query(`
            SELECT
                COALESCE(SUM(total_amount), 0) AS revenue_30d
            FROM sales_orders
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `);

        const [seriesRows] = await pool.query(`
            WITH RECURSIVE date_series AS (
                SELECT DATE_SUB(CURDATE(), INTERVAL 13 DAY) AS d
                UNION ALL
                SELECT d + INTERVAL 1 DAY
                FROM date_series
                WHERE d + INTERVAL 1 DAY <= CURDATE()
            )
            SELECT DATE_FORMAT(ds.d, '%b %e') AS label, COALESCE(SUM(so.total_amount), 0) AS revenue
            FROM date_series ds
            LEFT JOIN sales_orders so
                ON DATE(so.created_at) = ds.d
            GROUP BY ds.d
            ORDER BY ds.d ASC
        `);

        const [recentSales] = await pool.query(`
            SELECT so.invoice_no, so.total_amount, c.name AS customer_name, so.created_at
            FROM sales_orders so
            LEFT JOIN customers c ON so.customer_id = c.id
            ORDER BY so.id DESC
            LIMIT 5
        `);

        res.json({
            ...counts[0],
            revenue_30d: revenueRows[0].revenue_30d,
            revenue_series: seriesRows,
            recent_sales: recentSales
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
