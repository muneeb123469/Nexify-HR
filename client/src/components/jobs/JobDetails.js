import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobs } from "../../context/JobContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import styled from "styled-components";

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
`;

const Status = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  background: ${(props) => (props.$status === "open" ? "#e6f4ea" : "#fce8e6")};
  color: ${(props) => (props.$status === "open" ? "#137333" : "#c5221f")};
`;

const Info = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  color: #666;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: 0.5rem 0;
  color: #666;
  position: relative;
  padding-left: 1.5rem;

  &:before {
    content: "•";
    position: absolute;
    left: 0;
    color: #1a73e8;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &.primary {
    background: #1a73e8;
    color: white;

    &:hover {
      background: #1557b0;
    }
  }

  &.secondary {
    background: #f1f3f4;
    color: #333;

    &:hover {
      background: #e8eaed;
    }
  }

  &.danger {
    background: #dc3545;
    color: white;

    &:hover {
      background: #c82333;
    }
  }
`;

const formatSalary = (salary) => {
  if (!salary) return "Not specified";
  const { min, max, currency } = salary;
  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, loading, error, updateJob, deleteJob } = useJobs();
  const { user, hasRole, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const foundJob = (Array.isArray(jobs) ? jobs : []).find((j) => j._id === id);
    if (foundJob) {
      setJob(foundJob);
    }
  }, [id, jobs]);

  const handleStatusChange = async () => {
    if (!hasRole("hr")) {
      alert("Only HR can change job status");
      return;
    }

    try {
      const newStatus = job.status === "open" ? "closed" : "open";
      await updateJob(id, { status: newStatus });
      setJob((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error("Error updating job status:", error);
      alert("Failed to update job status");
    }
  };

  const handleDelete = async () => {
    if (!hasRole("hr")) {
      alert("Only HR can delete jobs");
      return;
    }

    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob(id);
        navigate("/jobs");
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Failed to delete job");
      }
    }
  };

  const handleApply = () => {
    if (!isAuthenticated()) {
      alert("Please login to apply for jobs");
      navigate("/login");
      return;
    }

    if (!hasRole("applicant")) {
      alert("Only applicants can apply for jobs");
      return;
    }
    navigate(`/applications/new/${id}`); // Updated route to match App.js
  };

  const handleEdit = () => {
    if (!hasRole("hr")) {
      alert("Only HR can edit jobs");
      return;
    }

    navigate(`/jobs/${id}/edit`);
  };

  if (loading) return <Container>Loading...</Container>;
  if (error) return <Container>Error: {error}</Container>;
  if (!job) return <Container>Job not found</Container>;

  // Debug logging to check user role
  console.log("Current user:", user);
  console.log("User role:", user?.role);
  console.log("hasRole(hr):", hasRole("hr"));
  console.log("hasRole(applicant):", hasRole("applicant"));
  console.log("isAuthenticated:", isAuthenticated());

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Header>
          <Title>{job.title}</Title>
          <Status $status={job.status}>{job.status}</Status>
        </Header>

        <Info>
          <InfoItem>
            <strong>Location:</strong> {job.location}
          </InfoItem>
          <InfoItem>
            <strong>Department:</strong> {job.department}
          </InfoItem>
          <InfoItem>
            <strong>Salary:</strong> {formatSalary(job.salary)}
          </InfoItem>
        </Info>

        <Section>
          <SectionTitle>Description</SectionTitle>
          <p>{job.description}</p>
        </Section>

        <Section>
          <SectionTitle>Requirements</SectionTitle>
          <List>
            {(Array.isArray(job.requirements) ? job.requirements : []).map((req, index) => (
              <ListItem key={index}>{req}</ListItem>
            ))}
          </List>
        </Section>

        <Section>
          <SectionTitle>Responsibilities</SectionTitle>
          <List>
            {(Array.isArray(job.responsibilities) ? job.responsibilities : []).map((resp, index) => (
              <ListItem key={index}>{resp}</ListItem>
            ))}
          </List>
        </Section>

        <ButtonGroup>
          {/* HR-only buttons */}
          {hasRole("hr") && (
            <>
              <Button className="primary" onClick={handleEdit}>
                Edit Job
              </Button>
              <Button className="secondary" onClick={handleStatusChange}>
                {job.status === "open" ? "Close Job" : "Reopen Job"}
              </Button>
              <Button className="danger" onClick={handleDelete}>
                Delete Job
              </Button>
            </>
          )}

          {/* Applicant-only button */}
          {hasRole("applicant") && ["open", "active"].includes(job.status) && (
            <Button className="primary" onClick={handleApply}>
              Apply Now
            </Button>
          )}

          {/* Unauthenticated users */}
          {!isAuthenticated() && ["open", "active"].includes(job.status) && (
            <Button className="primary" onClick={() => navigate("/login")}>
              Login to Apply
            </Button>
          )}
        </ButtonGroup>
      </Card>
    </Container>
  );
};

export default JobDetails;
