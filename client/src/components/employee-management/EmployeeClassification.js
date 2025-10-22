import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../utils/employeeApi';
import './EmployeeClassification.css';
import { Sidebar } from '../dashboard/HRDashboard';

const EmployeeClassification = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  const categories = ['Technical', 'Administrative', 'Management', 'Support'];
  const levels = ['Junior', 'Mid-level', 'Senior', 'Manager', 'Director'];

  // Get unique departments from employees
  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeApi.getAllEmployees();
      setEmployees(response.employees || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSkillAdd = async (employeeId, skill) => {
    try {
      const response = await employeeApi.addSkill(employeeId, skill);

      // Update local state
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === employeeId
            ? { ...emp, skills: response.skills }
            : emp
        )
      );

      setNotification({
        type: 'success',
        message: 'Skill added successfully!'
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error adding skill:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to add skill'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleProjectAdd = async (employeeId, project) => {
    try {
      const response = await employeeApi.addProject(employeeId, project);

      // Update local state
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === employeeId
            ? { ...emp, projects: response.projects }
            : emp
        )
      );

      setNotification({
        type: 'success',
        message: 'Project added successfully!'
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error adding project:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to add project'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    const matchesCategory = selectedCategory === 'all' || employee.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || employee.level === selectedLevel;
    const matchesSearch = searchTerm === '' ||
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      employee.projects?.some(project => project.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesDepartment && matchesCategory && matchesLevel && matchesSearch;
  });

  if (loading) {
    return (
      <div className="employee-classification">
        <div className="classification-header">
          <h1>Employee Classification</h1>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-classification">
        <div className="classification-header">
          <h1>Employee Classification</h1>
        </div>
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={fetchEmployees} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-classification">
        <div className="classification-header">
          <h1>Employee Classification</h1>
        <div className="filters">
          <div className="filter-group">
            <label>Department</label>
            <select value={selectedDepartment} onChange={handleDepartmentChange}>
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select value={selectedCategory} onChange={handleCategoryChange}>
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Level</label>
            <select value={selectedLevel} onChange={handleLevelChange}>
              <option value="all">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div className="search-group">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="classification-content">
        {filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <p>No employees found matching the current filters.</p>
          </div>
        ) : (
          <div className="employees-grid">
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="employee-card">
                <div className="employee-header">
                  <h3>{employee.name}</h3>
                  {employee.level && (
                    <span className={`level-badge ${employee.level.toLowerCase()}`}>
                      {employee.level}
                    </span>
                  )}
                </div>
                <div className="employee-info">
                  <div className="info-item">
                    <label>Department</label>
                    <p>{employee.department || 'Not specified'}</p>
                  </div>
                  <div className="info-item">
                    <label>Role</label>
                    <p>{employee.role || 'Not specified'}</p>
                  </div>
                  <div className="info-item">
                    <label>Category</label>
                    <p>{employee.category || 'Not specified'}</p>
                  </div>
                </div>
                <div className="skills-section">
                  <h4>Skills</h4>
                  <div className="skills-list">
                    {employee.skills && employee.skills.length > 0 ? (
                      employee.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="no-items">No skills added yet</p>
                    )}
                  </div>
                  <div className="add-skill">
                    <input
                      type="text"
                      placeholder="Add skill..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          handleSkillAdd(employee.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="projects-section">
                  <h4>Projects</h4>
                  <div className="projects-list">
                    {employee.projects && employee.projects.length > 0 ? (
                      employee.projects.map((project, index) => (
                        <span key={index} className="project-tag">
                          {project}
                        </span>
                      ))
                    ) : (
                      <p className="no-items">No projects assigned yet</p>
                    )}
                  </div>
                  <div className="add-project">
                    <input
                      type="text"
                      placeholder="Add project..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          handleProjectAdd(employee.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeClassification; 