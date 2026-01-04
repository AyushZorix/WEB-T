const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Marks = require('../models/Marks');
const router = express.Router();

// Register new user (mainly for initial setup)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, name, rollNumber, assignedCourses, class: studentClass, semester } = req.body;

        // Validation
        if (!username || !email || !password || !role || !name) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (role === 'student') {
            if (!rollNumber) {
                return res.status(400).json({ message: 'Roll number is required for students' });
            }
            if (!studentClass) {
                return res.status(400).json({ message: 'Class is required for students' });
            }
        }

        if (role === 'faculty') {
            if (!assignedCourses || assignedCourses.length === 0) {
                return res.status(400).json({ message: 'At least one course must be assigned to faculty' });
            }
        }

        // Check if user already exists
        const existingUserQuery = { 
            $or: [{ email }, { username }]
        };
        
        // Only add rollNumber to query if it's provided and not empty
        if (rollNumber && rollNumber.trim() !== '') {
            existingUserQuery.$or.push({ rollNumber: rollNumber.trim() });
        }

        const existingUser = await User.findOne(existingUserQuery);

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user - include role-specific fields
        const userData = {
            username,
            email,
            password,
            role,
            name
        };

        // Add role-specific fields
        if (role === 'student' && rollNumber && rollNumber.trim() !== '') {
            userData.rollNumber = rollNumber.trim();
            userData.class = studentClass;
            userData.semester = semester || 5;
        }

        if (role === 'faculty' && assignedCourses) {
            userData.assignedCourses = assignedCourses;
        }

        const user = new User(userData);
        await user.save();

        // If it's a student, create initial marks record
        if (role === 'student') {
            const marks = new Marks({
                studentId: user._id,
                rollNumber: user.rollNumber || '',
                studentName: user.name,
                class: user.class
            });
            await marks.save();
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            // Handle duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            res.status(400).json({ message: `${field} already exists. Please choose a different ${field}.` });
        } else {
            res.status(500).json({ message: 'Server error during registration' });
        }
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

        // Find user and populate assigned courses for faculty
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

        // Prepare user response with role-specific data
        const userResponse = {
            id: user._id,
            username: user.username,
            name: user.name,
            role: user.role,
            rollNumber: user.rollNumber,
            class: user.class,
            semester: user.semester,
            assignedCourses: user.assignedCourses
        };

        res.json({
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;