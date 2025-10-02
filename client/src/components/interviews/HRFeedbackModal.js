import React, { useState } from 'react';
import './HRFeedbackModal.css';

const HRFeedbackModal = ({ meeting, isOpen, onClose, onSubmit }) => {
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

  const handleSubmit = () => {
    if (!feedback.overallAssessment.trim()) {
      alert('Overall assessment is required');
      return;
    }
    onSubmit(feedback);
    onClose();
    // Reset form
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
  };

  const renderRatingStars = (category, value) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star ${star <= value ? 'filled' : ''}`}
            onClick={() => handleRatingChange(category, star)}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Submit Interview Feedback</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="interview-details">
            <h3>Interview Details</h3>
            <p><strong>Date:</strong> {meeting?.date}</p>
            <p><strong>Time:</strong> {meeting?.time}</p>
            <p><strong>Participants:</strong> {meeting?.participantNames?.join(', ')}</p>
          </div>

          <div className="feedback-form">
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
                <label>Overall Assessment *</label>
                <textarea
                  value={feedback.overallAssessment}
                  onChange={(e) => handleTextChange('overallAssessment', e.target.value)}
                  placeholder="Enter overall assessment..."
                  required
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
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="submit-button" 
            onClick={handleSubmit}
            disabled={!feedback.overallAssessment.trim()}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRFeedbackModal;