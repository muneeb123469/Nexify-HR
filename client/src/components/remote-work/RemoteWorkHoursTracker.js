import React, { useEffect, useMemo, useState } from 'react';
import {
  FaClock,
  FaCalendarAlt,
  FaUserTie,
  FaBuilding,
  FaFileAlt,
  FaPlay,
  FaPause,
  FaStop,
  FaCheck,
} from 'react-icons/fa';
import './RemoteWorkHoursTracker.css';

const EMPLOYEE_STORAGE_KEY = 'nexify_hr_employee_records';
const SESSION_STORAGE_KEY = 'nexify_hr_remote_work_hours';

const readStorageArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Failed to read ${key}`, error);
    return [];
  }
};

const writeSessions = (sessions) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
};

const getToday = () => new Date().toISOString().slice(0, 10);

const formatTime = (date) => date.toTimeString().slice(0, 5);

const formatDuration = (minutes = 0) => {
  const safeMinutes = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  return `${hours}h ${remainingMinutes.toString().padStart(2, '0')}m`;
};

const getMinutesBetween = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0;
  }

  return Math.max(0, Math.round((endDate - startDate) / 60000));
};

const buildEmployeeRecord = (employee) => ({
  id: String(employee.id || employee._id || employee.email || `employee-${Date.now()}`),
  name: employee.name || 'Unknown Employee',
  role: employee.role || employee.position || 'Unassigned Role',
  department: employee.department || 'Pending Assignment',
  status: employee.status || 'Active',
  email: employee.email || '',
});

const RemoteWorkHoursTracker = () => {
  const [employeeRecords, setEmployeeRecords] = useState(() => readStorageArray(EMPLOYEE_STORAGE_KEY));
  const [sessions, setSessions] = useState(() => readStorageArray(SESSION_STORAGE_KEY));
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [currentEmployeeId, setCurrentEmployeeId] = useState('');
  const [elapsedTick, setElapsedTick] = useState(0);

  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: getToday(),
    end: getToday(),
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isWorkHoursCollapsed, setIsWorkHoursCollapsed] = useState(false);
  const [isReportingCollapsed, setIsReportingCollapsed] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  const employees = useMemo(
    () => employeeRecords.map(buildEmployeeRecord),
    [employeeRecords]
  );

  useEffect(() => {
    const savedEmployees = readStorageArray(EMPLOYEE_STORAGE_KEY);
    const savedSessions = readStorageArray(SESSION_STORAGE_KEY);

    setEmployeeRecords(savedEmployees);
    setSessions(savedSessions);
  }, []);

  useEffect(() => {
    if (!currentEmployeeId && employees.length > 0) {
      setCurrentEmployeeId(employees[0].id);
    }
  }, [currentEmployeeId, employees]);

  useEffect(() => {
    const timer = setInterval(() => setElapsedTick((tick) => tick + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const updateSessions = (updater) => {
    setSessions((previousSessions) => {
      const nextSessions = typeof updater === 'function' ? updater(previousSessions) : updater;
      writeSessions(nextSessions);
      return nextSessions;
    });
  };

  const currentEmployee = employees.find((employee) => employee.id === currentEmployeeId) || employees[0];
  const activeSession = sessions.find(
    (session) => session.status === 'active' && session.employeeId === currentEmployee?.id
  );
  const sessionStatus = activeSession?.currentBreak
    ? 'on-break'
    : activeSession
      ? 'active'
      : 'inactive';

  const currentEmployeeSessions = sessions
    .filter((session) => session.employeeId === currentEmployee?.id && session.date === selectedDate)
    .sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0));

  const completedCurrentSessions = currentEmployeeSessions.filter(
    (session) => session.status === 'completed'
  );

  const completedMinutesToday = completedCurrentSessions.reduce(
    (total, session) => total + (Number(session.durationMinutes) || 0),
    0
  );

  const activeElapsedMinutes = activeSession
    ? Math.max(
        0,
        getMinutesBetween(activeSession.startedAt, new Date().toISOString()) -
          (Number(activeSession.breakMinutes) || 0)
      )
    : 0;

  const totalMinutesForDate = completedMinutesToday + activeElapsedMinutes + (elapsedTick * 0);
  const departments = [...new Set(employees.map((employee) => employee.department))];

  const filteredAdminEmployees = employees.filter((employee) => {
    const matchesDepartment =
      selectedDepartment === 'all' || employee.department === selectedDepartment;
    const matchesEmployee = selectedEmployee === 'all' || employee.id === selectedEmployee;
    return matchesDepartment && matchesEmployee;
  });

  const adminSessionsForDate = sessions.filter((session) => {
    const matchesDate = session.date === selectedDate;
    const matchesDepartment =
      selectedDepartment === 'all' || session.department === selectedDepartment;
    const matchesEmployee = selectedEmployee === 'all' || session.employeeId === selectedEmployee;
    return matchesDate && matchesDepartment && matchesEmployee;
  });

  const getReportDateRange = () => {
    if (reportType === 'daily') {
      return { start: selectedDate, end: selectedDate, label: selectedDate };
    }

    const start = dateRange.start <= dateRange.end ? dateRange.start : dateRange.end;
    const end = dateRange.start <= dateRange.end ? dateRange.end : dateRange.start;
    return { start, end, label: `${start} to ${end}` };
  };

  const getReportSessions = () => {
    const { start, end } = getReportDateRange();

    return sessions.filter((session) => {
      const matchesDate = session.date >= start && session.date <= end;
      const matchesDepartment =
        selectedDepartment === 'all' || session.department === selectedDepartment;
      const matchesEmployee = selectedEmployee === 'all' || session.employeeId === selectedEmployee;
      return matchesDate && matchesDepartment && matchesEmployee;
    });
  };

  const handleStartTracking = () => {
    if (!currentEmployee) {
      showNotification('No employee records found. Sync employees from prepared offers first.', 'info');
      return;
    }

    if (activeSession) {
      showNotification('A tracking session is already active for this employee.', 'error');
      return;
    }

    const now = new Date();
    const newSession = {
      id: `remote-session-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      role: currentEmployee.role,
      department: currentEmployee.department,
      date: selectedDate,
      startTime: formatTime(now),
      endTime: '',
      startedAt: now.toISOString(),
      endedAt: '',
      durationMinutes: 0,
      breakMinutes: 0,
      breaks: [],
      currentBreak: null,
      status: 'active',
      notes: '',
    };

    updateSessions((previousSessions) => [...previousSessions, newSession]);
    showNotification('Work hours tracking started.');
  };

  const handleEndTracking = () => {
    if (!activeSession) {
      showNotification('No active session to end.', 'error');
      return;
    }

    const now = new Date();
    updateSessions((previousSessions) =>
      previousSessions.map((session) => {
        if (session.id !== activeSession.id) {
          return session;
        }

        const activeBreakMinutes = session.currentBreak
          ? getMinutesBetween(session.currentBreak.startedAt, now.toISOString())
          : 0;
        const breakMinutes = (Number(session.breakMinutes) || 0) + activeBreakMinutes;
        const breaks = session.currentBreak
          ? [
              ...(session.breaks || []),
              {
                ...session.currentBreak,
                endedAt: now.toISOString(),
                endTime: formatTime(now),
                durationMinutes: activeBreakMinutes,
              },
            ]
          : session.breaks || [];
        const durationMinutes = Math.max(
          0,
          getMinutesBetween(session.startedAt, now.toISOString()) - breakMinutes
        );

        return {
          ...session,
          endTime: formatTime(now),
          endedAt: now.toISOString(),
          durationMinutes,
          breakMinutes,
          breaks,
          currentBreak: null,
          status: 'completed',
        };
      })
    );
    showNotification('Work hours tracking ended and saved locally.');
  };

  const handleBreakStart = () => {
    if (!activeSession || activeSession.currentBreak) {
      return;
    }

    const now = new Date();
    updateSessions((previousSessions) =>
      previousSessions.map((session) =>
        session.id === activeSession.id
          ? {
              ...session,
              currentBreak: {
                startedAt: now.toISOString(),
                startTime: formatTime(now),
              },
            }
          : session
      )
    );
    showNotification('Break started.');
  };

  const handleBreakEnd = () => {
    if (!activeSession?.currentBreak) {
      return;
    }

    const now = new Date();
    updateSessions((previousSessions) =>
      previousSessions.map((session) => {
        if (session.id !== activeSession.id) {
          return session;
        }

        const breakDuration = getMinutesBetween(session.currentBreak.startedAt, now.toISOString());
        const completedBreak = {
          ...session.currentBreak,
          endedAt: now.toISOString(),
          endTime: formatTime(now),
          durationMinutes: breakDuration,
        };

        return {
          ...session,
          breaks: [...(session.breaks || []), completedBreak],
          breakMinutes: (Number(session.breakMinutes) || 0) + breakDuration,
          currentBreak: null,
        };
      })
    );
    showNotification('Break ended.');
  };

  const generateReport = () => {
    const reportSessions = getReportSessions();
    const { label } = getReportDateRange();
    const generatedAt = new Date().toLocaleString();

    if (reportSessions.length === 0) {
      setGeneratedReport({
        isEmpty: true,
        message: 'No remote work sessions found for the selected report filters.',
        reportType,
        dateLabel: label,
        generatedAt,
      });
      showNotification('No remote work sessions found for the selected report filters.', 'info');
      return;
    }

    setGeneratedReport({
      isEmpty: false,
      reportType,
      dateLabel: label,
      sessionCount: reportSessions.length,
      employeeCount: new Set(reportSessions.map((session) => session.employeeId)).size,
      totalTrackedMinutes: reportSessions.reduce(
        (total, session) => total + (Number(session.durationMinutes) || 0),
        0
      ),
      totalBreakMinutes: reportSessions.reduce(
        (total, session) => total + (Number(session.breakMinutes) || 0),
        0
      ),
      generatedAt,
    });
    showNotification('Local demo report generated from saved work sessions.', 'success');
  };

  const clearReport = () => {
    setGeneratedReport(null);
  };

  const exportReportCsv = () => {
    if (!generatedReport || generatedReport.isEmpty) {
      return;
    }

    const rows = [
      ['Metric', 'Value'],
      ['Report Type', generatedReport.reportType],
      ['Date Range', generatedReport.dateLabel],
      ['Sessions', generatedReport.sessionCount],
      ['Employees Included', generatedReport.employeeCount],
      ['Total Tracked Time', formatDuration(generatedReport.totalTrackedMinutes)],
      ['Total Break Time', formatDuration(generatedReport.totalBreakMinutes)],
      ['Generated At', generatedReport.generatedAt],
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `remote-work-report-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleWorkHoursSection = () => {
    setIsWorkHoursCollapsed(!isWorkHoursCollapsed);
  };

  const toggleReportingSection = () => {
    setIsReportingCollapsed(!isReportingCollapsed);
  };

  const renderSession = (session) => (
    <div className="session-card" key={session.id}>
      <div className="session-card-header">
        <strong>{session.employeeName}</strong>
        <span className={`status ${session.status}`}>{session.status}</span>
      </div>
      <div className="session-row">
        <span>Date</span>
        <strong>{session.date}</strong>
      </div>
      <div className="session-row">
        <span>Time</span>
        <strong>
          {session.startTime || '--'} - {session.endTime || 'Active'}
        </strong>
      </div>
      <div className="session-row">
        <span>Duration</span>
        <strong>{formatDuration(session.durationMinutes)}</strong>
      </div>
      <div className="session-row">
        <span>Breaks</span>
        <strong>{formatDuration(session.breakMinutes)}</strong>
      </div>
    </div>
  );

  return (
    <div className="remote-work-tracker">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <FaCheck /> {notification.message}
        </div>
      )}

      <div className="tracker-header">
        <h1>Remote Work Hours Tracker</h1>
        <p className="local-demo-note">Work hours are saved locally for this demo.</p>
        <div className="view-toggle">
          <button
            className={!isAdmin ? 'active' : ''}
            onClick={() => setIsAdmin(false)}
          >
            Employee View
          </button>
          <button
            className={isAdmin ? 'active' : ''}
            onClick={() => setIsAdmin(true)}
          >
            Admin View
          </button>
        </div>
      </div>

      <div className="date-selector">
        <FaCalendarAlt />
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </div>

      {employees.length === 0 ? (
        <div className="empty-state">
          No employee records found. Sync employees from prepared offers first.
        </div>
      ) : !isAdmin ? (
        <div className="employee-dashboard">
          <div className="employee-selector">
            <label htmlFor="remote-work-employee">Employee</label>
            <select
              id="remote-work-employee"
              value={currentEmployee?.id || ''}
              onChange={(event) => setCurrentEmployeeId(event.target.value)}
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.role}
                </option>
              ))}
            </select>
          </div>

          <div className="current-session">
            <h2>Current Session</h2>
            <div className="session-info">
              <div className="info-card">
                <FaClock />
                <div>
                  <h3>Total Hours</h3>
                  <p>{formatDuration(totalMinutesForDate)}</p>
                </div>
              </div>
              <div className="info-card">
                <FaUserTie />
                <div>
                  <h3>Status</h3>
                  <p className={`status ${sessionStatus}`}>{sessionStatus}</p>
                </div>
              </div>
              <div className="info-card">
                <FaBuilding />
                <div>
                  <h3>Department</h3>
                  <p>{currentEmployee.department}</p>
                </div>
              </div>
            </div>

            <div className="tracking-controls">
              {!activeSession ? (
                <button className="start-btn" onClick={handleStartTracking}>
                  <FaPlay /> Start Tracking
                </button>
              ) : (
                <>
                  {!activeSession.currentBreak ? (
                    <button className="break-btn" onClick={handleBreakStart}>
                      <FaPause /> Start Break
                    </button>
                  ) : (
                    <button className="break-btn" onClick={handleBreakEnd}>
                      <FaPlay /> End Break
                    </button>
                  )}
                  <button className="end-btn" onClick={handleEndTracking}>
                    <FaStop /> End Tracking
                  </button>
                </>
              )}
            </div>

            {activeSession && (
              <div className="session-progress">
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${Math.min((activeElapsedMinutes / 480) * 100, 100)}%` }}
                  />
                </div>
                <p>{formatDuration(activeElapsedMinutes)} tracked in the active session</p>
              </div>
            )}
          </div>

          <div className="history-section">
            <h3>Today's Work Hours</h3>
            {currentEmployeeSessions.length > 0 ? (
              <div className="session-list">
                {currentEmployeeSessions.map(renderSession)}
              </div>
            ) : (
              <div className="empty-state compact">
                No remote work sessions found for this date.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="admin-dashboard">
          <div className={`work-hours-section ${isMobile && isWorkHoursCollapsed ? 'collapsed' : ''}`}>
            <div className="section-header" onClick={toggleWorkHoursSection}>
              <h2>Employee Work Hours</h2>
              {isMobile && <span>{isWorkHoursCollapsed ? 'v' : '^'}</span>}
            </div>
            {(!isMobile || !isWorkHoursCollapsed) && (
              <>
                <div className="admin-filters">
                  <select
                    value={selectedDepartment}
                    onChange={(event) => setSelectedDepartment(event.target.value)}
                  >
                    <option value="all">All Departments</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedEmployee}
                    onChange={(event) => setSelectedEmployee(event.target.value)}
                  >
                    <option value="all">All Employees</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                {adminSessionsForDate.length === 0 ? (
                  <div className="empty-state compact">
                    No remote work sessions found for this date.
                  </div>
                ) : (
                  <div className="employees-grid">
                    {filteredAdminEmployees.map((employee) => {
                      const employeeSessions = sessions.filter(
                        (session) => session.employeeId === employee.id && session.date === selectedDate
                      );

                      return (
                        <div key={employee.id} className="employee-card">
                          <div className="employee-header">
                            <h3>{employee.name}</h3>
                            <span className="department">{employee.department}</span>
                          </div>
                          <p className="employee-meta">{employee.role}</p>
                          <div className="work-hours-details">
                            {employeeSessions.length > 0 ? (
                              employeeSessions.map(renderSession)
                            ) : (
                              <p className="no-tracking-message">
                                No remote work sessions found for this date.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <div className={`reporting-section ${isMobile && isReportingCollapsed ? 'collapsed' : ''}`}>
            <div className="section-header" onClick={toggleReportingSection}>
              <h2>Reports</h2>
              {isMobile && <span>{isReportingCollapsed ? 'v' : '^'}</span>}
            </div>
            {(!isMobile || !isReportingCollapsed) && (
              <>
                <div className="report-filters">
                  <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
                    <option value="daily">Daily Report</option>
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                  </select>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(event) =>
                      setDateRange({ ...dateRange, start: event.target.value })
                    }
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(event) =>
                      setDateRange({ ...dateRange, end: event.target.value })
                    }
                  />
                  <button onClick={generateReport}>
                    <FaFileAlt /> Generate Local Report
                  </button>
                </div>
                <p className="local-demo-note">
                  Reports use locally saved demo sessions only.
                </p>
                {generatedReport && (
                  <div className={`report-summary ${generatedReport.isEmpty ? 'empty' : ''}`}>
                    {generatedReport.isEmpty ? (
                      <p>{generatedReport.message}</p>
                    ) : (
                      <>
                        <div className="report-summary-header">
                          <div>
                            <h3>Local Demo Report</h3>
                            <p>Local demo report generated from saved sessions.</p>
                          </div>
                          <div className="report-actions">
                            <button type="button" onClick={exportReportCsv}>
                              Export Report CSV
                            </button>
                            <button type="button" onClick={clearReport}>
                              Clear Report
                            </button>
                          </div>
                        </div>
                        <div className="report-summary-grid">
                          <div>
                            <span>Report Type</span>
                            <strong>{generatedReport.reportType}</strong>
                          </div>
                          <div>
                            <span>Date Range</span>
                            <strong>{generatedReport.dateLabel}</strong>
                          </div>
                          <div>
                            <span>Sessions</span>
                            <strong>{generatedReport.sessionCount}</strong>
                          </div>
                          <div>
                            <span>Employees Included</span>
                            <strong>{generatedReport.employeeCount}</strong>
                          </div>
                          <div>
                            <span>Total Tracked Time</span>
                            <strong>{formatDuration(generatedReport.totalTrackedMinutes)}</strong>
                          </div>
                          <div>
                            <span>Total Break Time</span>
                            <strong>{formatDuration(generatedReport.totalBreakMinutes)}</strong>
                          </div>
                          <div>
                            <span>Generated At</span>
                            <strong>{generatedReport.generatedAt}</strong>
                          </div>
                        </div>
                      </>
                    )}
                    {generatedReport.isEmpty && (
                      <div className="report-actions">
                        <button type="button" onClick={clearReport}>
                          Clear Report
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoteWorkHoursTracker;
