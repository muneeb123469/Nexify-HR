import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import styled from 'styled-components';
import './HRDashboard.css';

// Import HR Management Components
import JobPostingsDashboard from '../recruitment/JobPostingsDashboard';
import CandidateApplicationManagement from '../recruitment/CandidateApplicationManagement';

import InterviewSchedulingInterface from '../recruitment/InterviewSchedulingInterface';
import InterviewFeedbackRecording from '../recruitment/InterviewFeedbackRecording';
import OfferLetterGeneration from '../recruitment/OfferLetterGeneration';

// Import Payroll Management Components
import SalaryCalculation from '../payroll-management/SalaryCalculation';
import PayslipGeneration from '../payroll-management/PayslipGeneration';
import PayrollTaxManagement from '../employee-management/PayrollTaxManagement';

// Import Employee Management Components
import EmployeeDatabaseManagement from '../employee-management/EmployeeDatabaseManagement';
import EmployeeProfileManagement from '../employee-management/EmployeeProfileManagement';
import NewEmployeeProfile from '../employee-management/NewEmployeeProfile';
import EmployeeClassification from '../employee-management/EmployeeClassification';

// Import Remote Work Components
import WellnessFitnessDashboard from '../remote-work/WellnessFitnessDashboard';
import RemoteWorkHoursTracker from '../remote-work/RemoteWorkHoursTracker';

// Import Meeting Component
import Meeting from '../interviews/Meeting';

// Styled Components
const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #F8F9FA;
`;

const SidebarContainer = styled.div`
  width: 250px;
  background: #2C3E50;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  z-index: 100;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  padding: 32px 24px 24px 24px;
  background: #2C3E50;
  position: sticky;
  top: 0;
  z-index: 2;
  h1 {
    font-size: 1.6em;
    font-weight: 800;
    letter-spacing: 2px;
    color: #FFFFFF;
    span {
      color: #4C9F9F;
    }
  }
`;

const SidebarMenu = styled.ul`
  list-style: none;
  padding: 0 16px;
  margin: 0;
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: #4C9F9F #2C3E50;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #2C3E50;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #4C9F9F;
    border-radius: 3px;
  }
`;

const MenuItem = styled.li`
  a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    color: #FFFFFF;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.2s ease;

    &:hover, &.active {
      background: #4C9F9F;
      color: #FFFFFF;
    }

    i {
      margin-right: 0;
      font-size: 1.2rem;
      width: auto;
      text-align: left;
      color: #FFFFFF;
    }
  }
`;

const LogoutContainer = styled.div`
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: #2C3E50;
  position: sticky;
  bottom: 0;
  z-index: 2;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #4C9F9F;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2A6F6F;
  }

  i {
    margin-right: 0;
    color: #FFFFFF;
  }
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 250px;
  padding: 24px;
  background: #F8F9FA;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: linear-gradient(90deg, #A5D8D0 0%, #2C3E50 100%);
  padding: 16px 24px;
  border-radius: 12px;
  color: #FFFFFF;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 280px;
  
  input {
    width: 100%;
    padding: 10px 40px 10px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 0.875rem;
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;

    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    &:focus {
      outline: none;
      border-color: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
    }
  }

  i {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #FFFFFF;
    }
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Notifications = styled.div`
  margin-right: 20px;
  position: relative;

  i {
    font-size: 1.2rem;
    color: #FFFFFF;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 8px;
    height: 8px;
    background-color: #1DBF73;
    border-radius: 50%;
  }
`;

