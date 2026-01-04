const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Decoded token:', decoded);
        
        const user = await User.findById(decoded.userId).select('-password');
        console.log('User lookup result:', user ? `Found: ${user.name} (${user.role})` : 'Not found');
        
        if (!user) {
            return res.status(401).json({ message: 'Token is not valid - user not found' });
        }

        // Set both user object and userId for compatibility
        req.user = {
            ...user.toObject(),
            userId: user._id
        };
        
        console.log('Auth successful for user:', req.user.name, 'Role:', req.user.role);
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Check if user is faculty
const facultyAuth = (req, res, next) => {
    if (req.user && req.user.role === 'faculty') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Faculty role required.' });
    }
};

// Check if user is student
const studentAuth = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Student role required.' });
    }
};

module.exports = { auth, facultyAuth, studentAuth };