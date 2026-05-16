import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

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
      const { data } = await api.get("/jobs");
      setJobs(Array.isArray(data) ? data : []);
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
      const { data } = await api.post("/jobs", jobData);
      setJobs((prev) => [...(Array.isArray(prev) ? prev : []), data]);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create job");
    }
  };

  const updateJob = async (id, jobData) => {
    try {
      const { data } = await api.put(`/jobs/${id}`, jobData);
      setJobs((prev) =>
        (Array.isArray(prev) ? prev : []).map((job) =>
          job._id === id ? data : job,
        ),
      );
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update job");
    }
  };

  const deleteJob = async (id) => {
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => (Array.isArray(prev) ? prev : []).filter((job) => job._id !== id));
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
