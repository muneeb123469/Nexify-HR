import React, { useState } from 'react';
import './NewEmployeeProfile.css';

const NewEmployeeProfile = () => {
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    },
    employmentInfo: {
      department: '',
      position: '',
      startDate: '',
      employmentType: '',
      reportingManager: '',
      workLocation: ''
    },
    documents: {
      resume: null,
      idProof: null,
      addressProof: null,
      educationalCertificates: []
    },
    bankDetails: {
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      accountType: ''
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [notification, setNotification] = useState(null);

  const nextStep = () => setCurrentStep(step => Math.min(step + 1, 4));
  const prevStep = () => setCurrentStep(step => Math.max(step - 1, 1));

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleEmergencyContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        emergencyContact: {
          ...prev.personalInfo.emergencyContact,
          [field]: value
        }
      }
    }));
  };

  const handleFileUpload = (field, files) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: files[0]
      }
    }));
  };

  const handleEducationalCertificateUpload = (files) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        educationalCertificates: [...prev.documents.educationalCertificates, ...files]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add validation logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="new-employee-profile">
      <div className="profile-header">
        <h1>Create New Employee Profile</h1>
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>Personal Info</div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>Employment Info</div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>Documents</div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>Bank Details</div>
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {currentStep === 1 && (
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.personalInfo.address}
                  onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="emergency-contact">
              <h3>Emergency Contact</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.personalInfo.emergencyContact.name}
                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Relationship</label>
                  <input
                    type="text"
                    value={formData.personalInfo.emergencyContact.relationship}
                    onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.personalInfo.emergencyContact.phone}
                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-section">
            <h2>Employment Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Department</label>
                <select
                  value={formData.employmentInfo.department}
                  onChange={(e) => handleInputChange('employmentInfo', 'department', e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  value={formData.employmentInfo.position}
                  onChange={(e) => handleInputChange('employmentInfo', 'position', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={formData.employmentInfo.startDate}
                  onChange={(e) => handleInputChange('employmentInfo', 'startDate', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Employment Type</label>
                <select
                  value={formData.employmentInfo.employmentType}
                  onChange={(e) => handleInputChange('employmentInfo', 'employmentType', e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reporting Manager</label>
                <input
                  type="text"
                  value={formData.employmentInfo.reportingManager}
                  onChange={(e) => handleInputChange('employmentInfo', 'reportingManager', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Work Location</label>
                <input
                  type="text"
                  value={formData.employmentInfo.workLocation}
                  onChange={(e) => handleInputChange('employmentInfo', 'workLocation', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-section">
            <h2>Required Documents</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Resume</label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload('resume', e.target.files)}
                  accept=".pdf,.doc,.docx"
                  required
                />
              </div>
              <div className="form-group">
                <label>ID Proof</label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload('idProof', e.target.files)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
              </div>
              <div className="form-group">
                <label>Address Proof</label>
                <input
                  type="file"
                  onChange={(e) => handleFileUpload('addressProof', e.target.files)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
              </div>
              <div className="form-group">
                <label>Educational Certificates</label>
                <input
                  type="file"
                  onChange={(e) => handleEducationalCertificateUpload(e.target.files)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="form-section">
            <h2>Bank Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) => handleInputChange('bankDetails', 'accountNumber', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  value={formData.bankDetails.bankName}
                  onChange={(e) => handleInputChange('bankDetails', 'bankName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input
                  type="text"
                  value={formData.bankDetails.ifscCode}
                  onChange={(e) => handleInputChange('bankDetails', 'ifscCode', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Type</label>
                <select
                  value={formData.bankDetails.accountType}
                  onChange={(e) => handleInputChange('bankDetails', 'accountType', e.target.value)}
                  required
                >
                  <option value="">Select Account Type</option>
                  <option value="Savings">Savings</option>
                  <option value="Checking">Checking</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="prev-button">
              Previous
            </button>
          )}
          {currentStep < 4 ? (
            <button type="button" onClick={nextStep} className="next-button">
              Next
            </button>
          ) : (
            <button type="submit" className="submit-button">
              Create Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default NewEmployeeProfile;
