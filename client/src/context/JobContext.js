import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const JobContext = createContext();

export const useJobs = () => useContext(JobContext);

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      setJobs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/jobs`, jobData);
      setJobs(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create job');
    }
  };

  const updateJob = async (id, jobData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/jobs/${id}`, jobData);
      setJobs(prev => prev.map(job => job._id === id ? response.data : job));
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update job');
    }
  };

  const deleteJob = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/jobs/${id}`);
      setJobs(prev => prev.filter(job => job._id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const value = {
    jobs,
    loading,
    error,
    createJob,
    updateJob,
    deleteJob,
    fetchJobs
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
