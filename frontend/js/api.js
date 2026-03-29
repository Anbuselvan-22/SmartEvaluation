// API Configuration
const API_BASE_URL = 'http://localhost:5002/api';

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
const authAPI = {
  login: async (email, password, role) => {
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
      });
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await apiCall('/auth/register', {
        method: 'POST', 
        body: JSON.stringify(userData)
      });
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }
};

// Teacher API
const teacherAPI = {
  getStudents: async (teacherId) => {
    try {
      const response = await apiCall(`/teacher/students/${teacherId}`);
      return response;
    } catch (error) {
      console.error('Get students error:', error);
      throw error;
    }
  },
  
  getAnalytics: async (teacherId) => {
    try {
      const response = await apiCall(`/teacher/analytics/${teacherId}`);
      return response;
    } catch (error) {
      console.error('Get analytics error:', error);
      throw error;
    }
  },
  
  getSubjects: async () => {
    try {
      const response = await apiCall('/teacher/subjects');
      return response;
    } catch (error) {
      console.error('Get subjects error:', error);
      throw error;
    }
  }
};

// Student API  
const studentAPI = {
  getMarks: async (studentId) => {
    try {
      const response = await apiCall(`/student/marks/${studentId}`);
      return response;
    } catch (error) {
      console.error('Get marks error:', error);
      throw error;
    }
  },
  
  getPerformance: async (studentId) => {
    try {
      const response = await apiCall(`/student/performance/${studentId}`);
      return response;
    } catch (error) {
      console.error('Get performance error:', error);
      throw error;
    }
  },
  
  getFeedback: async (studentId, evaluationId) => {
    try {
      const response = await apiCall(`/student/feedback/${studentId}/${evaluationId}`);
      return response;
    } catch (error) {
      console.error('Get feedback error:', error);
      throw error;
    }
  }
};

// Evaluation API
const evaluationAPI = {
  uploadFiles: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/evaluate/upload`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Upload files error:', error);
      throw error;
    }
  },
  
  getResults: async (studentId) => {
    try {
      const response = await apiCall(`/evaluate/results/${studentId}`);
      return response;
    } catch (error) {
      console.error('Get results error:', error);
      throw error;
    }
  }
};
