import { useState, useEffect } from "react";
import { FaVideo, FaClock, FaCopy } from 'react-icons/fa';
import HRFeedbackModal from './HRFeedbackModal';
import "./Meeting.css";
import { Sidebar } from "../dashboard/HRDashboard";

const Meeting = () => {
  const [meetings, setMeetings] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, []);



  const fetchMeetings = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/meetings/all`);
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };





  const copyLink = (meetingUrl) => {
    navigator.clipboard.writeText(meetingUrl);
    alert("Meeting link copied!");
  };

  const markAsConducted = async (meetingId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/meetings/${meetingId}/conducted`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        alert("Interview marked as conducted!");
        fetchMeetings(); // Refresh the list
      } else {
        alert("Failed to update interview status.");
      }
    } catch (error) {
      console.error('Error marking interview as conducted:', error);
      alert("Error updating interview status.");
    }
  };

  const handleSubmitFeedback = (meeting) => {
    setSelectedMeeting(meeting);
    setShowFeedbackModal(true);
  };

  const submitHRFeedback = async (feedback) => {
    try {
      const response = await fetch(`http://localhost:5000/api/meetings/${selectedMeeting._id}/hr-feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });

      if (response.ok) {
        alert("Feedback submitted successfully!");
        fetchMeetings(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Failed to submit feedback: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error submitting HR feedback:', error);
      alert("Error submitting feedback.");
    }
  };









  return (
    <>
    <Sidebar/>
    <div className="gig-container animate-fade-in">
      <div className="page-header">
        <h1>Interview Meetings</h1>
        <p>View and join scheduled interview meetings</p>
      </div>



      <div className="gig-stats">
        <p>{meetings.length} meetings found</p>
      </div>

      <div className="gig-grid">
        {meetings.map((meeting) => {
          return (
            <div key={meeting._id} className="gig-card">
                <div className="gig-content">
                  <div className="meeting-info">
                    <h3 className="gig-title">Interview Meeting</h3>
                    <div className="meeting-meta">
                      <div className="meta-item">
                        <FaClock className="meta-icon" />
                        <span>Date: {meeting.date}</span>
                      </div>
                      <div className="meta-item">
                        <FaClock className="meta-icon" />
                        <span>Time: {meeting.time}</span>
                      </div>
                      <div className="meta-item">
                        <FaClock className="meta-icon" />
                        <span>Duration: {meeting.duration} minutes</span>
                      </div>
                      <div className="meta-item">
                        <FaClock className="meta-icon" />
                        <span>Participants: {meeting.participantNames?.join(', ')}</span>
                      </div>
                      <div className="meta-item">
                        <span className={`status-badge ${meeting.interviewConducted ? 'conducted' : 'pending'}`}>
                          {meeting.interviewConducted ? '✅ Interview Conducted' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="gig-actions">
                    {meeting.hrModeratorUrl && (
                      <a 
                        href={meeting.hrModeratorUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="action-button primary-button"
                      >
                        <FaVideo className="me-2" /> Join as HR (Moderator)
                      </a>
                    )}
                    {/* <a 
                      href={meeting.meetingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="action-button secondary-button"
                    >
                      <FaVideo className="me-2" /> Applicant Link
                    </a> */}
                    <button 
                      onClick={() => copyLink(meeting.hrModeratorUrl || meeting.meetingUrl)}
                      className="action-button"
                    >
                      <FaCopy className="me-2" /> Copy HR Link
                    </button>
                    <button 
                      onClick={() => copyLink(meeting.meetingUrl)}
                      className="action-button"
                    >
                      <FaCopy className="me-2" /> Copy Applicant Link
                    </button>
                    {!meeting.interviewConducted && (
                      <button 
                        onClick={() => markAsConducted(meeting._id)}
                        className="action-button success-button"
                      >
                        ✅ Mark as Conducted
                      </button>
                    )}
                    {meeting.interviewConducted && !meeting.hrFeedback && (
                      <button 
                        onClick={() => handleSubmitFeedback(meeting)}
                        className="action-button feedback-button"
                      >
                        📝 Submit Feedback
                      </button>
                    )}
                    {meeting.interviewConducted && meeting.hrFeedback && (
                      <span className="feedback-submitted">
                        ✅ Feedback Submitted
                      </span>
                    )}
                  </div>
                </div>
              </div>
          );
        })}
      </div>

      <HRFeedbackModal
        meeting={selectedMeeting}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={submitHRFeedback}
      />
    </div>
    </>
  );
};

export default Meeting;