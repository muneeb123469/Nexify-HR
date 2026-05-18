import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './InterviewHistory.css';
import { API_BASE_URL } from '../../config/api';

// Feedback Modal Component
const FeedbackModal = ({ interview, isOpen, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert('Please enter your feedback before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(interview.id, { feedback, rating });
      setFeedback('');
      setRating(5);
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Submit Interview Feedback</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="interview-info">
            <h4>{interview?.jobTitle}</h4>
            <p>Date: {interview?.date} at {interview?.time}</p>
            <p>Interviewer: {interview?.interviewer}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="rating">Overall Experience Rating:</label>
              <select
                id="rating"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="rating-select"
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very Good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="feedback">Your Feedback:</label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Please share your thoughts about the interview process, interviewer, and overall experience..."
                rows={6}
                className="feedback-textarea"
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="submit-btn">
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/meetings/applicant/interviews`);

      // Transform the data to match the expected format
      const transformedInterviews = response.data.map(interview => ({
        id: interview._id,
        jobTitle: interview.jobTitle || 'Software Engineer Position',
        company: interview.company || 'Nexify Technologies',
        date: interview.date,
        time: interview.time,
        type: interview.interviewType || 'Technical Interview',
        interviewType: interview.interviewType || 'Technical Interview',
        status: interview.status || 'Upcoming',
        interviewer: interview.interviewer || 'HR Representative',
        location: interview.location || interview.meetingUrl || 'Location TBD',
        notes: interview.notes,
        result: interview.result,
        feedback: interview.feedback,
        duration: interview.duration,
        meetingUrl: interview.meetingUrl
      }));

      setInterviews(transformedInterviews);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('Failed to load interview history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return '#4C9F9F';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#FF5A5A';
      default:
        return '#666';
    }
  };

  const getResultColor = (result) => {
    switch (result?.toLowerCase()) {
      case 'passed':
        return '#4CAF50';
      case 'failed':
        return '#FF5A5A';
      case 'pending':
        return '#FFB400';
      default:
        return '#666';
    }
  };

  const handleSubmitFeedback = async (interviewId, feedbackData) => {
    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error('Please log in to submit feedback.');
      }

      const token = localStorage.getItem('token');
      console.log('Submitting feedback with token:', token ? 'Token exists' : 'No token found');
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('User data:', user);
      console.log('Axios defaults:', axios.defaults.headers.common);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Explicitly set the authorization header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      console.log('Request config:', config);
      
      const response = await axios.put(
        `${API_BASE_URL}/meetings/${interviewId}/feedback`,
        feedbackData,
        config
      );

      if (response.status === 200) {
        // Update the local interviews state to reflect the feedback submission
        setInterviews(prevInterviews =>
          prevInterviews.map(interview =>
            interview.id === interviewId
              ? { ...interview, applicantFeedback: feedbackData.feedback, applicantRating: feedbackData.rating }
              : interview
          )
        );
        alert('Feedback submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };

  const openFeedbackModal = (interview) => {
    setSelectedInterview(interview);
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setSelectedInterview(null);
    setShowFeedbackModal(false);
  };

  const filteredInterviews = interviews.filter(interview => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return interview.status === 'Upcoming';
    if (filter === 'past') return interview.status === 'Completed';
    return true;
  });

  if (loading) {
    return <div className="loading">Loading interviews...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Error Loading Interviews</h2>
          <p>{error}</p>
          <button onClick={fetchInterviews} className="retry-btn">
            <i className="fas fa-refresh"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-history">
      <div className="header">
        <h1>Interview History</h1>
        <div className="filters">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Interviews</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <input type="text" placeholder="Search interviews..." />
        </div>
      </div>

      <div className="interviews-grid">
        {filteredInterviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <i className="fas fa-calendar-times"></i>
              <h3>No Interviews Found</h3>
              <p>
                {filter === 'all'
                  ? "You don't have any interviews scheduled yet."
                  : `No ${filter} interviews found.`}
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="show-all-btn"
                >
                  Show All Interviews
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredInterviews.map(interview => (
            <div key={interview.id} className="interview-card">
              <div className="interview-header">
                <h3>{interview.jobTitle}</h3>
                <span
                  className="status"
                  style={{ backgroundColor: getStatusColor(interview.status) }}
                >
                  {interview.status}
                </span>
              </div>
              <div className="interview-details">
                <p><i className="fas fa-building"></i> {interview.company}</p>
                <p><i className="fas fa-calendar"></i> Date: {interview.date}</p>
                <p><i className="fas fa-clock"></i> Time: {interview.time}</p>
                <p><i className="fas fa-user"></i> Interviewer: {interview.interviewer}</p>
                <p><i className="fas fa-star"></i> We're excited to discuss your qualifications and explore how you can contribute to our innovative team</p>
                <p><i className="fas fa-tag"></i> Type: {interview.interviewType || interview.type}</p>

                {interview.status === 'Completed' && (
                  <>
                    <p>
                      <i className="fas fa-check-circle"></i> Result:
                      <span
                        className="result"
                        style={{ backgroundColor: getResultColor(interview.result) }}
                      >
                        {interview.result}
                      </span>
                    </p>
                    <p><i className="fas fa-comment"></i> Feedback: {interview.feedback}</p>
                  </>
                )}

                {interview.status === 'Upcoming' && interview.notes && (
                  <p><i className="fas fa-sticky-note"></i> Notes: {interview.notes}</p>
                )}
              </div>

              <div className="interview-actions">
                <button
                  className="feedback-btn"
                  onClick={() => openFeedbackModal(interview)}
                >
                  <i className="fas fa-comment"></i> Submit Feedback
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <FeedbackModal
        interview={selectedInterview}
        isOpen={showFeedbackModal}
        onClose={closeFeedbackModal}
        onSubmit={handleSubmitFeedback}
      />
    </div>
  );
};

export default InterviewHistory; 