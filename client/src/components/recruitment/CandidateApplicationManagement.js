import React, { useEffect, useMemo, useState } from 'react';
import { useApplications } from '../../context/ApplicationContext';
import './CandidateApplicationManagement.css';

const CandidateApplicationManagement = () => {
  const {
    applications,
    loading,
    error,
    fetchApplications,
    updateApplicationStatus,
  } = useApplications();
  const [filters, setFilters] = useState({
    candidateName: '',
    jobTitle: '',
    status: '',
  });

  const [selectedApplications, setSelectedApplications] = useState([]);
  const [actionError, setActionError] = useState('');
  const applicationList = useMemo(
    () => (Array.isArray(applications) ? applications : []),
    [applications]
  );

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    return applicationList.filter(application => {
      const applicantName = application.applicantName || '';
      const jobTitle = application.jobTitle || '';
      const status = application.status || '';

      return (
        applicantName.toLowerCase().includes(filters.candidateName.toLowerCase()) &&
        jobTitle.toLowerCase().includes(filters.jobTitle.toLowerCase()) &&
        (!filters.status || status === filters.status)
      );
    });
  }, [applicationList, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setActionError('');
    const result = await updateApplicationStatus(applicationId, newStatus);

    if (result?.success === false) {
      setActionError(result.error || 'Failed to update application status');
    }
  };

  const handleBatchStatusChange = async (newStatus) => {
    setActionError('');

    const results = await Promise.all(
      selectedApplications.map(applicationId =>
        updateApplicationStatus(applicationId, newStatus)
      )
    );
    const failedResult = results.find(result => result?.success === false);

    if (failedResult) {
      setActionError(failedResult.error || 'Failed to update one or more applications');
    } else {
      setSelectedApplications([]);
    }
  };

  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplications(prev =>
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const filteredApplicationIds = filteredApplications.map(application => application._id);
  const allFilteredSelected =
    filteredApplicationIds.length > 0 &&
    filteredApplicationIds.every(applicationId => selectedApplications.includes(applicationId));

  const formatStatus = (status = '') => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </div>
      {error && <div className="error-state">{error}</div>}
      {actionError && <div className="error-state">{actionError}</div>}

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
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedApplications(filteredApplicationIds);
                    } else {
                      setSelectedApplications([]);
                    }
                  }}
                  checked={allFilteredSelected}
                  disabled={filteredApplicationIds.length === 0}
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
            {loading && (
              <tr>
                <td colSpan="6" className="empty-state">Loading applications...</td>
              </tr>
            )}
            {!loading && filteredApplications.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  No applications found. Submitted applicant applications will appear here.
                </td>
              </tr>
            )}
            {!loading && filteredApplications.map(application => (
              <tr key={application._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedApplications.includes(application._id)}
                    onChange={() => toggleApplicationSelection(application._id)}
                  />
                </td>
                <td>{application.applicantName || 'Unknown Applicant'}</td>
                <td>{application.jobTitle}</td>
                <td>
                  <select
                    value={application.status}
                    onChange={(e) => handleStatusChange(application._id, e.target.value)}
                    className={`status-select ${application.status}`}
                  >
                    <option value="pending">{formatStatus('pending')}</option>
                    <option value="shortlisted">{formatStatus('shortlisted')}</option>
                    <option value="rejected">{formatStatus('rejected')}</option>
                    <option value="hired">{formatStatus('hired')}</option>
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