const User = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  span {
    margin-right: 0;
    color: #FFFFFF;
  }

  .role {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FFFFFF;
`;

const Content = styled.div`
  padding: 20px;
  flex: 1;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto auto;
  gap: 20px;
`;

const GridItem = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

// Components
export const Sidebar = () => (
  <SidebarContainer>
    <Logo>
      <h1>Nexify<span>-HR</span></h1>
    </Logo>
    <SidebarMenu>
      <MenuItem>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-chart-line"></i>
          <span>Dashboard Overview</span>
        </NavLink>
      </MenuItem>

      {/* Recruitment Section */}
      <MenuItem>
        <NavLink to="/hr/job-postings" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-briefcase"></i>
          <span>Job Postings</span>
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink to="/hr/candidate-applications" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-user-plus"></i>
          <span>Candidate Applications</span>
        </NavLink>
      </MenuItem>

      <MenuItem>
        <NavLink to="/hr/interview-scheduling" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-calendar-check"></i>
          <span>Interview Scheduling</span>
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink to="/meetings" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-video"></i>
          <span>Meetings</span>
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink to="/hr/interview-feedback" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-comment-alt"></i>
          <span>Interview Feedback</span>
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink to="/hr/offer-letters" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-file-signature"></i>
          <span>Offer Letters</span>
        </NavLink>
      </MenuItem>

      {/* Employee Management Section */}
      <MenuItem>
        <NavLink to="/employee/database" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-users"></i>
          <span>Employee Records</span>
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink to="/employee/classification" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-list"></i>
          <span>Employee Classification</span>
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink to="/hr/attendance" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-clock"></i>
          <span>Attendance</span>
        </NavLink>
      </MenuItem>

      {/* Payroll Section */}
      <MenuItem>
        <NavLink to="/payroll/salary-calculation" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-calculator"></i>
          <span>Salary Calculation</span>
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink to="/payroll/payslip-generation" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-file-invoice-dollar"></i>
          <span>Payslip Generation</span>
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink to="/employee/payroll-tax" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-percentage"></i>
          <span>Payroll Tax</span>
        </NavLink>
      </MenuItem>

      {/* Remote Work Section */}
      <MenuItem>
        <NavLink to="/remote-work/wellness-fitness" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-heartbeat"></i>
          <span>Wellness & Fitness</span>
        </NavLink>
      </MenuItem>
      <MenuItem>
        <NavLink to="/remote-work/hours-tracker" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-clock"></i>
          <span>Hours Tracker</span>
        </NavLink>
      </MenuItem>

      {/* Settings */}
      <MenuItem>
        <NavLink to="/settings" className={({ isActive }) => isActive ? "active" : ""}>
          <i className="fas fa-cog"></i>
          <span>System Settings</span>
        </NavLink>
      </MenuItem>
    </SidebarMenu>
    <LogoutContainer>
      <LogoutButton>
        <i className="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </LogoutButton>
    </LogoutContainer>
  </SidebarContainer>
);

const HeaderComponent = () => (
  <Header>
    <SearchContainer>
      <input type="text" placeholder="Search..." />
      <i className="fas fa-search"></i>
    </SearchContainer>
    <UserInfo>
      <Notifications>
        <i className="far fa-bell"></i>
      </Notifications>
      <User>
        <span>Renee</span>
        <span className="role">CEO</span>
        <Avatar src="/api/placeholder/32/32" alt="User Profile" />
      </User>
    </UserInfo>
  </Header>
);

const ApprovalTable = ({ approvals }) => (
  <div className="approval-section">
    <h2>Approval</h2>
    <div className="filter-tabs">
      <span className="active">ALL APPLICATIONS</span>
      <span>APPLICANT</span>
      <span>APPLICATION TYPE</span>
      <span>DURATION</span>
    </div>
    <table className="approval-table">
      <thead>
        <tr>
          <th>DATE OF APPLICATION</th>
          <th>APPLICANT</th>
          <th>APPLICATION TYPE</th>
          <th>DURATION</th>
        </tr>
      </thead>
      <tbody>
        {approvals.map((approval, index) => (
          <tr key={index}>
            <td>{approval.date}</td>
            <td>
              <div className="applicant-info">
                <span className="name">{approval.name}</span>
                <span className="position">{approval.position}</span>
              </div>
            </td>
            <td>{approval.type}</td>
            <td>{approval.duration}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="status-indicators">
      <div className="status-item">
        <span className="status-dot approved"></span>
        <span>Approved</span>
      </div>
      <div className="status-item">
        <span className="status-dot rejected"></span>
        <span>Rejected</span>
      </div>
      <div className="status-item">
        <span className="status-dot pending"></span>
        <span>Pending</span>
      </div>
    </div>
  </div>
);

const AttendanceChart = ({ attendanceData, currentMonth }) => {
  const COLORS = ['#00A3B5', '#FFB400', '#FF5A5A', '#8CE0C9'];
  
  const totalPresent = attendanceData.reduce((sum, day) => sum + (day.present || 0), 0);
  const totalDays = attendanceData.length;
  const presentPercentage = Math.round((totalPresent / totalDays) * 100);
  
  const pieData = [
    { name: 'Present', value: presentPercentage },
    { name: 'Absent', value: 100 - presentPercentage }
  ];

  return (
    <div className="attendance-statistics">
      <div className="section-header">
        <h2>Attendance Statistics</h2>
        <div className="period-selector">
          <span className="active">MONTHLY</span>
        </div>
      </div>
      
      <div className="charts-container">
        <div className="pie-chart">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-center">
            <div>Today</div>
            <div className="percentage">{presentPercentage}%</div>
          </div>
        </div>
        
        <div className="line-chart">
          <div className="month-selector">
            <button className="prev-month"><i className="fas fa-chevron-left"></i></button>
            <span>{currentMonth} 2022</span>
            <button className="next-month"><i className="fas fa-chevron-right"></i></button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="casual" stroke="#FF8C00" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sick" stroke="#FF5A5A" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="present" stroke="#00A3B5" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="paternity" stroke="#8CE0C9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#00A3B5' }}></span>
          <span>Present</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#FF8C00' }}></span>
          <span>Casual</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#FF5A5A' }}></span>
          <span>Sick</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#8CE0C9' }}></span>
          <span>Paternity</span>
        </div>
      </div>
    </div>
  );
};

const Calendar = ({ month, year }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: '', empty: true });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, empty: false });
  }
  
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        {/* <h3>Personal Calendar</h3> */}
      </div>
      <div className="month-navigation">
        <button className="prev-month"><i className="fas fa-chevron-left"></i></button>
        <span>{monthNames[month]} {year}</span>
        <button className="next-month"><i className="fas fa-chevron-right"></i></button>
      </div>
      <div className="calendar">
        <div className="weekdays">
          {weekdays.map((day, index) => (
            <div key={index} className="weekday">{day}</div>
          ))}
        </div>
        <div className="days">
          {days.map((day, index) => (
            <div 
              key={index} 
              className={`day ${day.empty ? 'empty' : ''} ${(!day.empty && day.day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) ? 'today' : ''}`}
            >
              {day.day}
            </div>
          ))}
        </div>
      </div>
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="dot holiday"></span>
          <span>Don't Holiday</span>
        </div>
        <div className="legend-item">
          <span className="dot leave"></span>
          <span>Leave</span>
        </div>
      </div>
    </div>
  );
};

const WellnessMonitoring = () => {
  const [wellnessData, setWellnessData] = useState({
    totalEnrolled: 156,
    participationTrend: [
      { month: 'Jan', enrolled: 120 },
      { month: 'Feb', enrolled: 132 },
      { month: 'Mar', enrolled: 145 },
      { month: 'Apr', enrolled: 156 }
    ],
    programBreakdown: [
      { name: 'Wellness Programs', value: 45 },
      { name: 'Mental Health', value: 30 },
      { name: 'Fitness Programs', value: 25 }
    ],
    feedbackData: {
      programRatings: [
        { name: 'Wellness Programs', rating: 4.5, responses: 45 },
        { name: 'Mental Health', rating: 4.8, responses: 30 },
        { name: 'Fitness Programs', rating: 4.2, responses: 25 }
      ],
      commonThemes: {
        positive: [
          { text: 'Helpful', count: 35 },
          { text: 'Professional', count: 28 },
          { text: 'Convenient', count: 25 },
          { text: 'Supportive', count: 22 }
        ],
        negative: [
          { text: 'Scheduling', count: 15 },
          { text: 'Availability', count: 12 },
          { text: 'Timing', count: 10 }
        ]
      }
    },
    complianceData: {
      mandatoryPrograms: [
        { name: 'Annual Health Check', target: 100, achieved: 95 },
        { name: 'Mental Health Assessment', target: 100, achieved: 88 },
        { name: 'Stress Management Workshop', target: 100, achieved: 92 }
      ],
      engagementTrend: [
        { month: 'Jan', mentalHealth: 45, wellness: 65, fitness: 55 },
        { month: 'Feb', mentalHealth: 52, wellness: 68, fitness: 58 },
        { month: 'Mar', mentalHealth: 48, wellness: 72, fitness: 62 },
        { month: 'Apr', mentalHealth: 55, wellness: 75, fitness: 65 }
      ],
      resourceUtilization: [
        { resource: 'Mental Health Hotline', usage: 78, total: 100 },
        { resource: 'Wellness Portal', usage: 85, total: 100 },
        { resource: 'Fitness Center', usage: 65, total: 100 },
        { resource: 'Counseling Services', usage: 72, total: 100 }
      ]
    }
  });

  const [filters, setFilters] = useState({
    timePeriod: 'month',
    programType: 'all',
    department: 'all'
  });

  const timePeriods = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' }
  ];

  const programTypes = [
    { value: 'all', label: 'All Programs' },
    { value: 'wellness', label: 'Wellness Programs' },
    { value: 'mental', label: 'Mental Health' },
    { value: 'fitness', label: 'Fitness Programs' }
  ];

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'Human Resources' }
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const COLORS = ['#4C9F9F', '#2C3E50', '#A5D8D0'];

  const renderStarRating = (rating) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) => (
          <i 
            key={index}
            className={`fas fa-star ${index < Math.floor(rating) ? 'filled' : index < rating ? 'half-filled' : ''}`}
          />
        ))}
        <span className="rating-value">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="wellness-monitoring">
      <div className="section-header">
        <div className="header-content">
          <h2>
            <i className="fas fa-heartbeat"></i>
            Wellness & Mental Health Monitoring
          </h2>
          <div className="data-privacy-notice">
            <i className="fas fa-shield-alt"></i>
          </div>
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label>
              <i className="fas fa-calendar"></i>
              Time Period
            </label>
            <select 
              value={filters.timePeriod}
              onChange={(e) => handleFilterChange('timePeriod', e.target.value)}
            >
              {timePeriods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>
              <i className="fas fa-list"></i>
              Program Type
            </label>
            <select 
              value={filters.programType}
              onChange={(e) => handleFilterChange('programType', e.target.value)}
            >
              {programTypes.map(program => (
                <option key={program.value} value={program.value}>
                  {program.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>
              <i className="fas fa-users"></i>
              Department
            </label>
            <select 
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>Total Enrolled</h3>
            <div className="stat-value">{wellnessData.totalEnrolled}</div>
            <div className="stat-label">Employees</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-content">
            <h3>Average Engagement</h3>
            <div className="stat-value">78%</div>
            <div className="stat-label">Last 30 Days</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="stat-content">
            <h3>Overall Satisfaction</h3>
            <div className="stat-value">4.5</div>
            <div className="stat-label">Out of 5.0</div>
          </div>
        </div>
      </div>

      <div className="wellness-charts">
        <div className="participation-trend">
          <h3>Participation Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={wellnessData.participationTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="enrolled" 
                stroke="#4C9F9F" 
                strokeWidth={2} 
                dot={{ fill: '#4C9F9F' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="program-breakdown">
          <h3>Program Type Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={wellnessData.programBreakdown}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {wellnessData.programBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="feedback-section">
        <h3>Program Feedback & Ratings</h3>
        <div className="feedback-content">
          <div className="ratings-overview">
            <h4>Program Ratings</h4>
            <div className="ratings-list">
              {wellnessData.feedbackData.programRatings.map((program, index) => (
                <div key={index} className="rating-item">
                  <div className="program-name">{program.name}</div>
                  {renderStarRating(program.rating)}
                  <div className="response-count">{program.responses} responses</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="feedback-themes">
            <div className="theme-section positive">
              <h4>Positive Themes</h4>
              <div className="theme-cloud">
                {wellnessData.feedbackData.commonThemes.positive.map((theme, index) => (
                  <span 
                    key={index} 
                    className="theme-tag"
                    style={{ 
                      fontSize: `${Math.max(0.8, theme.count / 10)}rem`,
                      opacity: Math.max(0.6, theme.count / 35)
                    }}
                  >
                    {theme.text}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="theme-section negative">
              <h4>Areas for Improvement</h4>
              <div className="theme-cloud">
                {wellnessData.feedbackData.commonThemes.negative.map((theme, index) => (
                  <span 
                    key={index} 
                    className="theme-tag"
                    style={{ 
                      fontSize: `${Math.max(0.8, theme.count / 10)}rem`,
                      opacity: Math.max(0.6, theme.count / 35)
                    }}
                  >
                    {theme.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="compliance-section">
        <h3>Compliance & Engagement Tracking</h3>
        
        <div className="compliance-grid">
          <div className="compliance-overview">
            <h4>Mandatory Program Compliance</h4>
            <div className="compliance-list">
              {wellnessData.complianceData.mandatoryPrograms.map((program, index) => (
                <div key={index} className="compliance-item">
                  <div className="program-info">
                    <span className="program-name">{program.name}</span>
                    <span className="compliance-rate">
                      {program.achieved}% / {program.target}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(program.achieved / program.target) * 100}%`,
                        backgroundColor: program.achieved >= 90 ? '#4CAF50' : 
                                       program.achieved >= 80 ? '#FFB400' : '#FF5A5A'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="engagement-trend">
            <h4>Resource Engagement Trend</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={wellnessData.complianceData.engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="mentalHealth" 
                  name="Mental Health" 
                  stroke="#4C9F9F" 
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="wellness" 
                  name="Wellness" 
                  stroke="#2C3E50" 
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="fitness" 
                  name="Fitness" 
                  stroke="#A5D8D0" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="resource-utilization">
            <h4>Resource Utilization</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={wellnessData.complianceData.resourceUtilization}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="resource" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="usage" 
                  name="Utilization Rate" 
                  fill="#4C9F9F"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="data-export">
        <button className="export-button">
          <i className="fas fa-download"></i>
          Export Report
        </button>
        <div className="export-info">
          <i className="fas fa-info-circle"></i>
          <span>Reports contain aggregated data only</span>
        </div>
      </div>
    </div>
  );
};

