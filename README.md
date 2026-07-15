# Full-Stack Inventory Management System (IMS)

## Project Overview
This project is a comprehensive, full-stack Inventory Management System designed to efficiently track products, sales, purchases, suppliers, and customers. It features a modern, responsive user interface and a robust backend API connected to a relational database, built with a warehouse operations focus and role-based access control.

## What Was Built

### Initial Implementation
As your AI assistant, here is a summary of what we built for this project:

*   **Full-Stack Architecture Setup**: Scaffolded the project structure with a clear separation between the frontend (`client`) and backend (`server`).
*   **Database Design & Implementation**: Created a relational SQL schema in MySQL to handle relationships between products, categories, sales, purchases, customers, and suppliers.
*   **RESTful API Development**: Built backend endpoints using Node.js and Express.js, organized with modular routes and controllers.
*   **Authentication System**: Implemented a secure authentication flow using JWT (JSON Web Tokens) and bcrypt for password hashing.
*   **Frontend UI/UX**: Developed a sleek, responsive, and dynamic user interface using React and Tailwind CSS, featuring a dashboard, data tables, and forms.
*   **Form Handling & Validation**: Integrated `react-hook-form` to handle complex inputs for sales, purchases, and inventory updates, paired with `react-hot-toast` for user feedback.
*   **Data Visualization**: Integrated `chart.js` to display analytical insights and business metrics on the Dashboard.
*   **File Handling**: Configured `multer` on the backend to handle product image uploads.

### Recent Updates (July 15, 2026)

#### Database Schema Enhancements
- Renamed tables to use inventory-oriented naming convention:
  - `purchases` → `purchase_orders`
  - `purchase_items` → `purchase_order_items`
  - `sales` → `sales_orders`
  - `sale_items` → `sales_order_items`
- Added `is_active` column to users table for account deactivation support

#### User Profile Management
- **Backend**: Added new endpoints for profile and password updates
  - `PUT /api/auth/profile` - Update name, email, and role
  - `PUT /api/auth/password` - Change account password
- **Frontend**: Interactive Settings page with:
  - Editable name, email, and role fields
  - Secure password change form
  - Real-time success/error feedback

#### Security Improvements
- Login form autofill prevention with proper JSX attributes and password manager detection
- Removed test credentials hint from login page for production readiness

## Technical Specifications & Features

### Core Modules
1. **Dashboard**: High-level overview of inventory status, recent activities, and key metrics via charts.
2. **Inventory & Products**: CRUD operations for products, stock tracking, and category management.
3. **Sales Management**: Record sales transactions, associate them with customers, and automatically deduct from inventory upon sale.
4. **Purchases & Suppliers**: Track incoming stock, manage supplier information, and automatically add to inventory upon purchase.
5. **Customer & Supplier Directory**: Centralized management of contact information and transaction history.
6. **Reports**: View analytical reports based on sales and purchase history.
7. **Settings**: Update profile information, manage account preferences, and change password.
8. **User Management** (Admin): Create and manage user accounts with role-based access control.

### Role-Based Features
- **Admin**: Full system access, user management, settings configuration
- **Employee**: Read-only access to inventory and reports, can update own profile

## Technology Stack

### Frontend (`/client`)
*   **Core**: React 19, Vite
*   **Routing**: React Router DOM
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Charts**: Chart.js, react-chartjs-2
*   **Forms & Notifications**: React Hook Form, React Hot Toast
*   **HTTP Client**: Axios

### Backend (`/server`)
*   **Core**: Node.js, Express.js
*   **Database**: MySQL (using `mysql2`)
*   **Authentication**: JSON Web Tokens (JWT), bcrypt
*   **File Uploads**: Multer
*   **Utilities**: Morgan (logging), Dotenv (environment variables), CORS

## Getting Started

### Prerequisites
*   Node.js installed
*   MySQL Server running

### Setup Instructions

#### Backend Setup
1. Navigate to the `/server` directory
2. Run `npm install` to install dependencies
3. Configure your `.env` file with your database credentials:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=ims_db
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   ```
4. Start the server with `npm run dev`

#### Frontend Setup
1. Navigate to the `/client` directory
2. Run `npm install` to install dependencies
3. Create a `.env` file with:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server with `npm run dev`

### Database Setup
The database schema can be initialized by running:
```bash
cd server
node recreateDb.js
node sql/run_seed.js
```

## Testing Credentials

### Admin Account
- **Email**: `admin@ims.com`
- **Password**: `admin123`
- **Access**: Full system access including user management

### Employee Account
- **Email**: `employee@ims.com`
- **Password**: `employee123`
- **Access**: Read-only access to inventory and reports

## Recent Changes Summary

| Feature | Status | Files Modified |
|---------|--------|-----------------|
| Database schema update (purchase/sales orders) | ✅ | schema.sql, seed.sql |
| Backend profile update endpoint | ✅ | authController.js, authRoutes.js |
| Backend password update endpoint | ✅ | authController.js, authRoutes.js |
| Frontend profile edit form | ✅ | Settings.jsx, AuthContext.jsx |
| Role selection dropdown | ✅ | Settings.jsx |
| Password update form | ✅ | Settings.jsx |
| Login autofill prevention | ✅ | Login.jsx |
| Removed test credentials text | ✅ | Login.jsx |

## Build Status

All changes have been verified with successful builds:
- ✅ **Frontend**: `npm run build` - Success (Vite build in ~600-800ms)
- ✅ **Backend**: Server startup successful with database connection
- ✅ **Database**: Schema and seed data synchronized

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (admin only)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile (name, email, role)
- `PUT /api/auth/password` - Change password

### Inventory & Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Sales Management
- `GET /api/sales` - List sales orders
- `POST /api/sales` - Create sales order
- `GET /api/sales/:id` - Get sales order details
- `PUT /api/sales/:id/payment` - Add payment to sale

### Purchase Management
- `GET /api/purchases` - List purchase orders
- `POST /api/purchases` - Create purchase order (admin only)
- `GET /api/purchases/:id` - Get purchase order details
- `PUT /api/purchases/:id/payment` - Add payment to purchase

### Reports
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/purchases` - Purchase report (admin only)

### User Management (Admin)
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user status (admin only)

## Recommended Next Steps

1. **Security Enhancements**
   - Implement two-factor authentication (2FA)
   - Add audit logging for profile and role changes
   - Restrict role changes to admins only

2. **Feature Improvements**
   - Avatar/profile picture upload
   - Advanced reporting with date filters
   - Batch import/export functionality
   - Email notifications for low stock alerts

3. **UI/UX Refinements**
   - Employee-specific view modes with clear read-only indicators
   - Mobile app version
   - Dark mode support
   - Keyboard shortcuts for power users

4. **Performance Optimization**
   - Implement pagination for large datasets
   - Add caching layer for reports
   - Optimize database queries with indexes
   - Code splitting for frontend chunks
