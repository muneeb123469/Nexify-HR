import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaCheck, FaTimes, FaUserCircle, FaSpinner, FaCalendarAlt, FaEnvelope, FaIdCard, FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaEdit, FaTrash, FaPlus, FaUser, FaPhone, FaBriefcase, FaUserPlus } from 'react-icons/fa';

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

// Modal and Form styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;

  h2 {
    margin: 0;
    color: #2C3E50;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    svg {
      color: #4C9F9F;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #2C3E50;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #2C3E50;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #4C9F9F;
  }

  .required {
    color: #f44336;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #4C9F9F;
    box-shadow: 0 0 0 3px rgba(76, 159, 159, 0.2);
  }

  &:disabled {
    background: #f0f0f0;
    cursor: not-allowed;
  }
`;

const FormError = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #f5c6cb;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #c3e6cb;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
`;

const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &.primary {
    background: #4C9F9F;
    color: white;
    &:hover {
      background: #3A8A8A;
    }
  }

  &.secondary {
    background: #e9ecef;
    color: #2C3E50;
    &:hover {
      background: #dee2e6;
    }
  }

  &.danger {
    background: #f44336;
    color: white;
    &:hover {
      background: #d32f2f;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AddButton = styled.button`
  background: #4C9F9F;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #3A8A8A;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f0f0f0;
  }

  &.edit {
    color: #4C9F9F;
    &:hover {
      background: #E3F2FD;
    }
  }

  &.delete {
    color: #f44336;
    &:hover {
      background: #FFEBEE;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
`;

const DeleteDialog = styled(Modal)`
  max-width: 400px;
  text-align: center;
`;

const DeleteMessage = styled.p`
  color: #666;
  font-size: 1rem;
  margin: 1.5rem 0;
  line-height: 1.6;

  strong {
    color: #2C3E50;
    display: block;
    margin-top: 0.5rem;
  }
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

  // CRUD state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedHR, setSelectedHR] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    department: '',
    phone: '',
    jobTitle: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  // CRUD Functions
  const handleOpenCreateModal = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      department: '',
      phone: '',
      jobTitle: 'HR Manager'
    });
    setFormError('');
    setFormSuccess('');
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (hr) => {
    setSelectedHR(hr);
    setFormData({
      username: hr.username,
      email: hr.email,
      department: hr.department || '',
      phone: hr.phone || '',
      jobTitle: hr.jobTitle || 'HR Manager'
    });
    setFormError('');
    setFormSuccess('');
    setShowEditModal(true);
  };

  const handleOpenDeleteDialog = (hr) => {
    setSelectedHR(hr);
    setShowDeleteDialog(true);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteDialog(false);
    setSelectedHR(null);
    setFormError('');
    setFormSuccess('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateHR = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setFormError('Username, email, and password are required');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post('http://localhost:5000/api/admin/hr-create', formData);
      setFormSuccess('HR user created successfully!');
      setTimeout(() => {
        handleCloseModals();
        fetchHRList();
      }, 1500);
    } catch (err) {
      console.error('Error creating HR:', err);
      setFormError(err.response?.data?.message || 'Failed to create HR user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateHR = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validation
    if (!formData.username || !formData.email) {
      setFormError('Username and email are required');
      return;
    }

    try {
      setSubmitting(true);
      await axios.put(`http://localhost:5000/api/admin/hr-update/${selectedHR._id}`, formData);
      setFormSuccess('HR user updated successfully!');
      setTimeout(() => {
        handleCloseModals();
        fetchHRList();
      }, 1500);
    } catch (err) {
      console.error('Error updating HR:', err);
      setFormError(err.response?.data?.message || 'Failed to update HR user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHR = async () => {
    try {
      setSubmitting(true);
      await axios.delete(`http://localhost:5000/api/admin/hr-delete/${selectedHR._id}`);
      handleCloseModals();
      fetchHRList();
    } catch (err) {
      console.error('Error deleting HR:', err);
      setError(err.response?.data?.message || 'Failed to delete HR user');
      handleCloseModals();
    } finally {
      setSubmitting(false);
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
      {/* <Header>
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
      </Header> */}

      {error && (
        <ErrorMessage>
          <FaTimes />
          {error}
        </ErrorMessage>
      )}

      {/* New filtering and sorting controls */}
      <ControlsContainer>
        <AddButton onClick={handleOpenCreateModal}>
          <FaPlus /> Add New HR
        </AddButton>
        {/* <SearchContainer>
          <FaSearch />
          <SearchInput
            type="text"
            placeholder="Search by name, email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer> */}

        {/* <FilterContainer>
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
        </FilterContainer> */}
        {/* 
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
        </SortButton> */}
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
                {hr.approved && (
                  <ActionButtons>
                    <IconButton
                      className="edit"
                      onClick={() => handleOpenEditModal(hr)}
                      title="Edit HR User"
                    >
                      <FaEdit size={18} />
                    </IconButton>
                    <IconButton
                      className="delete"
                      onClick={() => handleOpenDeleteDialog(hr)}
                      title="Delete HR User"
                    >
                      <FaTrash size={18} />
                    </IconButton>
                  </ActionButtons>
                )}
              </Actions>
            </HRCard>
          ))}
        </HRList>
      )}

      {/* Create HR Modal */}
      {showCreateModal && (
        <ModalOverlay onClick={handleCloseModals}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2><FaUserPlus /> Create New HR User</h2>
              <CloseButton onClick={handleCloseModals}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            {formError && <FormError>{formError}</FormError>}
            {formSuccess && <SuccessMessage><FaCheck /> {formSuccess}</SuccessMessage>}

            <Form onSubmit={handleCreateHR}>
              <FormGroup>
                <Label>
                  <FaUser /> Username <span className="required">*</span>
                </Label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  placeholder="Enter username"
                  required
                  disabled={submitting}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaEnvelope /> Email <span className="required">*</span>
                </Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="Enter email address"
                  required
                  disabled={submitting}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaTimes /> Password <span className="required">*</span>
                </Label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Enter password (min 6 characters)"
                  required
                  minLength={6}
                  disabled={submitting}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaBriefcase /> Job Title
                </Label>
                <Input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleFormChange}
                  placeholder="Enter job title"
                  disabled={submitting}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaBriefcase /> Department
                </Label>
                <Input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  placeholder="Enter department"
                  disabled={submitting}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaPhone /> Phone
                </Label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="Enter phone number"
                  disabled={submitting}
                />
              </FormGroup>

              <FormActions>
                <ModalButton type="button" className="secondary" onClick={handleCloseModals} disabled={submitting}>
                  Cancel
                </ModalButton>
                <ModalButton type="submit" className="primary" disabled={submitting}>
                  {submitting ? (
                    <><FaSpinner className="fa-spin" /> Creating...</>
                  ) : (
                    <><FaCheck /> Create HR User</>
                  )}
                </ModalButton>
              </FormActions>
            </Form>
          </Modal>
        </ModalOverlay>
      )}

      {/* Edit HR Modal */}
      {showEditModal && selectedHR && (
        <ModalOverlay onClick={handleCloseModals}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2><FaEdit /> Edit HR User</h2>
              <CloseButton onClick={handleCloseModals}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            {formError && <FormError>{formError}</FormError>}
            {formSuccess && <SuccessMessage><FaCheck /> {formSuccess}</SuccessMessage>}

            <Form onSubmit={handleUpdateHR}>
              <FormGroup>
                <Label>
                  <FaUser /> Username <span className="required">*</span>
                </Label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  placeholder="Enter username"
                  required
                  disabled={submitting}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaEnvelope /> Email <span className="required">*</span>
                </Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="Enter email address"
                  required
                  disabled={submitting}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaBriefcase /> Job Title
                </Label>
                <Input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleFormChange}
                  placeholder="Enter job title"
                  disabled={submitting}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaBriefcase /> Department
                </Label>
                <Input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  placeholder="Enter department"
                  disabled={submitting}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  <FaPhone /> Phone
                </Label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="Enter phone number"
                  disabled={submitting}
                />
              </FormGroup>

              <FormActions>
                <ModalButton type="button" className="secondary" onClick={handleCloseModals} disabled={submitting}>
                  Cancel
                </ModalButton>
                <ModalButton type="submit" className="primary" disabled={submitting}>
                  {submitting ? (
                    <><FaSpinner className="fa-spin" /> Updating...</>
                  ) : (
                    <><FaCheck /> Update HR User</>
                  )}
                </ModalButton>
              </FormActions>
            </Form>
          </Modal>
        </ModalOverlay>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedHR && (
        <ModalOverlay onClick={handleCloseModals}>
          <DeleteDialog onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2><FaTrash /> Delete HR User</h2>
              <CloseButton onClick={handleCloseModals}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>

            <DeleteMessage>
              Are you sure you want to delete this HR user?
              <strong>{selectedHR.username} ({selectedHR.email})</strong>
              This action cannot be undone.
            </DeleteMessage>

            <FormActions>
              <ModalButton type="button" className="secondary" onClick={handleCloseModals} disabled={submitting}>
                Cancel
              </ModalButton>
              <ModalButton type="button" className="danger" onClick={handleDeleteHR} disabled={submitting}>
                {submitting ? (
                  <><FaSpinner className="fa-spin" /> Deleting...</>
                ) : (
                  <><FaTrash /> Delete User</>
                )}
              </ModalButton>
            </FormActions>
          </DeleteDialog>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default HRApprovalList;