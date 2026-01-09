import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [selectedRole, setSelectedRole] = useState(''); // 'student' or 'faculty' or empty for login
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: '',
    role: '',
    rollNumber: '',
    assignedCourses: [],
    class: '',
    semester: 5
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const courseOptions = [
    { key: 'course1', name: 'Database Management Systems' },
    { key: 'course2', name: 'Web Technologies' },
    { key: 'course3', name: 'Software Engineering' }
  ];

  const classOptions = ['CSE-A', 'CSE-B', 'CSE-C', 'IT-A', 'IT-B', 'ECE-A', 'ECE-B'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // Validation based on field type
    if (name === 'rollNumber') {
      filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
    } else if (name === 'name') {
      filteredValue = value.replace(/[^a-zA-Z\s-]/g, '');
    } else if (name === 'username') {
      filteredValue = value.replace(/[^a-zA-Z0-9_]/g, '');
    }

    setFormData({
      ...formData,
      [name]: filteredValue
    });
  };

  const handleCourseDropdownChange = (e) => {
    const selectedCourse = courseOptions.find(c => c.key === e.target.value);
    if (selectedCourse) {
      setFormData({
        ...formData,
        assignedCourses: [{ courseKey: selectedCourse.key, courseName: selectedCourse.name }]
      });
    }
  };

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setFormData({
      ...formData,
      role: role,
      assignedCourses: [],
      rollNumber: '',
      class: '',
      semester: 5
    });
  };

  const switchToLogin = () => {
    setIsSignup(false);
    setSelectedRole('');
    setError('');
    setFormData({
      username: '',
      password: '',
      email: '',
      name: '',
      role: '',
      rollNumber: '',
      assignedCourses: [],
      class: '',
      semester: 5
    });
  };

  const switchToSignup = () => {
    setIsSignup(true);
    setSelectedRole('');
    setError('');
    setFormData({
      username: '',
      password: '',
      email: '',
      name: '',
      role: '',
      rollNumber: '',
      assignedCourses: [],
      class: '',
      semester: 5
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Username and password are required');
      return;
    }

    if (isSignup) {
      if (!selectedRole) {
        setError('Please select Student or Faculty');
        return;
      }
      if (!formData.email.trim() || !formData.name.trim()) {
        setError('All fields are required for signup');
        return;
      }
      if (selectedRole === 'student' && (!formData.rollNumber.trim() || !formData.class.trim())) {
        setError('Roll number and class are required for students');
        return;
      }
      if (selectedRole === 'faculty' && formData.assignedCourses.length === 0) {
        setError('Please select a course for faculty');
        return;
      }
    }

    try {
      setIsLoading(true);
      
      if (isSignup) {
        const dataToSubmit = { ...formData, role: selectedRole };
        await signup(dataToSubmit);
        switchToLogin();
        setError('Account created successfully! Please login.');
      } else {
        await login(formData.username, formData.password);
        
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          navigate(user.role === 'faculty' ? '/faculty' : '/student');
        }
      }
    } catch (err) {
      setError(err.message || (isSignup ? 'Signup failed' : 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="login-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/bg.jpg)`
      }}
    >
      <div className="login-card">
        <div 
          className="login-left"
          style={{
            backgroundImage: `url(${process.env.PUBLIC_URL}/leftphoto.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
        </div>
        
        <div className="login-right">
          <div className="login-header">
            <h2>VAULT</h2>
            <p className="subtitle">Manage assessments effortlessly</p>
            
            {/* Login/Signup Toggle Buttons */}
            <div className="auth-toggle-buttons">
              <button 
                className={!isSignup ? 'active' : ''} 
                onClick={switchToLogin}
                type="button"
              >
                Login
              </button>
              <button 
                className={isSignup ? 'active' : ''} 
                onClick={switchToSignup}
                type="button"
              >
                Sign Up
              </button>
            </div>

            {/* Role Selection Buttons (only show during signup) */}
            {isSignup && (
              <div className="role-selection-buttons">
                <button 
                  type="button"
                  className={selectedRole === 'student' ? 'role-btn active' : 'role-btn'}
                  onClick={() => handleRoleSelection('student')}
                >
                   Student
                </button>
                <button 
                  type="button"
                  className={selectedRole === 'faculty' ? 'role-btn active' : 'role-btn'}
                  onClick={() => handleRoleSelection('faculty')}
                >
                   Faculty
                </button>
              </div>
            )}

            <h1>{isSignup ? (selectedRole ? `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Registration` : 'Create Account') : 'Welcome Back'}</h1>
            <p>{isSignup ? (selectedRole ? `Register as a ${selectedRole}` : 'Choose your role to continue') : 'Sign in to your account'}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className={`message ${error.includes('successfully') ? 'success-message' : 'error-message'}`}>
                {error}
              </div>
            )}
            
            {/* Show form only if not signup or role is selected */}
            {(!isSignup || selectedRole) && (
              <>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    minLength="3"
                    maxLength="30"
                    required
                  />
                </div>

                {isSignup && (
                  <>
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        minLength="2"
                        maxLength="50"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        maxLength="100"
                        required
                      />
                    </div>

                    {selectedRole === 'student' && (
                      <>
                        <div className="form-group">
                          <label htmlFor="rollNumber">Roll Number</label>
                          <input
                            type="text"
                            id="rollNumber"
                            name="rollNumber"
                            value={formData.rollNumber}
                            onChange={handleInputChange}
                            placeholder="Enter your roll number"
                            minLength="3"
                            maxLength="20"
                            required
                          />
                        </div>
                        
                        <div className="student-fields">
                          <div className="form-group">
                            <label htmlFor="class">Class</label>
                            <select
                              id="class"
                              name="class"
                              value={formData.class}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Your Class</option>
                              {classOptions.map(className => (
                                <option key={className} value={className}>
                                  {className}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label htmlFor="semester">Current Semester</label>
                            <select
                              id="semester"
                              name="semester"
                              value={formData.semester}
                              onChange={handleInputChange}
                            >
                              {[1,2,3,4,5,6,7,8].map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedRole === 'faculty' && (
                      <>
                        <div className="faculty-fields">
                          <div className="form-group">
                            <label htmlFor="assignedCourse">Assigned Course</label>
                            <select
                              id="assignedCourse"
                              name="assignedCourse"
                              value={formData.assignedCourses[0]?.courseKey || ''}
                              onChange={handleCourseDropdownChange}
                              required
                              className="course-dropdown"
                            >
                              <option value="">Select Course to Teach</option>
                              {courseOptions.map(course => (
                                <option key={course.key} value={course.key}>
                                  {course.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    minLength="6"
                    maxLength="50"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="login-button"
                  disabled={isLoading || (isSignup && selectedRole === 'faculty' && formData.assignedCourses.length === 0)}
                >
                  {isLoading ? (isSignup ? 'Creating Account...' : 'Signing in...') : (isSignup ? `Sign Up as ${selectedRole || 'User'}` : 'Sign In')}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;