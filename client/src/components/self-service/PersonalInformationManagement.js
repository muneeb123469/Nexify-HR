import React, { useState } from 'react';
import './PersonalInformationManagement.css';

const PersonalInformationManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [auditLog, setAuditLog] = useState([]);

  // Sample data - replace with actual data from your backend
  const [personalInfo, setPersonalInfo] = useState({
    basicInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State 12345'
    },
    emergencyContacts: [
      {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1 (555) 987-6543'
      }
    ],
    bankingInfo: {
      bankName: 'Sample Bank',
      accountNumber: '****1234',
      routingNumber: '****5678'
    }
  });

  const [editedInfo, setEditedInfo] = useState(personalInfo);

  const handleEdit = () => {
    setEditedInfo(personalInfo);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo(personalInfo);
  };

  const handleInputChange = (section, field, value) => {
    setEditedInfo(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleEmergencyContactChange = (index, field, value) => {
    setEditedInfo(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const addEmergencyContact = () => {
    setEditedInfo(prev => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { name: '', relationship: '', phone: '' }
      ]
    }));
  };

  const removeEmergencyContact = (index) => {
    setEditedInfo(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const { basicInfo, emergencyContacts } = editedInfo;
    
    if (!basicInfo.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setNotification({
        type: 'error',
        message: 'Please enter a valid email address'
      });
      return false;
    }

    if (!basicInfo.phone.match(/^\+?[\d\s-()]+$/)) {
      setNotification({
        type: 'error',
        message: 'Please enter a valid phone number'
      });
      return false;
    }

    for (const contact of emergencyContacts) {
      if (!contact.name || !contact.phone) {
        setNotification({
          type: 'error',
          message: 'Please fill in all required emergency contact fields'
        });
        return false;
      }
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Add to audit log
    const timestamp = new Date().toISOString();
    setAuditLog(prev => [
      ...prev,
      {
        timestamp,
        action: 'Update personal information',
        details: 'Personal information updated'
      }
    ]);

    setPersonalInfo(editedInfo);
    setIsEditing(false);
    setNotification({
      type: 'success',
      message: 'Personal information updated successfully!'
    });
  };

  return (
    <div className="personal-info-management">
      <div className="dashboard-header">
        <h1>Personal Information Management</h1>
        {!isEditing && (
          <button className="edit-button" onClick={handleEdit}>
            Edit Information
          </button>
        )}
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="dashboard-content">
        <div className="info-section">
          <h2>Basic Information</h2>
          <div className="info-grid">
            {Object.entries(isEditing ? editedInfo.basicInfo : personalInfo.basicInfo).map(([key, value]) => (
              <div key={key} className="info-item">
                <label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                {isEditing ? (
                  <input
                    type={key === 'email' ? 'email' : 'text'}
                    value={value}
                    onChange={(e) => handleInputChange('basicInfo', key, e.target.value)}
                    className="form-control"
                  />
                ) : (
                  <span className="info-value">{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="info-section">
          <h2>Emergency Contacts</h2>
          <div className="emergency-contacts">
            {(isEditing ? editedInfo.emergencyContacts : personalInfo.emergencyContacts).map((contact, index) => (
              <div key={index} className="contact-card">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                      placeholder="Contact Name"
                      className="form-control"
                    />
                    <input
                      type="text"
                      value={contact.relationship}
                      onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                      placeholder="Relationship"
                      className="form-control"
                    />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                      placeholder="Phone Number"
                      className="form-control"
                    />
                    <button
                      className="remove-contact-button"
                      onClick={() => removeEmergencyContact(index)}
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <>
                    <div className="contact-info">
                      <strong>{contact.name}</strong>
                      <span>{contact.relationship}</span>
                      <span>{contact.phone}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
            {isEditing && (
              <button className="add-contact-button" onClick={addEmergencyContact}>
                Add Emergency Contact
              </button>
            )}
          </div>
        </div>

        <div className="info-section">
          <h2>Banking Information</h2>
          <div className="info-grid">
            {Object.entries(isEditing ? editedInfo.bankingInfo : personalInfo.bankingInfo).map(([key, value]) => (
              <div key={key} className="info-item">
                <label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange('bankingInfo', key, e.target.value)}
                    className="form-control"
                  />
                ) : (
                  <span className="info-value">{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {isEditing && (
          <div className="action-buttons">
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button className="save-button" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        )}

        <div className="audit-log-section">
          <h2>Recent Changes</h2>
          <div className="audit-log">
            {auditLog.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-timestamp">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span className="log-action">{log.action}</span>
                <span className="log-details">{log.details}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformationManagement; 