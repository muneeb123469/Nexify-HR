import React, { createContext, useState, useContext } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const ApplicationContext = createContext();

export const useApplications = () => useContext(ApplicationContext);

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApplications = async (jobId = null) => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = jobId ? `/applications/job/${jobId}` : '/applications/user';
      const response = await api.get(endpoint);
      setApplications(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (jobId, formData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setApplications(prevApps => [...prevApps, response.data]);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting application');
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status, note) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/applications/${applicationId}/status`, {
        status,
        note
      });
      setApplications(prevApps =>
        prevApps.map(app => app._id === applicationId ? response.data : app)
      );
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating application status');
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    applications,
    loading,
    error,
    fetchApplications,
    submitApplication,
    updateApplicationStatus
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}; 