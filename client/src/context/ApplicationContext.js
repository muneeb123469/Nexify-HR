import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../utils/api";

const ApplicationContext = createContext();

export const useApplications = () => useContext(ApplicationContext);

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/applications");

      if (Array.isArray(response.data)) {
        setApplications(response.data);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError(err.response?.data?.message || "Failed to fetch applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitApplication = async (formData) => {
    try {
      const response = await api.post("/applications", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchApplications();

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to submit application",
      };
    }
  };

  const updateApplicationStatus = async (applicationId, status, note) => {
    try {
      const response = await api.patch(
        `/applications/${applicationId}/status`,
        {
          status,
          note,
        },
      );

      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId
            ? { ...app, status: response.data.status }
            : app,
        ),
      );

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to update application status",
      };
    }
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        loading,
        error,
        fetchApplications,
        submitApplication,
        updateApplicationStatus,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};
