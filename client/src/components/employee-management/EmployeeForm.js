import React, { useState } from 'react';
import './EmployeeForm.css';

const EmployeeForm = ({ employee = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    username: employee?.username || '',
    email: employee?.email || '',
    department: employee?.department || '',
    jobTitle: employee?.jobTitle || '',
    category: employee?.category || 'Technical',
    level: employee?.level || 'Junior',
    workMode: employee?.workMode || 'Office',
    employeeStatus: employee?.employeeStatus || 'Full-time permanent employee',
    hireDate: employee?.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
    salary: employee?.salary || '',
    phone: employee?.phone || '',
    address: employee?.address || '',
    skills: employee?.skills?.join(', ') || '',
    projects: employee?.projects?.join(', ') || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job Title is required';
    }
    
    if (!formData.hireDate) {
      newErrors.hireDate = 'Hire Date is required';
    }
    
    if (formData.salary && isNaN(formData.salary)) {
      newErrors.salary = 'Salary must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const submitData = {
      ...formData,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
      projects: formData.projects ? formData.projects.split(',').map(p => p.trim()).filter(p => p) : [],
      role: 'employee'
    };
    
    onSave(submitData);
  };

  return (
    <div className="employee-form-overlay">
      <div className="employee-form-container">
        <div className="employee-form-header">
          <h2>{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
          <button onClick={onCancel} className="close-btn">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-sections">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="username">Full Name *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={errors.username ? 'error' : ''}
                  />
                  {errors.username && <span className="error-text">{errors.username}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                  />
                </div>
              </div>
            </div>
            
            {/* Employment Information */}
            <div className="form-section">
              <h3>Employment Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="department">Department *</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={errors.department ? 'error' : ''}
                  />
                  {errors.department && <span className="error-text">{errors.department}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="jobTitle">Job Title *</label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className={errors.jobTitle ? 'error' : ''}
                  />
                  {errors.jobTitle && <span className="error-text">{errors.jobTitle}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Management">Management</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="level">Level</label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                  >
                    <option value="Junior">Junior</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                    <option value="Manager">Manager</option>
                    <option value="Director">Director</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="workMode">Work Mode</label>
                  <select
                    id="workMode"
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleChange}
                  >
                    <option value="Office">Office</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="employeeStatus">Employment Status</label>
                  <select
                    id="employeeStatus"
                    name="employeeStatus"
                    value={formData.employeeStatus}
                    onChange={handleChange}
                  >
                    <option value="Full-time permanent employee">Full-time Permanent</option>
                    <option value="Part-time employee">Part-time</option>
                    <option value="Contract-based employee">Contract-based</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="hireDate">Hire Date *</label>
                  <input
                    type="date"
                    id="hireDate"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleChange}
                    className={errors.hireDate ? 'error' : ''}
                  />
                  {errors.hireDate && <span className="error-text">{errors.hireDate}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="salary">Salary</label>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className={errors.salary ? 'error' : ''}
                    placeholder="Annual salary"
                  />
                  {errors.salary && <span className="error-text">{errors.salary}</span>}
                </div>
              </div>
            </div>
            
            {/* Skills and Projects */}
            <div className="form-section">
              <h3>Skills and Projects</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="skills">Skills (comma-separated)</label>
                  <textarea
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    rows="2"
                    placeholder="JavaScript, React, Node.js, etc."
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="projects">Projects (comma-separated)</label>
                  <textarea
                    id="projects"
                    name="projects"
                    value={formData.projects}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Project A, Project B, etc."
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {employee ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;