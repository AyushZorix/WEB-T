const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true,
        enum: ['CSE-A', 'CSE-B', 'CSE-C', 'IT-A', 'IT-B', 'ECE-A', 'ECE-B']
    },
    course1: {
        name: { type: String, default: 'Database Management Systems' },
        test1: { type: Number, min: 0, max: 40, default: 0 },
        test2: { type: Number, min: 0, max: 40, default: 0 },
        esa: { type: Number, min: 0, max: 20, default: 0 },
        totalMarks: { type: Number, min: 0, max: 100, default: 0 },
        grade: { type: String, default: 'F' }
    },
    course2: {
        name: { type: String, default: 'Web Technologies' },
        test1: { type: Number, min: 0, max: 40, default: 0 },
        test2: { type: Number, min: 0, max: 40, default: 0 },
        esa: { type: Number, min: 0, max: 20, default: 0 },
        totalMarks: { type: Number, min: 0, max: 100, default: 0 },
        grade: { type: String, default: 'F' }
    },
    course3: {
        name: { type: String, default: 'Software Engineering' },
        test1: { type: Number, min: 0, max: 40, default: 0 },
        test2: { type: Number, min: 0, max: 40, default: 0 },
        esa: { type: Number, min: 0, max: 20, default: 0 },
        totalMarks: { type: Number, min: 0, max: 100, default: 0 },
        grade: { type: String, default: 'F' }
    }
}, {
    timestamps: true
});

// Calculate grade based on total marks
function calculateGrade(totalMarks) {
    if (totalMarks >= 90) return 'S';
    if (totalMarks >= 80) return 'A';
    if (totalMarks >= 70) return 'B';
    if (totalMarks >= 60) return 'C';
    if (totalMarks >= 50) return 'D';
    return 'F';
}

// Pre-save middleware to calculate total marks and grades
marksSchema.pre('save', function(next) {
    // Calculate total marks for each course
    this.course1.totalMarks = this.course1.test1 + this.course1.test2 + this.course1.esa;
    this.course2.totalMarks = this.course2.test1 + this.course2.test2 + this.course2.esa;
    this.course3.totalMarks = this.course3.test1 + this.course3.test2 + this.course3.esa;
    
    // Calculate grades
    this.course1.grade = calculateGrade(this.course1.totalMarks);
    this.course2.grade = calculateGrade(this.course2.totalMarks);
    this.course3.grade = calculateGrade(this.course3.totalMarks);
    
    if (typeof next === 'function') {
        return next();
    }
});

module.exports = mongoose.model('Marks', marksSchema);