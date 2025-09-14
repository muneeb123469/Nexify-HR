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

const RemoteWorkHoursTracker = () => {
  const [isAdmin, setIsAdmin] = useState(false);
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
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isWorkHoursCollapsed, setIsWorkHoursCollapsed] = useState(false);
  const [isReportingCollapsed, setIsReportingCollapsed] = useState(false);

  // Add session progress tracking
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    // Replace with your actual authentication check
    const checkAuth = async () => {
      try {
        // Simulate authentication check
        const isAuth = true; // Replace with actual auth check
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('Authentication error:', error);
        setNotification({
          type: 'error',
          message: 'Authentication failed. Please log in again.'
        });
      }
    };
    checkAuth();
  }, []);

  // Sample data - replace with actual data from your backend
  const employees = [
    {
      id: 1,
      name: 'John Doe',
      department: 'Engineering',
      workHours: {
        '2024-03-20': {
          loginTime: '09:00',
          logoutTime: '17:30',
          breaks: [
            { start: '12:00', end: '13:00', duration: 60 }
          ],
          totalHours: 7.5,
          productiveHours: 6.5
        }
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      department: 'Design',
      workHours: {
        '2024-03-20': {
          loginTime: '08:45',
          logoutTime: '17:15',
          breaks: [
            { start: '12:00', end: '13:00', duration: 60 },
            { start: '15:00', end: '15:15', duration: 15 }
          ],
          totalHours: 7.5,
          productiveHours: 6.25
        }
      }
    }
  ];

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

  const handleStartTracking = () => {
    if (isTracking) {
      setNotification({
        type: 'error',
        message: 'A session is already active. Please end the current session before starting a new one.'
      });
      return;
    }

    const now = new Date();
    setCurrentSession({
      startTime: now.toLocaleTimeString(),
      breaks: []
    });
    setIsTracking(true);
    setSessionStatus('active');
    setNotification({
      type: 'success',
      message: 'Work hours tracking started'
    });
  };

  const handleEndTracking = () => {
    if (!currentSession) {
      setNotification({
        type: 'error',
        message: 'No active session to end'
      });
      return;
    }

    const now = new Date();
    const endTime = now.toLocaleTimeString();
    
    // Validate session duration
    const start = new Date(`2000-01-01T${currentSession.startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const totalMinutes = (end - start) / (1000 * 60);
    
    if (totalMinutes < 1) {
      setNotification({
        type: 'error',
        message: 'Session duration is too short. Please ensure you have worked for at least 1 minute.'
      });
      return;
    }

    const breakMinutes = currentSession.breaks.reduce((total, b) => total + b.duration, 0);
    const productiveMinutes = totalMinutes - breakMinutes;
    
    if (productiveMinutes < 0) {
      setNotification({
        type: 'error',
        message: 'Invalid session: Break duration exceeds total session duration'
      });
      return;
    }

    setTotalHours(calculateTotalHours(currentSession.startTime, endTime, currentSession.breaks));
    setNotification({
      type: 'success',
      message: 'Work hours tracking ended'
    });
    setIsTracking(false);
    setSessionStatus('completed');
    setCurrentSession(null);
  };

  const handleBreak = () => {
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

    const now = new Date();
    const breakStart = now.toLocaleTimeString();
    
    setCurrentSession(prev => ({
      ...prev,
      currentBreak: breakStart
    }));
    setSessionStatus('on-break');
    setNotification({
      type: 'success',
      message: 'Break started'
    });
  };

  const handleEndBreak = () => {
    if (!isTracking || !currentSession || !currentSession.currentBreak) {
      setNotification({
        type: 'error',
        message: 'No active break to end'
      });
      return;
    }

    const now = new Date();
    const breakEnd = now.toLocaleTimeString();
    
    // Calculate break duration
    const start = new Date(`2000-01-01T${currentSession.currentBreak}`);
    const end = new Date(`2000-01-01T${breakEnd}`);
    const duration = Math.round((end - start) / (1000 * 60));

    if (duration < 1) {
      setNotification({
        type: 'error',
        message: 'Break duration is too short. Please ensure you have taken a break of at least 1 minute.'
      });
      return;
    }

    setCurrentSession(prev => ({
      ...prev,
      breaks: [...prev.breaks, { start: prev.currentBreak, end: breakEnd, duration }],
      currentBreak: null
    }));
    setSessionStatus('active');
    setNotification({
      type: 'success',
      message: 'Break ended'
    });
  };

  const generateReport = () => {
    // Filter employees based on selected criteria
    const filteredEmployees = employees.filter(employee => {
      const departmentMatch = selectedDepartment === 'all' || employee.department === selectedDepartment;
      const employeeMatch = selectedEmployee === 'all' || employee.id === parseInt(selectedEmployee);
      return departmentMatch && employeeMatch;
    });

    // Generate report data
    const reportData = filteredEmployees.map(employee => ({
      name: employee.name,
      department: employee.department,
      workHours: employee.workHours[selectedDate] || {
        loginTime: 'N/A',
        logoutTime: 'N/A',
        totalHours: 0,
        productiveHours: 0,
        breaks: []
      }
    }));

    setNotification({
      type: 'success',
      message: 'Report generated successfully'
    });

    // Here you would typically send this data to your backend or export it
    console.log('Report Data:', reportData);
  };

  const departments = [...new Set(employees.map(emp => emp.department))];

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <h2>Authentication Required</h2>
        <p>Please log in to access the Remote Work Hours Tracker.</p>
      </div>
    );
  }

  return (
    <div className="remote-work-hours-tracker">
      <div className="tracker-header">
        <h1>Remote Work Hours Tracker</h1>
        <div className="header-actions">
          <div className="date-picker-wrapper">
            <FaCalendarAlt className="icon" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
            />
          </div>
          <button
            className="admin-toggle"
            onClick={() => setIsAdmin(!isAdmin)}
          >
            <FaUserTie className="icon" />
            {isAdmin ? 'Employee View' : 'Admin View'}
          </button>
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="tracker-content">
        {!isAdmin ? (
          <div className="employee-dashboard">
            <div className={`work-hours-summary ${isWorkHoursCollapsed ? 'collapsed' : ''}`}>
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
                    <span className={`status-indicator ${sessionStatus}`}></span>
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
                        style={{ width: `${sessionProgress}%` }}
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
                  className={`start-tracking-button ${isMobile ? 'mobile-fab' : ''}`}
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
            <div className={`reporting-section ${isReportingCollapsed ? 'collapsed' : ''}`}>
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
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
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
                {employees.map(employee => (
                  <div key={employee.id} className="employee-card">
                    <div className="employee-info">
                      <h3>{employee.name}</h3>
                      <span>{employee.department}</span>
                    </div>
                    {employee.workHours[selectedDate] && (
                      <div className="work-hours-details">
                        <div className="hours-info">
                          <span>Login: {employee.workHours[selectedDate].loginTime}</span>
                          <span>Logout: {employee.workHours[selectedDate].logoutTime}</span>
                        </div>
                        <div className="hours-summary">
                          <span>Total Hours: {employee.workHours[selectedDate].totalHours}</span>
                          <span>Productive Hours: {employee.workHours[selectedDate].productiveHours}</span>
                        </div>
                        {employee.workHours[selectedDate].breaks.length > 0 && (
                          <div className="breaks-list">
                            <h4>Breaks</h4>
                            {employee.workHours[selectedDate].breaks.map((break_, index) => (
                              <div key={index} className="break-item">
                                <span>{break_.start} - {break_.end}</span>
                                <span>{break_.duration} minutes</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoteWorkHoursTracker; 