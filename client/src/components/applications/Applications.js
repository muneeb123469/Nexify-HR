import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Clock4,
  Eye,
  X,
  Check,
  Download,
  MessageSquare,
  MapPin,
  Video,
  User
} from 'lucide-react';
import './Applications.css';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Submitted': { color: 'bg-blue-100 text-blue-800', icon: FileText },
    'Under Review': { color: 'bg-yellow-100 text-yellow-800', icon: Clock4 },
    'Interview Scheduled': { color: 'bg-purple-100 text-purple-800', icon: Calendar },
    'Offer Extended': { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    'Rejected': { color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  const config = statusConfig[status] || statusConfig['Submitted'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </span>
  );
};

// Application Card Component
const ApplicationCard = ({ application, onViewDetails, onWithdraw, onRespondToOffer }) => {
  return (
    <div className="application-card">
      <div className="application-header">
        <div>
          <h3>{application.position}</h3>
          <p>{application.company}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>
      
      <div className="application-details">
        <div className="detail-item">
          <Calendar className="icon" />
          <span>Applied on {application.appliedDate}</span>
        </div>
        {application.interviewDate && (
          <div className="detail-item">
            <Clock className="icon" />
            <span>Interview: {application.interviewDate}</span>
          </div>
        )}
      </div>

      <div className="application-actions">
        <div className="job-id">
          <span>Job ID: {application.jobId}</span>
        </div>
        <div className="action-buttons">
          <button
            onClick={() => onViewDetails(application)}
            className="view-button"
          >
            <Eye className="icon" />
            View
          </button>
          
          {application.status !== 'Rejected' && application.status !== 'Offer Extended' && (
            <button
              onClick={() => onWithdraw(application)}
              className="withdraw-button"
            >
              <X className="icon" />
              Withdraw
            </button>
          )}
          
          {application.status === 'Offer Extended' && (
            <div className="offer-buttons">
              <button
                onClick={() => onRespondToOffer(application, 'accept')}
                className="accept-button"
              >
                <Check className="icon" />
                Accept
              </button>
              <button
                onClick={() => onRespondToOffer(application, 'decline')}
                className="decline-button"
              >
                <X className="icon" />
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Application Details Modal Component
const ApplicationDetailsModal = ({ application, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h3>{application.position}</h3>
            <p>{application.company}</p>
          </div>
          <button onClick={onClose} className="close-button">
            <XCircle className="icon" />
          </button>
        </div>

        <div className="modal-body">
          <div className="details-section">
            <h4>Application Details</h4>
            <div className="details-grid">
              <div>
                <p>Job ID</p>
                <p>{application.jobId}</p>
              </div>
              <div>
                <p>Applied Date</p>
                <p>{application.appliedDate}</p>
              </div>
              <div>
                <p>Status</p>
                <StatusBadge status={application.status} />
              </div>
              {application.interviewDate && (
                <div>
                  <p>Interview Date</p>
                  <p>{application.interviewDate}</p>
                </div>
              )}
            </div>
          </div>

          {application.status === 'Interview Scheduled' && (
            <div className="interview-section">
              <h4>Interview Details</h4>
              <div className="interview-details">
                <div className="detail-item">
                  <Calendar className="icon" />
                  <span>{application.interviewDate}</span>
                </div>
                <div className="detail-item">
                  <Clock className="icon" />
                  <span>{application.interviewTime}</span>
                </div>
                <div className="detail-item">
                  <User className="icon" />
                  <span>Interviewer: {application.interviewer}</span>
                </div>
                <div className="detail-item">
                  {application.mode === 'Virtual' ? (
                    <Video className="icon" />
                  ) : (
                    <MapPin className="icon" />
                  )}
                  <span>{application.location || application.platform}</span>
                </div>
              </div>
            </div>
          )}

          {application.status === 'Offer Extended' && (
            <div className="offer-section">
              <h4>Offer Details</h4>
              <div className="offer-details">
                <div className="offer-item">
                  <span>Salary</span>
                  <span>{application.salary}</span>
                </div>
                <div className="offer-item">
                  <span>Start Date</span>
                  <span>{application.startDate}</span>
                </div>
                <div className="offer-item">
                  <span>Offer Expires</span>
                  <span>{application.offerExpiry}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Applications Component
const Applications = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for applications
  const applications = [
    {
      id: 1,
      position: 'Senior Software Engineer',
      company: 'Tech Corp',
      jobId: 'TC-SE-2024',
      status: 'Under Review',
      appliedDate: '2024-03-15',
      interviewDate: '2024-03-25',
      interviewTime: '10:00 AM',
      interviewer: 'John Smith',
      mode: 'Virtual',
      platform: 'Zoom'
    },
    {
      id: 2,
      position: 'Product Manager',
      company: 'Innovate Inc',
      jobId: 'II-PM-2024',
      status: 'Interview Scheduled',
      appliedDate: '2024-03-10',
      interviewDate: '2024-03-28',
      interviewTime: '2:00 PM',
      interviewer: 'Sarah Johnson',
      mode: 'In-person',
      location: '123 Tech Street, San Francisco, CA'
    },
    {
      id: 3,
      position: 'UX Designer',
      company: 'Design Studio',
      jobId: 'DS-UX-2024',
      status: 'Offer Extended',
      appliedDate: '2024-03-05',
      salary: '$85,000',
      startDate: '2024-04-15',
      offerExpiry: '2024-03-30'
    },
    {
      id: 4,
      position: 'Data Analyst',
      company: 'Data Corp',
      jobId: 'DC-DA-2024',
      status: 'Rejected',
      appliedDate: '2024-03-01'
    }
  ];

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleWithdrawApplication = (application) => {
    // Here you would typically make an API call to withdraw the application
    console.log('Withdrawing application:', application);
  };

  const handleRespondToOffer = (application, response) => {
    // Here you would typically make an API call to respond to the offer
    console.log('Responding to offer:', application, response);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h2>My Applications</h2>
        <div className="applications-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="status-filter">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Offer Extended">Offer Extended</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="applications-grid">
        {filteredApplications.length === 0 ? (
          <div className="no-applications">
            <p>No applications found</p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onViewDetails={handleViewDetails}
              onWithdraw={handleWithdrawApplication}
              onRespondToOffer={handleRespondToOffer}
            />
          ))
        )}
      </div>

      {showDetailsModal && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

export default Applications;