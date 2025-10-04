import React, { useState, useEffect } from 'react';
import './InterviewFeedbackRecording.css';
import { Sidebar } from '../dashboard/HRDashboard';

const InterviewFeedbackRecording = () => {
  const [interviews, setInterviews] = useState([]);

  const [selectedInterview, setSelectedInterview] = useState(null);
  const [feedback, setFeedback] = useState({
    technicalSkills: 0,
    communication: 0,
    problemSolving: 0,
    culturalFit: 0,
    strengths: '',
    weaknesses: '',
    overallAssessment: '',
    notes: ''
  });

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/meetings/all');
      const data = await response.json();
      
      // Transform the data to match the expected format
      const transformedInterviews = data.map(meeting => ({
        id: meeting._id,
        candidateName: meeting.participantNames?.find(name => name !== 'HR Representative') || 'Unknown Candidate',
        position: meeting.jobTitle || 'Software Engineer Position',
        date: meeting.date,
        time: meeting.time,
        status: meeting.interviewConducted ? 'completed' : 'upcoming',
        interviewers: ['HR Representative'],
        hrFeedback: meeting.hrFeedback || null,
        applicantFeedback: meeting.applicantFeedback || null,
        applicantRating: meeting.applicantRating || null,
        feedbackSubmittedAt: meeting.feedbackSubmittedAt || null,
        hrFeedbackSubmittedAt: meeting.hrFeedbackSubmittedAt || null,
        duration: meeting.duration,
        meetingUrl: meeting.meetingUrl,
        hrModeratorUrl: meeting.hrModeratorUrl,
        // Keep backward compatibility
        feedback: meeting.hrFeedback || null
      }));
      
      setInterviews(transformedInterviews);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
  };

  const handleInterviewSelect = (interview) => {
    setSelectedInterview(interview);
    if (interview.hrFeedback) {
      setFeedback({
        technicalSkills: interview.hrFeedback.technicalSkills || 0,
        communication: interview.hrFeedback.communication || 0,
        problemSolving: interview.hrFeedback.problemSolving || 0,
        culturalFit: interview.hrFeedback.culturalFit || 0,
        strengths: interview.hrFeedback.strengths || '',
        weaknesses: interview.hrFeedback.weaknesses || '',
        overallAssessment: interview.hrFeedback.overallAssessment || '',
        notes: interview.hrFeedback.notes || ''
      });
    } else {
      setFeedback({
        technicalSkills: 0,
        communication: 0,
        problemSolving: 0,
        culturalFit: 0,
        strengths: '',
        weaknesses: '',
        overallAssessment: '',
        notes: ''
      });
    }
  };

  const handleRatingChange = (category, value) => {
    setFeedback(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleTextChange = (field, value) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitFeedback = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/meetings/${selectedInterview.id}/hr-feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });

      if (response.ok) {
        alert("Feedback submitted successfully!");
        fetchInterviews(); // Refresh the list
        setSelectedInterview(null);
      } else {
        const errorData = await response.json();
        alert(`Failed to submit feedback: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error submitting HR feedback:', error);
      alert("Error submitting feedback.");
    }
  };

  const renderRatingStars = (category, value, isReadOnly = false) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            className={`star ${star <= value ? 'filled' : ''} ${isReadOnly ? 'readonly' : ''}`}
            onClick={isReadOnly ? undefined : () => handleRatingChange(category, star)}
            disabled={isReadOnly}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <Sidebar />
      <div className="interview-feedback-recording">
        <div className="feedback-header">
          <h1>Interview Feedback Recording</h1>
        </div>

      <div className="feedback-content">
        <div className="interviews-section">
          <h2>Interviews ({interviews.length})</h2>
          <div className="interviews-list">
            {interviews.length === 0 ? (
              <div className="no-interviews">
                <p>No interviews found</p>
              </div>
            ) : (
              interviews.map(interview => (
                <div
                  key={interview.id}
                  className={`interview-card ${selectedInterview?.id === interview.id ? 'selected' : ''}`}
                  onClick={() => handleInterviewSelect(interview)}
                >
                  <div className="interview-info">
                    <h3>{interview.candidateName}</h3>
                    <p className="position">{interview.position}</p>
                    <div className="interview-details">
                      <p className="date">{interview.date}</p>
                      <p className="time">{interview.time}</p>
                      <p className="duration">{interview.duration} minutes</p>
                      <span className={`status ${interview.status}`}>
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </span>
                      <div className="feedback-indicators">
                        {interview.hrFeedback && (
                          <span className="feedback-indicator hr">
                            ✅ HR Feedback
                          </span>
                        )}
                        {interview.applicantFeedback && (
                          <span className="feedback-indicator applicant">
                            ✅ Applicant Feedback
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="interviewers">
                      <p>Interviewers:</p>
                      <div className="interviewer-tags">
                        {interview.interviewers.map(interviewer => (
                          <span key={interviewer} className="interviewer-tag">
                            {interviewer}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="feedback-section">
          {selectedInterview ? (
            <div className="feedback-form">
              <h2>Feedback for {selectedInterview.candidateName}</h2>
              <p className="position">{selectedInterview.position}</p>
              <div className="interview-meta">
                <p><strong>Date:</strong> {selectedInterview.date}</p>
                <p><strong>Time:</strong> {selectedInterview.time}</p>
                <p><strong>Duration:</strong> {selectedInterview.duration} minutes</p>
                <p><strong>Status:</strong> {selectedInterview.status.charAt(0).toUpperCase() + selectedInterview.status.slice(1)}</p>
              </div>

              {selectedInterview.status === 'upcoming' ? (
                <div className="upcoming-interview">
                  <p>This interview hasn't been conducted yet. Feedback can be submitted after the interview is completed.</p>
                </div>
              ) : (
                <div className="feedback-display">
                  {/* Applicant Feedback Section */}
                  <div className="feedback-category">
                    <h3>Applicant Feedback</h3>
                    {selectedInterview.applicantFeedback ? (
                      <div className="applicant-feedback-content">
                        <div className="applicant-rating">
                          <label>Overall Rating</label>
                          <div className="rating-display">
                            <div className="rating-stars-display">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span
                                  key={star}
                                  className={`star-display ${star <= (selectedInterview.applicantRating || 0) ? 'filled' : ''}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="rating-value">({selectedInterview.applicantRating}/5)</span>
                          </div>
                        </div>
                        <div className="feedback-item">
                          <label>Feedback</label>
                          <div className="text-content">{selectedInterview.applicantFeedback}</div>
                        </div>
                        {selectedInterview.feedbackSubmittedAt && (
                          <div className="feedback-meta">
                            <p>Submitted: {new Date(selectedInterview.feedbackSubmittedAt).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="no-feedback">
                        <p>No applicant feedback submitted yet</p>
                      </div>
                    )}
                  </div>

                  {/* HR Feedback Section */}
                  <div className="feedback-category">
                    <h3>HR Feedback</h3>
                    {selectedInterview.hrFeedback ? (
                      <div className="hr-feedback-content">
                        <div className="rating-categories-display">
                          <div className="rating-category-display">
                            <label>Technical Skills</label>
                            <div className="rating-display">
                              <div className="rating-stars-display">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span
                                    key={star}
                                    className={`star-display ${star <= (selectedInterview.hrFeedback.technicalSkills || 0) ? 'filled' : ''}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="rating-value">({selectedInterview.hrFeedback.technicalSkills || 0}/5)</span>
                            </div>
                          </div>
                          <div className="rating-category-display">
                            <label>Communication</label>
                            <div className="rating-display">
                              <div className="rating-stars-display">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span
                                    key={star}
                                    className={`star-display ${star <= (selectedInterview.hrFeedback.communication || 0) ? 'filled' : ''}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="rating-value">({selectedInterview.hrFeedback.communication || 0}/5)</span>
                            </div>
                          </div>
                          <div className="rating-category-display">
                            <label>Problem Solving</label>
                            <div className="rating-display">
                              <div className="rating-stars-display">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span
                                    key={star}
                                    className={`star-display ${star <= (selectedInterview.hrFeedback.problemSolving || 0) ? 'filled' : ''}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="rating-value">({selectedInterview.hrFeedback.problemSolving || 0}/5)</span>
                            </div>
                          </div>
                          <div className="rating-category-display">
                            <label>Cultural Fit</label>
                            <div className="rating-display">
                              <div className="rating-stars-display">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span
                                    key={star}
                                    className={`star-display ${star <= (selectedInterview.hrFeedback.culturalFit || 0) ? 'filled' : ''}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="rating-value">({selectedInterview.hrFeedback.culturalFit || 0}/5)</span>
                            </div>
                          </div>
                        </div>

                        <div className="feedback-text-display">
                          {selectedInterview.hrFeedback.strengths && (
                            <div className="text-field-display">
                              <label>Strengths</label>
                              <div className="text-content">{selectedInterview.hrFeedback.strengths}</div>
                            </div>
                          )}
                          {selectedInterview.hrFeedback.weaknesses && (
                            <div className="text-field-display">
                              <label>Weaknesses</label>
                              <div className="text-content">{selectedInterview.hrFeedback.weaknesses}</div>
                            </div>
                          )}
                          {selectedInterview.hrFeedback.overallAssessment && (
                            <div className="text-field-display">
                              <label>Overall Assessment</label>
                              <div className="text-content">{selectedInterview.hrFeedback.overallAssessment}</div>
                            </div>
                          )}
                          {selectedInterview.hrFeedback.notes && (
                            <div className="text-field-display">
                              <label>Additional Notes</label>
                              <div className="text-content">{selectedInterview.hrFeedback.notes}</div>
                            </div>
                          )}
                        </div>

                        {selectedInterview.hrFeedbackSubmittedAt && (
                          <div className="feedback-meta">
                            <p>Submitted: {new Date(selectedInterview.hrFeedbackSubmittedAt).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="hr-feedback-form">
                        <div className="rating-categories">
                          <div className="rating-category">
                            <label>Technical Skills</label>
                            {renderRatingStars('technicalSkills', feedback.technicalSkills, false)}
                          </div>
                          <div className="rating-category">
                            <label>Communication</label>
                            {renderRatingStars('communication', feedback.communication, false)}
                          </div>
                          <div className="rating-category">
                            <label>Problem Solving</label>
                            {renderRatingStars('problemSolving', feedback.problemSolving, false)}
                          </div>
                          <div className="rating-category">
                            <label>Cultural Fit</label>
                            {renderRatingStars('culturalFit', feedback.culturalFit, false)}
                          </div>
                        </div>

                        <div className="feedback-text">
                          <div className="text-field">
                            <label>Strengths</label>
                            <textarea
                              value={feedback.strengths}
                              onChange={(e) => handleTextChange('strengths', e.target.value)}
                              placeholder="Enter candidate's strengths..."
                            />
                          </div>
                          <div className="text-field">
                            <label>Weaknesses</label>
                            <textarea
                              value={feedback.weaknesses}
                              onChange={(e) => handleTextChange('weaknesses', e.target.value)}
                              placeholder="Enter candidate's areas for improvement..."
                            />
                          </div>
                          <div className="text-field">
                            <label>Overall Assessment *</label>
                            <textarea
                              value={feedback.overallAssessment}
                              onChange={(e) => handleTextChange('overallAssessment', e.target.value)}
                              placeholder="Enter overall assessment..."
                            />
                          </div>
                          <div className="text-field">
                            <label>Additional Notes</label>
                            <textarea
                              value={feedback.notes}
                              onChange={(e) => handleTextChange('notes', e.target.value)}
                              placeholder="Enter any additional notes..."
                            />
                          </div>
                        </div>

                        <button
                          className="submit-feedback"
                          onClick={handleSubmitFeedback}
                          disabled={!feedback.overallAssessment}
                        >
                          Submit HR Feedback
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-interview-selected">
              <p>Select an interview to view or provide feedback</p>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default InterviewFeedbackRecording; 