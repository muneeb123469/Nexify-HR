import React, { useState } from 'react';
import './InterviewSchedulingInterface.css';

const InterviewSchedulingInterface = () => {
  const [shortlistedCandidates, setShortlistedCandidates] = useState([
    {
      id: 1,
      name: 'John Doe',
      position: 'Senior Software Engineer',
      availability: ['2024-03-20', '2024-03-21', '2024-03-22'],
    },
    {
      id: 2,
      name: 'Jane Smith',
      position: 'Product Manager',
      availability: ['2024-03-21', '2024-03-22', '2024-03-23'],
    },
  ]);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [interviewType, setInterviewType] = useState('onsite');
  const [interviewers, setInterviewers] = useState([]);
  const [notificationSent, setNotificationSent] = useState(false);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

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
    if (!interviewers.includes(interviewer)) {
      setInterviewers([...interviewers, interviewer]);
    }
  };

  const handleInterviewerRemove = (interviewer) => {
    setInterviewers(interviewers.filter(i => i !== interviewer));
  };

  const handleScheduleInterview = () => {
    // Simulate scheduling process
    setTimeout(() => {
      setNotificationSent(true);
    }, 1000);
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
            {shortlistedCandidates.map(candidate => (
              <div
                key={candidate.id}
                className={`candidate-card ${selectedCandidate?.id === candidate.id ? 'selected' : ''}`}
                onClick={() => handleCandidateSelect(candidate)}
              >
                <h3>{candidate.name}</h3>
                <p className="position">{candidate.position}</p>
                <div className="availability">
                  <h4>Available Dates:</h4>
                  <div className="date-tags">
                    {candidate.availability.map(date => (
                      <span key={date} className="date-tag">{date}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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
                          <option value="Sarah Johnson">Sarah Johnson</option>
                          <option value="Mike Brown">Mike Brown</option>
                          <option value="Lisa Chen">Lisa Chen</option>
                        </select>
                        <div className="selected-interviewers">
                          {interviewers.map(interviewer => (
                            <div key={interviewer} className="interviewer-tag">
                              {interviewer}
                              <button
                                onClick={() => handleInterviewerRemove(interviewer)}
                                className="remove-interviewer"
                              >
                                ×
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

                    {notificationSent && (
                      <div className="notification-success">
                        Interview scheduled successfully! Notifications sent to all participants.
                      </div>
                    )}
                  </>
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