import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaClock, FaUsers, FaCalendarAlt, FaSearch, FaFilter, FaDownload, FaCheckCircle, FaTimesCircle, FaSpinner, FaUser, FaArrowLeft, FaHistory } from 'react-icons/fa';
import { Sidebar } from '../dashboard/HRDashboard';
import { API_BASE_URL } from '../../config/api';


const Container = styled.div`
  margin-left: 250px;
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 16px;
  }
`;

const Header = styled.div`
  background: linear-gradient(90deg, #2C3E50 0%, #3498DB 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  color: #FFFFFF;
`;

const HeaderTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
`;

const FilterSection = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #2C3E50;
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #E0E6ED;
  border-radius: 8px;
  font-size: 14px;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: #3498DB;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #E0E6ED;
  border-radius: 8px;
  font-size: 14px;
  min-width: 150px;
  background: white;

  &:focus {
    outline: none;
    border-color: #3498DB;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  background: #3498DB;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;

  &:hover {
    background: #2980B9;
  }

  &:disabled {
    background: #BDC3C7;
    cursor: not-allowed;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || '#3498DB'};
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.color || '#2C3E50'};
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #7F8C8D;
  font-weight: 500;
`;

const AttendanceTable = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: #F8F9FA;
  padding: 16px 20px;
  border-bottom: 1px solid #E0E6ED;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TableTitle = styled.h3`
  margin: 0;
  color: #2C3E50;
  font-size: 18px;
  font-weight: 600;
`;

const TableContent = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: #F8F9FA;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #F8F9FA;
  }

  &:hover {
    background: #E8F4FD;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #2C3E50;
  border-bottom: 1px solid #E0E6ED;
  font-size: 14px;
`;

const TableCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #E0E6ED;
  font-size: 14px;
  color: #2C3E50;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  
  ${props => {
    switch (props.status) {
      case 'checked-in':
        return 'background: #D5F4E6; color: #27AE60;';
      case 'completed':
        return 'background: #D6EAF8; color: #3498DB;';
      case 'checked-out':
        return 'background: #FADBD8; color: #E74C3C;';
      default:
        return 'background: #F8F9FA; color: #7F8C8D;';
    }
  }}
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #7F8C8D;
`;

const ErrorMessage = styled.div`
  background: #FADBD8;
  color: #E74C3C;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #7F8C8D;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const ViewButton = styled.button`
  padding: 12px 24px;
  border: 2px solid ${props => props.active ? '#3498DB' : '#E0E6ED'};
  background: ${props => props.active ? '#3498DB' : '#FFFFFF'};
  color: ${props => props.active ? '#FFFFFF' : '#2C3E50'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    border-color: #3498DB;
    background: ${props => props.active ? '#2980B9' : '#F8F9FA'};
  }
`;

const EmployeeHistoryContainer = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const EmployeeSelector = styled.div`
  padding: 20px;
  border-bottom: 1px solid #E0E6ED;
  background: #F8F9FA;
`;

const EmployeeSelectRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  padding: 8px 16px;
  background: #95A5A6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;

  &:hover {
    background: #7F8C8D;
  }
`;

const EmployeeSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #E0E6ED;
  border-radius: 8px;
  font-size: 14px;
  min-width: 250px;
  background: white;

  &:focus {
    outline: none;
    border-color: #3498DB;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const MonthSelector = styled.input`
  padding: 8px 12px;
  border: 1px solid #E0E6ED;
  border-radius: 8px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #3498DB;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const TimelineContainer = styled.div`
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
`;

const TimelineItem = styled.div`
  display: flex;
  margin-bottom: 16px;
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 31px;
    top: 80px;
    width: 2px;
    height: calc(100% - 60px);
    background: #E0E6ED;
  }
`;

const DateColumn = styled.div`
  width: 80px;
  text-align: center;
  margin-right: 20px;
`;

const DateNumber = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.hasAttendance ? '#27AE60' : '#BDC3C7'};
  line-height: 1;
  margin-bottom: 4px;
`;

const DateDay = styled.div`
  font-size: 12px;
  color: #7F8C8D;
  font-weight: 500;
  text-transform: uppercase;
`;

const DateIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    if (props.status === 'multiple') return '#3498DB';
    if (props.status === 'single') return '#27AE60';
    return '#BDC3C7';
  }};
  margin: 8px auto 0;
  position: relative;
  z-index: 1;
`;

const SessionsColumn = styled.div`
  flex: 1;
