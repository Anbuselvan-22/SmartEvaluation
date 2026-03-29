import api from './api';

export const evaluationService = {
  uploadAnswerSheet: (formData) => {
    return api.post('/evaluate/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getEvaluationResults: (studentId) => {
    return api.get(`/evaluate/results/${studentId}`).then(response => response.data);
  },

  getStudentMarks: (studentId) => {
    return api.get(`/student/marks/${studentId}`).then(response => response.data);
  },

  getStudentPerformance: (studentId) => {
    return api.get(`/student/performance/${studentId}`).then(response => response.data);
  },

  getTeacherStudents: (teacherId) => {
    return api.get(`/teacher/students/${teacherId}`).then(response => response.data);
  },

  getTeacherAnalytics: (teacherId) => {
    return api.get(`/teacher/analytics/${teacherId}`).then(response => response.data);
  },

  getFeedback: (studentId, evaluationId) => {
    return api.get(`/student/feedback/${studentId}/${evaluationId}`).then(response => response.data);
  }
};
