const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Add user info to req object
            req.user = { id: decoded.id, role: decoded.role };
            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    
    return res.status(401).json({ message: 'Not authorized, no token' });
};

module.exports = { protect };