const PayrollOverview = () => {
  const [payrollData, setPayrollData] = useState({
    complianceStatus: {
      taxFiling: { status: 'compliant', lastUpdated: '2024-03-15' },
      socialSecurity: { status: 'compliant', lastUpdated: '2024-03-15' },
      benefits: { status: 'compliant', lastUpdated: '2024-03-15' },
      insurance: { status: 'pending', lastUpdated: '2024-03-10' }
    },
    salaryTrends: [
      { month: 'Jan', baseSalary: 450000, bonuses: 75000, deductions: 120000 },
      { month: 'Feb', baseSalary: 450000, bonuses: 85000, deductions: 125000 },
      { month: 'Mar', baseSalary: 460000, bonuses: 90000, deductions: 130000 },
      { month: 'Apr', baseSalary: 460000, bonuses: 95000, deductions: 132000 }
    ],
    departmentBreakdown: [
      { department: 'Engineering', avgSalary: 85000, headcount: 45 },
      { department: 'Marketing', avgSalary: 75000, headcount: 25 },
      { department: 'Sales', avgSalary: 95000, headcount: 30 },
      { department: 'HR', avgSalary: 70000, headcount: 15 }
    ],
    auditLogs: [
      { date: '2024-03-15', action: 'Salary Update', user: 'HR Admin', details: 'Annual salary review completed' },
      { date: '2024-03-14', action: 'Bonus Payment', user: 'Payroll Manager', details: 'Q1 bonuses processed' },
      { date: '2024-03-13', action: 'Tax Update', user: 'Finance Team', details: 'Tax rates updated for new fiscal year' },
      { date: '2024-03-12', action: 'Deduction Change', user: 'HR Admin', details: 'Updated insurance deductions' }
    ]
  });

  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-03-31' });

  const reportTypes = [
    { id: 'overview', label: 'Overview' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'trends', label: 'Salary Trends' },
    { id: 'audit', label: 'Audit Logs' }
  ];

  const getComplianceStatusColor = (status) => {
    switch (status) {
      case 'compliant': return '#4CAF50';
      case 'pending': return '#FFB400';
      case 'non-compliant': return '#FF5A5A';
      default: return '#666';
    }
  };

  return (
    <div className="payroll-overview">
      <div className="section-header">
        <div className="header-content">
          <h2>
            <i className="fas fa-money-check-alt"></i>
            Payroll Overview
          </h2>
          <div className="date-range-picker">
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <span>to</span>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>

        <div className="report-tabs">
          {reportTypes.map(report => (
            <button
              key={report.id}
              className={`report-tab ${selectedReport === report.id ? 'active' : ''}`}
              onClick={() => setSelectedReport(report.id)}
            >
              {report.label}
            </button>
          ))}
        </div>
      </div>

      <div className="payroll-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-file-invoice-dollar"></i>
          </div>
          <div className="stat-content">
            <h3>Total Payroll</h3>
            <div className="stat-value">$1.2M</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>Compliance Status</h3>
            <div className="stat-value">75%</div>
            <div className="stat-label">All Requirements Met</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>Active Employees</h3>
            <div className="stat-value">115</div>
            <div className="stat-label">On Payroll</div>
          </div>
        </div>
      </div>

      <div className="payroll-content">
        <div className="compliance-grid">
          <div className="compliance-card">
            <h3>Compliance Status</h3>
            <div className="compliance-list">
              {Object.entries(payrollData.complianceStatus).map(([key, value]) => (
                <div key={key} className="compliance-item">
                  <div className="compliance-info">
                    <span className="compliance-name">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="compliance-date">Last Updated: {value.lastUpdated}</span>
                  </div>
                  <div 
                    className="compliance-status"
                    style={{ backgroundColor: getComplianceStatusColor(value.status) }}
                  >
                    {value.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="salary-trends">
            <h3>Salary Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={payrollData.salaryTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="baseSalary" 
                  name="Base Salary" 
                  stroke="#4C9F9F" 
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="bonuses" 
                  name="Bonuses" 
                  stroke="#2C3E50" 
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="deductions" 
                  name="Deductions" 
                  stroke="#A5D8D0" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="department-breakdown">
            <h3>Department Salary Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={payrollData.departmentBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="avgSalary" 
                  name="Average Salary" 
                  fill="#4C9F9F"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="audit-logs">
            <h3>Recent Audit Logs</h3>
            <div className="audit-list">
              {payrollData.auditLogs.map((log, index) => (
                <div key={index} className="audit-item">
                  <div className="audit-header">
                    <span className="audit-date">{log.date}</span>
                    <span className="audit-action">{log.action}</span>
                  </div>
                  <div className="audit-details">
                    <span className="audit-user">{log.user}</span>
                    <span className="audit-description">{log.details}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="report-actions">
        <button className="export-button">
          <i className="fas fa-download"></i>
          Export Payroll Report
        </button>
        <button className="audit-button">
          <i className="fas fa-history"></i>
          View Full Audit Log
        </button>
      </div>
    </div>
  );
};

const RemoteWorkManagement = () => {
  const [remoteData, setRemoteData] = useState({
    timeTracking: {
      totalHours: 1245,
      dailyHours: [
        { day: 'Mon', hours: 8.5, target: 8 },
        { day: 'Tue', hours: 7.8, target: 8 },
        { day: 'Wed', hours: 8.2, target: 8 },
        { day: 'Thu', hours: 8.0, target: 8 },
        { day: 'Fri', hours: 7.5, target: 8 }
      ],
      weeklyProgress: 80
    },
    productivityMetrics: {
      tasksCompleted: 156,
      projectHours: [
        { project: 'Project A', hours: 45, target: 60 },
        { project: 'Project B', hours: 32, target: 40 },
        { project: 'Project C', hours: 28, target: 35 }
      ],
      goalProgress: [
        { employee: 'John Doe', progress: 85, target: 100 },
        { employee: 'Jane Smith', progress: 92, target: 100 },
        { employee: 'Mike Johnson', progress: 78, target: 100 }
      ]
    },
    collaborationTools: [
      { name: 'Slack', status: 'active', lastUsed: '2 mins ago' },
      { name: 'Zoom', status: 'active', lastUsed: '5 mins ago' },
      { name: 'Microsoft Teams', status: 'active', lastUsed: '10 mins ago' }
    ],
    managerFeedback: [
      {
        employee: 'John Doe',
        rating: 4.5,
        feedback: 'Excellent work on the project deliverables. Great communication skills.',
        date: '2024-03-15'
      },
      {
        employee: 'Jane Smith',
        rating: 5.0,
        feedback: 'Outstanding performance. Consistently meets deadlines.',
        date: '2024-03-14'
      }
    ]
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  const timeRanges = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const renderStarRating = (rating) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) => (
          <i 
            key={index}
            className={`fas fa-star ${index < Math.floor(rating) ? 'filled' : index < rating ? 'half-filled' : ''}`}
          />
        ))}
        <span className="rating-value">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="remote-work-management">
      <div className="section-header">
        <div className="header-content">
          <h2>
            <i className="fas fa-laptop-house"></i>
            Remote Work Management
          </h2>
          <div className="time-range-selector">
            {timeRanges.map(range => (
              <button
                key={range.value}
                className={`time-range-btn ${timeRange === range.value ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange(range.value)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>Total Remote Hours</h3>
            <div className="stat-value">{remoteData.timeTracking.totalHours}</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-tasks"></i>
          </div>
          <div className="stat-content">
            <h3>Tasks Completed</h3>
            <div className="stat-value">{remoteData.productivityMetrics.tasksCompleted}</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="stat-content">
            <h3>Productivity Score</h3>
            <div className="stat-value">85%</div>
            <div className="stat-label">Team Average</div>
          </div>
        </div>
      </div>

      <div className="remote-work-grid">
        <div className="time-tracking">
          <h3>Daily Work Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={remoteData.timeTracking.dailyHours}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="hours" 
                name="Hours Worked" 
                fill="#4C9F9F"
                radius={[4, 4, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                name="Target Hours" 
                stroke="#2C3E50" 
                strokeWidth={2}
                dot={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="project-hours">
          <h3>Project Hours Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={remoteData.productivityMetrics.projectHours}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="project" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="hours" 
                name="Hours Spent" 
                fill="#4C9F9F"
                radius={[4, 4, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                name="Target Hours" 
                stroke="#2C3E50" 
                strokeWidth={2}
                dot={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="collaboration-tools">
          <h3>Collaboration Tools</h3>
          <div className="tools-grid">
            {remoteData.collaborationTools.map((tool, index) => (
              <div key={index} className="tool-card">
                <div className="tool-icon">
                  <i className={`fab fa-${tool.name.toLowerCase()}`}></i>
                </div>
                <div className="tool-info">
                  <h4>{tool.name}</h4>
                  <span className={`status ${tool.status}`}>{tool.status}</span>
                  <span className="last-used">Last used: {tool.lastUsed}</span>
                </div>
                <button className="connect-btn">Connect</button>
              </div>
            ))}
          </div>
        </div>

        <div className="manager-feedback">
          <h3>Manager Feedback</h3>
          <div className="feedback-list">
            {remoteData.managerFeedback.map((feedback, index) => (
              <div key={index} className="feedback-card">
                <div className="feedback-header">
                  <div className="employee-info">
                    <h4>{feedback.employee}</h4>
                    <span className="date">{feedback.date}</span>
                  </div>
                  {renderStarRating(feedback.rating)}
                </div>
                <p className="feedback-text">{feedback.feedback}</p>
                <div className="feedback-actions">
                  <button className="edit-btn">
                    <i className="fas fa-edit"></i>
                    Edit
                  </button>
                  <button className="delete-btn">
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="add-feedback-btn">
            <i className="fas fa-plus"></i>
            Add New Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [approvals, setApprovals] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadApprovals = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/applications');
        const data = await res.json();
        const formatDate = (d) => {
          const dt = new Date(d);
          const mm = String(dt.getMonth() + 1).padStart(2, '0');
          const dd = String(dt.getDate()).padStart(2, '0');
          const yyyy = dt.getFullYear();
          return `${mm}/${dd}/${yyyy}`;
        };
        const monthShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const daysBetween = (a, b) => Math.max(0, Math.round((b - a) / (1000*60*60*24)));
        const today = new Date();
        const mapped = data.slice(0, 6).map(app => {
          const created = new Date(app.createdAt);
          const dd = String(created.getDate()).padStart(2, '0');
          const mon = monthShort[created.getMonth()];
          const pendingDays = String(daysBetween(created, today)).padStart(2, '0');
          return {
            date: formatDate(created),
            name: app.name,
            position: app.job?.title || 'N/A',
            type: (app.status || 'pending').replace(/^./, c => c.toUpperCase()),
            duration: `${pendingDays} (${dd} ${mon})`
          };
        });
        setApprovals(mapped);
      } catch (e) {
        setApprovals([]);
      }
    };
    
    const generateAttendanceData = () => {
      const data = [];
      for (let i = 1; i <= 30; i++) {
        data.push({
          day: i,
          present: Math.floor(Math.random() * 50) + 50,
          casual: Math.floor(Math.random() * 20),
          sick: Math.floor(Math.random() * 15),
          paternity: Math.floor(Math.random() * 10),
        });
      }
      return data;
    };

    loadApprovals();
    setAttendanceData(generateAttendanceData());
    setLoading(false);
  }, []);
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <DashboardGrid>
        <GridItem className="calendar">
          {(() => { const now = new Date(); return <Calendar month={now.getMonth()} year={now.getFullYear()} />; })()}
        </GridItem>
        <GridItem className="approvals">
          <ApprovalTable approvals={approvals} />
        </GridItem>
        <GridItem className="wellness">
          <WellnessMonitoring />
        </GridItem>
        <GridItem className="payroll">
          <PayrollOverview />
        </GridItem>
        <GridItem className="remote-work">
          <RemoteWorkManagement />
        </GridItem>
        <GridItem className="attendance">
          <AttendanceChart 
            attendanceData={attendanceData} 
            currentMonth="Sep"
          />
        </GridItem>
      </DashboardGrid>
    </div>
  );
};

const Layout = ({ children }) => (
  <AppContainer>
    <Sidebar />
    <MainContent>
      <HeaderComponent />
      <Content>
        {children}
      </Content>
    </MainContent>
  </AppContainer>
);

const HRDashboard = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* Recruitment Routes */}
        <Route path="/hr/job-postings" element={<JobPostingsDashboard />} />
        <Route path="/hr/candidate-applications" element={<CandidateApplicationManagement />} />

        <Route path="/hr/interview-scheduling" element={<InterviewSchedulingInterface />} />
        <Route path="/meetings" element={<Meeting />} />
        <Route path="/hr/interview-feedback" element={<InterviewFeedbackRecording />} />
        <Route path="/hr/offer-letters" element={<OfferLetterGeneration />} />
        
        {/* Employee Management Routes */}
        <Route path="/employee/database" element={<EmployeeDatabaseManagement />} />
        <Route path="/employee/classification" element={<EmployeeClassification />} />
              
        {/* Payroll Routes */}
        <Route path="/payroll/salary-calculation" element={<SalaryCalculation />} />
        <Route path="/payroll/payslip-generation" element={<PayslipGeneration />} />
        <Route path="/employee/payroll-tax" element={<PayrollTaxManagement />} />
        
        {/* Additional Feature Routes */}
        <Route path="/remote-work/wellness-fitness" element={<WellnessFitnessDashboard />} />
        <Route path="/remote-work/hours-tracker" element={<RemoteWorkHoursTracker />} />
        <Route path="/settings" element={<div>System Settings Page</div>} />
      </Routes>
    </Layout>
  );
};

export default HRDashboard; 