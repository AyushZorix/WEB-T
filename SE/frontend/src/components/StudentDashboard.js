import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { studentAPI } from '../utils/api';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [marks, setMarks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await studentAPI.getMyMarks();
      console.log('Fetched marks data:', data);
      setMarks(data);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to fetch marks');
      console.error('Error fetching marks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'S': return '#28a745';
      case 'A': return '#17a2b8';
      case 'B': return '#007bff';
      case 'C': return '#ffc107';
      case 'D': return '#fd7e14';
      case 'F': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const calculateOverallAverage = () => {
    if (!marks || !marks.courses) return 0;
    const course1Total = marks.courses.course1?.totalMarks || 0;
    const course2Total = marks.courses.course2?.totalMarks || 0;
    const course3Total = marks.courses.course3?.totalMarks || 0;
    const totalMarks = course1Total + course2Total + course3Total;
    return Math.round((totalMarks / 3) * 100) / 100;
  };

  const calculateOverallGrade = () => {
    if (!marks) return 'F';
    const average = calculateOverallAverage();
    if (average >= 90) return 'S';
    if (average >= 80) return 'A';
    if (average >= 70) return 'B';
    if (average >= 60) return 'C';
    if (average >= 50) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading">Loading your marks...</div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>My Academic Performance</h1>
              <div className="user-info">
            <span>Welcome, {user?.name}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {marks ? (
          <>
            {/* Overall Summary Card */}
            <div className="overall-summary-card">
              <div className="summary-header">
                <h2>Overall Performance</h2>
                <div className="student-basic-info">
                  <span><strong>Name:</strong> {marks.student.name}</span>
                  <span><strong>Roll No:</strong> {marks.student.rollNumber}</span>
                </div>
              </div>
              <div className="overall-stats">
                <div className="overall-stat">
                  <div className="stat-label">Overall Average</div>
                  <div className="stat-value">{calculateOverallAverage()}%</div>
                </div>
                <div className="overall-stat">
                  <div className="stat-label">Overall Grade</div>
                  <div 
                    className="stat-value grade-badge-large"
                    style={{ 
                      backgroundColor: getGradeColor(calculateOverallGrade()),
                      color: calculateOverallGrade() === 'C' ? '#333' : 'white'
                    }}
                  >
                    {calculateOverallGrade()}
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Marks Cards */}
            <div className="subjects-section">
              <h2>Marks by Subject</h2>
              <div className="subjects-grid">
                {['course1', 'course2', 'course3'].map((courseKey) => {
                  const course = marks.courses[courseKey];
                  return (
                    <div key={courseKey} className="subject-card">
                      <div className="subject-header">
                        <h3>{course.name}</h3>
                        <span 
                          className="subject-grade"
                          style={{ 
                            backgroundColor: getGradeColor(course.grade || 'F'),
                            color: (course.grade || 'F') === 'C' ? '#333' : 'white'
                          }}
                        >
                          Grade: {course.grade || 'F'}
                        </span>
                      </div>
                      
                      <div className="subject-total">
                        <div className="total-label">Total Marks</div>
                        <div className="total-value">{course.totalMarks !== undefined ? course.totalMarks : 0} / 100</div>
                        <div className="progress-bar-large">
                          <div 
                            className="progress-fill-large"
                            style={{ 
                              width: `${course.totalMarks !== undefined ? course.totalMarks : 0}%`,
                              backgroundColor: getGradeColor(course.grade || 'F')
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="marks-breakdown">
                        <div className="breakdown-item">
                          <span className="breakdown-label">Test 1:</span>
                          <span className="breakdown-value">{course.test1 !== undefined ? course.test1 : 0} / 40</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="breakdown-label">Test 2:</span>
                          <span className="breakdown-value">{course.test2 !== undefined ? course.test2 : 0} / 40</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="breakdown-label">ESA:</span>
                          <span className="breakdown-value">{course.esa !== undefined ? course.esa : 0} / 20</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Comparison Chart */}
            <div className="comparison-chart-section">
              <h2>Subject Comparison</h2>
              <div className="chart-container">
                <div className="chart-bars">
                  {['course1', 'course2', 'course3'].map((courseKey) => {
                    const course = marks.courses[courseKey];
                    const totalMarks = course.totalMarks !== undefined ? course.totalMarks : 0;
                    const barHeight = (totalMarks / 100) * 100;
                    
                    return (
                      <div key={courseKey} className="chart-bar-wrapper">
                        <div className="chart-bar-container">
                          <div 
                            className="chart-bar"
                            style={{ 
                              height: `${Math.max(barHeight, 5)}%`,
                              backgroundColor: getGradeColor(course.grade || 'F')
                            }}
                          >
                            <span className="chart-value">{totalMarks}</span>
                          </div>
                        </div>
                        <div className="chart-label">{course.name.split(' ')[0]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Grade Explanation */}
            <div className="grade-explanation">
              <h3>Grade System</h3>
              <div className="grade-list">
                <div className="grade-item">
                  <span className="grade-icon" style={{ backgroundColor: '#28a745' }}>S</span>
                  <span className="grade-text">90-100% - Excellent</span>
                </div>
                <div className="grade-item">
                  <span className="grade-icon" style={{ backgroundColor: '#17a2b8' }}>A</span>
                  <span className="grade-text">80-89% - Very Good</span>
                </div>
                <div className="grade-item">
                  <span className="grade-icon" style={{ backgroundColor: '#007bff' }}>B</span>
                  <span className="grade-text">70-79% - Good</span>
                </div>
                <div className="grade-item">
                  <span className="grade-icon" style={{ backgroundColor: '#ffc107', color: '#333' }}>C</span>
                  <span className="grade-text">60-69% - Average</span>
                </div>
                <div className="grade-item">
                  <span className="grade-icon" style={{ backgroundColor: '#fd7e14' }}>D</span>
                  <span className="grade-text">50-59% - Below Average</span>
                </div>
                <div className="grade-item">
                  <span className="grade-icon" style={{ backgroundColor: '#dc3545' }}>F</span>
                  <span className="grade-text">Below 50% - Fail</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="no-marks">
            <h2>No marks available</h2>
            <p>Your marks haven't been uploaded yet. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
