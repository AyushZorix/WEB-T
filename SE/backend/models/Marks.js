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
    course1: {
        name: { type: String, default: 'Database Management Systems' },
        marks: { type: Number, min: 0, max: 100, default: 0 },
        grade: { type: String, default: 'F' }
    },
    course2: {
        name: { type: String, default: 'Web Technologies' },
        marks: { type: Number, min: 0, max: 100, default: 0 },
        grade: { type: String, default: 'F' }
    },
    course3: {
        name: { type: String, default: 'Software Engineering' },
        marks: { type: Number, min: 0, max: 100, default: 0 },
        grade: { type: String, default: 'F' }
    }
}, {
    timestamps: true
});

// Calculate grade based on marks
function calculateGrade(marks) {
    if (marks >= 90) return 'S';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B';
    if (marks >= 60) return 'C';
    if (marks >= 50) return 'D';
    return 'F';
}

// Pre-save middleware to calculate grades
marksSchema.pre('save', function(next) {
    this.course1.grade = calculateGrade(this.course1.marks);
    this.course2.grade = calculateGrade(this.course2.marks);
    this.course3.grade = calculateGrade(this.course3.marks);
    if (typeof next === 'function') {
        return next();
    }
});

module.exports = mongoose.model('Marks', marksSchema);