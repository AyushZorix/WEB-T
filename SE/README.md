# Internal Assessment Portal

A full-stack web application for managing student internal assessments with role-based authentication and database-driven user management.

## 🛠 Tech Stack

- **Frontend**: React (JavaScript), React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## ✨ Features

### Authentication System
- 🔐 User registration (signup) for both faculty and students
- 🔑 Secure login with username/password
- 🛡️ JWT-based authentication
- 👥 Role-based access control (Faculty/Student)

### Faculty Features
- 👨‍🏫 Login with faculty credentials
- 👥 Add new students to the system
- 📊 View all students and their marks
- ✏️ Update student marks for 3 courses:
  - Database Management Systems
  - Web Technologies
  - Software Engineering
- 📈 View course analytics:
  - Class averages
  - Grade distribution (S, A, B, C, D, F)

### Student Features
- 👨‍🎓 Login with student credentials
- 📋 View their own marks and grades
- 📊 See course-wise performance
- 🏆 View overall average and grade
- 🔒 Cannot access other students' data

## 📈 Grade System

| Grade | Marks Range | Description |
|-------|-------------|-------------|
| S     | ≥ 90        | Excellent   |
| A     | 80-89       | Very Good   |
| B     | 70-79       | Good        |
| C     | 60-69       | Average     |
| D     | 50-59       | Below Average |
| F     | < 50        | Fail        |

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (running locally or MongoDB Atlas)

## 🚀 Installation & Setup

### 1. Clone or Navigate to the Project
```bash
cd /Users/ayushbhandari/Desktop/WebT/SE
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# The .env file is already configured with:
# PORT=5000
# MONGODB_URI=mongodb://127.0.0.1:27017/WT
# JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000` and connect to the `WT` database.

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the React application
npm start
```

The frontend will run on `http://localhost:3000`

## 🔐 Getting Started

### First Time Setup
1. **Start both backend and frontend servers** as shown above
2. **Open your browser** and go to `http://localhost:3000`
3. **Create your first faculty account:**
   - Click "Sign Up"
   - Select "Faculty" as role
   - Fill in all required fields
   - Click "Sign Up"
4. **Login with your faculty credentials**
5. **Add students** using the "Add Student" tab in faculty dashboard

### For Students
1. **Get added by faculty** OR **sign up directly:**
   - Click "Sign Up"
   - Select "Student" as role
   - Fill in all required fields including roll number
   - Click "Sign Up"
2. **Login with your student credentials**
3. **View your marks** (initially 0 until faculty updates them)

## 📁 Project Structure

```
SE/
├── backend/
│   ├── server.js                 # Main server file
│   ├── .env                      # Environment variables
│   ├── package.json              # Backend dependencies
│   ├── models/
│   │   ├── User.js               # User schema (faculty/student)
│   │   └── Marks.js              # Marks schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes (signup/login)
│   │   ├── faculty.js            # Faculty-specific routes
│   │   └── student.js            # Student-specific routes
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   └── controllers/              # (Future use)
├── frontend/
│   ├── public/
│   │   └── index.html            # Main HTML file
│   ├── src/
│   │   ├── App.js                # Main App component with routing
│   │   ├── App.css               # Global styles
│   │   ├── index.js              # React entry point
│   │   ├── index.css             # Base styles
│   │   ├── components/
│   │   │   ├── Login.js          # Login/Signup component
│   │   │   ├── Login.css         # Login/Signup styles
│   │   │   ├── FacultyDashboard.js   # Faculty dashboard
│   │   │   ├── FacultyDashboard.css  # Faculty styles
│   │   │   ├── StudentDashboard.js   # Student dashboard
│   │   │   └── StudentDashboard.css  # Student styles
│   │   ├── contexts/
│   │   │   └── AuthContext.js    # Authentication context
│   │   └── utils/
│   │       └── api.js            # API utility functions
│   └── package.json              # Frontend dependencies
```

## 🎯 How to Use

### Faculty Workflow
1. **Sign up** as faculty or **login** if already registered
2. **Manage Students Tab**: View all students and their current marks
3. **Add Student Tab**: Add new students to the system
4. **Analytics Tab**: View course-wise analytics and grade distribution
5. **Edit Marks**: Click "Edit Marks" for any student to update their scores

### Student Workflow
1. **Sign up** as student or **get added by faculty**
2. **Login** with your credentials
3. **View your marks** and overall performance
4. **See course-wise performance** and grade breakdown
5. **Check grade scale** to understand performance levels

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration (signup)
- `POST /api/auth/login` - User login

### Faculty Routes (Protected)
- `GET /api/faculty/students` - Get all students
- `POST /api/faculty/add-student` - Add new student
- `PUT /api/faculty/update-marks/:studentId` - Update student marks
- `GET /api/faculty/analytics` - Get course analytics

### Student Routes (Protected)
- `GET /api/student/my-marks` - Get own marks
- `GET /api/student/profile` - Get own profile

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Faculty and student roles with different permissions
- **Password Hashing**: bcryptjs for secure password storage
- **Route Protection**: Protected routes prevent unauthorized access
- **Data Isolation**: Students can only view their own data
- **Automatic Marks Creation**: When students sign up, their marks records are automatically created

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Make sure MongoDB is running locally
   - Check that the database `WT` is accessible
   - Verify the connection string in `.env` matches your setup

2. **Port Already in Use**
   - Backend: Change PORT in `.env` file
   - Frontend: React will prompt to use different port

3. **CORS Issues**
   - Backend has CORS enabled for all origins
   - Ensure backend is running on port 5000

4. **Signup/Login Issues**
   - Check MongoDB connection
   - Ensure all required fields are filled
   - Check browser console for detailed error messages

## 🔄 Database Schema

### Users Collection
```javascript
{
  username: String (unique),
  email: String (unique), 
  password: String (hashed),
  role: String ('faculty' | 'student'),
  name: String,
  rollNumber: String (required for students, unique)
}
```

### Marks Collection
```javascript
{
  studentId: ObjectId (reference to User),
  rollNumber: String,
  studentName: String,
  course1: { name: String, marks: Number, grade: String },
  course2: { name: String, marks: Number, grade: String },
  course3: { name: String, marks: Number, grade: String }
}
```

## 📝 Development Notes

- Frontend uses functional components with React Hooks
- Backend follows MVC architecture pattern
- MongoDB schemas include validation and middleware
- Automatic grade calculation based on marks
- Responsive design works on desktop and mobile
- Error handling implemented on both frontend and backend
- Loading states and user feedback included
- Marks records are automatically created when students register

## 🎨 Styling

- Clean, modern UI design
- Gradient backgrounds and hover effects
- Responsive grid layouts
- Color-coded grade system
- Professional dashboard interface
- Smooth form transitions between login and signup

---

**Developed with ❤️ using React and Node.js**