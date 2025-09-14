import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import './InterviewHistory.css';

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockInterviews = [
      {
        id: 1,
        jobTitle: 'Senior Software Engineer',
        company: 'Tech Corp',
        date: '2024-03-25',
        time: '10:00 AM',
        type: 'Technical Interview',
        status: 'Upcoming',
        interviewer: 'John Smith',
        location: 'Virtual (Zoom)',
        notes: 'Please prepare for coding questions and system design discussion'
      },
      {
        id: 2,
        jobTitle: 'Frontend Developer',
        company: 'Web Solutions',
        date: '2024-03-15',
        time: '2:00 PM',
        type: 'HR Interview',
        status: 'Completed',
        result: 'Passed',
        feedback: 'Strong communication skills and good technical knowledge',
        interviewer: 'Sarah Johnson',
        location: 'Virtual (Teams)'
      },
      {
        id: 3,
        jobTitle: 'Full Stack Developer',
        company: 'Digital Innovations',
        date: '2024-03-10',
        time: '11:00 AM',
        type: 'Technical Interview',
        status: 'Completed',
        result: 'Failed',
        feedback: 'Need to improve on system design concepts',
        interviewer: 'Mike Brown',
        location: 'Office'
      }
    ];

    setInterviews(mockInterviews);
    setLoading(false);
  }, []);

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
        {filteredInterviews.map(interview => (
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
              <p><i className="fas fa-map-marker-alt"></i> Location: {interview.location}</p>
              <p><i className="fas fa-tag"></i> Type: {interview.type}</p>
              
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
        ))}
      </div>
    </div>
  );
};

export default InterviewHistory; 