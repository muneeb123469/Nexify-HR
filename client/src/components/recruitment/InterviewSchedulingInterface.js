import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InterviewSchedulingInterface.css';
import { Sidebar } from '../dashboard/HRDashboard';

const InterviewSchedulingInterface = () => {
  const navigate = useNavigate();
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [interviewType, setInterviewType] = useState('onsite');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [interviewInstructions, setInterviewInstructions] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);

  // Editable candidate details
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [candidatePosition, setCandidatePosition] = useState('');
  const [candidateDepartment, setCandidateDepartment] = useState('');



  // Fetch shortlisted candidates from API
  useEffect(() => {
    fetchShortlistedCandidates();
  }, []);

  const fetchShortlistedCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch applications with shortlisted status
      const response = await fetch('http://localhost:5000/api/applications?status=shortlisted');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setShortlistedCandidates(data);
    } catch (err) {
      console.error('Error fetching shortlisted candidates:', err);
      setError('Failed to load shortlisted candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
    // Pre-fill editable fields with candidate data
    setCandidateName(candidate.name);
    setCandidateEmail(candidate.email);
    setCandidatePhone(candidate.phone || '');
    setCandidatePosition(candidate.job?.title || '');
    setCandidateDepartment(candidate.job?.department || '');

    setSelectedDate('');
    setSelectedTime('');
    setInterviewType('onsite');
    setInterviewLocation('');
    setInterviewInstructions('');
    setNotificationSent(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setNotificationSent(false);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setNotificationSent(false);
  };

  const handleInterviewTypeChange = (type) => {
    setInterviewType(type);
    // Auto-suggest location based on interview type
    if (type === 'online') {
      setInterviewLocation('Online Meeting (Link will be provided)');
    } else if (type === 'phone') {
      setInterviewLocation('Phone Interview');
    } else {
      setInterviewLocation('');
    }
    setNotificationSent(false);
  };

  const handleScheduleInterview = async () => {
    try {
      // Show loading state
      setNotificationSent(false);

      let meetingUrl = null;

      // If it's an online interview, generate a meeting URL and save to database
      if (interviewType === 'online') {
        // Generate a unique meeting room ID for Jitsi
        const meetingId = `HRInterview${Date.now()}`;

        // Create HR moderator URL (joins as moderator, no waiting)
        const hrModeratorUrl = `https://meet.jit.si/${meetingId}#userInfo.displayName="HR%20Representative"&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

        // Create applicant URL (regular participant, waits for moderator)
        const applicantUrl = `https://meet.jit.si/${meetingId}#userInfo.displayName="${encodeURIComponent(candidateName)}"`;

        // Use applicant URL as the main meeting URL (this goes in the email)
        meetingUrl = applicantUrl;

        console.log('HR Moderator URL:', hrModeratorUrl);
        console.log('Applicant URL:', applicantUrl);

        // Save meeting details to database
        const meetingData = {
          date: selectedDate,
          time: selectedTime,
          participantNames: [candidateName, 'HR Representative'],
          duration: 60, // Default 60 minutes
          meetingUrl: applicantUrl, // Applicant URL (waits for moderator)
          hrModeratorUrl: hrModeratorUrl, // HR URL (joins as moderator)
          candidateEmail: candidateEmail, // Link meeting to applicant
          jobTitle: candidatePosition || 'Software Engineer Position',
          company: 'Nexify Technologies',
          interviewType: 'Technical Interview',
          interviewer: 'HR Representative'
        };

        try {
          const meetingResponse = await fetch('http://localhost:5000/api/meetings/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meetingData)
          });

          if (meetingResponse.ok) {
            const meetingResult = await meetingResponse.json();
            console.log('Meeting saved to database:', meetingResult);
          } else {
            console.error('Failed to save meeting to database');
          }
        } catch (error) {
          console.error('Error saving meeting:', error);
        }
      }

      // Prepare interview data
      const interviewData = {
        candidateName,
        candidateEmail,
        candidatePhone,
        position: candidatePosition,
        department: candidateDepartment,
        date: selectedDate,
        time: selectedTime,
        type: interviewType,
        location: meetingUrl || interviewLocation, // Use meeting URL if online interview
        instructions: interviewInstructions
      };

      // Call the interview scheduling API (real endpoint with email sending)
      const response = await fetch('http://localhost:5000/api/interviews/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(interviewData)
      });

      const result = await response.json();

      if (result.success) {
        // Success - email sent successfully
        console.log('Interview scheduled successfully:', result);
        setNotificationSent(true);

        // Show success message
        const successMessage = `Interview scheduled successfully!\nEmail sent to: ${candidateEmail}\nMessage ID: ${result.data.messageId}`;

        setTimeout(() => {
          alert(successMessage);
        }, 1000);

      } else {
        // Handle API errors
        console.error('Interview scheduling failed:', result);
        alert(`Failed to schedule interview: ${result.message}`);
      }

    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Network error occurred while scheduling the interview. Please try again.');
    }
  };

  const handleViewCandidate = (candidate) => {
    navigate(`/hr/candidate-profile/${candidate._id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  if (loading) {
    return (
      <div className="interview-scheduling-interface">
        <div className="loading">Loading shortlisted candidates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interview-scheduling-interface">
        <div className="error">
          {error}
          <button onClick={fetchShortlistedCandidates} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="interview-scheduling-interface">
        <div className="scheduling-header">
          <h1>Interview Scheduling</h1>
          <p className="header-subtitle">Schedule interviews for shortlisted candidates</p>
        </div>

        <div className="scheduling-content">
          <div className="candidates-section">
            <h2>Shortlisted Candidates ({shortlistedCandidates.length})</h2>
            {shortlistedCandidates.length === 0 ? (
              <div className="no-candidates">
                <p>No shortlisted candidates found.</p>
                <p>Candidates will appear here when they are shortlisted from the Candidate Applications section.</p>
              </div>
            ) : (
              <div className="candidates-list">
                {shortlistedCandidates.map(candidate => (
                  <div
                    key={candidate._id}
                    className={`candidate-card ${selectedCandidate?._id === candidate._id ? 'selected' : ''}`}
                  >
                    <div className="candidate-info" onClick={() => handleCandidateSelect(candidate)}>
                      <h3>{candidate.name}</h3>
                      <p className="position">{candidate.job?.title || 'N/A'}</p>
                      <p className="department">{candidate.job?.department || 'N/A'}</p>
                      <p className="applied-date">Applied: {formatDate(candidate.createdAt)}</p>
                      <div className="status-badge shortlisted">
                        Shortlisted
                      </div>
                    </div>
                    <div className="candidate-actions">
                      <button
                        className="schedule-btn"
                        onClick={() => handleCandidateSelect(candidate)}
                        title="Schedule Interview"
                      >
                        Schedule Interview
                      </button>
                      <button
                        className="view-btn"
                        onClick={() => handleViewCandidate(candidate)}
                        title="View Candidate Profile"
                      >
                        👁️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="scheduling-section">
            {selectedCandidate ? (
              <>
                <div className="selected-candidate">
                  <h2>Schedule Interview</h2>
                  <div className="candidate-details-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Candidate Name</label>
                        <input
                          type="text"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          className="editable-input"
                          placeholder="Enter candidate name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={candidateEmail}
                          onChange={(e) => setCandidateEmail(e.target.value)}
                          className="editable-input"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          value={candidatePhone}
                          onChange={(e) => setCandidatePhone(e.target.value)}
                          className="editable-input"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="form-group">
                        <label>Position Applied</label>
                        <input
                          type="text"
                          value={candidatePosition}
                          onChange={(e) => setCandidatePosition(e.target.value)}
                          className="editable-input"
                          placeholder="Enter position"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group full-width">
                        <label>Department</label>
                        <input
                          type="text"
                          value={candidateDepartment}
                          onChange={(e) => setCandidateDepartment(e.target.value)}
                          className="editable-input"
                          placeholder="Enter department"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="scheduling-form">
                  <div className="form-section">
                    <h3>Select Interview Date</h3>
                    <div className="date-time-inputs">
                      <div className="form-group">
                        <label>Interview Date</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => handleDateSelect(e.target.value)}
                          className="date-input"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Select Interview Time</h3>
                    <div className="date-time-inputs">
                      <div className="form-group">
                        <label>Interview Time</label>
                        <input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => handleTimeSelect(e.target.value)}
                          className="time-input"
                        />
                      </div>
                    </div>
                  </div>

                  {selectedDate && selectedTime && (
                    <>
                      <div className="form-section">
                        <h3>Interview Type</h3>
                        <div className="interview-type-selection">
                          <button
                            className={`type-button ${interviewType === 'onsite' ? 'selected' : ''}`}
                            onClick={() => handleInterviewTypeChange('onsite')}
                          >
                            On-site Interview
                          </button>
                          <button
                            className={`type-button ${interviewType === 'online' ? 'selected' : ''}`}
                            onClick={() => handleInterviewTypeChange('online')}
                          >
                            Online Interview
                          </button>
                          <button
                            className={`type-button ${interviewType === 'phone' ? 'selected' : ''}`}
                            onClick={() => handleInterviewTypeChange('phone')}
                          >
                            Phone Interview
                          </button>
                        </div>
                      </div>

                      <div className="form-section">
                        <h3>Interview Location</h3>
                        <div className="location-input-container">
                          <input
                            type="text"
                            className="location-input"
                            placeholder={
                              interviewType === 'onsite'
                                ? 'Enter office address, meeting room, or specific location'
                                : interviewType === 'online'
                                  ? 'Online meeting'
                                  : 'Phone number'
                            }
                            value={interviewLocation}
                            onChange={(e) => setInterviewLocation(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-section">
                        <h3>Interview Instructions</h3>
                        <textarea
                          className="interview-instructions"
                          placeholder="Enter any special instructions for the interview (e.g., documents to bring, meeting location, technical requirements, etc.)"
                          value={interviewInstructions}
                          onChange={(e) => setInterviewInstructions(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="interview-summary">
                        <h4>Interview Summary</h4>
                        <div className="summary-details">
                          <p><strong>Candidate:</strong> {candidateName}</p>
                          <p><strong>Email:</strong> {candidateEmail}</p>
                          <p><strong>Phone:</strong> {candidatePhone}</p>
                          <p><strong>Position:</strong> {candidatePosition}</p>
                          <p><strong>Department:</strong> {candidateDepartment}</p>
                          <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p><strong>Time:</strong> {new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                          <p><strong>Type:</strong> {interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview</p>
                          <p><strong>Location:</strong> {interviewLocation || 'Not specified'}</p>
                          {interviewInstructions && (
                            <p><strong>Instructions:</strong> {interviewInstructions}</p>
                          )}
                        </div>
                      </div>

                      <button
                        className="schedule-button"
                        onClick={handleScheduleInterview}
                        disabled={!candidateName || !candidateEmail || !selectedDate || !selectedTime || !interviewLocation}
                      >
                        Schedule Interview
                      </button>

                      {notificationSent && (
                        <div className="notification-success">
                          <div className="success-icon">✓</div>
                          <div className="success-content">
                            <h4>Interview Scheduled Successfully!</h4>
                            <p>Interview details have been sent to {candidateName} ({candidateEmail})</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="no-candidate-selected">
                <div className="no-selection-icon">📅</div>
                <h3>Select a Candidate</h3>
                <p>Choose a shortlisted candidate from the left panel to schedule their interview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewSchedulingInterface;