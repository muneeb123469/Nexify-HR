import React, { useEffect, useMemo, useState } from 'react';
import { useApplications } from '../../context/ApplicationContext';
import './InterviewSchedulingInterface.css';

const STORAGE_KEY = 'nexify_hr_scheduled_interviews';

const getStoredInterviews = () => {
  try {
    const savedInterviews = localStorage.getItem(STORAGE_KEY);
    const parsedInterviews = savedInterviews ? JSON.parse(savedInterviews) : [];
    return Array.isArray(parsedInterviews) ? parsedInterviews : [];
  } catch (error) {
    console.error('Failed to read scheduled interviews:', error);
    return [];
  }
};

const generateAvailableDates = () =>
  Array.from({ length: 3 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    return date.toISOString().slice(0, 10);
  });

const InterviewSchedulingInterface = () => {
  const { applications, loading, error, fetchApplications } = useApplications();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [interviewType, setInterviewType] = useState('onsite');
  const [interviewers, setInterviewers] = useState([]);
  const [notificationSent, setNotificationSent] = useState(false);

  const availableDates = useMemo(() => generateAvailableDates(), []);
  const shortlistedCandidates = useMemo(() => {
    const applicationList = Array.isArray(applications) ? applications : [];

    return applicationList
      .filter((application) => application.status?.toLowerCase() === 'shortlisted')
      .map((application) => ({
        id: application._id,
        applicationId: application._id,
        name: application.applicantName || 'Unknown Applicant',
        position: application.jobTitle || 'Unknown Job',
        email: application.email || '',
        phone: application.phone || '',
        availability: availableDates,
      }));
  }, [applications, availableDates]);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (
      selectedCandidate &&
      !shortlistedCandidates.some((candidate) => candidate.id === selectedCandidate.id)
    ) {
      setSelectedCandidate(null);
      setSelectedDate('');
      setSelectedTime('');
      setInterviewers([]);
    }
  }, [selectedCandidate, shortlistedCandidates]);

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
    setSelectedDate('');
    setSelectedTime('');
    setNotificationSent(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setNotificationSent(false);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setNotificationSent(false);
  };

  const handleInterviewTypeChange = (type) => {
    setInterviewType(type);
    setNotificationSent(false);
  };

  const handleInterviewerAdd = (interviewer) => {
    if (interviewer && !interviewers.includes(interviewer)) {
      setInterviewers([...interviewers, interviewer]);
      setNotificationSent(false);
    }
  };

  const handleInterviewerRemove = (interviewer) => {
    setInterviewers(interviewers.filter(i => i !== interviewer));
    setNotificationSent(false);
  };

  const handleScheduleInterview = () => {
    if (!selectedCandidate || !selectedDate || !selectedTime || interviewers.length === 0) {
      return;
    }

    const scheduledInterview = {
      id: `interview_${Date.now()}`,
      applicationId: selectedCandidate.applicationId,
      candidateName: selectedCandidate.name,
      position: selectedCandidate.position,
      email: selectedCandidate.email,
      phone: selectedCandidate.phone,
      date: selectedDate,
      time: selectedTime,
      interviewType,
      interviewers,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };

    const updatedInterviews = [...getStoredInterviews(), scheduledInterview];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInterviews));
    setNotificationSent(true);
    setSelectedDate('');
    setSelectedTime('');
    setInterviewers([]);
  };

  return (
    <div className="interview-scheduling-interface">
      <div className="scheduling-header">
        <h1>Interview Scheduling Interface</h1>
      </div>

      <div className="scheduling-content">
        <div className="candidates-section">
          <h2>Shortlisted Candidates</h2>
          <div className="candidates-list">
            {loading ? (
              <div className="no-candidate-selected">
                <p>Loading shortlisted applications...</p>
              </div>
            ) : error ? (
              <div className="no-candidate-selected">
                <p>{error}</p>
              </div>
            ) : shortlistedCandidates.length === 0 ? (
              <div className="no-candidate-selected">
                <p>No shortlisted candidates available. Shortlist candidates from Candidate Applications first.</p>
              </div>
            ) : (
              shortlistedCandidates.map(candidate => (
                <div
                  key={candidate.id}
                  className={`candidate-card ${selectedCandidate?.id === candidate.id ? 'selected' : ''}`}
                  onClick={() => handleCandidateSelect(candidate)}
                >
                  <h3>{candidate.name}</h3>
                  <p className="position">{candidate.position}</p>
                  {candidate.email && <p className="position">{candidate.email}</p>}
                  {candidate.phone && <p className="position">{candidate.phone}</p>}
                  <div className="availability">
                    <h4>Available Dates:</h4>
                    <div className="date-tags">
                      {candidate.availability.map(date => (
                        <span key={date} className="date-tag">{date}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="scheduling-section">
          {selectedCandidate ? (
            <>
              <div className="selected-candidate">
                <h2>Schedule Interview for {selectedCandidate.name}</h2>
                <p className="position">{selectedCandidate.position}</p>
              </div>

              <div className="scheduling-form">
                <div className="form-section">
                  <h3>Select Date</h3>
                  <div className="date-selection">
                    {selectedCandidate.availability.map(date => (
                      <button
                        key={date}
                        className={`date-button ${selectedDate === date ? 'selected' : ''}`}
                        onClick={() => handleDateSelect(date)}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDate && (
                  <div className="form-section">
                    <h3>Select Time</h3>
                    <div className="time-selection">
                      {timeSlots.map(time => (
                        <button
                          key={time}
                          className={`time-button ${selectedTime === time ? 'selected' : ''}`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTime && (
                  <>
                    <div className="form-section">
                      <h3>Interview Type</h3>
                      <div className="interview-type-selection">
                        <button
                          className={`type-button ${interviewType === 'onsite' ? 'selected' : ''}`}
                          onClick={() => handleInterviewTypeChange('onsite')}
                        >
                          On-site
                        </button>
                        <button
                          className={`type-button ${interviewType === 'online' ? 'selected' : ''}`}
                          onClick={() => handleInterviewTypeChange('online')}
                        >
                          Online
                        </button>
                      </div>
                    </div>

                    <div className="form-section">
                      <h3>Interviewers</h3>
                      <div className="interviewers-selection">
                        <select
                          onChange={(e) => handleInterviewerAdd(e.target.value)}
                          value=""
                          className="interviewer-select"
                        >
                          <option value="">Select Interviewer</option>
                          <option value="HR Manager">HR Manager</option>
                          <option value="Technical Lead">Technical Lead</option>
                          <option value="Department Head">Department Head</option>
                          <option value="Recruitment Coordinator">Recruitment Coordinator</option>
                        </select>
                        <div className="selected-interviewers">
                          {interviewers.map(interviewer => (
                            <div key={interviewer} className="interviewer-tag">
                              {interviewer}
                              <button
                                onClick={() => handleInterviewerRemove(interviewer)}
                                className="remove-interviewer"
                              >
                                x
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      className="schedule-button"
                      onClick={handleScheduleInterview}
                      disabled={!selectedDate || !selectedTime || interviewers.length === 0}
                    >
                      Schedule Interview
                    </button>
                    <div className="local-demo-note">
                      Email notifications are not configured in this local demo.
                    </div>

                  </>
                )}

                {notificationSent && (
                  <div className="notification-success">
                    Interview scheduled successfully and saved for feedback review.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-candidate-selected">
              <p>Select a candidate to schedule an interview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewSchedulingInterface;
