const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
require('dotenv').config();

// Sample data for faculty and students
const sampleData = {
  faculty: {
    username: 'faculty1',
    email: 'faculty@university.edu',
    password: 'password123',
    role: 'faculty',
    name: 'Dr. John Smith'
  },
  students: [
    {
      username: 'student1',
      email: 'student1@university.edu',
      password: 'password123',
      role: 'student',
      name: 'Alice Johnson',
      rollNumber: 'CS2024001'
    },
    {
      username: 'student2',
      email: 'student2@university.edu',
      password: 'password123',
      role: 'student',
      name: 'Bob Wilson',
      rollNumber: 'CS2024002'
    },
    {
      username: 'student3',
      email: 'student3@university.edu',
      password: 'password123',
      role: 'student',
      name: 'Carol Davis',
      rollNumber: 'CS2024003'
    },
    {
      username: 'student4',
      email: 'student4@university.edu',
      password: 'password123',
      role: 'student',
      name: 'David Brown',
      rollNumber: 'CS2024004'
    },
    {
      username: 'student5',
      email: 'student5@university.edu',
      password: 'password123',
      role: 'student',
      name: 'Emma Taylor',
      rollNumber: 'CS2024005'
    }
  ]
};

// Sample marks data
const sampleMarks = [
  {
    rollNumber: 'CS2024001',
    course1: { marks: 95 }, // S
    course2: { marks: 88 }, // A
    course3: { marks: 92 }  // S
  },
  {
    rollNumber: 'CS2024002',
    course1: { marks: 82 }, // A
    course2: { marks: 75 }, // B
    course3: { marks: 78 }  // B
  },
  {
    rollNumber: 'CS2024003',
    course1: { marks: 67 }, // C
    course2: { marks: 71 }, // B
    course3: { marks: 85 }  // A
  },
  {
    rollNumber: 'CS2024004',
    course1: { marks: 55 }, // D
    course2: { marks: 62 }, // C
    course3: { marks: 48 }  // F
  },
  {
    rollNumber: 'CS2024005',
    course1: { marks: 91 }, // S
    course2: { marks: 87 }, // A
    course3: { marks: 89 }  // A
  }
];

async function createSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/WT');

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Marks.deleteMany({});
    console.log('Cleared existing data');

    // Create faculty user
    const faculty = new User(sampleData.faculty);
    await faculty.save();
    console.log('Faculty user created:', sampleData.faculty.username);

    // Create students and their marks
    for (let i = 0; i < sampleData.students.length; i++) {
      const studentData = sampleData.students[i];
      const marksData = sampleMarks[i];

      // Create student user
      const student = new User(studentData);
      await student.save();
      console.log('Student created:', studentData.username);

      // Create marks for student
      const marks = new Marks({
        studentId: student._id,
        rollNumber: student.rollNumber,
        studentName: student.name,
        course1: marksData.course1,
        course2: marksData.course2,
        course3: marksData.course3
      });
      
      await marks.save();
      console.log('Marks created for:', student.rollNumber);
    }

    console.log('\n✅ Sample data created successfully!');
    console.log('\n📚 Demo Login Credentials:');
    console.log('👨‍🏫 Faculty: username: faculty1, password: password123');
    console.log('👨‍🎓 Student: username: student1, password: password123');
    console.log('👩‍🎓 Student: username: student2, password: password123');
    console.log('👨‍🎓 Student: username: student3, password: password123');
    console.log('👩‍🎓 Student: username: student4, password: password123');
    console.log('👨‍🎓 Student: username: student5, password: password123');

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
if (require.main === module) {
  createSampleData();
}

module.exports = createSampleData;