`;

const SessionCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E0E6ED;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:last-child {
    margin-bottom: 0;
  }
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SessionNumber = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #7F8C8D;
  background: #F8F9FA;
  padding: 2px 8px;
  border-radius: 12px;
`;

const SessionStatus = styled.span`
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  ${props => {
    switch (props.status) {
      case 'completed':
        return 'background: #D5F4E6; color: #27AE60;';
      case 'active':
        return 'background: #FFF3CD; color: #F39C12;';
      default:
        return 'background: #F8F9FA; color: #7F8C8D;';
    }
  }}
`;

const SessionTimes = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
`;

const TimeEntry = styled.div`
  flex: 1;
`;

const TimeLabel = styled.div`
  font-size: 12px;
  color: #7F8C8D;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TimeValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.type === 'in' ? '#27AE60' : '#E74C3C'};
`;

const SessionDuration = styled.div`
  text-align: center;
  padding: 8px;
  background: #F8F9FA;
  border-radius: 6px;
  margin-top: 8px;
`;

const DurationLabel = styled.div`
  font-size: 12px;
  color: #7F8C8D;
  margin-bottom: 2px;
`;

const DurationValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #2C3E50;
`;

const NoSessionsCard = styled.div`
  background: #F8F9FA;
  border: 1px dashed #BDC3C7;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  color: #7F8C8D;
  font-size: 14px;
`;

