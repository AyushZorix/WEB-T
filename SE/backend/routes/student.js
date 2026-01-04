const express = require('express');
const Marks = require('../models/Marks');
const { auth, studentAuth } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth, studentAuth);

// Get student's own marks
router.get('/my-marks', async (req, res) => {
    try {
        const studentId = req.user._id;
        
        const marks = await Marks.findOne({ studentId });
        
        if (!marks) {
            return res.status(404).json({ message: 'No marks found for this student' });
        }

        // Return only the student's own marks
        res.json({
            student: {
                name: marks.studentName,
                rollNumber: marks.rollNumber
            },
            courses: {
                course1: {
                    name: marks.course1.name,
                    marks: marks.course1.marks,
                    grade: marks.course1.grade
                },
                course2: {
                    name: marks.course2.name,
                    marks: marks.course2.marks,
                    grade: marks.course2.grade
                },
                course3: {
                    name: marks.course3.name,
                    marks: marks.course3.marks,
                    grade: marks.course3.grade
                }
            }
        });
    } catch (error) {
        console.error('Get student marks error:', error);
        res.status(500).json({ message: 'Server error while fetching marks' });
    }
});

// Get student profile
router.get('/profile', async (req, res) => {
    try {
        const student = req.user;
        
        res.json({
            id: student._id,
            name: student.name,
            username: student.username,
            email: student.email,
            rollNumber: student.rollNumber,
            role: student.role
        });
    } catch (error) {
        console.error('Get student profile error:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
});

module.exports = router;