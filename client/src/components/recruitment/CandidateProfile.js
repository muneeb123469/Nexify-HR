import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CandidateProfile.css';

const CandidateProfile = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch application details: ${response.status}`);
      }

      const data = await response.json();
      setApplication(data);
    } catch (err) {
      console.error('Error fetching application details:', err);
      setError('Failed to load candidate profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShortlistCandidate = async () => {
    try {
      setIsShortlisting(true);

      // Update application status to shortlisted
      const response = await fetch(`http://localhost:5000/api/applications/${application._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'shortlisted' })
      });

      if (!response.ok) {
        throw new Error('Failed to shortlist candidate');
      }

      // Update local state
      setApplication(prev => ({ ...prev, status: 'shortlisted' }));

      // Show success toast and navigate to interview scheduling
      showToast(`${application.name} has been shortlisted successfully! Redirecting to interview scheduling...`, 'success');

      // Navigate to interview scheduling section after a short delay
      setTimeout(() => {
        navigate('/hr/interview-scheduling');
      }, 1500);

    } catch (error) {
      console.error('Error shortlisting candidate:', error);
      showToast('Failed to shortlist candidate. Please try again.', 'error');
    } finally {
      setIsShortlisting(false);
    }
  };

  const handleDownloadResume = async () => {
    try {
      if (!application.resume) {
        showToast('No resume file available for this candidate.', 'error');
        return;
      }

      // Use the dedicated download route
      const response = await fetch(`http://localhost:5000/api/applications/download-resume/${application._id}`, {
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
      showToast(`Failed to download resume: ${error.message}`, 'error');
    }
  };

  const formatExperience = (experience) => {
    if (!experience || experience.length === 0) return 'No experience data available';

    return (
      <div className="experience-list">
        {experience.map((exp, index) => {
          // Parse description to extract bullet points
          const renderDescription = () => {
            if (!exp.description) return null;

            // Split by newlines to get individual lines
            const lines = exp.description.split('\n').filter(line => line.trim());

            // Check if description has bullet points
            const hasBullets = lines.some(line => line.trim().startsWith('•'));

            if (hasBullets) {
              // Render as bullet list
              return (
                <ul className="experience-bullets">
                  {lines.map((line, i) => {
                    const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
                    return cleanLine ? <li key={i}>{cleanLine}</li> : null;
                  })}
                </ul>
              );
            } else {
              // Render as paragraphs
              return lines.map((line, i) => (
                <p key={i} className="experience-description">{line}</p>
              ));
            }
          };

          return (
            <div key={index} className="experience-entry">
              <h4 className="experience-title">
                {exp.title}{exp.company && ` (${exp.company})`}
              </h4>
              {(exp.startDate || exp.endDate) && (
                <p className="experience-duration">
                  {exp.startDate || ''}{exp.startDate && exp.endDate && ' - '}{exp.endDate || ''}
                  {exp.location && ` | ${exp.location}`}
                </p>
              )}
              {renderDescription()}
              {index < experience.length - 1 && <div className="experience-divider"></div>}
            </div>
          );
        })}
      </div>
    );
  };

  const formatEducation = (education) => {
    if (!education || education.length === 0) return 'No education data available';

    return education.map((edu, index) => (
      <div key={index} className="education-item">
        <h4>{edu.degree} {edu.field && `in ${edu.field}`}</h4>
        <p>{edu.institution}</p>
        <p className="education-duration">
          {edu.startDate} - {edu.endDate}
          {edu.grade && ` | Grade: ${edu.grade}`}
        </p>
      </div>
    ));
  };

  const formatSkills = (skills) => {
    if (!skills || skills.length === 0) return 'No skills data available';

    return skills.map((skill, index) => (
      <span key={index} className="skill-tag">{skill}</span>
    ));
  };

  if (loading) {
    return (
      <div className="candidate-profile-container">
        <div className="loading">Loading candidate profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidate-profile-container">
        <div className="error">
          {error}
          <button onClick={fetchApplicationDetails} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="candidate-profile-container">
        <div className="error">Candidate not found</div>
      </div>
    );
  }

  // Get data from parsed resume if available, otherwise use form data
  const profileData = {
    name: application.parsedResume?.name || application.name,
    email: application.parsedResume?.email || application.email,
    phone: application.parsedResume?.phone || application.phone,
    location: application.parsedResume?.location || 'Not specified',
    skills: application.parsedResume?.skills || [],
    experience: application.parsedResume?.experience || [],
    education: application.parsedResume?.education || [],
    projects: application.parsedResume?.projects || [],  // NEW: Projects data
    summary: application.parsedResume?.summary || application.coverLetter,
    certifications: application.parsedResume?.certifications || [],
    languages: application.parsedResume?.languages || []
  };
  const resumeParsingFailed = application.resumeParsingStatus === 'failed';

  return (
    <div className="candidate-profile-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="profile-header">
        <div className="header-content">
          {/* <button className="back-button" onClick={() => navigate('/hr/candidate-applications')}>
            ← Back to Applications
          </button> */}
          <h1>Candidate Profile</h1>
          <div className="header-actions">
            <button
              className="download-resume-btn"
              onClick={handleDownloadResume}
              disabled={!application.resume}
            >
              Download Resume
            </button>
            <button
              className="schedule-interview-btn"
              onClick={handleShortlistCandidate}
              disabled={isShortlisting}
            >
              {isShortlisting ? 'Shortlisting...' : 'Shortlist Candidate'}
            </button>
          </div>
        </div>
      </div>

      {resumeParsingFailed && (
        <div className="resume-parsing-note">
          Resume parsing failed, but the uploaded resume is still available for download.
        </div>
      )}

      {/* Profile Content */}
      <div className="profile-content">
        {/* Basic Information */}
        <section className="profile-section">
          <h2>Basic Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{profileData.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{profileData.email}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{profileData.phone}</span>
            </div>
            <div className="info-item">
              <label>Location:</label>
              <span>{profileData.location}</span>
            </div>
            <div className="info-item">
              <label>Applied For:</label>
              <span>{application.job?.title || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Application Status:</label>
              <span className={`status-badge ${application.status}`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>
            <div className="info-item">
              <label>Applied Date:</label>
              <span>{new Date(application.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Department:</label>
              <span>{application.job?.department || 'N/A'}</span>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="profile-section">
          <h2>Skills</h2>
          <div className="skills-container">
            {profileData.skills.length > 0 ? formatSkills(profileData.skills) : 'No skills data available'}
          </div>
        </section>

        {/* Experience */}
        <section className="profile-section">
          <h2>Work Experience</h2>
          <div className="experience-container">
            {formatExperience(profileData.experience)}
          </div>
        </section>

        {/* Projects */}
        {profileData.projects && profileData.projects.length > 0 && (
          <section className="profile-section">
            <h2>Projects</h2>
            <div className="experience-container">
              {formatExperience(profileData.projects)}
            </div>
          </section>
        )}

        {/* Education */}
        <section className="profile-section">
          <h2>Education</h2>
          <div className="education-container">
            {formatEducation(profileData.education)}
          </div>
        </section>

        {/* Summary/Cover Letter */}
        {profileData.summary && (
          <section className="profile-section">
            <h2>{application.parsedResume?.summary ? 'Professional Summary' : 'Cover Letter'}</h2>
            <div className="summary-content">
              <p>{profileData.summary}</p>
            </div>
          </section>
        )}

        {/* Certifications */}
        {profileData.certifications.length > 0 && (
          <section className="profile-section">
            <h2>Certifications</h2>
            <div className="certifications-container">
              {profileData.certifications.map((cert, index) => (
                <div key={index} className="certification-item">{cert}</div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {profileData.languages.length > 0 && (
          <section className="profile-section">
            <h2>Languages</h2>
            <div className="languages-container">
              {profileData.languages.map((lang, index) => (
                <span key={index} className="language-tag">{lang}</span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;
