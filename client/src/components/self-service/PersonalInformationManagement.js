import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { EmployerSideBar } from '../dashboard/EmployeeDashboard';
import { ApplicantSideBar } from '../dashboard/ApplicantDashboard';
import { Sidebar } from '../dashboard/HRDashboard';
import './PersonalInformationManagement.css';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const PersonalInformationManagement = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Real user data from database
  const [personalInfo, setPersonalInfo] = useState({
    basicInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: ''
    },
    emergencyContacts: [],
    bankingInfo: {
      bankName: '',
      accountNumber: '',
      routingNumber: ''
    }
  });

  const [editedInfo, setEditedInfo] = useState(personalInfo);

  // Fetch user data on component mount
  useEffect(() => {
    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      fetchUserProfile();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token found:', !!token);

      if (!token) {
        setNotification({
          type: 'error',
          message: 'No authentication token found. Please log in again.'
        });
        return;
      }

      console.log('Fetching user profile...');
      const response = await apiClient.get('/users/profile');

      console.log('Profile response:', response.data);

      if (response.data.success) {
        const userData = response.data.user;

        // Parse username into first and last name if available
        const nameParts = userData.username ? userData.username.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const userInfo = {
          basicInfo: {
            firstName: firstName,
            lastName: lastName,
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || ''
          },
          emergencyContacts: userData.emergencyContacts || [],
          bankingInfo: {
            bankName: '',
            accountNumber: '',
            routingNumber: ''
          }
        };

        setPersonalInfo(userInfo);
        setEditedInfo(userInfo);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      console.error('Error details:', error.response?.data);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load profile data. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Prepare data for API
      const updateData = {
        username: `${editedInfo.basicInfo.firstName} ${editedInfo.basicInfo.lastName}`.trim(),
        email: editedInfo.basicInfo.email,
        phone: editedInfo.basicInfo.phone,
        address: editedInfo.basicInfo.address,
        emergencyContacts: editedInfo.emergencyContacts,
        skills: [] // Keep existing skills
      };

      console.log('Updating profile with data:', updateData);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setNotification({
          type: 'error',
          message: 'No authentication token found. Please log in again.'
        });
        return;
      }

      const response = await apiClient.put('/users/profile', updateData);

      if (response.data.success) {
        // Add to audit log
        const timestamp = new Date().toISOString();
        setAuditLog(prev => [
          ...prev,
          {
            timestamp,
            action: 'Update personal information',
            details: 'Personal information updated successfully'
          }
        ]);

        setPersonalInfo(editedInfo);
        setIsEditing(false);
        setNotification({
          type: 'success',
          message: 'Personal information updated successfully!'
        });

        // Clear notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update profile. Please try again.'
      });

      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="personal-info-management">
        <div className="dashboard-header">
          <h1>Personal Information Management</h1>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Determine which sidebar to use based on user role
  const getSidebarComponent = () => {
    switch (user?.role) {
      case 'hr':
        return <Sidebar />;
      case 'applicant':
        return <ApplicantSideBar />;
      case 'employee':
      default:
        return <EmployerSideBar />;
    }
  };

  return (
    <>
      {getSidebarComponent()}
      <div className="personal-info-management">
      <div className="dashboard-header">
        <h1>Personal Information Management</h1>
        {!isEditing && (
          <button className="edit-button" onClick={handleEdit} disabled={saving}>
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

        {/* <div className="info-section">
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
        </div> */}

        {isEditing && (
          <div className="action-buttons">
            <button className="cancel-button" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
            <button className="save-button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
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
    </>
  );
};

export default PersonalInformationManagement; 