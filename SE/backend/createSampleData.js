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
    name: 'Dr. John Smith',
    assignedCourses: [
      {
        courseKey: 'course1',
        courseName: 'Database Management Systems'
      },
      {
        courseKey: 'course2',
        courseName: 'Web Technologies'
      },
      {
        courseKey: 'course3',
        courseName: 'Software Engineering'
      }
    ]
  },
  students: [
    {
      username: 'student1',
      email: 'student1@university.edu',
      password: 'password123',
      role: 'student',
      name: 'Alice Johnson',
      rollNumber: 'CS2024001',
      class: 'CSE-A',
      semester: 5
    },
    {
      username: 'student2',
      email: 'student2@university.edu',
      password: 'password123',
      role: 'student',
      name: 'Bob Wilson',
      rollNumber: 'CS2024002',
      class: 'CSE-A',
      semester: 5
    },
    {
      username: 'student3',
      email: 'student3@university.edu',
      password: 'password123',
      role: 'student',
      name: 'Carol Davis',
      rollNumber: 'CS2024003',
      class: 'CSE-B',
      semester: 5
    },
    {
      username: 'student4',
      email: 'student4@university.edu',
      password: 'password123',
      role: 'student',
      name: 'David Brown',
      rollNumber: 'CS2024004',
      class: 'CSE-B',
      semester: 5
    },
    {
      username: 'student5',
      email: 'student5@university.edu',
      password: 'password123',
      role: 'student',
      name: 'Emma Taylor',
      rollNumber: 'CS2024005',
      class: 'CSE-A',
      semester: 5
    }
  ]
};

// Helper function to convert total marks to test1, test2, esa format
function convertMarksToFormat(totalMarks) {
  // Distribute marks: test1 (40%), test2 (40%), esa (20%)
  const test1 = Math.round(totalMarks * 0.4);
  const test2 = Math.round(totalMarks * 0.4);
  const esa = totalMarks - test1 - test2; // Remaining for ESA
  
  // Ensure values are within valid ranges
  return {
    test1: Math.min(Math.max(test1, 0), 40),
    test2: Math.min(Math.max(test2, 0), 40),
    esa: Math.min(Math.max(esa, 0), 20)
  };
}

// Sample marks data (converted to proper format)
const sampleMarks = [
  {
    rollNumber: 'CS2024001',
    course1: convertMarksToFormat(95), // S
    course2: convertMarksToFormat(88), // A
    course3: convertMarksToFormat(92)  // S
  },
  {
    rollNumber: 'CS2024002',
    course1: convertMarksToFormat(82), // A
    course2: convertMarksToFormat(75), // B
    course3: convertMarksToFormat(78)  // B
  },
  {
    rollNumber: 'CS2024003',
    course1: convertMarksToFormat(67), // C
    course2: convertMarksToFormat(71), // B
    course3: convertMarksToFormat(85)  // A
  },
  {
    rollNumber: 'CS2024004',
    course1: convertMarksToFormat(55), // D
    course2: convertMarksToFormat(62), // C
    course3: convertMarksToFormat(48)  // F
  },
  {
    rollNumber: 'CS2024005',
    course1: convertMarksToFormat(91), // S
    course2: convertMarksToFormat(87), // A
    course3: convertMarksToFormat(89)  // A
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