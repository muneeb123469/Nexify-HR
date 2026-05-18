import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PerformanceAnalytics from './PerformanceAnalytics';
import './EmployeeProfileManagement.css';
import { API_BASE_URL } from '../../config/api';

const EmployeeProfileManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/employees`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')} `
        }
      });

      if (response.data.success) {
        // Transform API data to match component expectations
        const transformedEmployees = response.data.employees.map(emp => ({
          id: emp.id,
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department,
          position: emp.role,
          email: emp.email,
          phone: emp.phone,
          status: emp.status,
          joinDate: emp.hireDate ? new Date(emp.hireDate).toISOString().split('T')[0] : '',
          documents: {
            resume: 'resume.pdf',
            idProof: 'id_proof.pdf',
            addressProof: 'address_proof.pdf',
            certificates: []
          },
          bankDetails: {
            accountNumber: '****',
            bankName: 'Not specified',
            ifscCode: 'N/A'
          }
        }));

        setEmployees(transformedEmployees);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees. Please try again.');
      setNotification({
        type: 'error',
        message: 'Failed to load employees'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setActiveTab('personal');
    // Reset password form when selecting new employee
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
  };

  const handleStatusChange = (employeeId, newStatus) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === employeeId
          ? { ...emp, status: newStatus }
          : emp
      )
    );
    setNotification({
      type: 'success',
      message: 'Employee status updated successfully!'
    });
  };

  const handleDocumentDownload = (documentName) => {
    // Implement document download logic
    console.log('Downloading document:', documentName);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);

      // Call API to change password
      const response = await axios.put(
        `${API_BASE_URL}/employees/${selectedEmployee.id}/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }
      );

      setNotification({
        type: 'success',
        message: 'Password changed successfully!'
      });

      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Auto-hide notification
      setTimeout(() => setNotification(null), 5000);

    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error.response?.data?.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredEmployees = employees.filter(employee =>
    Object.values(employee).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="employee-profile-management">
      <div className="profile-header">
        <h1>Employee Profile Management</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="profile-content">
        <div className="employees-list">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Position</th>
                <th>Status</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr
                  key={employee.id}
                  className={selectedEmployee?.id === employee.id ? 'selected' : ''}
                  onClick={() => handleEmployeeSelect(employee)}
                >
                  <td>{employee.id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.department}</td>
                  <td>{employee.position}</td>
                  <td>
                    <span className={`status-badge ${employee.status.toLowerCase()}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td>{employee.joinDate}</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(
                          employee.id,
                          employee.status === 'Active' ? 'Inactive' : 'Active'
                        );
                      }}
                      className={`status-toggle ${employee.status.toLowerCase()}`}
                    >
                      {employee.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedEmployee && (
          <div className="employee-details">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                Personal Info
              </button>
              <button
                className={`tab ${activeTab === 'employment' ? 'active' : ''}`}
                onClick={() => setActiveTab('employment')}
              >
                Employment
              </button>
              <button
                className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                Documents
              </button>
              <button
                className={`tab ${activeTab === 'bank' ? 'active' : ''}`}
                onClick={() => setActiveTab('bank')}
              >
                Bank Details
              </button>
              <button
                className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
              >
                Performance Analytics
              </button>
              <button
                className={`tab ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                Change Password
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'personal' && (
                <div className="info-section">
                  <h3>Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Name</label>
                      <p>{selectedEmployee.name}</p>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <p>{selectedEmployee.email}</p>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <p>{selectedEmployee.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'employment' && (
                <div className="info-section">
                  <h3>Employment Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Department</label>
                      <p>{selectedEmployee.department}</p>
                    </div>
                    <div className="info-item">
                      <label>Position</label>
                      <p>{selectedEmployee.position}</p>
                    </div>
                    <div className="info-item">
                      <label>Join Date</label>
                      <p>{selectedEmployee.joinDate}</p>
                    </div>
                    <div className="info-item">
                      <label>Status</label>
                      <p>{selectedEmployee.status}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="info-section">
                  <h3>Documents</h3>
                  <div className="documents-list">
                    <div className="document-item">
                      <span>Resume</span>
                      <button
                        onClick={() => handleDocumentDownload(selectedEmployee.documents.resume)}
                        className="download-button"
                      >
                        Download
                      </button>
                    </div>
                    <div className="document-item">
                      <span>ID Proof</span>
                      <button
                        onClick={() => handleDocumentDownload(selectedEmployee.documents.idProof)}
                        className="download-button"
                      >
                        Download
                      </button>
                    </div>
                    <div className="document-item">
                      <span>Address Proof</span>
                      <button
                        onClick={() => handleDocumentDownload(selectedEmployee.documents.addressProof)}
                        className="download-button"
                      >
                        Download
                      </button>
                    </div>
                    {selectedEmployee.documents.certificates.map((cert, index) => (
                      <div key={index} className="document-item">
                        <span>Certificate {index + 1}</span>
                        <button
                          onClick={() => handleDocumentDownload(cert)}
                          className="download-button"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'bank' && (
                <div className="info-section">
                  <h3>Bank Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Account Number</label>
                      <p>{selectedEmployee.bankDetails.accountNumber}</p>
                    </div>
                    <div className="info-item">
                      <label>Bank Name</label>
                      <p>{selectedEmployee.bankDetails.bankName}</p>
                    </div>
                    <div className="info-item">
                      <label>IFSC Code</label>
                      <p>{selectedEmployee.bankDetails.ifscCode}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <PerformanceAnalytics employeeId={selectedEmployee.id} />
              )}

              {activeTab === 'password' && (
                <div className="info-section">
                  <h3>Change Password for {selectedEmployee.name}</h3>

                  {passwordError && (
                    <div className="password-error" style={{
                      background: '#f8d7da',
                      color: '#721c24',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      borderLeft: '4px solid #f5c6cb'
                    }}>
                      {passwordError}
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="password-form">
                    <div className="form-group">
                      <label>Current Password *</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Enter current password"
                        required
                        disabled={passwordLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label>New Password *</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Enter new password (min 6 characters)"
                        required
                        minLength={6}
                        disabled={passwordLoading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password *</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Confirm new password"
                        required
                        disabled={passwordLoading}
                      />
                    </div>

                    <button
                      type="submit"
                      className="submit-button"
                      disabled={passwordLoading}
                      style={{
                        background: passwordLoading ? '#ccc' : '#4C9F9F',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: passwordLoading ? 'not-allowed' : 'pointer',
                        marginTop: '16px'
                      }}
                    >
                      {passwordLoading ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfileManagement; 