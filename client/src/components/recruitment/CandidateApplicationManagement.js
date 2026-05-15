import React, { useState } from 'react';
import './CandidateApplicationManagement.css';

const CandidateApplicationManagement = () => {
  const [applications, setApplications] = useState([
    {
      id: 1,
      candidateName: 'John Doe',
      jobTitle: 'Senior Software Engineer',
      status: 'Under Review',
      appliedDate: '2024-03-15',
      resume: 'resume.pdf',
      coverLetter: 'cover_letter.pdf',
    },
    {
      id: 2,
      candidateName: 'Jane Smith',
      jobTitle: 'Product Manager',
      status: 'Shortlisted',
      appliedDate: '2024-03-14',
      resume: 'resume.pdf',
      coverLetter: 'cover_letter.pdf',
    },
  ]);

  const [filters, setFilters] = useState({
    candidateName: '',
    jobTitle: '',
    status: '',
  });

  const [selectedApplications, setSelectedApplications] = useState([]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (applicationId, newStatus) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );
  };

  const handleBatchStatusChange = (newStatus) => {
    setApplications(prev =>
      prev.map(app =>
        selectedApplications.includes(app.id) ? { ...app, status: newStatus } : app
      )
    );
    setSelectedApplications([]);
  };

  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplications(prev =>
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  return (
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
          />
          <input
            type="text"
            name="jobTitle"
            placeholder="Search by job title"
            value={filters.jobTitle}
            onChange={handleFilterChange}
            className="search-input"
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="status-filter"
          >
            <option value="">All Status</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {selectedApplications.length > 0 && (
        <div className="batch-actions">
          <span>{selectedApplications.length} applications selected</span>
          <div className="batch-buttons">
            <button
              onClick={() => handleBatchStatusChange('Shortlisted')}
              className="batch-btn shortlist"
            >
              Shortlist Selected
            </button>
            <button
              onClick={() => handleBatchStatusChange('Rejected')}
              className="batch-btn reject"
            >
              Reject Selected
            </button>
          </div>
        </div>
      )}

      <div className="applications-table">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedApplications(applications.map(app => app.id));
                    } else {
                      setSelectedApplications([]);
                    }
                  }}
                  checked={selectedApplications.length === applications.length}
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
              <tr key={application.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedApplications.includes(application.id)}
                    onChange={() => toggleApplicationSelection(application.id)}
                  />
                </td>
                <td>{application.candidateName}</td>
                <td>{application.jobTitle}</td>
                <td>
                  <select
                    value={application.status}
                    onChange={(e) => handleStatusChange(application.id, e.target.value)}
                    className={`status-select ${application.status.toLowerCase().replace(' ', '-')}`}
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td>{application.appliedDate}</td>
                <td>
                  <div className="action-buttons">
                    <span className="unavailable-action">Profile unavailable</span>
                    <span className="unavailable-action">Resume unavailable</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CandidateApplicationManagement;
