import React, { useState } from 'react';
import './InterviewFeedbackRecording.css';

const InterviewFeedbackRecording = () => {
  const [interviews, setInterviews] = useState([
    {
      id: 1,
      candidateName: 'John Doe',
      position: 'Senior Software Engineer',
      date: '2024-03-20',
      time: '10:00 AM',
      status: 'upcoming',
      interviewers: ['Sarah Johnson', 'Mike Brown'],
    },
    {
      id: 2,
      candidateName: 'Jane Smith',
      position: 'Product Manager',
      date: '2024-03-19',
      time: '02:00 PM',
      status: 'completed',
      interviewers: ['Lisa Chen'],
      feedback: {
        technicalSkills: 4,
        communication: 5,
        problemSolving: 4,
        culturalFit: 5,
        strengths: 'Strong technical background and excellent communication skills.',
        weaknesses: 'Could improve on system design knowledge.',
        overallAssessment: 'Highly recommended for the position.',
        notes: 'Great potential for growth.'
      }
    },
  ]);

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

  const handleInterviewSelect = (interview) => {
    setSelectedInterview(interview);
    if (interview.feedback) {
      setFeedback(interview.feedback);
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

  const handleSubmitFeedback = () => {
    setInterviews(prev =>
      prev.map(interview =>
        interview.id === selectedInterview.id
          ? { ...interview, feedback, status: 'completed' }
          : interview
      )
    );
    setSelectedInterview(null);
  };

  const renderRatingStars = (category, value) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            className={`star ${star <= value ? 'filled' : ''}`}
            onClick={() => handleRatingChange(category, star)}
          >
            ★
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
            {interviews.map(interview => (
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
                      {interview.interviewers.map(interviewer => (
                        <span key={interviewer} className="interviewer-tag">
                          {interviewer}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                Submit Feedback
              </button>
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