const HRAttendanceView = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    employeeName: '',
    status: 'all'
  });
  const [stats, setStats] = useState({
    totalEmployees: 0,
    checkedIn: 0,
    completed: 0,
    notCheckedIn: 0
  });

  // Employee history view state
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'employee-history'
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams();
      
      if (filters.date) queryParams.append('date', filters.date);
      if (filters.employeeName) queryParams.append('employeeName', filters.employeeName);
      if (filters.status !== 'all') queryParams.append('status', filters.status);

      const response = await fetch(`${API_BASE_URL}/attendance/all?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        setError('Session expired. Please login again.');
        // Optionally redirect to login
        window.location.href = '/';
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setAttendanceData(data.data.attendance || []);
        calculateStats(data.data.attendance || []);
      } else {
        setError(data.message || 'Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const totalEmployees = data.length;
    const checkedIn = data.filter(record => record.status === 'checked-in').length;
    const completed = data.filter(record => record.status === 'completed').length;
    const notCheckedIn = totalEmployees - checkedIn - completed;

    setStats({
      totalEmployees,
      checkedIn,
      completed,
      notCheckedIn
    });
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchAttendanceData();
  };

  // Fetch all employees for selection
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Please login again.');
        window.location.href = '/';
        return;
      }

      const data = await response.json();
      if (data.success) {
        setEmployees(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Network error. Please try again.');
    }
  };

  // Fetch employee attendance history for a specific month
  const fetchEmployeeHistory = async (employeeId, month) => {
    if (!employeeId || !month) return;
    
    setHistoryLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please login again.');
        setHistoryLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/attendance/employee/${employeeId}/history?month=${month}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Please login again.');
        window.location.href = '/';
        return;
      }

      const data = await response.json();
      if (data.success) {
        setEmployeeHistory(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch employee history');
      }
    } catch (error) {
      console.error('Error fetching employee history:', error);
      setError('Network error. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle employee selection
  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployee(employeeId);
    if (employeeId) {
      fetchEmployeeHistory(employeeId, selectedMonth);
    }
  };

  // Handle month change
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    if (selectedEmployee) {
      fetchEmployeeHistory(selectedEmployee, month);
    }
  };

  // Switch to employee history view
  const switchToEmployeeHistory = () => {
    setViewMode('employee-history');
    if (employees.length === 0) {
      fetchEmployees();
    }
  };

  // Switch back to overview
  const switchToOverview = () => {
    setViewMode('overview');
    setSelectedEmployee('');
    setEmployeeHistory([]);
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'checked-in':
        return <FaCheckCircle />;
      case 'completed':
        return <FaCheckCircle />;
      default:
        return <FaTimesCircle />;
    }
  };

  // Generate timeline data for the selected month
  const generateTimelineData = () => {
    const [year, month] = selectedMonth.split('-');
    const daysInMonth = new Date(year, month, 0).getDate();
    const timeline = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Find attendance record for this date
      const attendanceRecord = employeeHistory.find(record => 
        new Date(record.date).toISOString().split('T')[0] === dateString
      );

      timeline.push({
        date: date,
        dateString: dateString,
        day: day,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        attendance: attendanceRecord || null,
        sessions: attendanceRecord?.sessions || []
      });
    }

    return timeline; // Show oldest first (ascending order)
  };

  // Calculate session duration
  const calculateSessionDuration = (checkInAt, checkOutAt) => {
    if (!checkInAt || !checkOutAt) return null;
    
    const diffMs = new Date(checkOutAt) - new Date(checkInAt);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Get session status
  const getSessionStatus = (session) => {
    if (session.checkInAt && session.checkOutAt) {
      return 'completed';
    } else if (session.checkInAt) {
      return 'active';
    }
    return 'incomplete';
  };

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchAttendanceData();
  }, []);

  return (
    <>
      <Sidebar />
      <Container>
      <Header>
        <HeaderTitle>
          <FaClock />
          Employee Attendance Management
        </HeaderTitle>
        <HeaderSubtitle>Monitor and manage employee attendance across your organization</HeaderSubtitle>
      </Header>

      <ViewToggle>
        <ViewButton 
          active={viewMode === 'overview'} 
          onClick={switchToOverview}
        >
          <FaUsers />
          All Employees Overview
        </ViewButton>
        <ViewButton 
          active={viewMode === 'employee-history'} 
          onClick={switchToEmployeeHistory}
        >
          <FaHistory />
          Employee History
        </ViewButton>
      </ViewToggle>

      {viewMode === 'overview' ? (
        <>
          <FilterSection>
            <FilterRow>
              <FilterGroup>
                <FilterLabel>Date</FilterLabel>
                <FilterInput
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                />
              </FilterGroup>
              <FilterGroup>
                <FilterLabel>Employee Name</FilterLabel>
                <FilterInput
                  type="text"
                  placeholder="Search by name..."
                  value={filters.employeeName}
                  onChange={(e) => handleFilterChange('employeeName', e.target.value)}
                />
              </FilterGroup>
              <FilterGroup>
                <FilterLabel>Status</FilterLabel>
                <FilterSelect
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="checked-in">Checked In</option>
                  <option value="completed">Completed</option>
                  <option value="not-checked-in">Not Checked In</option>
                </FilterSelect>
              </FilterGroup>
              <FilterGroup>
                <FilterLabel>&nbsp;</FilterLabel>
                <FilterButton onClick={applyFilters} disabled={loading}>
                  <FaSearch />
                  Apply Filters
                </FilterButton>
              </FilterGroup>
            </FilterRow>
          </FilterSection>

      <StatsGrid>
        <StatCard color="#3498DB">
          <StatValue color="#3498DB">{stats.totalEmployees}</StatValue>
          <StatLabel>Total Employees</StatLabel>
        </StatCard>
        <StatCard color="#27AE60">
          <StatValue color="#27AE60">{stats.checkedIn}</StatValue>
          <StatLabel>Currently Checked In</StatLabel>
        </StatCard>
        <StatCard color="#F39C12">
          <StatValue color="#F39C12">{stats.completed}</StatValue>
          <StatLabel>Completed Sessions</StatLabel>
        </StatCard>
        <StatCard color="#E74C3C">
          <StatValue color="#E74C3C">{stats.notCheckedIn}</StatValue>
          <StatLabel>Not Checked In</StatLabel>
        </StatCard>
      </StatsGrid>

      <AttendanceTable>
        <TableHeader>
          <TableTitle>Attendance Records</TableTitle>
        </TableHeader>
        
        <TableContent>
          {loading ? (
            <LoadingContainer>
              <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} />
              Loading attendance data...
            </LoadingContainer>
          ) : error ? (
            <ErrorMessage>
              <FaTimesCircle />
              {error}
            </ErrorMessage>
          ) : attendanceData.length === 0 ? (
            <EmptyState>
              <FaUsers style={{ fontSize: '48px', marginBottom: '16px', color: '#BDC3C7' }} />
              <div>No attendance records found for the selected criteria.</div>
            </EmptyState>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Employee</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Sessions</TableHeaderCell>
                  <TableHeaderCell>Last Check-in</TableHeaderCell>
                  <TableHeaderCell>Last Check-out</TableHeaderCell>
                  <TableHeaderCell>Working Hours</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {attendanceData.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>{record.employeeName}</TableCell>
                    <TableCell>{record.employeeEmail}</TableCell>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.status}>
                        {getStatusIcon(record.status)}
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      {record.sessions?.length || 0} 
                      {record.sessions?.filter(s => s.checkInAt && s.checkOutAt).length > 0 && 
                        ` (${record.sessions.filter(s => s.checkInAt && s.checkOutAt).length} completed)`
                      }
                    </TableCell>
                    <TableCell>
                      {record.sessions?.length > 0 
                        ? formatTime(record.sessions[record.sessions.length - 1]?.checkInAt)
                        : '--:--'
                      }
                    </TableCell>
                    <TableCell>
                      {record.sessions?.length > 0 
                        ? formatTime(record.sessions[record.sessions.length - 1]?.checkOutAt)
                        : '--:--'
                      }
                    </TableCell>
                    <TableCell>{record.formattedWorkingHours || '0h 0m'}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </TableContent>
      </AttendanceTable>
        </>
      ) : (
        // Employee History View
        <EmployeeHistoryContainer>
          <EmployeeSelector>
            <EmployeeSelectRow>
              {/* <BackButton onClick={switchToOverview}> */}
                {/* <FaArrowLeft /> */}
                {/* Back to Overview */}
              {/* </BackButton> */}
              <FilterGroup>
                <FilterLabel>Select Employee</FilterLabel>
                <EmployeeSelect
                  value={selectedEmployee}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                >
                  <option value="">Choose an employee...</option>
                  {employees.map(employee => (
                    <option key={employee._id} value={employee._id}>
                      {employee.username} ({employee.email})
                    </option>
                  ))}
                </EmployeeSelect>
              </FilterGroup>
              <FilterGroup>
                <FilterLabel>Month</FilterLabel>
                <MonthSelector
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                />
              </FilterGroup>
            </EmployeeSelectRow>
          </EmployeeSelector>

          {selectedEmployee && (
            <TimelineContainer>
              {historyLoading ? (
                <LoadingContainer>
                  <FaSpinner className="fa-spin" style={{ marginRight: '8px' }} />
                  Loading employee history...
                </LoadingContainer>
              ) : error ? (
                <ErrorMessage>
                  <FaTimesCircle />
                  {error}
                </ErrorMessage>
              ) : (
                <>
                  {generateTimelineData().map((timelineItem) => (
                    <TimelineItem key={timelineItem.dateString}>
                      <DateColumn>
                        <DateNumber hasAttendance={timelineItem.sessions.length > 0}>
                          {String(timelineItem.day).padStart(2, '0')}
                        </DateNumber>
                        <DateDay>{timelineItem.dayName}</DateDay>
                        <DateIndicator 
                          status={
                            timelineItem.sessions.length > 1 ? 'multiple' : 
                            timelineItem.sessions.length === 1 ? 'single' : 'none'
                          } 
                        />
                      </DateColumn>
                      
                      <SessionsColumn>
                        {timelineItem.sessions.length > 0 ? (
                          timelineItem.sessions.map((session, index) => (
                            <SessionCard key={index}>
                              <SessionHeader>
                                <SessionNumber>
                                  {timelineItem.sessions.length > 1 ? `Session ${index + 1}` : '1st Session'}
                                </SessionNumber>
                                <SessionStatus status={getSessionStatus(session)}>
                                  {getSessionStatus(session) === 'completed' ? 'Completed' : 
                                   getSessionStatus(session) === 'active' ? 'Active' : 'Incomplete'}
                                </SessionStatus>
                              </SessionHeader>
                              
                              <SessionTimes>
                                <TimeEntry>
                                  <TimeLabel>
                                    <FaCheckCircle style={{ color: '#27AE60' }} />
                                    Check In
                                  </TimeLabel>
                                  <TimeValue type="in">
                                    {formatTime(session.checkInAt)}
                                  </TimeValue>
                                </TimeEntry>
                                
                                <TimeEntry>
                                  <TimeLabel>
                                    <FaTimesCircle style={{ color: '#E74C3C' }} />
                                    Check Out
                                  </TimeLabel>
                                  <TimeValue type="out">
                                    {session.checkOutAt ? formatTime(session.checkOutAt) : '--:--'}
                                  </TimeValue>
                                </TimeEntry>
                              </SessionTimes>
                              
                              {session.checkOutAt && (
                                <SessionDuration>
                                  <DurationLabel>Duration</DurationLabel>
                                  <DurationValue>
                                    {calculateSessionDuration(session.checkInAt, session.checkOutAt)}
                                  </DurationValue>
                                </SessionDuration>
                              )}
                            </SessionCard>
                          ))
                        ) : (
                          <NoSessionsCard>
                            No attendance recorded for this day
                          </NoSessionsCard>
                        )}
                      </SessionsColumn>
                    </TimelineItem>
                  ))}
                </>
              )}
            </TimelineContainer>
          )}
        </EmployeeHistoryContainer>
      )}
    </Container>
    </>
  );
};

export default HRAttendanceView;
