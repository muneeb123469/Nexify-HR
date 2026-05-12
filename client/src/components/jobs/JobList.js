import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0;
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const JobGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const JobCard = styled(motion.div)`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const JobTitle = styled.h2`
  font-size: 1.25rem;
  color: #333;
  margin: 0 0 1rem 0;
`;

const Info = styled.div`
  color: #666;
  margin-bottom: 1rem;
`;

const Status = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => props.$status === 'open' ? '#e6f4ea' : '#fce8e6'};
  color: ${props => props.$status === 'open' ? '#137333' : '#c5221f'};
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1557b0;
  }
`;

const JobList = () => {
  const navigate = useNavigate();
  const { jobs, loading, error } = useJobs();
  const { user, hasRole } = useAuth();
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const jobList = Array.isArray(jobs) ? jobs : [];

  const departments = [...new Set(jobList.map(job => job.department).filter(Boolean))];
  const statuses = ['open', 'closed'];

  const filteredJobs = jobList.filter(job => {
    if (departmentFilter && job.department !== departmentFilter) return false;
    if (statusFilter && job.status !== statusFilter) return false;
    return true;
  });

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleCreateJob = () => {
    navigate('/jobs/create');
  };

  if (loading) return <Container>Loading...</Container>;
  if (error) return <Container>Error: {error}</Container>;

  return (
    <Container>
      {/* <Header>
        <Title>Job Listings</Title>
        {hasRole('hr') && (
          <Button onClick={handleCreateJob}>Create Job</Button>
        )}
      </Header> */}

      <Filters>
        <Select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </Select>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {statuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </Select>
      </Filters>

      <JobGrid>
        {filteredJobs.map(job => (
          <JobCard
            key={job._id}
            onClick={() => handleJobClick(job._id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <JobTitle>{job.title}</JobTitle>
            <Info>
              <div><strong>Department:</strong> {job.department}</div>
              <div><strong>Location:</strong> {job.location}</div>
              <div><strong>Salary:</strong> {job.salary?.min} - {job.salary?.max} {job.salary?.currency}</div>
            </Info>
            <Status $status={job.status}>{job.status}</Status>
          </JobCard>
        ))}
      </JobGrid>
    </Container>
  );
};

export default JobList; 
