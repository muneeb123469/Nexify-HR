import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../utils/employeeApi';
import './EmployeeDatabaseManagement.css';

const EmployeeDatabaseManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [notification, setNotification] = useState(null);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    department: '',
    jobTitle: '',
    phone: '',
    hireDate: '',
    salary: '',
    managerId: '',
    status: 'Active'
  });

  // Fetch employees and managers on component mount
  useEffect(() => {
    fetchEmployees();
    fetchManagers();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getAllEmployees();
      if (response.success) {
        setEmployees(response.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to fetch employees'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await employeeApi.getManagers();
      if (response.success) {
        setManagers(response.managers);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddEmployee = () => {
    setNewEmployee({
      name: '',
      email: '',
      department: '',
      jobTitle: '',
      phone: '',
      hireDate: '',
      salary: '',
      managerId: '',
      status: 'Active'
    });
    setShowAddForm(true);
    setShowEditForm(false);
    setShowAuditLogs(false);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setNewEmployee({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      jobTitle: employee.role,
      phone: employee.phone,
      hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
      salary: employee.salary || '',
      managerId: employee.manager?._id || '',
      status: employee.status
    });
    setShowEditForm(true);
    setShowAddForm(false);
    setShowAuditLogs(false);
  };

  const handleViewAuditLogs = (employee) => {
    setSelectedEmployee(employee);
    setShowAuditLogs(true);
    setShowAddForm(false);
    setShowEditForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department,
        jobTitle: newEmployee.jobTitle,
        phone: newEmployee.phone,
        hireDate: newEmployee.hireDate,
        salary: newEmployee.salary ? parseFloat(newEmployee.salary) : null,
        managerId: newEmployee.managerId || null
      };

      const response = await employeeApi.createEmployee(employeeData);
      
      if (response.success) {
        setShowAddForm(false);
        setNewEmployee({
          name: '',
          email: '',
          department: '',
          jobTitle: '',
          phone: '',
          hireDate: '',
          salary: '',
          managerId: '',
          status: 'Active'
        });
        setNotification({
          type: 'success',
          message: 'Employee added successfully!'
        });
        // Refresh employee list
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to add employee'
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department,
        jobTitle: newEmployee.jobTitle,
        phone: newEmployee.phone,
        status: newEmployee.status,
        hireDate: newEmployee.hireDate,
        salary: newEmployee.salary ? parseFloat(newEmployee.salary) : null,
        managerId: newEmployee.managerId || null
      };

      const response = await employeeApi.updateEmployee(selectedEmployee.id, employeeData);
      
      if (response.success) {
        setShowEditForm(false);
        setSelectedEmployee(null);
        setNotification({
          type: 'success',
          message: 'Employee updated successfully!'
        });
        // Refresh employee list
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to update employee'
      });
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to terminate this employee?')) {
      try {
        const response = await employeeApi.deleteEmployee(employeeId);
        
        if (response.success) {
          setNotification({
            type: 'success',
            message: 'Employee terminated successfully!'
          });
          // Refresh employee list
          fetchEmployees();
        }
      } catch (error) {
        console.error('Error terminating employee:', error);
        setNotification({
          type: 'error',
          message: error.message || 'Failed to terminate employee'
        });
      }
    }
  };

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredEmployees = employees.filter(employee =>
    Object.values(employee).some(value =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="employee-database-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-database-management">
      <div className="database-header">
        <h1>Employee Database Management</h1>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <button onClick={handleAddEmployee} className="add-button">
            Add New Employee
          </button>
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="database-content">
        <div className="employees-list">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    {searchTerm ? 'No employees found matching your search.' : 'No employees found. Add some employees to get started.'}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.employeeId || employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.department || 'N/A'}</td>
                    <td>{employee.role || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${employee.status.toLowerCase()}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td>{formatDate(employee.lastModified)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewAuditLogs(employee)}
                          className="audit-button"
                        >
                          Audit Logs
                        </button>
                        {employee.status !== 'Terminated' && (
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="delete-button"
                          >
                            Terminate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showAddForm && (
          <div className="form-overlay">
            <div className="form-container">
              <h2>Add New Employee</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={newEmployee.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={newEmployee.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Department *</label>
                    <select
                      name="department"
                      value={newEmployee.department}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={newEmployee.jobTitle}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={newEmployee.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hire Date</label>
                    <input
                      type="date"
                      name="hireDate"
                      value={newEmployee.hireDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Salary</label>
                    <input
                      type="number"
                      name="salary"
                      value={newEmployee.salary}
                      onChange={handleInputChange}
                      placeholder="Annual salary"
                    />
                  </div>
                  <div className="form-group">
                    <label>Manager</label>
                    <select
                      name="managerId"
                      value={newEmployee.managerId}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Manager</option>
                      {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name} - {manager.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Add Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditForm && selectedEmployee && (
          <div className="form-overlay">
            <div className="form-container">
              <h2>Edit Employee - {selectedEmployee.name}</h2>
              <form onSubmit={handleUpdate}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={newEmployee.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={newEmployee.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Department *</label>
                    <select
                      name="department"
                      value={newEmployee.department}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={newEmployee.jobTitle}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={newEmployee.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={newEmployee.status}
                      onChange={handleInputChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Hire Date</label>
                    <input
                      type="date"
                      name="hireDate"
                      value={newEmployee.hireDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Salary</label>
                    <input
                      type="number"
                      name="salary"
                      value={newEmployee.salary}
                      onChange={handleInputChange}
                      placeholder="Annual salary"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Manager</label>
                    <select
                      name="managerId"
                      value={newEmployee.managerId}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Manager</option>
                      {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name} - {manager.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Update Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAuditLogs && selectedEmployee && (
          <div className="form-overlay">
            <div className="form-container">
              <h2>Audit Logs - {selectedEmployee.name}</h2>
              <div className="audit-logs">
                <div className="log-entry">
                  <p><strong>Employee ID:</strong> {selectedEmployee.employeeId}</p>
                  <p><strong>Last Modified:</strong> {formatDate(selectedEmployee.lastModified)}</p>
                  <p><strong>Created:</strong> {formatDate(selectedEmployee.createdAt)}</p>
                  <p><strong>Current Status:</strong> {selectedEmployee.status}</p>
                  <p><strong>Department:</strong> {selectedEmployee.department}</p>
                  <p><strong>Role:</strong> {selectedEmployee.role}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuditLogs(false)}
                className="close-button"
              >
                X
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDatabaseManagement;