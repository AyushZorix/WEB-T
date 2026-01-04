const express = require('express');
const User = require('../models/User');
const Marks = require('../models/Marks');
const { auth, facultyAuth } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth, facultyAuth);

// Add new student
router.post('/add-student', async (req, res) => {
    try {
        const { username, email, password, name, rollNumber } = req.body;

        // Validation
        if (!username || !email || !password || !name || !rollNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if student already exists
        const existingStudent = await User.findOne({ 
            $or: [{ email }, { username }, { rollNumber }]
        });

        if (existingStudent) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        // Create new student
        const student = new User({
            username,
            email,
            password,
            role: 'student',
            name,
            rollNumber
        });

        await student.save();

        // Create initial marks record for the student
        const marks = new Marks({
            studentId: student._id,
            rollNumber: student.rollNumber,
            studentName: student.name
        });

        await marks.save();

        res.status(201).json({ 
            message: 'Student added successfully',
            student: {
                id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                username: student.username,
                email: student.email
            }
        });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ message: 'Server error while adding student' });
    }
});

// Get all students
router.get('/students', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        const studentsWithMarks = await Promise.all(
            students.map(async (student) => {
                const marks = await Marks.findOne({ studentId: student._id });
                const studentObj = student.toObject();
                return {
                    ...studentObj,
                    id: studentObj._id, // Add id field for frontend compatibility
                    marks: marks || null
                };
            })
        );

        res.json(studentsWithMarks);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ message: 'Server error while fetching students' });
    }
});

// Update student marks
router.put('/update-marks/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { course1, course2, course3 } = req.body;

        // Validation
        if (!course1 || !course2 || !course3) {
            return res.status(400).json({ message: 'All course marks are required' });
        }

        // Validate marks range
        const courses = [course1, course2, course3];
        for (let course of courses) {
            if (course.marks < 0 || course.marks > 100) {
                return res.status(400).json({ message: 'Marks must be between 0 and 100' });
            }
        }

        // Find and update marks
        let marks = await Marks.findOne({ studentId });
        
        if (!marks) {
            // Create new marks record if not exists
            const student = await User.findById(studentId);
            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            marks = new Marks({
                studentId,
                rollNumber: student.rollNumber,
                studentName: student.name
            });
        }

        // Update marks
        marks.course1.marks = course1.marks;
        marks.course2.marks = course2.marks;
        marks.course3.marks = course3.marks;

        await marks.save();

        res.json({ 
            message: 'Marks updated successfully',
            marks 
        });
    } catch (error) {
        console.error('Update marks error:', error);
        res.status(500).json({ message: 'Server error while updating marks' });
    }
});

// Delete student
router.delete('/delete-student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find and delete student
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.role !== 'student') {
            return res.status(400).json({ message: 'Can only delete students' });
        }

        // Delete student's marks
        await Marks.deleteOne({ studentId });

        // Delete student user
        await User.findByIdAndDelete(studentId);

        res.json({ 
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ message: 'Server error while deleting student' });
    }
});

// Get analytics for all courses
router.get('/analytics', async (req, res) => {
    try {
        const allMarks = await Marks.find({});

        const analytics = {
            course1: calculateCourseAnalytics(allMarks, 'course1'),
            course2: calculateCourseAnalytics(allMarks, 'course2'),
            course3: calculateCourseAnalytics(allMarks, 'course3')
        };

        res.json(analytics);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Server error while calculating analytics' });
    }
});

// Helper function to calculate course analytics
function calculateCourseAnalytics(marksData, courseKey) {
    const courseMarks = marksData.map(mark => mark[courseKey].marks);
    const courseGrades = marksData.map(mark => mark[courseKey].grade);

    // Calculate average
    const average = courseMarks.length > 0 
        ? (courseMarks.reduce((sum, mark) => sum + mark, 0) / courseMarks.length).toFixed(2)
        : 0;

    // Count grades
    const gradeCount = {
        S: courseGrades.filter(grade => grade === 'S').length,
        A: courseGrades.filter(grade => grade === 'A').length,
        B: courseGrades.filter(grade => grade === 'B').length,
        C: courseGrades.filter(grade => grade === 'C').length,
        D: courseGrades.filter(grade => grade === 'D').length,
        F: courseGrades.filter(grade => grade === 'F').length
    };

    return {
        courseName: marksData.length > 0 ? marksData[0][courseKey].name : '',
        average: parseFloat(average),
        gradeCount,
        totalStudents: courseMarks.length
    };
}

module.exports = router;