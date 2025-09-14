import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaCheck, FaTimes, FaUserCircle, FaSpinner, FaCalendarAlt, FaEnvelope, FaIdCard, FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

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
  background: linear-gradient(90deg, #A5D8D0 0%, #2C3E50 100%);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  color: #FFFFFF;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #FFFFFF;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  span {
    font-size: 1.2rem;
    font-weight: 600;
  }
`;

// New styled components for filtering and sorting
const ControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SearchContainer = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #4C9F9F;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4C9F9F;
    box-shadow: 0 0 0 3px rgba(76, 159, 159, 0.2);
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? '#4C9F9F' : 'white'};
  color: ${props => props.active ? 'white' : '#2C3E50'};
  border: 1px solid ${props => props.active ? '#4C9F9F' : '#dee2e6'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#3A8A8A' : '#f1f3f5'};
  }
`;

const SortButton = styled.button`
  background: white;
  color: #2C3E50;
  border: 1px solid #dee2e6;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f3f5;
  }
  
  svg {
    color: #4C9F9F;
  }
`;

const HRList = styled.div`
  display: grid;
  gap: 1.25rem;
`;

const HRCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 5px solid ${props => 
    props.status === 'pending' ? '#FFB400' : 
    props.status === 'approved' ? '#4C9F9F' : '#f44336'};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const HRInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

const Avatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #2C3E50;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const Details = styled.div`
  h3 {
    margin: 0;
    color: #2C3E50;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .detail-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    color: #666;
    font-size: 0.9rem;
    
    svg {
      color: #4C9F9F;
    }
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &.approve {
    background: #4C9F9F;
    color: white;
    &:hover {
      background: #3A8A8A;
    }
  }

  &.reject {
    background: #f44336;
    color: white;
    &:hover {
      background: #d32f2f;
    }
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const Status = styled.span`
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;

  &.pending {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeeba;
  }

  &.approved {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  &.rejected {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #4C9F9F;
  gap: 1rem;
  font-size: 1.1rem;
  
  svg {
    font-size: 1.5rem;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #f5c6cb;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    font-size: 1.25rem;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px dashed #dee2e6;
  font-size: 1.1rem;
`;

const HRApprovalList = () => {
  const [hrList, setHRList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  
  // New state for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  const fetchHRList = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/admin/hr-list');
      setHRList(response.data);
      
      // Calculate stats
      const newStats = {
        pending: 0,
        approved: 0,
        rejected: 0
      };
      
      response.data.forEach(hr => {
        if (hr.isPending) newStats.pending++;
        else if (hr.approved) newStats.approved++;
        else newStats.rejected++;
      });
      
      setStats(newStats);
    } catch (err) {
      console.error('Error fetching HR list:', err);
      setError(err.response?.data?.message || 'Failed to fetch HR list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRList();
  }, []);
  
  // Apply filters and sorting whenever dependencies change
  useEffect(() => {
    let result = [...hrList];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(hr => {
        if (statusFilter === 'pending') return hr.isPending;
        if (statusFilter === 'approved') return hr.approved;
        if (statusFilter === 'rejected') return !hr.isPending && !hr.approved;
        return true;
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(hr => 
        hr.username.toLowerCase().includes(lowerCaseSearch) || 
        hr.email.toLowerCase().includes(lowerCaseSearch) ||
        hr._id.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Special handling for status since it's derived from multiple fields
      if (sortConfig.key === 'status') {
        // Convert status to a sortable value (0: pending, 1: approved, 2: rejected)
        aValue = a.isPending ? 0 : (a.approved ? 1 : 2);
        bValue = b.isPending ? 0 : (b.approved ? 1 : 2);
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredList(result);
  }, [hrList, statusFilter, searchTerm, sortConfig]);

  const handleApproval = async (hrId, action) => {
    try {
      setProcessingId(hrId);
      await axios.post(
        'http://localhost:5000/api/admin/hr-approval',
        { hrId, action }
      );
      await fetchHRList();
    } catch (err) {
      console.error(`Error ${action}ing HR profile:`, err);
      setError(err.response?.data?.message || `Failed to ${action} HR profile. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Handle sort change
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <FaSpinner className="fa-spin" />
          Loading HR approval requests...
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>HR Approval Management</Title>
        <StatsContainer>
          <StatCard>
            <span>{stats.pending}</span> Pending
          </StatCard>
          <StatCard>
            <span>{stats.approved}</span> Approved
          </StatCard>
          <StatCard>
            <span>{stats.rejected}</span> Rejected
          </StatCard>
        </StatsContainer>
      </Header>
      
      {error && (
        <ErrorMessage>
          <FaTimes />
          {error}
        </ErrorMessage>
      )}
      
      {/* New filtering and sorting controls */}
      <ControlsContainer>
        <SearchContainer>
          <FaSearch />
          <SearchInput 
            type="text" 
            placeholder="Search by name, email or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        
        <FilterContainer>
          <FilterButton 
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          >
            <FaFilter /> All
          </FilterButton>
          <FilterButton 
            active={statusFilter === 'pending'}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </FilterButton>
          <FilterButton 
            active={statusFilter === 'approved'}
            onClick={() => setStatusFilter('approved')}
          >
            Approved
          </FilterButton>
          <FilterButton 
            active={statusFilter === 'rejected'}
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected
          </FilterButton>
        </FilterContainer>
        
        <SortButton onClick={() => handleSort('username')}>
          Name {sortConfig.key === 'username' && (
            sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />
          )}
        </SortButton>
        
        <SortButton onClick={() => handleSort('createdAt')}>
          Date {sortConfig.key === 'createdAt' && (
            sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />
          )}
        </SortButton>
        
        <SortButton onClick={() => handleSort('status')}>
          Status {sortConfig.key === 'status' && (
            sortConfig.direction === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />
          )}
        </SortButton>
      </ControlsContainer>
      
      {filteredList.length === 0 ? (
        <EmptyMessage>
          {searchTerm || statusFilter !== 'all' ? 
            'No HR profiles match your current filters' : 
            'No HR profiles found'}
        </EmptyMessage>
      ) : (
        <HRList>
          {filteredList.map((hr) => (
            <HRCard 
              key={hr._id} 
              status={hr.isPending ? 'pending' : hr.approved ? 'approved' : 'rejected'}
            >
              <HRInfo>
                <Avatar>
                  <FaUserCircle />
                </Avatar>
                <Details>
                  <h3>{hr.username}</h3>
                  <div className="detail-row">
                    <FaEnvelope />
                    {hr.email}
                  </div>
                  <div className="detail-row">
                    <FaIdCard />
                    ID: {hr._id.substring(hr._id.length - 8)}
                  </div>
                  <div className="detail-row">
                    <FaCalendarAlt />
                    Registered: {hr.createdAt ? formatDate(hr.createdAt) : 'N/A'}
                  </div>
                  <Status className={hr.isPending ? 'pending' : hr.approved ? 'approved' : 'rejected'}>
                    {hr.isPending ? 'Pending Approval' : hr.approved ? 'Approved' : 'Rejected'}
                  </Status>
                </Details>
              </HRInfo>
              <Actions>
                {hr.isPending && (
                  <>
                    <Button
                      className="approve"
                      onClick={() => handleApproval(hr._id, 'approve')}
                      disabled={processingId === hr._id}
                    >
                      {processingId === hr._id ? (
                        <FaSpinner className="fa-spin" />
                      ) : (
                        <FaCheck />
                      )}{' '}
                      Approve
                    </Button>
                    <Button
                      className="reject"
                      onClick={() => handleApproval(hr._id, 'reject')}
                      disabled={processingId === hr._id}
                    >
                      {processingId === hr._id ? (
                        <FaSpinner className="fa-spin" />
                      ) : (
                        <FaTimes />
                      )}{' '}
                      Reject
                    </Button>
                  </>
                )}
              </Actions>
            </HRCard>
          ))}
        </HRList>
      )}
    </Container>
  );
};

export default HRApprovalList;