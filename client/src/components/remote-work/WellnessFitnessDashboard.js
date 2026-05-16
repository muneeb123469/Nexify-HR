import React, { useEffect, useMemo, useState } from 'react';
import {
  FaDumbbell,
  FaUser,
  FaBullseye,
  FaRunning,
  FaClock,
  FaChartLine,
  FaStar,
  FaComments,
  FaSpa,
  FaHeartbeat,
  FaCalendarAlt,
  FaShareAlt,
  FaPlus,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './WellnessFitnessDashboard.css';

const EMPLOYEE_STORAGE_KEY = 'nexify_hr_employee_records';
const PROGRAM_STORAGE_KEY = 'nexify_hr_wellness_programs';
const SESSION_STORAGE_KEY = 'nexify_hr_wellness_sessions';

const defaultPrograms = [
  {
    id: 'program-yoga-beginners',
    name: 'Yoga for Beginners',
    type: 'Yoga',
    duration: '30 mins',
    level: 'Beginner',
    recommendedFor: ['Flexibility', 'Stress Relief'],
    description: 'Gentle yoga poses and breathing exercises for beginners.',
    progress: 0,
    calories: 150,
    sessionsCompleted: 0,
    totalTimeSpent: 0,
    active: true,
  },
  {
    id: 'program-hiit-workout',
    name: 'HIIT Workout',
    type: 'Cardio',
    duration: '45 mins',
    level: 'Intermediate',
    recommendedFor: ['Weight Loss', 'General Fitness'],
    description: 'High-intensity interval training for cardio health and calorie burn.',
    progress: 0,
    calories: 400,
    sessionsCompleted: 0,
    totalTimeSpent: 0,
    active: true,
  },
  {
    id: 'program-mindful-meditation',
    name: 'Mindful Meditation',
    type: 'Meditation',
    duration: '20 mins',
    level: 'All Levels',
    recommendedFor: ['Stress Relief', 'General Fitness'],
    description: 'Guided meditation for stress relief and mental clarity.',
    progress: 0,
    calories: 50,
    sessionsCompleted: 0,
    totalTimeSpent: 0,
    active: true,
  },
];

const fitnessGoals = [
  { value: 'Weight Loss', label: 'Weight Loss', icon: <FaChartLine /> },
  { value: 'Strength Training', label: 'Strength Training', icon: <FaDumbbell /> },
  { value: 'Flexibility', label: 'Flexibility', icon: <FaSpa /> },
  { value: 'Stress Relief', label: 'Stress Relief', icon: <FaHeartbeat /> },
  { value: 'General Fitness', label: 'General Fitness', icon: <FaRunning /> },
];

const fitnessLevels = [
  { value: 'Beginner', label: 'Beginner', icon: <FaStar /> },
  { value: 'Intermediate', label: 'Intermediate', icon: <FaStar /> },
  { value: 'Advanced', label: 'Advanced', icon: <FaStar /> },
];

const programTypes = ['Yoga', 'Cardio', 'Meditation', 'Strength', 'Wellness'];
const programLevels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

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

const writeStorageArray = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const loadPrograms = () => {
  const savedPrograms = readStorageArray(PROGRAM_STORAGE_KEY);

  if (savedPrograms.length > 0) {
    return savedPrograms;
  }

  writeStorageArray(PROGRAM_STORAGE_KEY, defaultPrograms);
  return defaultPrograms;
};

const getToday = () => new Date().toISOString().slice(0, 10);

const parseDurationMinutes = (duration) => {
  const value = parseInt(duration, 10);
  return Number.isNaN(value) ? 0 : value;
};

const buildEmployeeRecord = (employee) => ({
  id: String(employee.id || employee._id || employee.email || `employee-${Date.now()}`),
  name: employee.name || 'Unknown Employee',
  role: employee.role || employee.position || 'Employee',
  department: employee.department || 'Pending Assignment',
  email: employee.email || '',
});

const WellnessFitnessDashboard = () => {
  const { user } = useAuth() || {};
  const [viewMode, setViewMode] = useState('employee');
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    fitnessGoal: '',
    fitnessLevel: '',
  });
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employeeRecords, setEmployeeRecords] = useState(() =>
    readStorageArray(EMPLOYEE_STORAGE_KEY)
  );
  const [programs, setPrograms] = useState(loadPrograms);
  const [wellnessSessions, setWellnessSessions] = useState(() =>
    readStorageArray(SESSION_STORAGE_KEY)
  );
  const [newProgram, setNewProgram] = useState({
    name: '',
    type: 'Yoga',
    duration: '',
    level: 'Beginner',
    recommendedGoal: 'General Fitness',
    description: '',
  });

  const employees = useMemo(
    () => employeeRecords.map(buildEmployeeRecord),
    [employeeRecords]
  );

  const userRole = (user?.role || '').toLowerCase();
  const canManageWellness = ['admin', 'hr', 'manager', 'administrator'].includes(userRole);

  const activePrograms = useMemo(
    () => programs.filter((program) => program.active !== false),
    [programs]
  );

  const selectedEmployee =
    employees.find((employee) => employee.id === selectedEmployeeId) || employees[0];

  const selectedProgram = programs.find((program) => program.id === selectedProgramId);

  const employeeSessions = wellnessSessions
    .filter((session) => session.employeeId === selectedEmployee?.id)
    .sort((a, b) => new Date(b.scheduledAt || b.date) - new Date(a.scheduledAt || a.date));

  useEffect(() => {
    setEmployeeRecords(readStorageArray(EMPLOYEE_STORAGE_KEY));
    setWellnessSessions(readStorageArray(SESSION_STORAGE_KEY));
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId && employees.length > 0) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [employees, selectedEmployeeId]);

  useEffect(() => {
    if (!canManageWellness && viewMode === 'admin') {
      setViewMode('employee');
    }
  }, [canManageWellness, viewMode]);

  const showNotification = (message, type = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const updatePrograms = (updater) => {
    setPrograms((previousPrograms) => {
      const nextPrograms =
        typeof updater === 'function' ? updater(previousPrograms) : updater;
      writeStorageArray(PROGRAM_STORAGE_KEY, nextPrograms);
      return nextPrograms;
    });
  };

  const updateSessions = (updater) => {
    setWellnessSessions((previousSessions) => {
      const nextSessions =
        typeof updater === 'function' ? updater(previousSessions) : updater;
      writeStorageArray(SESSION_STORAGE_KEY, nextSessions);
      return nextSessions;
    });
  };

  const getProgramIcon = (type) => {
    const icons = {
      Yoga: <FaSpa />,
      Cardio: <FaRunning />,
      Meditation: <FaHeartbeat />,
      Strength: <FaDumbbell />,
      Wellness: <FaHeartbeat />,
    };

    return icons[type] || <FaDumbbell />;
  };

  const getRecommendedPrograms = () => {
    if (!userPreferences.fitnessGoal || !userPreferences.fitnessLevel) {
      return [];
    }

    return activePrograms.filter(
      (program) =>
        (program.recommendedFor || []).includes(userPreferences.fitnessGoal) &&
        (program.level === userPreferences.fitnessLevel || program.level === 'All Levels')
    );
  };

  const handlePreferenceChange = (field, value) => {
    setUserPreferences((previousPreferences) => ({
      ...previousPreferences,
      [field]: value,
    }));
  };

  const handleProgramSelect = (program) => {
    setSelectedProgramId(program.id);
    setFeedbackText('');
  };

  const handleProgressUpdate = (programId, progress) => {
    updatePrograms((previousPrograms) =>
      previousPrograms.map((program) =>
        program.id === programId
          ? {
              ...program,
              progress,
              sessionsCompleted: (Number(program.sessionsCompleted) || 0) + 1,
              totalTimeSpent:
                (Number(program.totalTimeSpent) || 0) + parseDurationMinutes(program.duration),
            }
          : program
      )
    );

    showNotification('Progress updated successfully!');
  };

  const handleScheduleSession = (program) => {
    if (!selectedEmployee) {
      showNotification('No employee records found. Sync employees from prepared offers first.', 'info');
      return;
    }

    const newSession = {
      id: `wellness-session-${Date.now()}`,
      programId: program.id,
      programName: program.name,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      employeeRole: selectedEmployee.role,
      employeeDepartment: selectedEmployee.department,
      date: selectedDate,
      duration: program.duration,
      status: 'scheduled',
      scheduledAt: new Date().toISOString(),
    };

    updateSessions((previousSessions) => [...previousSessions, newSession]);
    showNotification('Session scheduled successfully and saved locally.');
  };

  const handleShareProgram = () => {
    showNotification('Sharing is not configured in this local demo.', 'info');
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) {
      showNotification('Please enter your feedback before submitting.', 'error');
      return;
    }

    showNotification('Feedback submitted successfully!');
    setFeedbackText('');
  };

  const handleNewProgramChange = (field, value) => {
    setNewProgram((previousProgram) => ({
      ...previousProgram,
      [field]: value,
    }));
  };

  const handleCreateProgram = (event) => {
    event.preventDefault();

    if (!newProgram.name.trim() || !newProgram.duration.trim() || !newProgram.description.trim()) {
      showNotification('Please complete the required program fields.', 'error');
      return;
    }

    const createdProgram = {
      id: `program-${Date.now()}`,
      name: newProgram.name.trim(),
      type: newProgram.type,
      duration: newProgram.duration.trim(),
      level: newProgram.level,
      recommendedFor: [newProgram.recommendedGoal],
      description: newProgram.description.trim(),
      progress: 0,
      calories: 0,
      sessionsCompleted: 0,
      totalTimeSpent: 0,
      active: true,
    };

    updatePrograms((previousPrograms) => [...previousPrograms, createdProgram]);
    setNewProgram({
      name: '',
      type: 'Yoga',
      duration: '',
      level: 'Beginner',
      recommendedGoal: 'General Fitness',
      description: '',
    });
    showNotification('Wellness program created successfully.');
  };

  const handleToggleProgramStatus = (programId) => {
    updatePrograms((previousPrograms) =>
      previousPrograms.map((program) =>
        program.id === programId ? { ...program, active: program.active === false } : program
      )
    );
    showNotification('Program status updated successfully.');
  };

  const getParticipationSummary = (program) => {
    const programSessions = wellnessSessions.filter((session) => session.programId === program.id);

    return {
      scheduledCount: programSessions.length,
      employeeCount: new Set(programSessions.map((session) => session.employeeId)).size,
    };
  };

  const renderProgramCard = (program, options = {}) => {
    const { admin = false } = options;
    const participation = getParticipationSummary(program);

    return (
      <div
        key={program.id}
        className={`program-card ${selectedProgramId === program.id ? 'selected' : ''}`}
        onClick={() => handleProgramSelect(program)}
      >
        <h3>
          <span>{getProgramIcon(program.type)}</span> {program.name}
        </h3>
        <div className="program-details">
          <span className="program-type">
            {getProgramIcon(program.type)} {program.type}
          </span>
          <span className="program-duration">
            <FaClock /> {program.duration}
          </span>
          <span className="program-level">
            <FaStar /> {program.level}
          </span>
          <span className={`program-status ${program.active === false ? 'inactive' : 'active'}`}>
            {program.active === false ? 'Inactive' : 'Active'}
          </span>
        </div>
        <p>{program.description}</p>
        {!admin && (
          <>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${program.progress || 0}%` }} />
            </div>
            <span className="progress-text">{program.progress || 0}% Complete</span>
          </>
        )}
        <div className="program-stats">
          <span>
            <FaChartLine /> {program.calories || 0} calories
          </span>
          <span>
            <FaClock /> {program.sessionsCompleted || 0} sessions
          </span>
        </div>
        <div className="program-actions">
          {admin ? (
            <button
              className="schedule-button"
              onClick={(event) => {
                event.stopPropagation();
                handleToggleProgramStatus(program.id);
              }}
            >
              {program.active === false ? 'Mark Active' : 'Mark Inactive'}
            </button>
          ) : (
            <>
              <button
                className="schedule-button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleScheduleSession(program);
                }}
              >
                <FaCalendarAlt /> Schedule
              </button>
              <button
                className="share-button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleShareProgram();
                }}
              >
                <FaShareAlt /> Share
              </button>
            </>
          )}
        </div>
        {admin && (
          <div className="participation-summary">
            <span>{participation.scheduledCount} scheduled sessions</span>
            <span>{participation.employeeCount} employees scheduled</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="wellness-fitness-dashboard">
      <div className="dashboard-header">
        <h1>Wellness and Fitness Programs</h1>
        <p className="local-demo-note">
          Wellness programs and sessions are saved locally for this demo.
        </p>
        {canManageWellness && (
          <div className="wellness-view-toggle">
            <button
              className={viewMode === 'employee' ? 'active' : ''}
              onClick={() => setViewMode('employee')}
            >
              Employee View
            </button>
            <button
              className={viewMode === 'admin' ? 'active' : ''}
              onClick={() => setViewMode('admin')}
            >
              HR/Admin View
            </button>
          </div>
        )}
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="dashboard-content">
        {viewMode === 'employee' ? (
          <>
            {employees.length === 0 ? (
              <div className="empty-state">
                No employee records found. Sync employees from prepared offers first.
              </div>
            ) : (
              <>
                <div className="preferences-section">
                  <h2><FaUser /> Personalize Your Experience</h2>
                  <div className="preferences-form">
                    <div className="form-group">
                      <label>
                        <FaUser /> Employee
                      </label>
                      <select
                        value={selectedEmployee?.id || ''}
                        onChange={(event) => setSelectedEmployeeId(event.target.value)}
                        className="form-control"
                      >
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name} - {employee.role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>
                        <FaCalendarAlt /> Session Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(event) => setSelectedDate(event.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <FaBullseye /> Fitness Goal
                      </label>
                      <select
                        value={userPreferences.fitnessGoal}
                        onChange={(event) =>
                          handlePreferenceChange('fitnessGoal', event.target.value)
                        }
                        className="form-control"
                      >
                        <option value="">Select a goal</option>
                        {fitnessGoals.map((goal) => (
                          <option key={goal.value} value={goal.value}>
                            {goal.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>
                        <FaStar /> Fitness Level
                      </label>
                      <select
                        value={userPreferences.fitnessLevel}
                        onChange={(event) =>
                          handlePreferenceChange('fitnessLevel', event.target.value)
                        }
                        className="form-control"
                      >
                        <option value="">Select your level</option>
                        {fitnessLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {userPreferences.fitnessGoal && userPreferences.fitnessLevel && (
                  <div className="recommended-programs-section">
                    <h2><FaStar /> Recommended for You</h2>
                    {getRecommendedPrograms().length > 0 ? (
                      <div className="programs-grid">
                        {getRecommendedPrograms().map((program) => renderProgramCard(program))}
                      </div>
                    ) : (
                      <div className="empty-state compact">
                        No active programs match your selected preferences.
                      </div>
                    )}
                  </div>
                )}

                <div className="programs-section">
                  <h2><FaDumbbell /> Available Programs</h2>
                  {activePrograms.length > 0 ? (
                    <div className="programs-grid">
                      {activePrograms.map((program) => renderProgramCard(program))}
                    </div>
                  ) : (
                    <div className="empty-state compact">
                      No active wellness programs are available right now.
                    </div>
                  )}
                </div>

                <div className="scheduled-sessions-section">
                  <h2><FaCalendarAlt /> My Scheduled Sessions</h2>
                  {employeeSessions.length > 0 ? (
                    <div className="scheduled-session-list">
                      {employeeSessions.map((session) => (
                        <div key={session.id} className="scheduled-session-card">
                          <strong>{session.programName}</strong>
                          <span>{session.date}</span>
                          <span>{session.duration}</span>
                          <span>{session.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state compact">
                      No wellness sessions scheduled for this employee.
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="admin-program-form-section">
              <h2><FaPlus /> Create Wellness Program</h2>
              <form className="admin-program-form" onSubmit={handleCreateProgram}>
                <input
                  type="text"
                  placeholder="Program name"
                  value={newProgram.name}
                  onChange={(event) => handleNewProgramChange('name', event.target.value)}
                />
                <select
                  value={newProgram.type}
                  onChange={(event) => handleNewProgramChange('type', event.target.value)}
                >
                  {programTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Duration, e.g. 30 mins"
                  value={newProgram.duration}
                  onChange={(event) => handleNewProgramChange('duration', event.target.value)}
                />
                <select
                  value={newProgram.level}
                  onChange={(event) => handleNewProgramChange('level', event.target.value)}
                >
                  {programLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <select
                  value={newProgram.recommendedGoal}
                  onChange={(event) =>
                    handleNewProgramChange('recommendedGoal', event.target.value)
                  }
                >
                  {fitnessGoals.map((goal) => (
                    <option key={goal.value} value={goal.value}>
                      {goal.label}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Program description"
                  value={newProgram.description}
                  onChange={(event) => handleNewProgramChange('description', event.target.value)}
                />
                <button type="submit">
                  <FaPlus /> Add Program
                </button>
              </form>
            </div>

            <div className="programs-section">
              <h2><FaDumbbell /> Wellness Programs</h2>
              <div className="programs-grid">
                {programs.map((program) => renderProgramCard(program, { admin: true }))}
              </div>
            </div>
          </>
        )}

        {selectedProgram && (
          <div className="program-details-section">
            <h2><FaDumbbell /> Program Details</h2>
            <div className="program-details-card">
              <h3>
                <span>{getProgramIcon(selectedProgram.type)}</span> {selectedProgram.name}
              </h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label><FaDumbbell /> Type</label>
                  <span>{selectedProgram.type}</span>
                </div>
                <div className="detail-item">
                  <label><FaClock /> Duration</label>
                  <span>{selectedProgram.duration}</span>
                </div>
                <div className="detail-item">
                  <label><FaStar /> Level</label>
                  <span>{selectedProgram.level}</span>
                </div>
                <div className="detail-item">
                  <label><FaChartLine /> Calories</label>
                  <span>{selectedProgram.calories || 0}</span>
                </div>
                <div className="detail-item">
                  <label><FaClock /> Sessions Completed</label>
                  <span>{selectedProgram.sessionsCompleted || 0}</span>
                </div>
                <div className="detail-item">
                  <label><FaClock /> Total Time Spent</label>
                  <span>{selectedProgram.totalTimeSpent || 0} mins</span>
                </div>
              </div>
              {viewMode === 'employee' && (
                <>
                  <div className="progress-section">
                    <label><FaChartLine /> Your Progress</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedProgram.progress || 0}
                      onChange={(event) =>
                        handleProgressUpdate(selectedProgram.id, parseInt(event.target.value, 10))
                      }
                      className="progress-slider"
                    />
                  </div>
                  <div className="feedback-section">
                    <label><FaComments /> Program Feedback</label>
                    <textarea
                      placeholder="Share your experience with this program..."
                      className="feedback-input"
                      value={feedbackText}
                      onChange={(event) => setFeedbackText(event.target.value)}
                    />
                    <button className="submit-feedback-button" onClick={handleFeedbackSubmit}>
                      <FaComments /> Submit Feedback
                    </button>
                  </div>
                  <div className="social-share-section">
                    <h4>Share Your Progress</h4>
                    <button className="share-button" onClick={handleShareProgram}>
                      <FaShareAlt /> Share Program
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessFitnessDashboard;
