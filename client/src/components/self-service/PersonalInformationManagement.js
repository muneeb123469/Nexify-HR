import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EmployerSideBar } from '../dashboard/EmployeeDashboard';
import { ApplicantSideBar } from '../dashboard/ApplicantDashboard';
import { Sidebar } from '../dashboard/HRDashboard';
import './PersonalInformationManagement.css';
import { API_BASE_URL } from '../../config/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL
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
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Change Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [showIncorrectPasswordOptions, setShowIncorrectPasswordOptions] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

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

  // Password strength validation function
  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password)
    });
  };

  // Handle password input change
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    // Check password strength for new password
    if (field === 'newPassword') {
      checkPasswordStrength(value);
    }

    // Clear error when user types
    if (passwordError) {
      setPasswordError('');
    }
  };

  // Open Change Password modal
  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setShowIncorrectPasswordOptions(false);
    setPasswordStrength({
      hasMinLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false
    });
  };

  // Close Change Password modal
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setShowIncorrectPasswordOptions(false);
  };

  // Handle Retry (clear old password and try again)
  const handleRetry = () => {
    setPasswordData(prev => ({
      ...prev,
      oldPassword: ''
    }));
    setPasswordError('');
    setShowIncorrectPasswordOptions(false);
  };

  // Navigate to Forgot Password
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Handle Change Password submission
  const handleChangePassword = async () => {
    setPasswordError('');

    // Validate all fields are filled
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }

    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Check password strength
    const isPasswordStrong = Object.values(passwordStrength).every(val => val === true);
    if (!isPasswordStrong) {
      setPasswordError('Password does not meet all requirements');
      return;
    }

    try {
      setChangingPassword(true);

      const response = await apiClient.post('/users/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        // Show success message
        setNotification({
          type: 'success',
          message: 'Password changed successfully! Redirecting to login...'
        });

        // Close modal
        closePasswordModal();

        // Wait 2 seconds before logout
        setTimeout(() => {
          // Clear localStorage (logout)
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          // Redirect to login
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Error changing password:', error);

      // Check if it's an incorrect old password error
      if (error.response?.data?.incorrectPassword) {
        setPasswordError(error.response.data.message);
        setShowIncorrectPasswordOptions(true);
      } else {
        setPasswordError(error.response?.data?.message || 'Failed to change password. Please try again.');
      }
    } finally {
      setChangingPassword(false);
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

            {/* Change Password button - only visible in edit mode */}
            {isEditing && (
              <div className="change-password-section">
                <button className="change-password-button" onClick={openPasswordModal} disabled={saving}>
                  Change Password
                </button>
              </div>
            )}
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

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={closePasswordModal}>
          <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="modal-close" onClick={closePasswordModal}>×</button>
            </div>

            <div className="modal-body">
              {passwordError && (
                <div className="password-error-message">
                  {passwordError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="oldPassword">Current Password</label>
                <input
                  type="password"
                  id="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                  placeholder="Enter current password"
                  disabled={changingPassword}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                  disabled={changingPassword}
                  className="form-control"
                />

                {/* Password Strength Indicator */}
                <div className="password-requirements">
                  <div className={`requirement ${passwordStrength.hasMinLength ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordStrength.hasMinLength ? '✓' : '○'}</span>
                    At least 8 characters
                  </div>
                  <div className={`requirement ${passwordStrength.hasUpperCase ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordStrength.hasUpperCase ? '✓' : '○'}</span>
                    One uppercase letter
                  </div>
                  <div className={`requirement ${passwordStrength.hasLowerCase ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordStrength.hasLowerCase ? '✓' : '○'}</span>
                    One lowercase letter
                  </div>
                  <div className={`requirement ${passwordStrength.hasNumber ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordStrength.hasNumber ? '✓' : '○'}</span>
                    One number
                  </div>
                  <div className={`requirement ${passwordStrength.hasSpecialChar ? 'met' : ''}`}>
                    <span className="requirement-icon">{passwordStrength.hasSpecialChar ? '✓' : '○'}</span>
                    One special character (@$!%*?&)
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  disabled={changingPassword}
                  className="form-control"
                />
              </div>

              {/* Show Retry/Forgot Password options if old password is incorrect */}
              {showIncorrectPasswordOptions && (
                <div className="incorrect-password-options">
                  <button
                    className="retry-button"
                    onClick={handleRetry}
                    disabled={changingPassword}
                  >
                    Retry
                  </button>
                  <button
                    className="forgot-password-link-button"
                    onClick={handleForgotPassword}
                    disabled={changingPassword}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="cancel-button-modal"
                onClick={closePasswordModal}
                disabled={changingPassword}
              >
                Cancel
              </button>
              <button
                className="save-button-modal"
                onClick={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonalInformationManagement;
