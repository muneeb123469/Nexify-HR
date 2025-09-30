import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './InterviewHistory.css';

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const { user } = useAuth();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:5000/api/meetings/applicant/interviews');
      
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
            
            {interview.status === 'Upcoming' && (
              <div className="interview-actions">
                <button className="reschedule-btn">
                  <i className="fas fa-calendar-alt"></i> Reschedule
                </button>
                <button className="cancel-btn">
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            )}
          </div>
        ))
        )}
      </div>
    </div>
  );
};

export default InterviewHistory; 