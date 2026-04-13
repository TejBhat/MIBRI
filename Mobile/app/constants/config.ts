// Configuration for API and feature flags

export const API_BASE_URL = "http://your-machine-ip:5000/api";
// Replace "your-machine-ip" with your actual machine IP
// Example: http://192.168.1.5:5000/api

export const API_ENDPOINTS = {
  // Upload endpoints
  UPLOAD_RESUME: `${API_BASE_URL}/upload`,
  GET_RESUMES: `${API_BASE_URL}/upload/resumes`,
  
  // Interview endpoints
  START_INTERVIEW: `${API_BASE_URL}/interview/start`,
  SUBMIT_ANSWERS: `${API_BASE_URL}/interview/submit-answers`,
  GET_INTERVIEWS: `${API_BASE_URL}/interview`,
  
  // Evaluation endpoints
  SUBMIT_EVALUATION: `${API_BASE_URL}/evaluation/submit`,
  GET_EVALUATIONS: `${API_BASE_URL}/evaluation`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
};

// Interview configuration
export const INTERVIEW_CONFIG = {
  "5min": {
    duration: 5,
    questions: "5-6",
  },
  "10min": {
    duration: 10,
    questions: "8-10",
  },
  "15min": {
    duration: 15,
    questions: "12-15",
  },
};

// Feature flags
export const FEATURES = {
  ENABLE_SPEECH_TO_TEXT: true,
  ENABLE_AUTO_SAVE: true,
  ENABLE_OFFLINE_MODE: false,
};