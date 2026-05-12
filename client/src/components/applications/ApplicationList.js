import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApplications } from "../../context/ApplicationContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import styled from "styled-components";
import "./ApplicationList.css";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 2rem;
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 150px;
`;

const ApplicationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const ApplicationCard = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CandidateName = styled.h2`
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const Info = styled.div`
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Status = styled.span`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  background: ${(props) => {
    switch (props.status) {
      case "pending":
        return "#f1c40f";
      case "shortlisted":
        return "#3498db";
      case "rejected":
        return "#e74c3c";
      case "hired":
        return "#2ecc71";
      default:
        return "#95a5a6";
    }
  }};
  color: white;
`;

const Button = styled(motion.button)`
  padding: 0.8rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  width: 100%;
  margin-top: 1rem;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const ApplicationList = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const {
    applications,
    loading,
    error,
    fetchApplications,
    updateApplicationStatus,
  } = useApplications();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("");
  const applicationList = Array.isArray(applications) ? applications : [];

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = statusFilter && statusFilter !== "all"
    ? applicationList.filter((app) => app.status === statusFilter)
    : applicationList;

  const handleCancelApplication = (applicationId) => {
    if (window.confirm("Are you sure you want to cancel this application?")) {
      // Mock API call - replace with actual API call
      const updatedApplications = applicationList.filter(
        (app) => app._id !== applicationId,
      );
      fetchApplications(updatedApplications);
    }
  };

  const handleDeleteApplication = (applicationId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this application? This action cannot be undone.",
      )
    ) {
      // Mock API call - replace with actual API call
      const updatedApplications = applicationList.filter(
        (app) => app._id !== applicationId,
      );
      fetchApplications(updatedApplications);
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    try {
      await updateApplicationStatus(applicationId, status);
    } catch (err) {
      console.error("Failed to update application status:", err);
      alert(err.message || "Failed to update application status");
    }
  };

  const getStatusColor = (status = "") => {
    switch (status.toLowerCase()) {
      case "under review":
        return "#FFB400";
      case "interview scheduled":
        return "#4C9F9F";
      case "rejected":
        return "#FF5A5A";
      case "accepted":
        return "#4CAF50";
      default:
        return "#666";
    }
  };
  return (
    <Container>
      <Header>
        <Title>My Applications</Title>
        <Filters>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="under_review">Under Review</option>
            <option value="interview">Interview Scheduled</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </Select>
          <input type="text" placeholder="Search applications..." />
        </Filters>
      </Header>

      <ApplicationGrid>
        {filteredApplications.map((application) => (
          <ApplicationCard
            key={application._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CandidateName>{application.jobTitle}</CandidateName>
            <Info>
              <i className="fas fa-building"></i>
              {application.company}
            </Info>
            <Info>
              <i className="fas fa-calendar"></i>
              Applied: {application.appliedDate}
            </Info>
            <Info>
              <i className="fas fa-clock"></i>
              Last Updated: {application.lastUpdated}
            </Info>
            <Status
              status={application.status}
              style={{ backgroundColor: getStatusColor(application.status) }}
            >
              {application.status}
            </Status>

            {user && user.role !== "candidate" && (
              <div style={{ marginTop: "1rem" }}>
                <Select
                  value={application.status}
                  onChange={(e) =>
                    handleStatusChange(application._id, e.target.value)
                  }
                  style={{ width: "100%", marginBottom: "1rem" }}
                >
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlist</option>
                  <option value="rejected">Reject</option>
                  <option value="hired">Hire</option>
                </Select>
              </div>
            )}

            <div className="application-actions">
              <button
                className="cancel-btn"
                onClick={() => handleCancelApplication(application._id)}
                disabled={
                  application.status === "Rejected" ||
                  application.status === "Accepted"
                }
              >
                <i className="fas fa-times"></i> Cancel
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteApplication(application._id)}
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            </div>

            <Button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/applications/${application._id}`)}
            >
              View Details
            </Button>
          </ApplicationCard>
        ))}
      </ApplicationGrid>
    </Container>
  );
};

export default ApplicationList;
