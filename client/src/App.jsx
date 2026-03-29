import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import EvaluationPage from './pages/EvaluationPage';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}-dashboard`} />;
  }
  
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/teacher-dashboard" 
        element={
          <ProtectedRoute role="teacher">
            <>
              <Navbar />
              <TeacherDashboard />
            </>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student-dashboard" 
        element={
          <ProtectedRoute role="student">
            <>
              <Navbar />
              <StudentDashboard />
            </>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/evaluation" 
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <EvaluationPage />
            </>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          user ? <Navigate to={`/${user.role}-dashboard`} /> : <Navigate to="/login" />
        } 
      />
    </Routes>
  );
}

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
