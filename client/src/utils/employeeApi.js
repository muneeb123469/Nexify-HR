import { API_BASE_URL } from '../config/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Handle authentication errors
const handleAuthError = (response, data) => {
  if (response.status === 401) {
    const errorCode = data?.code;
    if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_INVALID' || errorCode === 'NO_TOKEN') {
      // Clear stored auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
      
      throw new Error('Session expired. Please login again.');
    }
  }
};

// Employee API functions
export const employeeApi = {
  // Get all employees
  getAllEmployees: async () => {
    try {
      console.log('Making request to:', `${API_BASE_URL}/employees`);
      console.log('Headers:', getAuthHeaders());
      
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        handleAuthError(response, data);
        throw new Error(data.message || 'Failed to fetch employees');
      }

      return data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Get single employee
  getEmployee: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        handleAuthError(response, data);
        throw new Error(data.message || 'Failed to fetch employee');
      }

      return data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(employeeData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        handleAuthError(response, data);
        throw new Error(data.message || 'Failed to create employee');
      }

      return data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(employeeData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        handleAuthError(response, data);
        throw new Error(data.message || 'Failed to update employee');
      }

      return data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  },

  // Delete employee (terminate)
  deleteEmployee: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        handleAuthError(response, data);
        throw new Error(data.message || 'Failed to terminate employee');
      }

      return data;
    } catch (error) {
      console.error('Error terminating employee:', error);
      throw error;
    }
  },

  // Get managers list
  getManagers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/managers`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        handleAuthError(response, data);
        throw new Error(data.message || 'Failed to fetch managers');
      }

      return data;
    } catch (error) {
      console.error('Error fetching managers:', error);
      throw error;
    }
  },

  // Add skill to employee
  addSkill: async (employeeId, skill) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/skills`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ skill })
      });

      const data = await response.json();
      
      if (!response.ok) {
        handleAuthError(response, data);
        throw new Error(data.message || 'Failed to add skill');
      }

      return data;
    } catch (error) {
      console.error('Error adding skill:', error);
      throw error;
    }
  },

  // Add project to employee
  addProject: async (employeeId, project) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ project })
      });

      const data = await response.json();
      
      if (!response.ok) {
        handleAuthError(response, data);
        throw new Error(data.message || 'Failed to add project');
      }

      return data;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }
};

export default employeeApi;
