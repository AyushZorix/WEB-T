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

        console.log('Fetching marks for student:', studentId);
        console.log('Marks from DB:', {
            course1: {
                test1: marks.course1.test1,
                test2: marks.course1.test2,
                esa: marks.course1.esa,
                totalMarks: marks.course1.totalMarks,
                grade: marks.course1.grade
            },
            course2: {
                test1: marks.course2.test1,
                test2: marks.course2.test2,
                esa: marks.course2.esa,
                totalMarks: marks.course2.totalMarks,
                grade: marks.course2.grade
            },
            course3: {
                test1: marks.course3.test1,
                test2: marks.course3.test2,
                esa: marks.course3.esa,
                totalMarks: marks.course3.totalMarks,
                grade: marks.course3.grade
            }
        });

        // Return only the student's own marks with complete details
        res.json({
            student: {
                name: marks.studentName,
                rollNumber: marks.rollNumber
            },
            courses: {
                course1: {
                    name: marks.course1.name,
                    test1: marks.course1.test1,
                    test2: marks.course1.test2,
                    esa: marks.course1.esa,
                    totalMarks: marks.course1.totalMarks,
                    grade: marks.course1.grade
                },
                course2: {
                    name: marks.course2.name,
                    test1: marks.course2.test1,
                    test2: marks.course2.test2,
                    esa: marks.course2.esa,
                    totalMarks: marks.course2.totalMarks,
                    grade: marks.course2.grade
                },
                course3: {
                    name: marks.course3.name,
                    test1: marks.course3.test1,
                    test2: marks.course3.test2,
                    esa: marks.course3.esa,
                    totalMarks: marks.course3.totalMarks,
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