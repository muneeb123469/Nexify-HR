import React, { useEffect, useState } from 'react';
import './InterviewFeedbackRecording.css';

const STORAGE_KEY = 'nexify_hr_scheduled_interviews';

const createEmptyFeedback = () => ({
  technicalSkills: 0,
  communication: 0,
  problemSolving: 0,
  culturalFit: 0,
  strengths: '',
  weaknesses: '',
  overallAssessment: '',
  notes: ''
});

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

const saveStoredInterviews = (interviews) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
};

const InterviewFeedbackRecording = () => {
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [feedback, setFeedback] = useState(createEmptyFeedback);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    setInterviews(getStoredInterviews());
  }, []);

  const handleInterviewSelect = (interview) => {
    setSelectedInterview(interview);
    setFeedback(interview.feedback || createEmptyFeedback());
    setFeedbackSuccess(false);
  };

  const handleRatingChange = (category, value) => {
    setFeedback(prev => ({
      ...prev,
      [category]: value
    }));
    setFeedbackSuccess(false);
  };

  const handleTextChange = (field, value) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
    setFeedbackSuccess(false);
  };

  const handleSubmitFeedback = () => {
    if (!selectedInterview) {
      return;
    }

    const updatedInterview = {
      ...selectedInterview,
      feedback,
      status: 'completed',
      feedbackSubmittedAt: new Date().toISOString(),
    };

    const updatedInterviews = interviews.map(interview =>
      interview.id === selectedInterview.id ? updatedInterview : interview
    );

    setInterviews(updatedInterviews);
    saveStoredInterviews(updatedInterviews);
    setSelectedInterview(updatedInterview);
    setFeedbackSuccess(true);
  };

  const hasSavedFeedback =
    selectedInterview?.status === 'completed' || Boolean(selectedInterview?.feedback);

  const renderRatingStars = (category, value) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            className={`star ${star <= value ? 'filled' : ''}`}
            onClick={() => handleRatingChange(category, star)}
          >
            &#9733;
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="interview-feedback-recording">
      <div className="feedback-header">
        <h1>Interview Feedback Recording</h1>
      </div>

      <div className="feedback-content">
        <div className="interviews-section">
          <h2>Interviews</h2>
          <div className="interviews-list">
            {interviews.length === 0 ? (
              <div className="no-interview-selected">
                <p>No scheduled interviews found. Schedule interviews first.</p>
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
                      <span className={`status ${interview.status}`}>
                        {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                      </span>
                    </div>
                    <div className="interviewers">
                      <p>Interviewers:</p>
                      <div className="interviewer-tags">
                        {(interview.interviewers || []).map(interviewer => (
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

              <div className="rating-categories">
                <div className="rating-category">
                  <label>Technical Skills</label>
                  {renderRatingStars('technicalSkills', feedback.technicalSkills)}
                </div>
                <div className="rating-category">
                  <label>Communication</label>
                  {renderRatingStars('communication', feedback.communication)}
                </div>
                <div className="rating-category">
                  <label>Problem Solving</label>
                  {renderRatingStars('problemSolving', feedback.problemSolving)}
                </div>
                <div className="rating-category">
                  <label>Cultural Fit</label>
                  {renderRatingStars('culturalFit', feedback.culturalFit)}
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
                  <label>Overall Assessment</label>
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
                {hasSavedFeedback ? 'Update Feedback' : 'Submit Feedback'}
              </button>

              {feedbackSuccess && (
                <div className="feedback-success">
                  Feedback saved successfully.
                </div>
              )}
            </div>
          ) : (
            <div className="no-interview-selected">
              <p>Select an interview to provide feedback</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewFeedbackRecording;
