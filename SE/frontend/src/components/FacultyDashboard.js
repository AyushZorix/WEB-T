import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { facultyAPI } from '../utils/api';
import './FacultyDashboard.css';

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add student form state
  const [newStudent, setNewStudent] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    rollNumber: '',
    class: '',
    semester: 5
  });

  // Update marks state - updated for new marking scheme
  const [editingStudent, setEditingStudent] = useState(null);
  const [marksForm, setMarksForm] = useState({});

  // Get faculty's assigned courses
  const assignedCourses = user?.assignedCourses || [];
  const assignedCourseKeys = assignedCourses.map(c => c.courseKey);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchClasses();
    if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, selectedClass]);

  const fetchClasses = async () => {
    try {
      const data = await facultyAPI.getClasses();
      setClasses(data);
    } catch (err) {
      console.error('Fetch classes error:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching students...');
      console.log('Current user:', user);
      console.log('Token from localStorage:', localStorage.getItem('token'));
      console.log('Selected class:', selectedClass);
      
      const data = await facultyAPI.getStudents(selectedClass ? { class: selectedClass } : {});
      console.log('Students fetched successfully:', data);
      setStudents(data);
    } catch (err) {
      console.error('Fetch students error:', err);
      
      let errorMessage = 'Failed to fetch students';
      if (err.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        // Redirect to login if token is invalid
        logout();
      } else if (err.status === 403) {
        errorMessage = 'Access denied. No courses assigned or insufficient privileges.';
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await facultyAPI.getAnalytics(selectedClass ? { class: selectedClass } : {});
      setAnalytics(data);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      await facultyAPI.addStudent(newStudent);
      setSuccess('Student added successfully!');
      setNewStudent({
        username: '',
        email: '',
        password: '',
        name: '',
        rollNumber: '',
        class: '',
        semester: 5
      });
      if (activeTab === 'students') {
        fetchStudents();
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMarks = (student) => {
    const studentId = student._id || student.id;
    setEditingStudent(studentId);
    
    // Initialize marks form with only assigned courses
    const initialMarksForm = {};
    assignedCourseKeys.forEach(courseKey => {
      if (student.marks && student.marks[courseKey]) {
        initialMarksForm[courseKey] = {
          test1: student.marks[courseKey].test1 || 0,
          test2: student.marks[courseKey].test2 || 0,
          esa: student.marks[courseKey].esa || 0
        };
      } else {
        initialMarksForm[courseKey] = { test1: 0, test2: 0, esa: 0 };
      }
    });
    
    setMarksForm(initialMarksForm);
  };

  const handleUpdateMarks = async (studentId) => {
    try {
      setLoading(true);
      await facultyAPI.updateMarks(studentId, marksForm);
      setSuccess('Marks updated successfully!');
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to update marks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!studentId) {
      setError('Invalid student ID');
      return;
    }

    // Ensure we have a valid student ID
    const idToDelete = String(studentId).trim();
    if (!idToDelete) {
      setError('Invalid student ID format');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete this student? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await facultyAPI.deleteStudent(idToDelete);
      setSuccess('Student deleted successfully!');
      // Refresh the student list
      await fetchStudents();
    } catch (err) {
      const errorMessage = err.data?.message || err.message || 'Failed to delete student';
      setError(errorMessage);
      console.error('Delete student error:', err);
      console.error('Student ID attempted:', idToDelete);
    } finally {
      setLoading(false);
    }
  };

  const getGrade = (test1, test2, esa) => {
    const totalMarks = test1 + test2 + esa;
    if (totalMarks >= 90) return 'S';
    if (totalMarks >= 80) return 'A';
    if (totalMarks >= 70) return 'B';
    if (totalMarks >= 60) return 'C';
    if (totalMarks >= 50) return 'D';
    return 'F';
  };

  // Helper function to calculate course analytics - updated
  const calculateCourseAnalytics = (marksData, courseKey) => {
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
  };

  return (
    <div className="faculty-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Faculty Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.name}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button 
            className={activeTab === 'students' ? 'active' : ''}
            onClick={() => setActiveTab('students')}
          >
            Manage Students
          </button>
          <button 
            className={activeTab === 'addStudent' ? 'active' : ''}
            onClick={() => setActiveTab('addStudent')}
          >
            Add Student
          </button>
          <button 
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </nav>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'students' && (
          <div className="students-section">
            <h2>Student Management</h2>
            
            {/* Faculty Info Display */}
            {assignedCourses.length > 0 && (
              <div className="faculty-info">
                <h3>Your Assigned Courses</h3>
                <div className="assigned-courses">
                  {assignedCourses.map((course, index) => (
                    <span key={index} className="course-tag">
                      {course.courseName}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="class-filter">
              <label htmlFor="class-select">Filter by Class:</label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.name} value={cls.name}>
                    {cls.name} ({cls.studentCount} students)
                  </option>
                ))}
              </select>
            </div>
            
            {loading ? (
              <div className="loading">Loading students...</div>
            ) : (
              <div className="students-table">
                {students.length === 0 ? (
                  <div className="no-students-message">
                    <h3>No students found</h3>
                    <p>
                      {selectedClass 
                        ? `No students found in class ${selectedClass}. Try selecting a different class or add new students.`
                        : 'No students found in the system. You can add new students using the "Add Student" tab.'
                      }
                    </p>
                    <button 
                      onClick={() => setActiveTab('addStudent')} 
                      className="add-student-btn"
                    >
                      Add New Student
                    </button>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Name</th>
                        <th>Class</th>
                        {assignedCourseKeys.map(courseKey => {
                          const course = assignedCourses.find(c => c.courseKey === courseKey);
                          return (
                            <th key={courseKey}>
                              {course ? course.courseName : courseKey} Marks
                            </th>
                          );
                        })}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const rawId = student._id || student.id;
                        const studentId = rawId ? (rawId.toString ? rawId.toString() : String(rawId)) : '';
                        return (
                          <tr key={studentId}>
                            <td>{student.rollNumber}</td>
                            <td>{student.name}</td>
                            <td>{student.class || 'Not Assigned'}</td>
                            {assignedCourseKeys.map(courseKey => (
                              <td key={courseKey} className="marks-display-cell">
                                {editingStudent === studentId ? (
                                  <div className="marks-inputs">
                                    <div className="input-group">
                                      <label>Test1:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="40"
                                        value={marksForm[courseKey]?.test1 || 0}
                                        onChange={(e) => setMarksForm({
                                          ...marksForm,
                                          [courseKey]: {
                                            ...marksForm[courseKey],
                                            test1: parseInt(e.target.value) || 0
                                          }
                                        })}
                                      />
                                    </div>
                                    <div className="input-group">
                                      <label>Test2:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="40"
                                        value={marksForm[courseKey]?.test2 || 0}
                                        onChange={(e) => setMarksForm({
                                          ...marksForm,
                                          [courseKey]: {
                                            ...marksForm[courseKey],
                                            test2: parseInt(e.target.value) || 0
                                          }
                                        })}
                                      />
                                    </div>
                                    <div className="input-group">
                                      <label>ESA:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="20"
                                        value={marksForm[courseKey]?.esa || 0}
                                        onChange={(e) => setMarksForm({
                                          ...marksForm,
                                          [courseKey]: {
                                            ...marksForm[courseKey],
                                            esa: parseInt(e.target.value) || 0
                                          }
                                        })}
                                      />
                                    </div>
                                    <div className="total-display">
                                      Total: {(marksForm[courseKey]?.test1 || 0) + (marksForm[courseKey]?.test2 || 0) + (marksForm[courseKey]?.esa || 0)}/100
                                    </div>
                                  </div>
                                ) : (
                                  <div className="marks-breakdown">
                                    <span>Test1: {student.marks?.[courseKey]?.test1 || 0}/40</span>
                                    <span>Test2: {student.marks?.[courseKey]?.test2 || 0}/40</span>
                                    <span>ESA: {student.marks?.[courseKey]?.esa || 0}/20</span>
                                    <div className="total-marks">
                                      Total: {student.marks?.[courseKey]?.totalMarks || 0}/100
                                    </div>
                                    <span className={`grade grade-${student.marks?.[courseKey]?.grade || 'F'}`}>
                                      {student.marks?.[courseKey]?.grade || 'F'}
                                    </span>
                                  </div>
                                )}
                              </td>
                            ))}
                            <td>
                              <div className="action-buttons">
                                {editingStudent === studentId ? (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateMarks(studentId)}
                                      className="save-btn"
                                      disabled={loading}
                                    >
                                      Save
                                    </button>
                                    <button 
                                      onClick={() => setEditingStudent(null)}
                                      className="cancel-btn"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button 
                                      onClick={() => handleEditMarks(student)}
                                      className="edit-btn"
                                    >
                                      Edit Marks
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteStudent(studentId)}
                                      className="delete-btn"
                                      disabled={loading}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'addStudent' && (
          <div className="add-student-section">
            <h2>Add New Student</h2>
            <form onSubmit={handleAddStudent} className="add-student-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({
                      ...newStudent,
                      name: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rollNumber">Roll Number</label>
                  <input
                    type="text"
                    id="rollNumber"
                    value={newStudent.rollNumber}
                    onChange={(e) => setNewStudent({
                      ...newStudent,
                      rollNumber: e.target.value
                    })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={newStudent.username}
                    onChange={(e) => setNewStudent({
                      ...newStudent,
                      username: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({
                      ...newStudent,
                      email: e.target.value
                    })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="class">Class</label>
                  <select
                    id="class"
                    value={newStudent.class}
                    onChange={(e) => setNewStudent({
                      ...newStudent,
                      class: e.target.value
                    })}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.name} value={cls.name}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="semester">Semester</label>
                  <input
                    type="number"
                    id="semester"
                    value={newStudent.semester}
                    onChange={(e) => setNewStudent({
                      ...newStudent,
                      semester: parseInt(e.target.value) || 5
                    })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({
                    ...newStudent,
                    password: e.target.value
                  })}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="add-btn">
                {loading ? 'Adding...' : 'Add Student'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>Course Analytics</h2>
            <div className="class-filter">
              <label htmlFor="class-select">Filter by Class:</label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.name} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            {loading ? (
              <div className="loading">Loading analytics...</div>
            ) : analytics ? (
              <div className="analytics-grid">
                {Object.entries(analytics).map(([courseKey, courseData]) => (
                  <div key={courseKey} className="course-analytics">
                    <h3>{courseData.courseName}</h3>
                    <div className="analytics-stats">
                      <div className="stat">
                        <label>Class Average:</label>
                        <span className="average">{courseData.average.toFixed(2)}</span>
                      </div>
                      <div className="stat">
                        <label>Total Students:</label>
                        <span>{courseData.totalStudents}</span>
                      </div>
                    </div>
                    <div className="grade-distribution">
                      <h4>Grade Distribution:</h4>
                      <div className="grade-bars">
                        {Object.entries(courseData.gradeCount).map(([grade, count]) => (
                          <div key={grade} className="grade-bar">
                            <span className="grade-label">{grade}</span>
                            <div className="bar-container">
                              <div 
                                className={`bar grade-${grade}`}
                                style={{ 
                                  width: `${courseData.totalStudents > 0 ? (count / courseData.totalStudents) * 100 : 0}%` 
                                }}
                              ></div>
                              <span className="count">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;