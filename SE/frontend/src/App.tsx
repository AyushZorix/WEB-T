import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import FacultyDashboard from './components/FacultyDashboard';
import StudentDashboard from './components/StudentDashboard';
import './App.css';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({ 
  children, 
  role 
}) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// App Routes component
const AppRoutes: React.FC = () => {
  const { user, token } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          token ? (
            <Navigate to={user?.role === 'faculty' ? '/faculty' : '/student'} replace />
          ) : (
            <Login />
          )
        } 
      />
      <Route 
        path="/faculty" 
        element={
          <ProtectedRoute role="faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student" 
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          token ? (
            <Navigate to={user?.role === 'faculty' ? '/faculty' : '/student'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
