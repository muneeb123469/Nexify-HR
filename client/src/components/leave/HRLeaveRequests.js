import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaCalendarAlt, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner,
  FaEye,
  FaFilter,
  FaUser
} from 'react-icons/fa';
import { API_BASE_URL } from '../../config/api';

const Container = styled.div`
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
`;

const Header = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
`;

const Title = styled.h1`
  color: #2C3E50;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #4C9F9F;
  }
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
`;

const FilterSection = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 14px;
  color: #2C3E50;
  background: #FFFFFF;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #4C9F9F;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.color || '#4C9F9F'};
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 14px;
`;

const RequestsContainer = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const RequestCard = styled.div`
  border-bottom: 1px solid #E0E0E0;
  padding: 24px;
  transition: all 0.2s ease;

  &:hover {
    background: #F8F9FA;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EmployeeName = styled.h3`
  color: #2C3E50;
  margin: 0;
  font-size: 18px;
`;

const EmployeeDetails = styled.div`
  color: #666;
  font-size: 14px;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 4px;

  &.pending {
    background: #FFF3CD;
    color: #856404;
  }

  &.approved {
    background: #D4EDDA;
    color: #155724;
  }

  &.rejected {
    background: #F8D7DA;
    color: #721C24;
  }
`;

const RequestDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: #2C3E50;
  font-weight: 500;
`;

const LeaveTypeTag = styled.span`
  background: #4C9F9F;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
`;

const ReasonSection = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: #F8F9FA;
  border-radius: 6px;
  border-left: 3px solid #4C9F9F;
`;

const ReasonLabel = styled.div`
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
`;

const ReasonText = styled.div`
  font-size: 14px;
  color: #2C3E50;
  line-height: 1.4;
`;

const ActionSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.approve {
    background: #28a745;
    color: white;

    &:hover:not(:disabled) {
      background: #218838;
    }
  }

  &.reject {
    background: #dc3545;
    color: white;

    &:hover:not(:disabled) {
      background: #c82333;
    }
  }
`;

const CommentInput = styled.textarea`
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;

  &:focus {
    outline: none;
    border-color: #4C9F9F;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px;
  color: #666;
`;

const HRLeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingIds, setProcessingIds] = useState(new Set());
  const [comments, setComments] = useState({});

  useEffect(() => {
    fetchLeaveRequests();
  }, [statusFilter]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view leave requests');
        return;
      }

      const url = statusFilter === 'all' 
        ? `${API_BASE_URL}/leave/all`
        : `${API_BASE_URL}/leave/all?status=${statusFilter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setLeaveRequests(data.data);
      } else {
        setError(data.message || 'Failed to fetch leave requests');
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      setProcessingIds(prev => new Set([...prev, requestId]));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/leave/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          reviewComments: comments[requestId] || ''
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update the request in the local state
        setLeaveRequests(prev => 
          prev.map(request => 
            request._id === requestId 
              ? { ...request, status: newStatus, reviewComments: comments[requestId] || '', reviewedDate: new Date() }
              : request
          )
        );
        
        // Clear the comment for this request
        setComments(prev => {
          const newComments = { ...prev };
          delete newComments[requestId];
          return newComments;
        });
      } else {
        alert(data.message || 'Failed to update leave request');
      }
    } catch (error) {
      console.error('Error updating leave request:', error);
      alert('Network error. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock />;
      case 'approved':
        return <FaCheckCircle />;
      case 'rejected':
        return <FaTimesCircle />;
      default:
        return <FaClock />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    return daysDiff;
  };

  const getStats = () => {
    const total = leaveRequests.length;
    const pending = leaveRequests.filter(req => req.status === 'pending').length;
    const approved = leaveRequests.filter(req => req.status === 'approved').length;
    const rejected = leaveRequests.filter(req => req.status === 'rejected').length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>
            <FaCalendarAlt />
            Leave Requests Management
          </Title>
          <Subtitle>Review and manage employee leave applications</Subtitle>
        </Header>
        <LoadingContainer>
          <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} />
          Loading leave requests...
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title>
            <FaCalendarAlt />
            Leave Requests Management
          </Title>
          <Subtitle>Review and manage employee leave applications</Subtitle>
        </Header>
        <EmptyState>
          <FaTimesCircle style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
          <div>{error}</div>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FaCalendarAlt />
          Leave Requests Management
        </Title>
        <Subtitle>Review and manage employee leave applications</Subtitle>
      </Header>

      <StatsContainer>
        <StatCard>
          <StatNumber color="#4C9F9F">{stats.total}</StatNumber>
          <StatLabel>Total Requests</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber color="#FFA500">{stats.pending}</StatNumber>
          <StatLabel>Pending Review</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber color="#28a745">{stats.approved}</StatNumber>
          <StatLabel>Approved</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber color="#dc3545">{stats.rejected}</StatNumber>
          <StatLabel>Rejected</StatLabel>
        </StatCard>
      </StatsContainer>

      <FilterSection>
        <FaFilter style={{ color: '#666' }} />
        <span style={{ color: '#666', fontWeight: '500' }}>Filter by Status:</span>
        <FilterSelect 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </FilterSelect>
      </FilterSection>

      <RequestsContainer>
        {leaveRequests.length === 0 ? (
          <EmptyState>
            <FaCalendarAlt style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
            <div>No leave requests found</div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
              {statusFilter === 'all' 
                ? 'No leave requests have been submitted yet'
                : `No ${statusFilter} leave requests found`
              }
            </div>
          </EmptyState>
        ) : (
          leaveRequests.map((request) => (
            <RequestCard key={request._id}>
              <RequestHeader>
                <EmployeeInfo>
                  <EmployeeName>
                    <FaUser style={{ marginRight: '8px', color: '#4C9F9F' }} />
                    {request.employeeName}
                  </EmployeeName>
                  <EmployeeDetails>
                    {request.employeeEmail} • {request.department}
                  </EmployeeDetails>
                </EmployeeInfo>
                <StatusBadge className={request.status}>
                  {getStatusIcon(request.status)}
                  {request.status}
                </StatusBadge>
              </RequestHeader>

              <RequestDetails>
                <DetailItem>
                  <DetailLabel>Leave Type</DetailLabel>
                  <DetailValue>
                    <LeaveTypeTag>{request.leaveType}</LeaveTypeTag>
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Start Date</DetailLabel>
                  <DetailValue>{formatDate(request.startDate)}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>End Date</DetailLabel>
                  <DetailValue>{formatDate(request.endDate)}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Duration</DetailLabel>
                  <DetailValue>{calculateDuration(request.startDate, request.endDate)} day(s)</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Applied On</DetailLabel>
                  <DetailValue>{formatDate(request.appliedDate)}</DetailValue>
                </DetailItem>
                {request.reviewedDate && (
                  <DetailItem>
                    <DetailLabel>Reviewed On</DetailLabel>
                    <DetailValue>{formatDate(request.reviewedDate)}</DetailValue>
                  </DetailItem>
                )}
              </RequestDetails>

              <ReasonSection>
                <ReasonLabel>Reason for Leave</ReasonLabel>
                <ReasonText>{request.reason}</ReasonText>
              </ReasonSection>

              {request.status === 'pending' && (
                <ActionSection>
                  <CommentInput
                    placeholder="Add comments (optional)..."
                    value={comments[request._id] || ''}
                    onChange={(e) => setComments(prev => ({
                      ...prev,
                      [request._id]: e.target.value
                    }))}
                  />
                  <ActionButton
                    className="approve"
                    onClick={() => handleStatusUpdate(request._id, 'approved')}
                    disabled={processingIds.has(request._id)}
                  >
                    {processingIds.has(request._id) ? <FaSpinner className="fa-spin" /> : <FaCheck />}
                    Approve
                  </ActionButton>
                  <ActionButton
                    className="reject"
                    onClick={() => handleStatusUpdate(request._id, 'rejected')}
                    disabled={processingIds.has(request._id)}
                  >
                    {processingIds.has(request._id) ? <FaSpinner className="fa-spin" /> : <FaTimes />}
                    Reject
                  </ActionButton>
                </ActionSection>
              )}

              {request.reviewComments && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  background: '#FFF8E1', 
                  borderRadius: '6px',
                  borderLeft: '3px solid #FFB400'
                }}>
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: '500', marginBottom: '4px' }}>
                    HR Comments
                  </div>
                  <div style={{ fontSize: '14px', color: '#2C3E50' }}>
                    {request.reviewComments}
                  </div>
                </div>
              )}
            </RequestCard>
          ))
        )}
      </RequestsContainer>
    </Container>
  );
};

export default HRLeaveRequests;