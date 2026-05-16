import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './PersonalInformationManagement.css';

const EMPLOYEE_STORAGE_KEY = 'nexify_hr_employee_records';
const PERSONAL_INFO_STORAGE_KEY = 'nexify_hr_employee_personal_info';

const readStorageArray = (key) => {
  try {
    const value = localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return [];
  }
};

const readStorageObject = (key) => {
  try {
    const value = localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return {};
  }
};

const createEmptyInfo = (employee = {}) => ({
  basicInfo: {
    name: employee.name || '',
    email: employee.email || '',
    phone: employee.phone || '',
    department: employee.department || 'Pending Assignment',
    role: employee.role || employee.position || 'Unassigned Role',
    address: '',
  },
  emergencyContacts: [],
  bankingInfo: {
    bankName: '',
    accountNumber: '',
    routingNumber: '',
  },
});

const mergeEmployeeInfo = (employee, savedInfo) => {
  const defaults = createEmptyInfo(employee);

  return {
    basicInfo: {
      ...defaults.basicInfo,
      ...(savedInfo?.basicInfo || {}),
    },
    emergencyContacts: Array.isArray(savedInfo?.emergencyContacts)
      ? savedInfo.emergencyContacts
      : [],
    bankingInfo: {
      ...defaults.bankingInfo,
      ...(savedInfo?.bankingInfo || {}),
    },
  };
};

const formatLabel = (key) =>
  key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');

const PersonalInformationManagement = () => {
  const { user } = useAuth() || {};
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [employees] = useState(() => readStorageArray(EMPLOYEE_STORAGE_KEY));
  const [savedPersonalInfo, setSavedPersonalInfo] = useState(() =>
    readStorageObject(PERSONAL_INFO_STORAGE_KEY)
  );

  const currentEmployee = useMemo(() => {
    const userEmail = user?.email?.toLowerCase();
    return (
      employees.find((employee) => employee.email?.toLowerCase() === userEmail) ||
      employees[0] ||
      null
    );
  }, [employees, user]);

  const employeeKey = currentEmployee?.id || currentEmployee?.email || 'current-employee';
  const personalInfo = currentEmployee
    ? mergeEmployeeInfo(currentEmployee, savedPersonalInfo[employeeKey])
    : null;

  const [editedInfo, setEditedInfo] = useState(personalInfo || createEmptyInfo());

  const handleEdit = () => {
    setEditedInfo(personalInfo);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo(personalInfo);
  };

  const handleInputChange = (section, field, value) => {
    setEditedInfo((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleEmergencyContactChange = (index, field, value) => {
    setEditedInfo((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      ),
    }));
  };

  const addEmergencyContact = () => {
    setEditedInfo((prev) => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { name: '', relationship: '', phone: '' },
      ],
    }));
  };

  const removeEmergencyContact = (index) => {
    setEditedInfo((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const { basicInfo, emergencyContacts } = editedInfo;

    if (!basicInfo.name.trim()) {
      setNotification({ type: 'error', message: 'Name is required.' });
      return false;
    }

    if (!basicInfo.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setNotification({ type: 'error', message: 'Please enter a valid email address.' });
      return false;
    }

    if (basicInfo.phone && !basicInfo.phone.match(/^\+?[\d\s() -]+$/)) {
      setNotification({ type: 'error', message: 'Please enter a valid phone number.' });
      return false;
    }

    for (const contact of emergencyContacts) {
      if (!contact.name || !contact.phone) {
        setNotification({
          type: 'error',
          message: 'Please fill in emergency contact name and phone, or remove the incomplete contact.',
        });
        return false;
      }
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const timestamp = new Date().toISOString();
    const nextSavedInfo = {
      ...savedPersonalInfo,
      [employeeKey]: editedInfo,
    };

    localStorage.setItem(PERSONAL_INFO_STORAGE_KEY, JSON.stringify(nextSavedInfo));
    setSavedPersonalInfo(nextSavedInfo);
    setAuditLog((prev) => [
      ...prev,
      {
        timestamp,
        action: 'Update personal information',
        details: 'Personal information saved locally for this demo.',
      },
    ]);
    setIsEditing(false);
    setNotification({
      type: 'success',
      message: 'Personal information saved locally for this demo.',
    });
  };

  if (!currentEmployee) {
    return (
      <div className="personal-info-management">
        <div className="dashboard-header">
          <h1>Personal Information Management</h1>
        </div>
        <div className="info-section">
          <p className="no-data">No employee record found. Ask HR to sync your employee record first.</p>
        </div>
      </div>
    );
  }

  const displayedInfo = isEditing ? editedInfo : personalInfo;

  return (
    <div className="personal-info-management">
      <div className="dashboard-header">
        <div>
          <h1>Personal Information Management</h1>
          <p className="local-demo-note">Personal information is saved locally for this demo.</p>
        </div>
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
            {Object.entries(displayedInfo.basicInfo).map(([key, value]) => (
              <div key={key} className="info-item">
                <label>{formatLabel(key)}</label>
                {isEditing ? (
                  <input
                    type={key === 'email' ? 'email' : 'text'}
                    value={value}
                    onChange={(e) => handleInputChange('basicInfo', key, e.target.value)}
                    className="form-control"
                  />
                ) : (
                  <span className="info-value">{value || 'Not Set'}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="info-section">
          <h2>Emergency Contacts</h2>
          <div className="emergency-contacts">
            {displayedInfo.emergencyContacts.length === 0 && !isEditing ? (
              <p className="no-data">No emergency contacts saved locally.</p>
            ) : displayedInfo.emergencyContacts.map((contact, index) => (
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
                  <div className="contact-info">
                    <strong>{contact.name}</strong>
                    <span>{contact.relationship || 'Relationship not set'}</span>
                    <span>{contact.phone}</span>
                  </div>
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
            {Object.entries(displayedInfo.bankingInfo).map(([key, value]) => (
              <div key={key} className="info-item">
                <label>{formatLabel(key)}</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange('bankingInfo', key, e.target.value)}
                    className="form-control"
                  />
                ) : (
                  <span className="info-value">{value || 'Not Set'}</span>
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
            {auditLog.length === 0 ? (
              <p className="no-data">No local changes in this session.</p>
            ) : auditLog.map((log, index) => (
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
