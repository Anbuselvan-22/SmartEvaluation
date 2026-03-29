// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// API Helper Functions
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: (email, password, role) => 
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    }),
  
  register: (userData) => 
    apiCall('/auth/register', {
      method: 'POST', 
      body: JSON.stringify(userData)
    })
};

// Teacher API
export const teacherAPI = {
  getStudents: (teacherId) => 
    apiCall(`/teacher/students/${teacherId}`),
  
  getAnalytics: (teacherId) => 
    apiCall(`/teacher/analytics/${teacherId}`),
  
  getSubjects: () => 
    apiCall('/teacher/subjects')
};

// Student API  
export const studentAPI = {
  getMarks: (studentId) => 
    apiCall(`/student/marks/${studentId}`),
  
  getPerformance: (studentId) => 
    apiCall(`/student/performance/${studentId}`),
  
  getFeedback: (studentId, evaluationId) => 
    apiCall(`/student/feedback/${studentId}/${evaluationId}`)
};

// Evaluation API
export const evaluationAPI = {
  uploadFiles: (formData) => 
    fetch(`${API_BASE_URL}/evaluate/upload`, {
      method: 'POST',
      body: formData
    }),
  
  getResults: (studentId) => 
    apiCall(`/evaluate/results/${studentId}`)
};
