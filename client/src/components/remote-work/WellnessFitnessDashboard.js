import React, { useState, useEffect } from 'react';
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
  FaBell,
  FaShareAlt,
  FaCheck,
  FaPlus,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLightbulb,
  FaPhoneAlt,
  FaGavel,
  FaPaperPlane
} from 'react-icons/fa';
import './WellnessFitnessDashboard.css';
import { EmployerSideBar } from '../dashboard/EmployeeDashboard';
import { Sidebar } from '../dashboard/HRDashboard';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const WellnessFitnessDashboard = () => {
  const { user } = useAuth();

  // Determine which sidebar to use based on user role
  const SidebarComponent = user?.role === 'hr' ? Sidebar : EmployerSideBar;
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [notification, setNotification] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    fitnessGoal: '',
    fitnessLevel: '',
    preferredActivities: []
  });
  const [feedbackText, setFeedbackText] = useState('');
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Wellness features state
  const [dailyTip, setDailyTip] = useState(null);
  const [mentalHealthResources, setMentalHealthResources] = useState([]);
  const [wellnessFeedback, setWellnessFeedback] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('General');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [complianceGuidelines, setComplianceGuidelines] = useState([]);
  const [selectedGuideline, setSelectedGuideline] = useState(null);

  const [programs, setPrograms] = useState([
    {
      id: 1,
      name: 'Yoga for Beginners',
      type: 'Yoga',
      duration: '30 mins',
      level: 'Beginner',
      description: 'Gentle yoga poses and breathing exercises for beginners',
      progress: 0,
      icon: <FaSpa />,
      calories: 150,
      sessionsCompleted: 0,
      totalTimeSpent: 0,
      recommendedFor: ['Flexibility', 'Stress Relief']
    },
    {
      id: 2,
      name: 'HIIT Workout',
      type: 'Cardio',
      duration: '45 mins',
      level: 'Intermediate',
      description: 'High-intensity interval training for maximum calorie burn',
      progress: 0,
      icon: <FaRunning />,
      calories: 400,
      sessionsCompleted: 0,
      totalTimeSpent: 0,
      recommendedFor: ['Weight Loss', 'General Fitness']
    },
    {
      id: 3,
      name: 'Mindful Meditation',
      type: 'Meditation',
      duration: '20 mins',
      level: 'All Levels',
      description: 'Guided meditation for stress relief and mental clarity',
      progress: 0,
      icon: <FaHeartbeat />,
      calories: 50,
      sessionsCompleted: 0,
      totalTimeSpent: 0,
      recommendedFor: ['Stress Relief', 'General Fitness']
    }
  ]);

  const fitnessGoals = [
    { value: 'Weight Loss', label: 'Weight Loss', icon: <FaChartLine /> },
    { value: 'Strength Training', label: 'Strength Training', icon: <FaDumbbell /> },
    { value: 'Flexibility', label: 'Flexibility', icon: <FaSpa /> },
    { value: 'Stress Relief', label: 'Stress Relief', icon: <FaHeartbeat /> },
    { value: 'General Fitness', label: 'General Fitness', icon: <FaRunning /> }
  ];

  const fitnessLevels = [
    { value: 'Beginner', label: 'Beginner', icon: <FaStar /> },
    { value: 'Intermediate', label: 'Intermediate', icon: <FaStar /> },
    { value: 'Advanced', label: 'Advanced', icon: <FaStar /> }
  ];

  // Get recommended programs based on user preferences
  const getRecommendedPrograms = () => {
    if (!userPreferences.fitnessGoal || !userPreferences.fitnessLevel) return [];

    return programs.filter(program =>
      program.recommendedFor.includes(userPreferences.fitnessGoal) &&
      (program.level === userPreferences.fitnessLevel || program.level === 'All Levels')
    );
  };

  const handlePreferenceChange = (field, value) => {
    setUserPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    setFeedbackText('');
  };

  const handleProgressUpdate = (programId, progress) => {
    setPrograms(prevPrograms =>
      prevPrograms.map(program =>
        program.id === programId ? {
          ...program,
          progress,
          sessionsCompleted: program.sessionsCompleted + 1,
          totalTimeSpent: program.totalTimeSpent + parseInt(program.duration)
        } : program
      )
    );

    setNotification({
      type: 'success',
      message: 'Progress updated successfully!'
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleScheduleSession = (program, date) => {
    const newSession = {
      id: Date.now(),
      programId: program.id,
      programName: program.name,
      date: date,
      duration: program.duration
    };

    setScheduledSessions(prev => [...prev, newSession]);
    setNotification({
      type: 'success',
      message: 'Session scheduled successfully!'
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleShareProgram = (program, platform) => {
    const shareText = `I just completed ${program.name} on the Wellness & Fitness Dashboard!`;
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
        break;
      case 'instagram':
        // Instagram sharing typically requires a mobile app
        setNotification({
          type: 'info',
          message: 'Please use the Instagram app to share your progress!'
        });
        return;
    }

    window.open(shareUrl, '_blank');
  };

  const handleFeedbackSubmit = (programId) => {
    if (!feedbackText.trim()) {
      setNotification({
        type: 'error',
        message: 'Please enter your feedback before submitting.'
      });
      return;
    }

    setNotification({
      type: 'success',
      message: 'Feedback submitted successfully!'
    });

    setFeedbackText('');

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Fetch wellness data on component mount
  useEffect(() => {
    const fetchWellnessData = async () => {
      try {
        // Fetch daily tip
        const tipRes = await axios.get('http://localhost:5000/api/wellness/tips/today');
        setDailyTip(tipRes.data);

        // Fetch mental health resources
        const resourcesRes = await axios.get('http://localhost:5000/api/wellness/mental-health-resources');
        setMentalHealthResources(resourcesRes.data);

        // Fetch compliance guidelines
        const guidelinesRes = await axios.get('http://localhost:5000/api/wellness/compliance-guidelines');
        setComplianceGuidelines(guidelinesRes.data);
      } catch (error) {
        console.error('Error fetching wellness data:', error);
      }
    };

    fetchWellnessData();
  }, []);

  // Handle wellness feedback submission
  const handleWellnessFeedbackSubmit = async () => {
    if (!wellnessFeedback.trim()) {
      setNotification({
        type: 'error',
        message: 'Please enter your feedback before submitting.'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/wellness/feedback',
        {
          feedback: wellnessFeedback,
          category: feedbackCategory,
          isAnonymous
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNotification({
        type: 'success',
        message: 'Thank you for your feedback! It has been submitted successfully.'
      });

      setWellnessFeedback('');
      setFeedbackCategory('General');
      setIsAnonymous(false);

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error submitting wellness feedback:', error);
      setNotification({
        type: 'error',
        message: 'Failed to submit feedback. Please try again.'
      });
    }
  };

  // Add tooltip data for program types
  const programTypeTooltips = {
    'Yoga': 'Gentle stretching and breathing exercises for flexibility and stress relief',
    'Cardio': 'High-intensity workouts to improve cardiovascular health and burn calories',
    'Meditation': 'Mindfulness practices for mental clarity and stress reduction'
  };

  // Add tooltip data for fitness goals
  const fitnessGoalTooltips = {
    'Weight Loss': 'Focus on calorie-burning exercises and healthy eating habits',
    'Strength Training': 'Build muscle mass and improve overall strength',
    'Flexibility': 'Enhance joint mobility and muscle elasticity',
    'Stress Relief': 'Reduce stress through mindful movement and breathing',
    'General Fitness': 'Maintain overall health and wellness'
  };

  // Enhanced program card render with tooltips
  const renderProgramCard = (program) => (
    <div
      key={program.id}
      className={`program-card ${selectedProgram?.id === program.id ? 'selected' : ''}`}
      onClick={() => handleProgramSelect(program)}
      data-tooltip={programTypeTooltips[program.type]}
    >
      <h3>
        <span data-tooltip={program.description}>{program.icon}</span> {program.name}
      </h3>
      <div className="program-details">
        <span className="program-type" data-tooltip={programTypeTooltips[program.type]}>
          {program.icon} {program.type}
        </span>
        <span className="program-duration" data-tooltip="Session duration">
          <FaClock /> {program.duration}
        </span>
        <span className="program-level" data-tooltip={`Recommended for ${program.level} level`}>
          <FaStar /> {program.level}
        </span>
      </div>
      <p>{program.description}</p>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${program.progress}%` }}
        />
      </div>
      <span className="progress-text">{program.progress}% Complete</span>
      <div className="program-stats">
        <span data-tooltip="Estimated calories burned per session">
          <FaChartLine /> {program.calories} calories
        </span>
        <span data-tooltip="Total number of completed sessions">
          <FaClock /> {program.sessionsCompleted} sessions
        </span>
      </div>
      <div className="program-actions">
        <button
          className="schedule-button"
          onClick={(e) => {
            e.stopPropagation();
            handleScheduleSession(program, new Date());
          }}
          data-tooltip="Schedule this program"
        >
          <FaCalendarAlt /> Schedule
        </button>
      </div>
    </div>
  );

  return (
    <>
      <SidebarComponent />
      <div className="wellness-fitness-dashboard">
        <div className="dashboard-header">
          <h1>Wellness and Fitness Programs</h1>
        </div>

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="dashboard-content">
          <div className="preferences-section">
            <h2><FaUser /> Personalize Your Experience</h2>
            <div className="preferences-form">
              <div className="form-group">
                <label>
                  <FaBullseye data-tooltip="Select your primary fitness goal" /> Fitness Goal
                </label>
                <select
                  value={userPreferences.fitnessGoal}
                  onChange={(e) => handlePreferenceChange('fitnessGoal', e.target.value)}
                  className="form-control"
                >
                  <option value="">Select a goal</option>
                  {fitnessGoals.map(goal => (
                    <option
                      key={goal.value}
                      value={goal.value}
                      data-tooltip={fitnessGoalTooltips[goal.value]}
                    >
                      {goal.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <FaUser data-tooltip="Select your current fitness level" /> Fitness Level
                </label>
                <select
                  value={userPreferences.fitnessLevel}
                  onChange={(e) => handlePreferenceChange('fitnessLevel', e.target.value)}
                  className="form-control"
                >
                  <option value="">Select your level</option>
                  {fitnessLevels.map(level => (
                    <option
                      key={level.value}
                      value={level.value}
                      data-tooltip={`Recommended for ${level.label} level users`}
                    >
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
              <div className="programs-grid">
                {getRecommendedPrograms().map(renderProgramCard)}
              </div>
            </div>
          )}

          <div className="programs-section">
            <h2><FaDumbbell /> Available Programs</h2>
            <div className="programs-grid">
              {programs.map(renderProgramCard)}
            </div>
          </div>

          {selectedProgram && (
            <div className="program-details-section">
              <h2><FaDumbbell /> Program Details</h2>
              <div className="program-details-card">
                <h3>
                  <span data-tooltip={selectedProgram.description}>
                    {selectedProgram.icon}
                  </span> {selectedProgram.name}
                </h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>
                      <FaDumbbell data-tooltip="Program type" /> Type
                    </label>
                    <span>{selectedProgram.type}</span>
                  </div>
                  <div className="detail-item">
                    <label>
                      <FaClock data-tooltip="Session duration" /> Duration
                    </label>
                    <span>{selectedProgram.duration}</span>
                  </div>
                  <div className="detail-item">
                    <label>
                      <FaStar data-tooltip="Recommended fitness level" /> Level
                    </label>
                    <span>{selectedProgram.level}</span>
                  </div>
                  <div className="detail-item">
                    <label>
                      <FaChartLine data-tooltip="Estimated calories burned per session" /> Calories
                    </label>
                    <span>{selectedProgram.calories}</span>
                  </div>
                  <div className="detail-item">
                    <label>
                      <FaClock data-tooltip="Total number of completed sessions" /> Sessions Completed
                    </label>
                    <span>{selectedProgram.sessionsCompleted}</span>
                  </div>
                  <div className="detail-item">
                    <label>
                      <FaClock data-tooltip="Total time spent on this program" /> Total Time Spent
                    </label>
                    <span>{selectedProgram.totalTimeSpent} mins</span>
                  </div>
                </div>
                <div className="progress-section">
                  <label>
                    <FaChartLine data-tooltip="Track your progress" /> Your Progress
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedProgram.progress}
                    onChange={(e) => handleProgressUpdate(selectedProgram.id, parseInt(e.target.value))}
                    className="progress-slider"
                  />
                </div>
                <div className="feedback-section">
                  <label>
                    <FaComments data-tooltip="Share your experience with this program" /> Program Feedback
                  </label>
                  <textarea
                    placeholder="Share your experience with this program..."
                    className="feedback-input"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                  <button
                    className="submit-feedback-button"
                    onClick={() => handleFeedbackSubmit(selectedProgram.id)}
                    data-tooltip="Submit your feedback"
                  >
                    <FaComments /> Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== NEW WELLNESS FEATURES ===== */}

          {/* 1. Daily Well-being Tip */}
          {dailyTip && (
            <div className="wellness-section daily-tip-section">
              <h2><FaLightbulb /> Daily Well-being Tip</h2>
              <div className="daily-tip-card">
                <div className="tip-header">
                  <FaLightbulb className="tip-icon" />
                  <span className="tip-day">{dailyTip.dayOfWeek}</span>
                </div>
                <p className="tip-content">{dailyTip.tip}</p>
              </div>
            </div>
          )}

          {/* 2. Quick Access to Mental Health Resources */}
          {mentalHealthResources.length > 0 && (
            <div className="wellness-section mental-health-section">
              <h2><FaPhoneAlt /> Quick Access to Mental Health Resources</h2>
              <div className="resources-grid">
                {mentalHealthResources.map((resource) => (
                  <div key={resource._id} className="resource-card">
                    <div className="resource-header">
                      <FaPhoneAlt className="resource-icon" />
                      <span className="resource-category">{resource.category}</span>
                    </div>
                    <h3>{resource.title}</h3>
                    <p>{resource.description}</p>
                    <div className="resource-actions">
                      {resource.phoneNumber && (
                        <div className="resource-contact">
                          <FaPhoneAlt /> <strong>{resource.phoneNumber}</strong>
                        </div>
                      )}
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resource-link"
                        >
                          Visit Website →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Employee Feedback & Suggestion Box */}
          <div className="wellness-section feedback-section">
            <h2><FaComments /> Employee Feedback & Suggestion Box</h2>
            <div className="feedback-card">
              <p className="feedback-description">
                Help us improve employee well-being programs by sharing your thoughts, ideas, and concerns.
              </p>
              <div className="feedback-form">
                <div className="form-group">
                  <label htmlFor="feedbackCategory">Category</label>
                  <select
                    id="feedbackCategory"
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="form-control"
                  >
                    <option value="General">General</option>
                    <option value="Wellness Program">Wellness Program</option>
                    <option value="Workplace Safety">Workplace Safety</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="wellnessFeedback">Your Feedback</label>
                  <textarea
                    id="wellnessFeedback"
                    placeholder="Share your feedback or suggestions..."
                    className="feedback-input"
                    value={wellnessFeedback}
                    onChange={(e) => setWellnessFeedback(e.target.value)}
                    rows="5"
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <span>Submit anonymously</span>
                  </label>
                </div>
                <button
                  className="submit-feedback-button"
                  onClick={handleWellnessFeedbackSubmit}
                >
                  <FaPaperPlane /> Submit Feedback
                </button>
              </div>
            </div>
          </div>

          {/* 4. Legal Rights & Compliance Guidelines */}
          {complianceGuidelines.length > 0 && (
            <div className="wellness-section compliance-section">
              <h2><FaGavel /> Legal Rights & Compliance Guidelines</h2>
              <div className="compliance-intro">
                <p>Know your rights: Workplace safety, discrimination, and harassment guidelines.</p>
              </div>
              <div className="guidelines-list">
                {complianceGuidelines.map((guideline) => (
                  <div key={guideline._id} className="guideline-card">
                    <div
                      className="guideline-header"
                      onClick={() => setSelectedGuideline(
                        selectedGuideline?._id === guideline._id ? null : guideline
                      )}
                    >
                      <div className="guideline-title">
                        <FaGavel className="guideline-icon" />
                        <h3>{guideline.title}</h3>
                      </div>
                      <div className="guideline-category-badge">
                        {guideline.category}
                      </div>
                    </div>
                    {selectedGuideline?._id === guideline._id && (
                      <div className="guideline-content">
                        <div className="guideline-text">
                          {guideline.content.split('\n\n').map((paragraph, idx) => {
                            // Handle bold text
                            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                              return (
                                <h4 key={idx} className="guideline-subtitle">
                                  {paragraph.replace(/\*\*/g, '')}
                                </h4>
                              );
                            }
                            // Handle bullet points
                            if (paragraph.startsWith('-')) {
                              const items = paragraph.split('\n-').map(item => item.trim().replace(/^-\s*/, ''));
                              return (
                                <ul key={idx} className="guideline-list">
                                  {items.map((item, i) => item && <li key={i}>{item}</li>)}
                                </ul>
                              );
                            }
                            // Regular paragraphs
                            return paragraph && <p key={idx}>{paragraph}</p>;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          className="mobile-fab"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          data-tooltip="Quick Actions"
        >
          <FaPlus />
        </button>

        {showMobileMenu && (
          <div className="mobile-menu">
            <button
              onClick={() => setShowCalendar(true)}
              data-tooltip="Schedule a session"
            >
              <FaCalendarAlt /> Schedule
            </button>
            <button
              onClick={() => setShowMobileMenu(false)}
              data-tooltip="View notifications"
            >
              <FaBell /> Notifications
            </button>
            <button
              onClick={() => setShowMobileMenu(false)}
              data-tooltip="View progress"
            >
              <FaChartLine /> Progress
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default WellnessFitnessDashboard; 