import React, { useState, useEffect } from 'react';
import './RemoteWorkHoursTracker.css';
import {
  FaClock,
  FaCalendarAlt,
  FaUserTie,
  FaBuilding,
  FaFileAlt,
  FaPlay,
  FaPause,
  FaStop,
  FaCheck
} from 'react-icons/fa';
import { EmployerSideBar } from '../dashboard/EmployeeDashboard';
import { Sidebar } from '../dashboard/HRDashboard';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const RemoteWorkHoursTracker = () => {
  const { user } = useAuth();

  // Determine which sidebar to use based on user role
  const SidebarComponent = user?.role === 'hr' ? Sidebar : EmployerSideBar;
  const [notification, setNotification] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [totalHours, setTotalHours] = useState(0);
  const [sessionStatus, setSessionStatus] = useState('inactive');

  // Admin reporting states
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isWorkHoursCollapsed, setIsWorkHoursCollapsed] = useState(false);
  const [isReportingCollapsed, setIsReportingCollapsed] = useState(false);

  // Add session progress tracking
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employeeSessions, setEmployeeSessions] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load active session and sessions on component mount
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      loadActiveSession();
      if (user.role === 'hr') {
        loadEmployees();
        loadAllSessions();
      } else {
        loadEmployeeSessions();
      }
    }
  }, [user]);

  // Reload sessions when date changes
  useEffect(() => {
    if (user?.role === 'hr') {
      loadAllSessions();
    } else if (user) {
      loadEmployeeSessions();
    }
  }, [selectedDate]);

  // Load active session for employee
  const loadActiveSession = async () => {
    try {
      const response = await api.get('/work-sessions/active');
      if (response.data.session) {
        const session = response.data.session;
        setCurrentSession({
          id: session._id,
          startTime: new Date(session.startTime).toLocaleTimeString(),
          breaks: session.breaks.map(b => ({
            start: new Date(b.startTime).toLocaleTimeString(),
            end: b.endTime ? new Date(b.endTime).toLocaleTimeString() : null,
            duration: b.duration
          })),
          currentBreak: session.currentBreak ? new Date(session.currentBreak).toLocaleTimeString() : null
        });
        setIsTracking(true);
        setSessionStatus(session.status);
      }
    } catch (error) {
      console.error('Error loading active session:', error);
    }
  };

  // Load employee sessions
  const loadEmployeeSessions = async () => {
    try {
      const response = await api.get('/work-sessions/my-sessions', {
        params: { date: selectedDate }
      });
      setEmployeeSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error loading employee sessions:', error);
    }
  };

  // Load all sessions for HR
  const loadAllSessions = async () => {
    try {
      const response = await api.get('/work-sessions/all', {
        params: { date: selectedDate }
      });
      setAllSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error loading all sessions:', error);
    }
  };

  // Load employees for HR dashboard
  const loadEmployees = async () => {
    try {
      const response = await api.get('/users/employees');
      if (response.data.success) {
        setEmployees(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };



  // Calculate total hours worked
  const calculateTotalHours = (startTime, endTime, breaks) => {
    if (!startTime || !endTime) return 0;

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const totalMinutes = (end - start) / (1000 * 60);
    const breakMinutes = breaks.reduce((total, b) => total + b.duration, 0);
    return ((totalMinutes - breakMinutes) / 60).toFixed(2);
  };

  // Update total hours every minute when tracking is active
  useEffect(() => {
    let interval;
    if (isTracking && currentSession) {
      interval = setInterval(() => {
        const now = new Date();
        const currentTime = now.toLocaleTimeString();
        const hours = calculateTotalHours(
          currentSession.startTime,
          currentTime,
          currentSession.breaks
        );
        setTotalHours(hours);
      }, 60000); // Update every minute
    }
    return () => clearInterval(interval);
  }, [isTracking, currentSession]);

  // Update session progress
  useEffect(() => {
    let interval;
    if (isTracking && currentSession) {
      interval = setInterval(() => {
        const now = new Date();
        const start = new Date(`2000-01-01T${currentSession.startTime}`);
        const current = new Date(`2000-01-01T${now.toLocaleTimeString()}`);
        const totalMinutes = (current - start) / (1000 * 60);
        const breakMinutes = currentSession.breaks.reduce((total, b) => total + b.duration, 0);
        const productiveMinutes = totalMinutes - breakMinutes;
        setSessionProgress(Math.min((productiveMinutes / (8 * 60)) * 100, 100)); // 8-hour workday
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, currentSession]);

  const handleStartTracking = async () => {
    if (isTracking) {
      setNotification({
        type: 'error',
        message: 'A session is already active. Please end the current session before starting a new one.'
      });
      return;
    }

    try {
      const response = await api.post('/work-sessions/start');
      const session = response.data.session;

      setCurrentSession({
        id: session._id,
        startTime: new Date(session.startTime).toLocaleTimeString(),
        breaks: []
      });
      setIsTracking(true);
      setSessionStatus('active');
      setNotification({
        type: 'success',
        message: 'Work hours tracking started'
      });
    } catch (error) {
      console.error('Error starting tracking:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to start tracking'
      });
    }
  };

  const handleEndTracking = async () => {
    if (!currentSession) {
      setNotification({
        type: 'error',
        message: 'No active session to end'
      });
      return;
    }

    try {
      const response = await api.put(`/work-sessions/${currentSession.id}/end`);
      const session = response.data.session;

      setTotalHours(session.totalHours);
      setNotification({
        type: 'success',
        message: `Work hours tracking ended. Total: ${session.totalHours}h, Productive: ${session.productiveHours}h`
      });
      setIsTracking(false);
      setSessionStatus('completed');
      setCurrentSession(null);

      // Reload sessions
      if (user.role === 'hr') {
        loadAllSessions();
      } else {
        loadEmployeeSessions();
      }
    } catch (error) {
      console.error('Error ending tracking:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to end tracking'
      });
    }
  };

  const handleBreak = async () => {
    if (!isTracking || !currentSession) {
      setNotification({
        type: 'error',
        message: 'No active session to take a break from'
      });
      return;
    }

    if (currentSession.currentBreak) {
      setNotification({
        type: 'error',
        message: 'You are already on a break'
      });
      return;
    }

    try {
      const response = await api.put(`/work-sessions/${currentSession.id}/break/start`);
      const session = response.data.session;

      setCurrentSession(prev => ({
        ...prev,
        currentBreak: new Date(session.currentBreak).toLocaleTimeString()
      }));
      setSessionStatus('on-break');
      setNotification({
        type: 'success',
        message: 'Break started'
      });
    } catch (error) {
      console.error('Error starting break:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to start break'
      });
    }
  };

  const handleEndBreak = async () => {
    if (!isTracking || !currentSession || !currentSession.currentBreak) {
      setNotification({
        type: 'error',
        message: 'No active break to end'
      });
      return;
    }

    try {
      const response = await api.put(`/work-sessions/${currentSession.id}/break/end`);
      const session = response.data.session;

      setCurrentSession(prev => ({
        ...prev,
        breaks: session.breaks.map(b => ({
          start: new Date(b.startTime).toLocaleTimeString(),
          end: new Date(b.endTime).toLocaleTimeString(),
          duration: b.duration
        })),
        currentBreak: null
      }));
      setSessionStatus('active');
      setNotification({
        type: 'success',
        message: 'Break ended'
      });
    } catch (error) {
      console.error('Error ending break:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to end break'
      });
    }
  };

  const generateReport = async () => {
    try {
      setLoadingReport(true);

      // Build query parameters
      const params = {
        startDate: dateRange.start,
        endDate: dateRange.end
      };

      if (selectedDepartment !== 'all') {
        params.department = selectedDepartment;
      }

      if (selectedEmployee !== 'all') {
        params.employeeId = selectedEmployee;
      }

      const response = await api.get('/work-sessions/report', { params });

      setReportData(response.data);
      setNotification({
        type: 'success',
        message: `Report generated successfully! Total Sessions: ${response.data.summary.totalSessions}, Total Hours: ${response.data.summary.totalHours.toFixed(2)}h`
      });
    } catch (error) {
      console.error('Error generating report:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to generate report'
      });
    } finally {
      setLoadingReport(false);
    }
  };

  // Helper function to get employee session for selected date
  const getEmployeeSession = (employeeId) => {
    return allSessions.find(session =>
      session.employeeId === employeeId || session.employeeId._id === employeeId
    );
  };

  const departments = [...new Set(employees.map(emp => emp.department))];

  if (!isAuthenticated) {
    return (
      <>
        <SidebarComponent />
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to access the Remote Work Hours Tracker.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SidebarComponent />
      <div className="remote-work-hours-tracker">
        <div className="tracker-header">
          <h1>Remote Work Hours Tracker</h1>
          <div className="header-actions">
            <div className="date-picker-wrapper">
              {/* <FaCalendarAlt className="icon" /> */}
              {/* <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-picker"
              /> */}
            </div>
          </div>
        </div>

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="tracker-content">
          {user?.role !== 'hr' ? (
            <div className="employee-dashboard">
              <div className={`work - hours - summary ${isWorkHoursCollapsed ? 'collapsed' : ''}`}>
                <div
                  className="section-header"
                  onClick={() => setIsWorkHoursCollapsed(!isWorkHoursCollapsed)}
                >
                  <h2>Today's Work Hours</h2>
                  <span className="collapse-icon">
                    {isWorkHoursCollapsed ? '▼' : '▲'}
                  </span>
                </div>
                {!isWorkHoursCollapsed && (
                  <>
                    <div className="session-status">
                      <span className={`status - indicator ${sessionStatus}`}></span>
                      <span className="status-text">
                        {sessionStatus === 'active' ? 'Tracking Active' :
                          sessionStatus === 'on-break' ? 'On Break' :
                            sessionStatus === 'completed' ? 'Session Completed' :
                              'No Active Session'}
                      </span>
                    </div>
                    {currentSession && (
                      <div className="session-progress">
                        <div
                          className="progress-bar"
                          style={{ width: `${sessionProgress} % ` }}
                        ></div>
                        <span className="progress-text">{sessionProgress.toFixed(1)}% of workday</span>
                      </div>
                    )}
                    {currentSession ? (
                      <div className="current-session-details">
                        <div className="session-info">
                          <span>
                            <FaClock className="icon" />
                            Start Time: {currentSession.startTime}
                          </span>
                          <span>
                            <FaPlay className="icon" />
                            Status: {currentSession.currentBreak ? 'On Break' : 'Working'}
                          </span>
                          <span>
                            <FaCheck className="icon" />
                            Total Hours: {totalHours}
                          </span>
                        </div>
                        {currentSession.breaks.length > 0 && (
                          <div className="breaks-list">
                            <h3>
                              <FaPause className="icon" />
                              Breaks
                            </h3>
                            {currentSession.breaks.map((break_, index) => (
                              <div key={index} className="break-item">
                                <span>{break_.start} - {break_.end}</span>
                                <span>{break_.duration} minutes</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="no-tracking-message">No active tracking session</p>
                    )}
                  </>
                )}
              </div>

              <div className="tracking-controls">
                {!isTracking ? (
                  <button
                    className={`start - tracking - button ${isMobile ? 'mobile-fab' : ''}`}
                    onClick={handleStartTracking}
                  >
                    <FaPlay className="icon" />
                    Start Tracking
                  </button>
                ) : (
                  <div className="tracking-actions">
                    <div className="current-session">
                      <span>
                        <FaClock className="icon" />
                        Started at: {currentSession?.startTime}
                      </span>
                      {currentSession?.currentBreak && (
                        <span>
                          <FaPause className="icon" />
                          On break since: {currentSession.currentBreak}
                        </span>
                      )}
                    </div>
                    <div className="action-buttons">
                      {!currentSession?.currentBreak ? (
                        <button
                          className="break-button"
                          onClick={handleBreak}
                        >
                          <FaPause className="icon" />
                          Take Break
                        </button>
                      ) : (
                        <button
                          className="end-break-button"
                          onClick={handleEndBreak}
                        >
                          <FaPlay className="icon" />
                          End Break
                        </button>
                      )}
                      <button
                        className="end-tracking-button"
                        onClick={handleEndTracking}
                      >
                        <FaStop className="icon" />
                        End Tracking
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="admin-dashboard">
              <div className={`reporting - section ${isReportingCollapsed ? 'collapsed' : ''}`}>
                <div
                  className="section-header"
                  onClick={() => setIsReportingCollapsed(!isReportingCollapsed)}
                >
                  <h2>
                    <FaFileAlt className="icon" />
                    Generate Reports
                  </h2>
                  <span className="collapse-icon">
                    {isReportingCollapsed ? '▼' : '▲'}
                  </span>
                </div>
                {!isReportingCollapsed && (
                  <div className="report-filters">
                    <div className="filter-group">
                      <label>
                        <FaFileAlt className="icon" />
                        Report Type
                      </label>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        <option value="daily">Daily Report</option>
                        <option value="weekly">Weekly Report</option>
                        <option value="monthly">Monthly Report</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>
                        <FaCalendarAlt className="icon" />
                        Date Range
                      </label>
                      <div className="date-range-inputs">
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

                    <div className="filter-group">
                      <label>
                        <FaBuilding className="icon" />
                        Department
                      </label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                      >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>
                        <FaUserTie className="icon" />
                        Employee
                      </label>
                      <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                      >
                        <option value="all">All Employees</option>
                        {employees
                          .filter(emp => selectedDepartment === 'all' || emp.department === selectedDepartment)
                          .map(emp => (
                            <option key={emp._id} value={emp._id}>{emp.username}</option>
                          ))}
                      </select>
                    </div>

                    <button
                      className="generate-report-button"
                      onClick={generateReport}
                    >
                      <FaFileAlt className="icon" />
                      Generate Report
                    </button>
                  </div>
                )}
              </div>

              <div className="employees-list">
                <h2>Employee Work Hours</h2>
                <div className="employees-grid">
                  {employees.map(employee => {
                    const session = getEmployeeSession(employee._id);
                    return (
                      <div key={employee._id} className="employee-card">
                        <div className="employee-info">
                          <h3>{employee.username}</h3>
                          <span>{employee.department || 'No Department'}</span>
                        </div>
                        {session ? (
                          <div className="work-hours-details">
                            <div className="hours-info">
                              <span>Login: {new Date(session.startTime).toLocaleTimeString()}</span>
                              <span>Logout: {session.endTime ? new Date(session.endTime).toLocaleTimeString() : 'In Progress'}</span>
                            </div>
                            <div className="hours-summary">
                              <span>Total Hours: {session.totalHours || 0}h</span>
                              <span>Productive Hours: {session.productiveHours || 0}h</span>
                            </div>
                            {session.breaks && session.breaks.length > 0 && (
                              <div className="breaks-list">
                                <h4>Breaks</h4>
                                {session.breaks.map((break_, index) => (
                                  <div key={index} className="break-item">
                                    <span>{new Date(break_.startTime).toLocaleTimeString()} - {break_.endTime ? new Date(break_.endTime).toLocaleTimeString() : 'Ongoing'}</span>
                                    <span>{break_.duration} minutes</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="no-session">
                            <p>No work session for this date</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RemoteWorkHoursTracker; 