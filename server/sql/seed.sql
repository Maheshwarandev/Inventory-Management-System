-- Insert Categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Devices, gadgets, and accessories'),
('Office Supplies', 'Pens, paper, notebooks, and desk organizers'),
('Furniture', 'Chairs, desks, and storage units');

-- Insert Suppliers
INSERT INTO suppliers (name, email, phone, address) VALUES
('TechWorld Distributing', 'sales@techworld.com', '555-0101', '123 Tech Lane, Silicon Valley, CA'),
('Stationery Hub', 'orders@stationeryhub.com', '555-0102', '456 Paper St, New York, NY'),
('Comfort Seating Inc.', 'contact@comfortseating.com', '555-0103', '789 Wood Blvd, Austin, TX');

-- Insert Customers
INSERT INTO customers (name, email, phone, address) VALUES
('Acme Corp', 'purchasing@acmecorp.com', '555-0201', '100 Business Rd, Chicago, IL'),
('Global Tech Solutions', 'billing@globaltech.com', '555-0202', '200 Innovation Ave, Seattle, WA'),
('Jane Doe', 'jane.doe@email.com', '555-0203', '300 Residential St, Denver, CO');

-- Insert Products
INSERT INTO products (name, sku, barcode, category_id, supplier_id, price, cost_price, stock_qty, min_stock) VALUES
('Wireless Mouse Pro', 'ELEC-MOU-01', '1234567890123', 1, 1, 45.99, 25.00, 150, 20),
('Mechanical Keyboard', 'ELEC-KEY-01', '1234567890124', 1, 1, 120.00, 75.00, 45, 15),
('27-inch 4K Monitor', 'ELEC-MON-01', '1234567890125', 1, 1, 350.00, 250.00, 12, 10),
('A4 Printer Paper (500 sheets)', 'OFFI-PAP-01', '1234567890126', 2, 2, 8.50, 4.00, 500, 100),
('Gel Pens (Pack of 12)', 'OFFI-PEN-01', '1234567890127', 2, 2, 12.00, 5.00, 80, 30),
('Ergonomic Office Chair', 'FURN-CHR-01', '1234567890128', 3, 3, 249.99, 150.00, 25, 5),
('Standing Desk', 'FURN-DSK-01', '1234567890129', 3, 3, 499.00, 300.00, 2, 5); -- Intentionally low stock

-- Insert Purchases
INSERT INTO purchase_orders (supplier_id, total_amount, paid_amount, payment_status) VALUES
(1, 1500.00, 1500.00, 'paid'),
(3, 1200.00, 600.00, 'partial');

-- Insert Purchase Items
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_cost) VALUES
(1, 2, 20, 75.00),
(2, 6, 8, 150.00);

-- Insert Sales
INSERT INTO sales_orders (customer_id, total_amount, paid_amount, discount, tax, payment_status, invoice_no) VALUES
(1, 470.00, 470.00, 0, 0, 'paid', 'INV-10001'),
(2, 599.00, 0.00, 0, 100.00, 'unpaid', 'INV-10002');

-- Insert Sale Items
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price) VALUES
(1, 2, 1, 120.00),
(1, 3, 1, 350.00),
(2, 7, 1, 499.00);

-- Insert Payments
INSERT INTO payments (reference_id, reference_type, amount, payment_method, created_by) VALUES
(1, 'purchase', 1500.00, 'Bank Transfer', 1),
(2, 'purchase', 600.00, 'Credit Card', 1),
(1, 'sale', 470.00, 'Credit Card', 1);
