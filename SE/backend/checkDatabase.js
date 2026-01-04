const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
require('dotenv').config();

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WT');
    console.log('✅ Connected to MongoDB\n');

    // Check faculty users
    console.log('📋 Checking Faculty Users:');
    console.log('─'.repeat(50));
    const facultyUsers = await User.find({ role: 'faculty' }).select('-password');
    console.log(`Found ${facultyUsers.length} faculty user(s):\n`);
    
    facultyUsers.forEach((faculty, index) => {
      console.log(`${index + 1}. ${faculty.name} (${faculty.username})`);
      console.log(`   Email: ${faculty.email}`);
      console.log(`   Assigned Courses: ${faculty.assignedCourses?.length || 0}`);
      if (faculty.assignedCourses && faculty.assignedCourses.length > 0) {
        faculty.assignedCourses.forEach(course => {
          console.log(`     - ${course.courseName} (${course.courseKey})`);
        });
      } else {
        console.log(`     ⚠️  WARNING: No courses assigned to this faculty!`);
        console.log(`     Faculty must have at least one assigned course to view students properly.`);
      }
      console.log('');
    });

    // Check student users
    console.log('📋 Checking Student Users:');
    console.log('─'.repeat(50));
    const studentUsers = await User.find({ role: 'student' }).select('-password');
    console.log(`Found ${studentUsers.length} student(s):\n`);
    
    if (studentUsers.length === 0) {
      console.log('⚠️  WARNING: No students found in database!');
      console.log('   Faculty will not see any students until students are added.\n');
    } else {
      studentUsers.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.username})`);
        console.log(`   Roll Number: ${student.rollNumber || 'NOT SET'}`);
        console.log(`   Class: ${student.class || 'NOT SET'}`);
        console.log(`   Semester: ${student.semester || 'NOT SET'}`);
        if (!student.class) {
          console.log(`   ⚠️  WARNING: Student missing required 'class' field!`);
        }
        console.log('');
      });
    }

    // Check marks
    console.log('📋 Checking Marks Records:');
    console.log('─'.repeat(50));
    const marksRecords = await Marks.find();
    console.log(`Found ${marksRecords.length} marks record(s)\n`);
    
    if (marksRecords.length === 0 && studentUsers.length > 0) {
      console.log('⚠️  WARNING: Students exist but no marks records found!');
      console.log('   Marks records are created automatically when students are created.\n');
    } else if (marksRecords.length > 0) {
      marksRecords.slice(0, 3).forEach((mark, index) => {
        console.log(`${index + 1}. ${mark.studentName} (${mark.rollNumber})`);
        console.log(`   Class: ${mark.class}`);
        console.log(`   Course1 Total: ${mark.course1?.totalMarks || 0}/100`);
        console.log(`   Course2 Total: ${mark.course2?.totalMarks || 0}/100`);
        console.log(`   Course3 Total: ${mark.course3?.totalMarks || 0}/100`);
        console.log('');
      });
      if (marksRecords.length > 3) {
        console.log(`   ... and ${marksRecords.length - 3} more records\n`);
      }
    }

    // Summary and recommendations
    console.log('📊 Summary:');
    console.log('─'.repeat(50));
    const facultyWithCourses = facultyUsers.filter(f => f.assignedCourses && f.assignedCourses.length > 0).length;
    const studentsWithClass = studentUsers.filter(s => s.class).length;
    
    console.log(`✓ Faculty users: ${facultyUsers.length}`);
    console.log(`✓ Faculty with assigned courses: ${facultyWithCourses}/${facultyUsers.length}`);
    console.log(`✓ Student users: ${studentUsers.length}`);
    console.log(`✓ Students with class assigned: ${studentsWithClass}/${studentUsers.length}`);
    console.log(`✓ Marks records: ${marksRecords.length}\n`);

    if (facultyWithCourses === 0 && facultyUsers.length > 0) {
      console.log('⚠️  ISSUE FOUND: Faculty users exist but none have assigned courses!');
      console.log('   SOLUTION: Update faculty users to include assignedCourses array.\n');
    }

    if (studentsWithClass < studentUsers.length && studentUsers.length > 0) {
      console.log('⚠️  ISSUE FOUND: Some students are missing the required "class" field!');
      console.log('   SOLUTION: Update student records to include class field.\n');
    }

    if (studentUsers.length === 0) {
      console.log('ℹ️  INFO: No students in database. Faculty can add students through the dashboard.\n');
    }

    if (facultyUsers.length === 0) {
      console.log('ℹ️  INFO: No faculty users in database. Create a faculty account to use the system.\n');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the check
if (require.main === module) {
  checkDatabase();
}

module.exports = checkDatabase;

