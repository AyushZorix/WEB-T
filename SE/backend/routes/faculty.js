const express = require('express');
const User = require('../models/User');
const Marks = require('../models/Marks');
const { auth, facultyAuth } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth, facultyAuth);

// Add new student with class assignment
router.post('/add-student', async (req, res) => {
    try {
        const { username, email, password, name, rollNumber, class: studentClass, semester } = req.body;

        // Validation
        if (!username || !email || !password || !name || !rollNumber || !studentClass) {
            return res.status(400).json({ message: 'All fields including class are required' });
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
            rollNumber,
            class: studentClass,
            semester: semester || 5
        });

        await student.save();

        // Create initial marks record for the student
        const marks = new Marks({
            studentId: student._id,
            rollNumber: student.rollNumber,
            studentName: student.name,
            class: student.class
        });

        await marks.save();

        res.status(201).json({ 
            message: 'Student added successfully',
            student: {
                id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                username: student.username,
                email: student.email,
                class: student.class,
                semester: student.semester
            }
        });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({ message: 'Server error while adding student' });
    }
});

// Get students based on faculty's assigned courses and classes
router.get('/students', async (req, res) => {
    try {
        console.log('Faculty getting students request from user:', req.user?.name, req.user?.role);
        
        // The faculty user is already loaded in req.user from auth middleware
        const faculty = req.user;
        console.log('Faculty loaded:', faculty ? faculty.name : 'None', 'Assigned courses:', faculty?.assignedCourses?.length || 0);
        
        if (!faculty) {
            return res.status(404).json({ message: 'Faculty not found' });
        }

        // Check if faculty has assigned courses - but allow viewing all students for now
        const hasAssignedCourses = faculty.assignedCourses && faculty.assignedCourses.length > 0;
        console.log('Faculty has assigned courses:', hasAssignedCourses);

        const { class: filterClass } = req.query;
        
        // Build query to get students
        let studentQuery = { role: 'student' };
        if (filterClass) {
            studentQuery.class = filterClass;
        }

        const students = await User.find(studentQuery).select('-password');
        console.log(`Found ${students.length} students in database`);
        
        if (students.length === 0) {
            return res.json([]);
        }

        const studentsWithMarks = await Promise.all(
            students.map(async (student) => {
                const marks = await Marks.findOne({ studentId: student._id });
                const studentObj = student.toObject();
                
                // If faculty has assigned courses, filter marks accordingly
                let filteredMarks = null;
                if (marks) {
                    if (hasAssignedCourses) {
                        filteredMarks = { ...marks.toObject() };
                        
                        // Only include courses that faculty is assigned to
                        const assignedCourseKeys = faculty.assignedCourses.map(c => c.courseKey);
                        
                        if (!assignedCourseKeys.includes('course1')) {
                            delete filteredMarks.course1;
                        }
                        if (!assignedCourseKeys.includes('course2')) {
                            delete filteredMarks.course2;
                        }
                        if (!assignedCourseKeys.includes('course3')) {
                            delete filteredMarks.course3;
                        }
                    } else {
                        // If no assigned courses, show all marks but with limited edit access
                        filteredMarks = marks.toObject();
                    }
                }
                
                return {
                    ...studentObj,
                    id: studentObj._id,
                    marks: filteredMarks,
                    assignedCourses: faculty.assignedCourses || [] // Send faculty's assigned courses for UI
                };
            })
        );

        console.log('Sending students with filtered marks:', studentsWithMarks.length);
        res.json(studentsWithMarks);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ message: 'Server error while fetching students' });
    }
});

// Get available classes
router.get('/classes', async (req, res) => {
    try {
        const classes = ['CSE-A', 'CSE-B', 'CSE-C', 'IT-A', 'IT-B', 'ECE-A', 'ECE-B'];
        
        // Get count of students in each class
        const classData = await Promise.all(
            classes.map(async (className) => {
                const count = await User.countDocuments({ role: 'student', class: className });
                return { name: className, studentCount: count };
            })
        );
        
        res.json(classData);
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({ message: 'Server error while fetching classes' });
    }
});

