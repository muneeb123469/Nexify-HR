import React, { useState } from 'react';
import './ResumeParsingInterface.css';

const ResumeParsingInterface = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [parsingStatus, setParsingStatus] = useState({});
  const [parsedData, setParsedData] = useState({});

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleParse = (fileId) => {
    setParsingStatus(prev => ({
      ...prev,
      [fileId]: 'parsing'
    }));

    // Simulate parsing process
    setTimeout(() => {
      setParsingStatus(prev => ({
        ...prev,
        [fileId]: 'completed'
      }));

      // Simulate parsed data
      setParsedData(prev => ({
        ...prev,
        [fileId]: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 234 567 8900',
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          experience: [
            {
              company: 'Tech Corp',
              position: 'Senior Developer',
              duration: '2020 - Present'
            }
          ],
          education: [
            {
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              university: 'Tech University',
              year: '2016 - 2020'
            }
          ]
        }
      }));
    }, 2000);
  };

  const handleParseAll = () => {
    uploadedFiles.forEach(file => {
      if (file.status === 'pending') {
        handleParse(file.id);
      }
    });
  };

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
            disabled={!uploadedFiles.some(file => file.status === 'pending')}
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
              {uploadedFiles.map(file => (
                <div key={file.id} className="file-card">
                  <div className="file-info">
                    <h3>{file.name}</h3>
                    <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <div className="file-status">
                    {parsingStatus[file.id] === 'parsing' ? (
                      <div className="parsing-progress">
                        <div className="progress-bar"></div>
                        <span>Parsing...</span>
                      </div>
                    ) : parsingStatus[file.id] === 'completed' ? (
                      <span className="status-completed">Completed</span>
                    ) : (
                      <button
                        className="parse-button"
                        onClick={() => handleParse(file.id)}
                      >
                        Parse
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="parsed-data">
          <h2>Parsed Data Preview</h2>
          {Object.keys(parsedData).length === 0 ? (
            <p className="no-data">No parsed data available</p>
          ) : (
            <div className="parsed-data-grid">
              {Object.entries(parsedData).map(([fileId, data]) => (
                <div key={fileId} className="parsed-data-card">
                  <h3>Candidate Information</h3>
                  <div className="data-section">
                    <h4>Personal Details</h4>
                    <p><strong>Name:</strong> {data.name}</p>
                    <p><strong>Email:</strong> {data.email}</p>
                    <p><strong>Phone:</strong> {data.phone}</p>
                  </div>
                  <div className="data-section">
                    <h4>Skills</h4>
                    <div className="skills-list">
                      {data.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="data-section">
                    <h4>Experience</h4>
                    {data.experience.map((exp, index) => (
                      <div key={index} className="experience-item">
                        <p><strong>{exp.position}</strong> at {exp.company}</p>
                        <p className="duration">{exp.duration}</p>
                      </div>
                    ))}
                  </div>
                  <div className="data-section">
                    <h4>Education</h4>
                    {data.education.map((edu, index) => (
                      <div key={index} className="education-item">
                        <p><strong>{edu.degree}</strong> in {edu.field}</p>
                        <p>{edu.university}</p>
                        <p className="duration">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeParsingInterface; 