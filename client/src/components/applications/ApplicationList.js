import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApplications } from '../../context/ApplicationContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import './ApplicationList.css';
import { ApplicantSideBar } from '../dashboard/ApplicantDashboard';

const Container = styled.div`
  max-width: 1200px;
  margin-left:20%;
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
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 150px;
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 200px;
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
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
`;

const JobTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
`;

const CompanyName = styled.h3`
  color: #4C9F9F;
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const Info = styled.div`
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
`;

const Status = styled.span`
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  margin: 1rem 0;
  background: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'pending': return '#f39c12';
      case 'under review': return '#3498db';
      case 'interview scheduled': return '#9b59b6';
      case 'shortlisted': return '#3498db';
      case 'rejected': return '#e74c3c';
      case 'hired': return '#2ecc71';
      case 'accepted': return '#2ecc71';
      default: return '#95a5a6';
    }
  }};
  color: white;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const Button = styled(motion.button)`
  padding: 0.6rem 1.2rem;
  background: ${props => props.variant === 'danger' ? '#e74c3c' : '#3498db'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s ease;
  flex: 1;
  min-width: 100px;

  &:hover {
    background: ${props => props.variant === 'danger' ? '#c0392b' : '#2980b9'};
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #4C9F9F;
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  
  h3 {
    margin-bottom: 1rem;
    color: #2c3e50;
  }
  
  p {
    margin-bottom: 2rem;
  }
`;

const ApplicationList = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { applications, loading, error, fetchApplications } = useApplications();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to format salary
  const formatSalary = (salary) => {
    if (!salary) {
      return 'Salary not specified';
    }
    
    if (typeof salary === 'string') {
      return salary;
    }
    
    if (typeof salary === 'object' && salary.min !== undefined && salary.max !== undefined) {
      const currency = salary.currency || 'USD';
      const min = salary.min?.toLocaleString() || '0';
      const max = salary.max?.toLocaleString() || '0';
      return `$${min} - $${max} ${currency}`;
    }
    
    return 'Salary not specified';
  };

  useEffect(() => {
    // Fetch user's applications (not job-specific)
    fetchApplications();
  }, []);

  const handleViewDetails = (applicationId) => {
    navigate(`/applications/${applicationId}`);
  };

  const handleCancelApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to cancel this application?')) {
      try {
        // You'll need to implement this API call
        console.log('Canceling application:', applicationId);
        // After successful cancellation, refresh the list
        fetchApplications();
      } catch (err) {
        console.error('Error canceling application:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#f39c12';
      case 'under review':
        return '#3498db';
      case 'interview scheduled':
        return '#9b59b6';
      case 'shortlisted':
        return '#3498db';
      case 'rejected':
        return '#e74c3c';
      case 'hired':
      case 'accepted':
        return '#2ecc71';
      default:
        return '#95a5a6';
    }
  };

  // Filter applications based on status and search query
  const filteredApplications = applications.filter(application => {
    const matchesStatus = statusFilter === 'all' || application.status?.toLowerCase() === statusFilter;
    const matchesSearch = !searchQuery || 
      application.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.job?.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <i className="fas fa-spinner fa-spin" style={{marginRight: '0.5rem'}}></i>
          Loading your applications...
        </LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (

      <Container>
        <ErrorMessage>
          <i className="fas fa-exclamation-triangle" style={{marginRight: '0.5rem'}}></i>
          Error: {error}
        </ErrorMessage>
      </Container>
    );
  }

  return (
          <>
      <ApplicantSideBar/>
    <Container>
      <Header>
        <Title>My Applications</Title>
        <div style={{color: '#7f8c8d', fontSize: '1rem'}}>
          {applications.length} application{applications.length !== 1 ? 's' : ''} found
        </div>
      </Header>

      <Filters>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under review">Under Review</option>
          <option value="interview scheduled">Interview Scheduled</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
          <option value="hired">Hired</option>
        </Select>
        <SearchInput
          type="text"
          placeholder="Search by job title or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Filters>

      {filteredApplications.length === 0 ? (
        <EmptyState>
          <i className="fas fa-file-alt" style={{fontSize: '3rem', color: '#bdc3c7', marginBottom: '1rem'}}></i>
          <h3>No Applications Found</h3>
          <p>
            {applications.length === 0 
              ? "You haven't applied to any jobs yet." 
              : "No applications match your current filters."
            }
          </p>
          <Button
            onClick={() => navigate('/jobs')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <i className="fas fa-search" style={{marginRight: '0.5rem'}}></i>
            Browse Jobs
          </Button>
        </EmptyState>
      ) : (
        <ApplicationGrid>
          {filteredApplications.map(application => (
            <ApplicationCard
              key={application._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <JobTitle>
                {application.job?.title || 'Job Title Not Available'}
              </JobTitle>
              <CompanyName>
                {application.job?.company || application.job?.department || 'Company Not Available'}
              </CompanyName>
              
              <Info>
                <i className="fas fa-id-badge"></i>
                Job ID: {application.job?._id || 'N/A'}
              </Info>
              
              <Info>
                <i className="fas fa-map-marker-alt"></i>
                {application.job?.location || 'Location Not Specified'}
              </Info>
              
              <Info>
                <i className="fas fa-calendar"></i>
                Applied: {formatDate(application.createdAt)}
              </Info>
              
              {application.job?.salary && (
                <Info>
                  <i className="fas fa-dollar-sign"></i>
                  {formatSalary(application.job.salary)}
                </Info>
              )}

              <Status 
                status={application.status} 
                style={{ backgroundColor: getStatusColor(application.status) }}
              >
                {application.status || 'Pending'}
              </Status>

              {/* Show parsed resume info if available */}
              {application.parsedResume && (
                <Info>
                  <i className="fas fa-check-circle" style={{color: '#2ecc71'}}></i>
                  Resume parsed successfully
                </Info>
              )}

              <ActionButtons>
                <Button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleViewDetails(application._id)}
                >
                  <i className="fas fa-eye" style={{marginRight: '0.5rem'}}></i>
                  View Details
                </Button>
                
                {application.status?.toLowerCase() !== 'rejected' && 
                 application.status?.toLowerCase() !== 'hired' && (
                  <Button
                    variant="danger"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCancelApplication(application._id)}
                  >
                    <i className="fas fa-times" style={{marginRight: '0.5rem'}}></i>
                    Cancel
                  </Button>
                )}
              </ActionButtons>
            </ApplicationCard>
          ))}
        </ApplicationGrid>
      )}
    </Container>
    </>
  );
};

export default ApplicationList;