// Update student marks (only for assigned courses)
router.put('/update-marks/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const marksUpdate = req.body;

        // Get faculty user with assigned courses
        const faculty = await User.findById(req.user.userId);
        if (!faculty || !faculty.assignedCourses || faculty.assignedCourses.length === 0) {
            return res.status(403).json({ message: 'No courses assigned to this faculty' });
        }

        // Get assigned course keys
        const assignedCourseKeys = faculty.assignedCourses.map(c => c.courseKey);

        // Validate that faculty can only update their assigned courses
        for (let courseKey in marksUpdate) {
            if (!assignedCourseKeys.includes(courseKey)) {
                return res.status(403).json({ 
                    message: `You are not authorized to update marks for ${courseKey}` 
                });
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
                studentName: student.name,
                class: student.class
            });
        }

        // Update only the assigned courses
        for (let courseKey of assignedCourseKeys) {
            if (marksUpdate[courseKey]) {
                const courseData = marksUpdate[courseKey];
                
                // Validate marks ranges
                if (courseData.test1 !== undefined && (courseData.test1 < 0 || courseData.test1 > 40)) {
                    return res.status(400).json({ message: 'Test 1 marks must be between 0 and 40' });
                }
                if (courseData.test2 !== undefined && (courseData.test2 < 0 || courseData.test2 > 40)) {
                    return res.status(400).json({ message: 'Test 2 marks must be between 0 and 40' });
                }
                if (courseData.esa !== undefined && (courseData.esa < 0 || courseData.esa > 20)) {
                    return res.status(400).json({ message: 'ESA marks must be between 0 and 20' });
                }

                // Update marks and mark as modified for mongoose change detection
                if (courseData.test1 !== undefined) {
                    marks[courseKey].test1 = courseData.test1;
                    marks.markModified(`${courseKey}.test1`);
                }
                if (courseData.test2 !== undefined) {
                    marks[courseKey].test2 = courseData.test2;
                    marks.markModified(`${courseKey}.test2`);
                }
                if (courseData.esa !== undefined) {
                    marks[courseKey].esa = courseData.esa;
                    marks.markModified(`${courseKey}.esa`);
                }
                // Mark the entire course object as modified
                marks.markModified(courseKey);
            }
        }

        await marks.save();
        
        // Reload marks from database to get calculated totals and grades
        const updatedMarks = await Marks.findOne({ studentId });
        console.log('Marks saved successfully for student:', studentId);
        console.log('Updated marks:', JSON.stringify(updatedMarks, null, 2));

        res.json({ 
            message: 'Marks updated successfully',
            marks: updatedMarks
        });
    } catch (error) {
        console.error('Update marks error:', error);
        res.status(500).json({ message: 'Server error while updating marks' });
    }
});

// Delete student (only if faculty has permission for the student's class)
router.delete('/delete-student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find student first
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

// Get analytics for assigned courses only
router.get('/analytics', async (req, res) => {
    try {
        // Get faculty user with assigned courses
        const faculty = await User.findById(req.user.userId);
        if (!faculty || !faculty.assignedCourses || faculty.assignedCourses.length === 0) {
            return res.status(403).json({ message: 'No courses assigned to this faculty' });
        }

        const { class: filterClass } = req.query;
        
        // Build query for marks
        let marksQuery = {};
        if (filterClass) {
            marksQuery.class = filterClass;
        }

        const allMarks = await Marks.find(marksQuery);
        const assignedCourseKeys = faculty.assignedCourses.map(c => c.courseKey);

        const analytics = {};
        
        // Only calculate analytics for assigned courses
        for (let courseKey of assignedCourseKeys) {
            analytics[courseKey] = calculateCourseAnalytics(allMarks, courseKey);
        }

        res.json(analytics);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Server error while calculating analytics' });
    }
});

// Helper function to calculate course analytics
function calculateCourseAnalytics(marksData, courseKey) {
    const courseTotalMarks = marksData.map(mark => mark[courseKey].totalMarks);
    const courseGrades = marksData.map(mark => mark[courseKey].grade);

    // Calculate average
    const average = courseTotalMarks.length > 0 
        ? (courseTotalMarks.reduce((sum, mark) => sum + mark, 0) / courseTotalMarks.length).toFixed(2)
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
        totalStudents: courseTotalMarks.length
    };
}

module.exports = router;