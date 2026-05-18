import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../utils/employeeApi';
import './EmployeePerformanceOverview.css';
import { API_BASE_URL } from '../../config/api';

// Task API functions
const taskApi = {
  getEmployeeStats: async (employeeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/stats/employee/${employeeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        return {
          totalAssigned: data.total || 0,
          totalCompleted: data.completed || 0,
          completionRate: data.completionRate || 0
        };
      }
      return { totalAssigned: 0, totalCompleted: 0, completionRate: 0 };
    } catch (error) {
      console.error('Error fetching task stats:', error);
      return { totalAssigned: 0, totalCompleted: 0, completionRate: 0 };
    }
  }
};

const EmployeePerformanceOverview = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterWorkMode, setFilterWorkMode] = useState('all');

  useEffect(() => {
    fetchEmployeesPerformanceData();
  }, []);

  const fetchEmployeesPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get all employees with basic data
      const response = await employeeApi.getAllEmployees();
      
      if (response.success) {
        // Fetch task data for each employee
        console.log('Fetching task data for', response.employees.length, 'employees');
        
        const employeesWithPerformance = await Promise.all(
          response.employees.map(async (emp) => {
            try {
              // Get task statistics for this employee
              const taskStats = await taskApi.getEmployeeStats(emp.id);
              console.log(`Task stats for ${emp.name}:`, taskStats);
              
              return {
                ...emp,
                yearsInCompany: emp.yearsInCompany || calculateYearsInCompany(emp.hireDate),
                yearsInRole: emp.yearsInRole || calculateYearsInRole(emp.hireDate),
                workMode: emp.workMode || 'Office',
                salaryBand: emp.salaryBand || calculateSalaryBand(emp.salary),
                tasksAssigned: taskStats.totalAssigned || 0,
                tasksCompleted: taskStats.totalCompleted || 0,
                taskCompletionRate: taskStats.totalAssigned > 0 
                  ? Math.round((taskStats.totalCompleted / taskStats.totalAssigned) * 100) 
                  : 0
              };
            } catch (error) {
              console.error(`Error fetching task stats for employee ${emp.name}:`, error);
              // Return employee data with zero task stats if task fetch fails
              return {
                ...emp,
                yearsInCompany: emp.yearsInCompany || calculateYearsInCompany(emp.hireDate),
                yearsInRole: emp.yearsInRole || calculateYearsInRole(emp.hireDate),
                workMode: emp.workMode || 'Office',
                salaryBand: emp.salaryBand || calculateSalaryBand(emp.salary),
                tasksAssigned: 0,
                tasksCompleted: 0,
                taskCompletionRate: 0
              };
            }
          })
        );
        
        setEmployees(employeesWithPerformance);
      }
    } catch (err) {
      console.error('Error fetching employee performance data:', err);
      setError(err.message || 'Failed to fetch employee performance data');
    } finally {
      setLoading(false);
    }
  };

  const calculateYearsInCompany = (hireDate) => {
    if (!hireDate) return 0;
    const diffTime = Math.abs(new Date() - new Date(hireDate));
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.round(diffYears * 10) / 10; // Round to 1 decimal place
  };

  const calculateYearsInRole = (hireDate) => {
    // Simplified - in reality, this would track job title changes
    return calculateYearsInCompany(hireDate);
  };

  const calculateSalaryBand = (salary) => {
    if (!salary) return 'Low';
    if (salary < 50000) return 'Low';
    if (salary >= 50000 && salary < 100000) return 'Medium';
    return 'High';
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortedAndFilteredEmployees = () => {
    let filtered = employees.filter(emp => {
      const matchesSearch = searchTerm === '' || 
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
      const matchesWorkMode = filterWorkMode === 'all' || emp.workMode === filterWorkMode;
      
      return matchesSearch && matchesDepartment && matchesWorkMode;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
  const workModes = ['Office', 'Hybrid', 'Online'];

  if (loading) {
    return (
      <div className="performance-overview">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading employee performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="performance-overview">
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={fetchEmployeesPerformanceData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const sortedEmployees = getSortedAndFilteredEmployees();

  return (
    <div className="performance-overview">
      <div className="overview-header">
        <h1>Employee Performance Overview</h1>
        <p>Comprehensive view of all employee performance metrics</p>
      </div>

      <div className="overview-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-section">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <select
            value={filterWorkMode}
            onChange={(e) => setFilterWorkMode(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Work Modes</option>
            {workModes.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overview-stats">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <p className="stat-number">{employees.length}</p>
        </div>
        <div className="stat-card">
          <h3>Departments</h3>
          <p className="stat-number">{departments.length}</p>
        </div>
        <div className="stat-card">
          <h3>Average Years in Company</h3>
          <p className="stat-number">
            {employees.length > 0 
              ? (employees.reduce((sum, emp) => sum + emp.yearsInCompany, 0) / employees.length).toFixed(1)
              : 0
            }
          </p>
        </div>
        <div className="stat-card">
          <h3>Office Workers</h3>
          <p className="stat-number">
            {employees.filter(emp => emp.workMode === 'Office').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Hybrid Workers</h3>
          <p className="stat-number">
            {employees.filter(emp => emp.workMode === 'Hybrid').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Remote Workers</h3>
          <p className="stat-number">
            {employees.filter(emp => emp.workMode === 'Online').length}
          </p>
        </div>
      </div>

      <div className="performance-table-container">
        <table className="performance-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('department')} className="sortable">
                Department {sortBy === 'department' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('role')} className="sortable">
                Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('yearsInCompany')} className="sortable">
                Years in Company {sortBy === 'yearsInCompany' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('yearsInRole')} className="sortable">
                Years in Role {sortBy === 'yearsInRole' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('workMode')} className="sortable">
                Work Mode {sortBy === 'workMode' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('salaryBand')} className="sortable">
                Salary Band {sortBy === 'salaryBand' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('tasksAssigned')} className="sortable">
                Tasks Assigned {sortBy === 'tasksAssigned' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('tasksCompleted')} className="sortable">
                Tasks Completed {sortBy === 'tasksCompleted' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('taskCompletionRate')} className="sortable">
                Completion Rate {sortBy === 'taskCompletionRate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  {searchTerm || filterDepartment !== 'all' || filterWorkMode !== 'all' 
                    ? 'No employees found matching the current filters.' 
                    : 'No employees found.'}
                </td>
              </tr>
            ) : (
              sortedEmployees.map(employee => (
                <tr key={employee.id}>
                  <td className="employee-name">
                    <div className="name-cell">
                      <strong>{employee.name}</strong>
                      <small>{employee.email}</small>
                    </div>
                  </td>
                  <td>{employee.department || 'N/A'}</td>
                  <td>{employee.role || 'N/A'}</td>
                  <td>
                    <span className="years-badge">
                      {employee.yearsInCompany} years
                    </span>
                  </td>
                  <td>
                    <span className="years-badge">
                      {employee.yearsInRole} years
                    </span>
                  </td>
                  <td>
                    <span className={`work-mode-badge ${employee.workMode.toLowerCase()}`}>
                      {employee.workMode}
                    </span>
                  </td>
                  <td>
                    <span className={`salary-band-badge ${employee.salaryBand.toLowerCase()}`}>
                      {employee.salaryBand}
                    </span>
                  </td>
                  <td>
                    <span className="task-count">
                      {employee.tasksAssigned}
                    </span>
                  </td>
                  <td>
                    <span className="task-count">
                      {employee.tasksCompleted}
                    </span>
                  </td>
                  <td>
                    <div className="completion-rate">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${employee.taskCompletionRate}%` }}
                        ></div>
                      </div>
                      <span className="percentage">{employee.taskCompletionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeePerformanceOverview;