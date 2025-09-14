import React, { useState } from 'react';
import './EmployeeDatabaseManagement.css';

const EmployeeDatabaseManagement = () => {
  const [employees, setEmployees] = useState([
    {
      id: 'EMP001',
      name: 'John Doe',
      department: 'Engineering',
      role: 'Senior Developer',
      email: 'john.doe@company.com',
      phone: '+1 234 567 8900',
      status: 'Active',
      lastModified: '2024-03-15',
      modifiedBy: 'Admin User'
    },
    {
      id: 'EMP002',
      name: 'Jane Smith',
      department: 'HR',
      role: 'HR Manager',
      email: 'jane.smith@company.com',
      phone: '+1 234 567 8901',
      status: 'Active',
      lastModified: '2024-03-14',
      modifiedBy: 'Admin User'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [notification, setNotification] = useState(null);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    department: '',
    role: '',
    email: '',
    phone: '',
    status: 'Active'
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddEmployee = () => {
    setShowAddForm(true);
    setShowEditForm(false);
    setShowAuditLogs(false);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add validation logic here
    const newId = `EMP${String(employees.length + 1).padStart(3, '0')}`;
    const employeeToAdd = {
      ...newEmployee,
      id: newId,
      lastModified: new Date().toISOString().split('T')[0],
      modifiedBy: 'Admin User'
    };

    setEmployees(prev => [...prev, employeeToAdd]);
    setShowAddForm(false);
    setNewEmployee({
      name: '',
      department: '',
      role: '',
      email: '',
      phone: '',
      status: 'Active'
    });
    setNotification({
      type: 'success',
      message: 'Employee added successfully!'
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    // Add validation logic here
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === selectedEmployee.id
          ? {
              ...emp,
              ...newEmployee,
              lastModified: new Date().toISOString().split('T')[0],
              modifiedBy: 'Admin User'
            }
          : emp
      )
    );
    setShowEditForm(false);
    setNotification({
      type: 'success',
      message: 'Employee updated successfully!'
    });
  };

  const filteredEmployees = employees.filter(employee =>
    Object.values(employee).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
              {filteredEmployees.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.department}</td>
                  <td>{employee.role}</td>
                  <td>
                    <span className={`status-badge ${employee.status.toLowerCase()}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td>{employee.lastModified}</td>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddForm && (
          <div className="form-overlay">
            <div className="form-container">
              <h2>Add New Employee</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newEmployee.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
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
                  </select>
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    name="role"
                    value={newEmployee.role}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newEmployee.phone}
                    onChange={handleInputChange}
                    required
                  />
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
              <h2>Edit Employee</h2>
              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newEmployee.name || selectedEmployee.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={newEmployee.department || selectedEmployee.department}
                    onChange={handleInputChange}
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
                  <label>Role</label>
                  <input
                    type="text"
                    name="role"
                    value={newEmployee.role || selectedEmployee.role}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newEmployee.email || selectedEmployee.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newEmployee.phone || selectedEmployee.phone}
                    onChange={handleInputChange}
                    required
                  />
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
                  <p><strong>Last Modified:</strong> {selectedEmployee.lastModified}</p>
                  <p><strong>Modified By:</strong> {selectedEmployee.modifiedBy}</p>
                  <p><strong>Changes:</strong> Employee information updated</p>
                </div>
                {/* Add more log entries as needed */}
              </div>
              <button
                onClick={() => setShowAuditLogs(false)}
                className="close-button"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDatabaseManagement; 