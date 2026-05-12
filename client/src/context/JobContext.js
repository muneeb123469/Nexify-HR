import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const JobContext = createContext();

export const useJobs = () => useContext(JobContext);

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/jobs`);
      setJobs(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch jobs");
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData) => {
    try {
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create job");
    }
  };

  const updateJob = async (id, jobData) => {
    try {
      const response = await axios.put(`${API_URL}/jobs/${id}`, jobData);
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update job");
    }
  };

  const deleteJob = async (id) => {
    try {
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to delete job");
    }
  };

  const value = {
    jobs,
    loading,
    error,
    createJob,
    updateJob,
    deleteJob,
    fetchJobs,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};
