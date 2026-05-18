import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaSpinner } from 'react-icons/fa';
import { API_BASE_URL } from '../../config/api';

const Container = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
`;

const Title = styled.h3`
  color: #2C3E50;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #4C9F9F;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const RequestCard = styled.div`
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
`;

const LeaveType = styled.span`
  background: #4C9F9F;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
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
`;

const Reason = styled.div`
  margin-top: 12px;
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

const HRComments = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #FFF8E1;
  border-radius: 6px;
  border-left: 3px solid #FFB400;
`;

const CommentsLabel = styled.div`
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
`;

const CommentsText = styled.div`
  font-size: 14px;
  color: #2C3E50;
  line-height: 1.4;
`;

const LeaveStatus = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view leave requests');
        setLoading(false);
        return;
      }

      // Get user info from token to get employee ID
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.id) {
        setError('User information not found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/leave/employee/${userInfo.id}`, {
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

  if (loading) {
    return (
      <Container>
        <Title>
          <FaEye />
          Request Status
        </Title>
        <LoadingContainer>
          <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} />
          Loading your leave requests...
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>
          <FaEye />
          Request Status
        </Title>
        <EmptyState>
          <FaTimesCircle style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
          <div>{error}</div>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        <FaEye />
        Request Status
      </Title>

      {leaveRequests.length === 0 ? (
        <EmptyState>
          <FaCalendarAlt style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
          <div>No leave requests found</div>
          <div style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
            Submit your first leave request to see it here
          </div>
        </EmptyState>
      ) : (
        leaveRequests.map((request) => (
          <RequestCard key={request._id}>
            <RequestHeader>
              <LeaveType>{request.leaveType} Leave</LeaveType>
              <StatusBadge className={request.status}>
                {getStatusIcon(request.status)}
                {request.status}
              </StatusBadge>
            </RequestHeader>

            <RequestDetails>
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

            <Reason>
              <ReasonLabel>Reason</ReasonLabel>
              <ReasonText>{request.reason}</ReasonText>
            </Reason>

            {request.reviewComments && (
              <HRComments>
                <CommentsLabel>HR Comments</CommentsLabel>
                <CommentsText>{request.reviewComments}</CommentsText>
              </HRComments>
            )}
          </RequestCard>
        ))
      )}
    </Container>
  );
};

export default LeaveStatus;