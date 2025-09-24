import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import './JobPostingsDashboard.css';

const JobPostingsDashboard = () => {
  const navigate = useNavigate();
  const { jobs } = useJobs();

  const [filters, setFilters] = useState({
    jobType: '',
    status: '',
    dateRange: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const postings = useMemo(() => {
    return jobs
      .filter(j => {
        if (filters.jobType && j.department !== filters.jobType) return false;
        if (filters.status && (j.status || '').toLowerCase() !== filters.status.toLowerCase()) return false;
        return true;
      })
      .map(j => ({
        id: j._id,
        title: j.title,
        department: j.department,
        status: (j.status || 'active'),
        postedDate: j.postedDate ? new Date(j.postedDate).toISOString().slice(0,10) : '',
        applications: j.applicationsCount || 0,
        views: j.viewsCount || 0,
      }));
  }, [jobs, filters]);

  return (
    <div className="job-postings-dashboard">
      <div className="dashboard-header">
        <h1>Job Postings Dashboard</h1>
        <button className="create-job-btn" onClick={() => navigate('/hr/jobs/create')}>Create Job</button>
        <div className="filter-section">
          <select
            name="jobType"
            value={filters.jobType}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Job Types</option>
            <option value="Engineering">Engineering</option>
            <option value="Project">Project</option>
            <option value="HR">HR</option>
            <option value="Design">Design</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
          <select
            name="dateRange"
            value={filters.dateRange}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
      </div>

      {postings.length === 0 ? (
        <div className="no-postings">
          <p>No active postings available</p>
        </div>
      ) : (
        <div className="postings-grid">
          {postings.map(posting => (
            <div key={posting.id} className="posting-card">
              <div className="posting-header">
                <h3>{posting.title}</h3>
                <span className={`status-badge ${posting.status.toLowerCase()}`}>
                  {posting.status}
                </span>
              </div>
              <div className="posting-details">
                <p className="department">{posting.department}</p>
                <p className="date">Posted: {posting.postedDate}</p>
              </div>
              <div className="posting-metrics">
                <div className="metric">
                  <span className="metric-value">{posting.applications}</span>
                  <span className="metric-label">Applications</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{posting.views}</span>
                  <span className="metric-label">Views</span>
                </div>
              </div>
              <button 
                className="view-details-btn"
                onClick={() => navigate(`/jobs/${posting.id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobPostingsDashboard; 