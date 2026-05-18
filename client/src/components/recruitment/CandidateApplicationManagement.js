import React, { useState, useEffect } from 'react';
import {useParams, useNavigate } from 'react-router-dom';
import './CandidateApplicationManagement.css';
import { Sidebar } from '../dashboard/HRDashboard';
import { API_BASE_URL } from '../../config/api';


const CandidateApplicationManagement = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    candidateName: '',
    jobTitle: '',
    status: '',
  });

  const [selectedApplications, setSelectedApplications] = useState([]);
  
  // Fetch applications from API
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.candidateName) queryParams.append('candidateName', filters.candidateName);
      if (filters.jobTitle) queryParams.append('jobTitle', filters.jobTitle);
      if (filters.status) queryParams.append('status', filters.status);
      if(jobId) queryParams.append('jobId',jobId)
      
      const response = await fetch(`${API_BASE_URL}/applications?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications on component mount and when filters change
  useEffect(() => {
    fetchApplications();
  }, [filters.status]); // Auto-fetch when status filter changes

  // Handle manual search for name and job title
  const handleSearch = () => {
    fetchApplications();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update application status. Please try again.');
    }
  };

  const handleBatchStatusChange = async (newStatus) => {
    try {
      // Update all selected applications
      const updatePromises = selectedApplications.map(applicationId =>
        fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })
      );

      await Promise.all(updatePromises);

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          selectedApplications.includes(app._id) ? { ...app, status: newStatus } : app
        )
      );
      setSelectedApplications([]);
    } catch (err) {
      console.error('Error updating batch status:', err);
      alert('Failed to update application statuses. Please try again.');
    }
  };

  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplications(prev =>
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Handle download resume
  const handleDownloadResume = async (application) => {
    try {
      if (!application.resume) {
        alert('No resume file available for this candidate.');
        return;
      }

      // Use the dedicated download route
      const response = await fetch(`${API_BASE_URL}/applications/download-resume/${application._id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to download resume: ${response.status}`);
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `${application.name}_resume`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert(`Failed to download resume: ${error.message}`);
    }
  };

  // Handle view profile - navigate to candidate profile page
  const handleViewProfile = (application) => {
    navigate(`/hr/candidate-profile/${application._id}`);
  };

  if (loading) {
    return (
      <div className="candidate-application-management">
        <div className="loading">Loading applications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidate-application-management">
        <div className="error">
          {error}
          <button onClick={fetchApplications} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
       <Sidebar/>
    <div className="candidate-application-management">
      <div className="management-header">
        <h1>Candidate Application Management</h1>
        <div className="search-filters">
          <input
            type="text"
            name="candidateName"
            placeholder="Search by candidate name"
            value={filters.candidateName}
            onChange={handleFilterChange}
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <input
            type="text"
            name="jobTitle"
            placeholder="Search by job title"
            value={filters.jobTitle}
            onChange={handleFilterChange}
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="status-filter"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={handleSearch} className="search-btn">
            Search
          </button>
        </div>
      </div>

      {selectedApplications.length > 0 && (
        <div className="batch-actions">
          <span>{selectedApplications.length} applications selected</span>
          <div className="batch-buttons">
            <button
              onClick={() => handleBatchStatusChange('shortlisted')}
              className="batch-btn shortlist"
            >
              Shortlist Selected
            </button>
            <button
              onClick={() => handleBatchStatusChange('rejected')}
              className="batch-btn reject"
            >
              Reject Selected
            </button>
          </div>
        </div>
      )}

      <div className="applications-table">
        {applications.length === 0 ? (
          <div className="no-applications">
            No applications found. {filters.candidateName || filters.jobTitle || filters.status ? 'Try adjusting your filters.' : ''}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedApplications(applications.map(app => app._id));
                      } else {
                        setSelectedApplications([]);
                      }
                    }}
                    checked={selectedApplications.length === applications.length && applications.length > 0}
                  />
                </th>
                <th>Candidate Name</th>
                <th>Job Title</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(application => (
                <tr key={application._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application._id)}
                      onChange={() => toggleApplicationSelection(application._id)}
                    />
                  </td>
                  <td>{application.name}</td>
                  <td>{application.job ? application.job.title : 'N/A'}</td>
                  <td>
                    <select
                      value={application.status}
                      onChange={(e) => handleStatusChange(application._id, e.target.value)}
                      className={`status-select ${application.status.toLowerCase().replace(' ', '-')}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td>{formatDate(application.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="view-profile-btn"
                        onClick={() => handleViewProfile(application)}
                        title="View candidate profile and details"
                      >
                        View Profile
                      </button>
                      {/* <button 
                        className="download-resume-btn"
                        onClick={() => handleDownloadResume(application)}
                        title="Download candidate's resume"
                        disabled={!application.resume}
                      >
                        Download Resume
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
        </>
  );
};

export default CandidateApplicationManagement;