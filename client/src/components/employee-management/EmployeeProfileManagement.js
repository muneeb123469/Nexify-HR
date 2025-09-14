import React, { useState } from 'react';
import './EmployeeProfileManagement.css';

const EmployeeProfileManagement = () => {
  const [employees, setEmployees] = useState([
    {
      id: 'EMP001',
      name: 'John Doe',
      department: 'Engineering',
      position: 'Senior Developer',
      email: 'john.doe@company.com',
      phone: '+1 234 567 8900',
      status: 'Active',
      joinDate: '2023-01-15',
      documents: {
        resume: 'resume.pdf',
        idProof: 'id_proof.pdf',
        addressProof: 'address_proof.pdf',
        certificates: ['cert1.pdf', 'cert2.pdf']
      },
      bankDetails: {
        accountNumber: '****1234',
        bankName: 'Example Bank',
        ifscCode: 'EXBK0001234'
      }
    },
    {
      id: 'EMP002',
      name: 'Jane Smith',
      department: 'HR',
      position: 'HR Manager',
      email: 'jane.smith@company.com',
      phone: '+1 234 567 8901',
      status: 'Active',
      joinDate: '2023-02-01',
      documents: {
        resume: 'resume.pdf',
        idProof: 'id_proof.pdf',
        addressProof: 'address_proof.pdf',
        certificates: ['cert1.pdf']
      },
      bankDetails: {
        accountNumber: '****5678',
        bankName: 'Example Bank',
        ifscCode: 'EXBK0005678'
      }
    }
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [notification, setNotification] = useState(null);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setActiveTab('personal');
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfileManagement; 