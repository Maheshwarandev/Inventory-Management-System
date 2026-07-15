const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.is_active === 0) {
            return res.status(403).json({ message: 'This account has been deactivated' });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private/Admin
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const userRole = role === 'admin' ? 'admin' : 'employee';

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, userRole]
        );

        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, role, avatar, is_active FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const updates = [];
        const values = [];

        if (typeof name !== 'undefined' && name !== null) {
            const trimmedName = name.toString().trim();
            if (trimmedName) {
                updates.push('name = ?');
                values.push(trimmedName);
            }
        }

        if (typeof email !== 'undefined' && email !== null) {
            const trimmedEmail = email.toString().trim().toLowerCase();
            if (trimmedEmail) {
                const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [trimmedEmail, req.user.id]);
                if (existing.length > 0) {
                    return res.status(400).json({ message: 'Email already in use' });
                }

                updates.push('email = ?');
                values.push(trimmedEmail);
            }
        }

        if (typeof role !== 'undefined' && role !== null) {
            // Only admins can change roles — prevent self-escalation
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Only admins can change user roles' });
            }
            const normalizedRole = role === 'admin' ? 'admin' : 'employee';
            updates.push('role = ?');
            values.push(normalizedRole);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No profile changes provided' });
        }

        values.push(req.user.id);
        await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

        const [users] = await pool.query('SELECT id, name, email, role, avatar, is_active FROM users WHERE id = ?', [req.user.id]);
        const updatedUser = users[0];
        const token = generateToken(updatedUser.id, updatedUser.role);

        res.json({ ...updatedUser, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, users[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    login,
    register,
    getMe,
    updateProfile,
    updatePassword
};
