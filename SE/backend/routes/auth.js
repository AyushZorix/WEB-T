const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Marks = require('../models/Marks');
const router = express.Router();

// Register new user (mainly for initial setup)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, name, rollNumber } = req.body;

        // Validation
        if (!username || !email || !password || !role || !name) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (role === 'student' && !rollNumber) {
            return res.status(400).json({ message: 'Roll number is required for students' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }, ...(rollNumber ? [{ rollNumber }] : [])]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            role,
            name,
            rollNumber
        });

        await user.save();

        // If it's a student, create initial marks record
        if (role === 'student') {
            const marks = new Marks({
                studentId: user._id,
                rollNumber: user.rollNumber,
                studentName: user.name
            });
            await marks.save();
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                role: user.role,
                rollNumber: user.rollNumber
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;