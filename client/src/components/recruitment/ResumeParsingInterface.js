import React, { useState } from 'react';
import api from '../../utils/api';
import './ResumeParsingInterface.css';

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
};

const normalizeParsedData = (data = {}) => ({
  name: data.name || '',
  email: data.email || '',
  phone: data.phone || '',
  skills: toArray(data.skills),
  experience: toArray(data.experience),
  education: toArray(data.education),
  rawText: data.rawText || data.summary || '',
});

const formatFileSize = (size) => {
  if (!size) return '0 KB';
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
  return `${(size / 1024).toFixed(2)} KB`;
};

const ResumeParsingInterface = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const updateFile = (fileId, updates) => {
    setUploadedFiles((previousFiles) =>
      previousFiles.map((file) =>
        file.id === fileId ? { ...file, ...updates } : file
      )
    );
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'Pending',
      error: '',
      parsedData: null,
    }));

    setUploadedFiles((previousFiles) => [...previousFiles, ...newFiles]);
    event.target.value = '';
  };

  const handleParse = async (fileId) => {
    const targetFile = uploadedFiles.find((file) => file.id === fileId);
    if (!targetFile) return;

    const formData = new FormData();
    formData.append('resume', targetFile.file);

    updateFile(fileId, { status: 'Parsing', error: '', parsedData: null });

    try {
      const response = await api.post('/resumes/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateFile(fileId, {
        status: 'Completed',
        parsedData: normalizeParsedData(response.data?.parsed),
      });
    } catch (error) {
      updateFile(fileId, {
        status: 'Failed',
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'Resume parsing failed',
      });
    }
  };

  const handleParseAll = () => {
    uploadedFiles
      .filter((file) => file.status === 'Pending')
      .forEach((file) => handleParse(file.id));
  };

  const renderStatus = (file) => {
    if (file.status === 'Parsing') {
      return (
        <div className="parsing-progress">
          <div className="progress-bar"></div>
          <span>Parsing</span>
        </div>
      );
    }

    if (file.status === 'Completed') {
      return <span className="status-completed">Completed</span>;
    }

    if (file.status === 'Failed') {
      return (
        <div className="failed-status">
          <span className="status-failed">Failed</span>
          <button className="parse-button" onClick={() => handleParse(file.id)}>
            Retry
          </button>
        </div>
      );
    }

    return (
      <button className="parse-button" onClick={() => handleParse(file.id)}>
        Parse
      </button>
    );
  };

  const parsedFiles = uploadedFiles.filter((file) => file.parsedData);
  const hasPendingFiles = uploadedFiles.some((file) => file.status === 'Pending');

  return (
    <div className="resume-parsing-interface">
      <div className="parsing-header">
        <h1>Resume Parsing Interface</h1>
        <div className="upload-section">
          <label className="upload-button">
            Upload Resumes
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="file-input"
            />
          </label>
          <button
            className="parse-all-button"
            onClick={handleParseAll}
            disabled={!hasPendingFiles}
          >
            Parse All
          </button>
        </div>
      </div>

      <div className="parsing-content">
        <div className="files-list">
          <h2>Uploaded Files</h2>
          {uploadedFiles.length === 0 ? (
            <p className="no-files">No files uploaded yet</p>
          ) : (
            <div className="files-grid">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="file-card">
                  <div className="file-info">
                    <h3>{file.name}</h3>
                    <p className="file-size">{formatFileSize(file.size)}</p>
                    <p className="file-type">{file.status}</p>
                    {file.error && <p className="file-error">{file.error}</p>}
                  </div>
                  <div className="file-status">{renderStatus(file)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="parsed-data">
          <h2>Parsed Data Preview</h2>
          {parsedFiles.length === 0 ? (
            <p className="no-data">
              Upload a resume and click Parse All to preview parsed data.
            </p>
          ) : (
            <div className="parsed-data-grid">
              {parsedFiles.map((file) => {
                const data = file.parsedData;

                return (
                  <div key={file.id} className="parsed-data-card">
                    <h3>{file.name}</h3>
                    <div className="data-section">
                      <h4>Personal Details</h4>
                      <p><strong>Name:</strong> {data.name || 'Not found'}</p>
                      <p><strong>Email:</strong> {data.email || 'Not found'}</p>
                      <p><strong>Phone:</strong> {data.phone || 'Not found'}</p>
                    </div>
                    <div className="data-section">
                      <h4>Skills</h4>
                      {data.skills.length > 0 ? (
                        <div className="skills-list">
                          {data.skills.map((skill, index) => (
                            <span key={`${skill}-${index}`} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      ) : (
                        <p>No skills found.</p>
                      )}
                    </div>
                    <div className="data-section">
                      <h4>Experience</h4>
                      {data.experience.length > 0 ? (
                        data.experience.map((exp, index) => (
                          <div key={index} className="experience-item">
                            {typeof exp === 'string' ? (
                              <p>{exp}</p>
                            ) : (
                              <>
                                <p>
                                  <strong>{exp.title || exp.position || 'Experience'}</strong>
                                  {exp.company ? ` at ${exp.company}` : ''}
                                </p>
                                {exp.description && <p>{exp.description}</p>}
                                {exp.location && <p className="duration">{exp.location}</p>}
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <p>No experience found.</p>
                      )}
                    </div>
                    <div className="data-section">
                      <h4>Education</h4>
                      {data.education.length > 0 ? (
                        data.education.map((edu, index) => (
                          <div key={index} className="education-item">
                            {typeof edu === 'string' ? (
                              <p>{edu}</p>
                            ) : (
                              <>
                                <p>
                                  <strong>{edu.degree || 'Education'}</strong>
                                  {edu.field ? ` in ${edu.field}` : ''}
                                </p>
                                <p>{edu.institution || edu.university || 'Institution not found'}</p>
                                {edu.grade && <p className="duration">{edu.grade}</p>}
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <p>No education found.</p>
                      )}
                    </div>
                    {data.rawText && (
                      <div className="data-section">
                        <h4>Raw Text Preview</h4>
                        <p className="raw-text-preview">{data.rawText.slice(0, 600)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeParsingInterface;
