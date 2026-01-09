const API_BASE_URL = 'http://localhost:5001/api';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests with fetch
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  // Add authorization header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Build full URL
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    // Parse JSON response
    const data = await response.json();

    // If response is not ok, throw error with response data
    if (!response.ok) {
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If it's our custom error, rethrow it
    if (error.status) {
      throw error;
    }
    // Network or other errors
    console.error('API request failed:', error);
    throw new Error(error.message || 'Network error. Please check your connection.');
  }
};

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Faculty API calls
export const facultyAPI = {
  addStudent: async (studentData) => {
    return apiRequest('/faculty/add-student', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  getStudents: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/faculty/students${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  getClasses: async () => {
    return apiRequest('/faculty/classes', {
      method: 'GET',
    });
  },

  updateMarks: async (studentId, marks) => {
    return apiRequest(`/faculty/update-marks/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(marks),
    });
  },

  getAnalytics: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/faculty/analytics${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint, {
      method: 'GET',
    });
  },

  deleteStudent: async (studentId) => {
    return apiRequest(`/faculty/delete-student/${studentId}`, {
      method: 'DELETE',
    });
  },
};

// Student API calls
export const studentAPI = {
  getMyMarks: async () => {
    return apiRequest('/student/my-marks', {
      method: 'GET',
    });
  },

  getProfile: async () => {
    return apiRequest('/student/profile', {
      method: 'GET',
    });
  },
};

export default apiRequest;
