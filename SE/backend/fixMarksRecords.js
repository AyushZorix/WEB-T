const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
require('dotenv').config();

async function fixMarksRecords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WT');
    console.log('✅ Connected to MongoDB\n');

    // Find all students
    const students = await User.find({ role: 'student' });
    console.log(`Found ${students.length} student(s)\n`);

    if (students.length === 0) {
      console.log('No students found. Nothing to fix.\n');
      await mongoose.connection.close();
      return;
    }

    let created = 0;
    let existing = 0;

    for (const student of students) {
      // Check if marks record exists
      const existingMarks = await Marks.findOne({ studentId: student._id });
      
      if (existingMarks) {
        console.log(`✓ Marks record already exists for ${student.name} (${student.rollNumber})`);
        existing++;
      } else {
        // Create marks record
        const marks = new Marks({
          studentId: student._id,
          rollNumber: student.rollNumber || '',
          studentName: student.name,
          class: student.class || 'CSE-A' // Default to CSE-A if class is missing
        });

        await marks.save();
        console.log(`✓ Created marks record for ${student.name} (${student.rollNumber})`);
        created++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Existing marks records: ${existing}`);
    console.log(`   - Created marks records: ${created}`);
    console.log(`   - Total students: ${students.length}\n`);

    console.log('✅ All students now have marks records!\n');

  } catch (error) {
    console.error('❌ Error fixing marks records:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  fixMarksRecords();
}

module.exports = fixMarksRecords;

