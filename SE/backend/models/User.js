const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['faculty', 'student'],
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    rollNumber: {
        type: String,
        required: function() { return this.role === 'student'; },
        unique: true,
        sparse: true
    },
    // Faculty-specific fields
    assignedCourses: [{
        courseKey: {
            type: String,
            enum: ['course1', 'course2', 'course3'], // DBMS, Web Tech, Software Eng
            required: function() { return this.role === 'faculty'; }
        },
        courseName: {
            type: String,
            required: function() { return this.role === 'faculty'; }
        }
    }],
    // Student-specific fields
    class: {
        type: String,
        required: function() { return this.role === 'student'; },
        enum: ['CSE-A', 'CSE-B', 'CSE-C', 'IT-A', 'IT-B', 'ECE-A', 'ECE-B']
    },
    semester: {
        type: Number,
        required: function() { return this.role === 'student'; },
        min: 1,
        max: 8,
        default: 5 // 5th semester for current courses
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        if (typeof next === 'function') {
            return next();
        }
        return;
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        if (typeof next === 'function') {
            return next();
        }
    } catch (error) {
        if (typeof next === 'function') {
            return next(error);
        }
        throw error;
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);