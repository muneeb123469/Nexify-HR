import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCheck, FaExclamationTriangle, FaSearch, FaFilter, FaDownload, FaTimes, FaUserCircle, FaInfoCircle, FaChevronDown, FaCalculator, FaChartLine, FaMoneyBillWave, FaFileInvoiceDollar, FaClipboardCheck } from 'react-icons/fa';
import './SalaryCalculation.css';
import { Sidebar } from '../dashboard/HRDashboard';
import api from '../../utils/api';

const SalaryCalculation = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [calculationStatus, setCalculationStatus] = useState('idle');
  const [notification, setNotification] = useState(null);
  const [verificationIssues, setVerificationIssues] = useState([]);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(''); // Track if approving or rejecting
  const [adjustmentData, setAdjustmentData] = useState({
    amount: '',
    type: 'bonus',
    comment: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [progress, setProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState('csv');
  const [loading, setLoading] = useState(false);

  // Month and year selection for salary calculation
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Edit salary states - expanded to include all components
  const [showEditSalaryModal, setShowEditSalaryModal] = useState(false);
  const [editSalaryData, setEditSalaryData] = useState({
    hourlyRate: '',
    baseSalaryOverride: '',
    bonuses: '',
    deductions: '',
    notes: ''
  });

  const [collapsedSections, setCollapsedSections] = useState({
    basicSalary: false,
    additionalEarnings: false,
    deductions: false,
    adjustments: false
  });

  // Load employees on component mount
  useEffect(() => {
    // Initially, employees state is empty - will be populated when Calculate All is clicked
  }, []);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculateSalary = (employee) => {
    // Safety check for null/undefined employee
    if (!employee) {
      return {
        baseSalary: 0,
        netSalary: 0,
        deductions: 0,
        workHours: {},
        details: {}
      };
    }

    // If employee has salary data from backend, use it
    if (employee.salaryData) {
      return {
        baseSalary: employee.salaryData.baseSalary || 0,
        netSalary: employee.salaryData.netSalary || 0,
        deductions: employee.salaryData.deductions || 0,
        workHours: employee.salaryData.workHours || {},
        details: employee.salaryData.details || {}
      };
    }

    // Fallback to old calculation (for compatibility)
    return {
      baseSalary: 0,
      netSalary: 0,
      deductions: 0
    };
  };

  const handleCalculateAll = async () => {
    try {
      setCalculationStatus('processing');
      setVerificationIssues([]);
      setNotification(null);
      setProgress(0);
      setLoading(true);

      // Call backend API to calculate all salaries
      const response = await api.get('/salary/calculate-all', {
        params: {
          month: selectedMonth,
          year: selectedYear
        }
      });

      if (response.data.success) {
        const salariesData = response.data.data;

        // Transform backend data to match frontend structure
        const transformedEmployees = salariesData.map(salary => ({
          id: salary.employeeId,
          name: salary.employeeName,
          position: salary.position || 'N/A',
          profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(salary.employeeName)}&background=random`,
          employeeType: salary.employeeType,
          hourlyRate: salary.hourlyRate,
          workingHours: salary.workHours?.totalHours || 0,
          attendanceHours: salary.workHours?.attendanceHours || 0,
          remoteHours: salary.workHours?.remoteHours || 0,
          status: salary.error ? 'error' : 'calculated',
          approvalStatus: 'pending',
          salaryData: salary, // Store full salary data
          error: salary.error
        }));

        setEmployees(transformedEmployees);
        setProgress(100);

        setNotification({
          type: 'success',
          message: `Successfully calculated salaries for ${transformedEmployees.length} employees!`,
          icon: <FaCheck />
        });
        setCalculationStatus('completed');
      }
    } catch (error) {
      console.error('Error calculating salaries:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error calculating salaries',
        icon: <FaExclamationTriangle />
      });
      setCalculationStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslips = async () => {
    setCalculationStatus('generating');
    setNotification(null);
    setProgress(0);

    await new Promise(resolve => setTimeout(resolve, 1000));
    setProgress(100);

    setNotification({
      type: 'success',
      message: 'Payslips generated successfully!',
      icon: <FaCheck />
    });
    setCalculationStatus('completed');
  };

  const handleExport = () => {
    const headers = ['Employee', 'Position', 'Employee Type', 'Working Hours', 'Base Salary', 'Deductions', 'Net Salary', 'Status'];
    const data = filteredEmployees.map(emp => {
      const salary = calculateSalary(emp);
      return [
        emp.name || 'N/A',
        emp.position || 'N/A',
        emp.employeeType || 'N/A',
        emp.workingHours?.toFixed(1) || '0',
        salary?.baseSalary || 0,
        salary?.deductions || 0,
        salary?.netSalary || 0,
        emp.status || 'N/A'
      ];
    });

    let content;
    let mimeType;
    let fileExtension;

    switch (exportFormat) {
      case 'csv':
        content = [
          headers.join(','),
          ...data.map(row => row.join(','))
        ].join('\n');
        mimeType = 'text/csv;charset=utf-8;';
        fileExtension = 'csv';
        break;
      case 'excel':
        // Add Excel export logic here
        break;
      case 'pdf':
        // Add PDF export logic here
        break;
      default:
        content = [
          headers.join(','),
          ...data.map(row => row.join(','))
        ].join('\n');
        mimeType = 'text/csv;charset=utf-8;';
        fileExtension = 'csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payroll_report.${fileExtension}`;
    link.click();
  };

  const handleAdjustment = () => {
    if (!adjustmentData.amount || !adjustmentData.comment) return;

    setEmployees(prev =>
      prev.map(emp =>
        emp.id === selectedEmployee.id
          ? {
            ...emp,
            adjustments: [
              ...(emp.adjustments || []),
              {
                ...adjustmentData,
                amount: Number(adjustmentData.amount),
                date: new Date().toISOString()
              }
            ],
            comments: [
              ...(emp.comments || []),
              {
                text: adjustmentData.comment,
                date: new Date().toISOString()
              }
            ]
          }
          : emp
      )
    );

    setShowAdjustmentModal(false);
    setAdjustmentData({ amount: '', type: 'bonus', comment: '' });
    setNotification({
      type: 'success',
      message: 'Salary adjustment applied successfully!',
      icon: <FaCheck />
    });
  };

  const handleApproval = async (status) => {
    try {
      // Call backend API to save approval status
      await api.post(`/salary/approve/${selectedEmployee.id}`, {
        status,
        month: selectedMonth,
        year: selectedYear
      });

      setEmployees(prev =>
        prev.map(emp =>
          emp.id === selectedEmployee.id
            ? {
              ...emp,
              approvalStatus: status
            }
            : emp
        )
      );

      setShowApprovalModal(false);
      setApprovalAction('');
      setNotification({
        type: 'success',
        message: `Salary ${status} successfully!`,
        icon: <FaCheck />
      });
    } catch (error) {
      console.error('Error approving salary:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update approval status',
        icon: <FaExclamationTriangle />
      });
      setShowApprovalModal(false);
      setApprovalAction('');
    }
  };

  const handleEditSalary = async () => {
    // Validate at least one field is filled
    if (!editSalaryData.hourlyRate && !editSalaryData.baseSalaryOverride &&
      !editSalaryData.bonuses && !editSalaryData.deductions) {
      setNotification({
        type: 'error',
        message: 'Please enter at least one value to update',
        icon: <FaExclamationTriangle />
      });
      return;
    }

    try {
      const updateData = {};

      if (editSalaryData.hourlyRate) updateData.hourlyRate = parseFloat(editSalaryData.hourlyRate);
      if (editSalaryData.baseSalaryOverride) updateData.baseSalaryOverride = parseFloat(editSalaryData.baseSalaryOverride);
      if (editSalaryData.bonuses) updateData.bonuses = parseFloat(editSalaryData.bonuses);
      if (editSalaryData.deductions) updateData.deductions = parseFloat(editSalaryData.deductions);
      if (editSalaryData.notes) updateData.notes = editSalaryData.notes;

      const response = await api.put(`/salary/update/${selectedEmployee.id}`, updateData);

      if (response.data.success) {
        // Update employee in list with new values
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === selectedEmployee.id
              ? {
                ...emp,
                ...updateData,
                // Update salary data to reflect changes
                salaryData: {
                  ...emp.salaryData,
                  baseSalary: updateData.baseSalaryOverride || emp.salaryData?.baseSalary,
                  deductions: updateData.deductions || emp.salaryData?.deductions || 0,
                  netSalary: (updateData.baseSalaryOverride || emp.salaryData?.baseSalary || 0) +
                    (updateData.bonuses || 0) -
                    (updateData.deductions || emp.salaryData?.deductions || 0)
                }
              }
              : emp
          )
        );

        // Update selected employee
        setSelectedEmployee(prev => ({
          ...prev,
          ...updateData,
          salaryData: {
            ...prev.salaryData,
            baseSalary: updateData.baseSalaryOverride || prev.salaryData?.baseSalary,
            deductions: updateData.deductions || prev.salaryData?.deductions || 0,
            netSalary: (updateData.baseSalaryOverride || prev.salaryData?.baseSalary || 0) +
              (updateData.bonuses || 0) -
              (updateData.deductions || prev.salaryData?.deductions || 0)
          }
        }));

        setShowEditSalaryModal(false);
        setEditSalaryData({
          hourlyRate: '',
          baseSalaryOverride: '',
          bonuses: '',
          deductions: '',
          notes: ''
        });

        setNotification({
          type: 'success',
          message: 'Salary details updated successfully!',
          icon: <FaCheck />
        });

        // Recalculate salaries to reflect changes
        handleCalculateAll();
      }
    } catch (error) {
      console.error('Error updating salary:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update salary',
        icon: <FaExclamationTriangle />
      });
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderBreakdownSection = (title, icon, section, items) => (
    <div className={`breakdown-section ${collapsedSections[section] ? 'collapsed' : ''}`}>
      <div
        className="breakdown-section-header"
        onClick={() => toggleSection(section)}
      >
        <h4>
          {icon}
          {title}
        </h4>
        <FaChevronDown className="icon" />
      </div>
      <div className="breakdown-content">
        {items}
      </div>
    </div>
  );

  return (
    <>
      <Sidebar />
      <div className="salary-calculation">
        <div className="calculation-header">
          <h1>Salary Calculation</h1>
          <div className="month-year-selector">
            <label>Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <label>Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[...Array(5)].map((_, i) => {
                const year = currentDate.getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
          <div className="action-buttons">
            <button
              onClick={handleCalculateAll}
              disabled={calculationStatus === 'processing'}
              className="calculate-button"
            >
              {calculationStatus === 'processing' ? (
                <>
                  Calculating...
                  <FaSpinner className="spinner" />
                </>
              ) : (
                'Calculate All Salaries'
              )}
            </button>
            <button
              onClick={handleGeneratePayslips}
              disabled={calculationStatus !== 'completed' || employees.some(emp => emp.status !== 'calculated')}
              className="generate-button"
            >
              {calculationStatus === 'generating' ? (
                <>
                  Generating...
                  <FaSpinner className="spinner" />
                </>
              ) : (
                'Generate Payslips'
              )}
            </button>
            <div className="export-container">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="export-format"
              >
                <option value="csv">CSV</option>
                {/* <option value="excel">Excel</option>
                <option value="pdf">PDF</option> */}
              </select>
              <button
                onClick={handleExport}
                className="export-button"
              >
                <FaDownload /> Export Report
              </button>
            </div>
          </div>
        </div>

        {notification && (
          <div className={`notification-toast ${notification.type}`}>
            {notification.icon}
            <span>{notification.message}</span>
            <button
              className="toast-close-button"
              onClick={() => setNotification(null)}
              aria-label="Close notification"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {verificationIssues.length > 0 && (
          <div className="verification-panel">
            <h3>
              <FaExclamationTriangle />
              Verification Issues
            </h3>
            <ul>
              {verificationIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {calculationStatus === 'processing' && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        )}

        <div className="filters">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search employees by name or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="status-filter">
            <FaFilter />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="calculated">Calculated</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="calculation-content">
          <div className="employees-list">
            <div className="employees-list-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Position</th>
                    <th>Employee Type</th>
                    <th>Working Hours</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No employees calculated. Click "Calculate All Salaries" to begin.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map(employee => {
                      const salary = calculateSalary(employee);
                      return (
                        <tr
                          key={employee.id}
                          className={selectedEmployee?.id === employee.id ? 'selected' : ''}
                          onClick={() => setSelectedEmployee(employee)}
                        >
                          <td className="employee-name-cell">
                            {employee.name}
                          </td>
                          <td className="position-cell">{employee.position}</td>
                          <td className="employee-type-cell">{employee.employeeType || 'N/A'}</td>
                          <td className="hours-cell">
                            <div className="hours-total">{employee.workingHours ? employee.workingHours.toFixed(1) : '0'}h</div>
                            {employee.attendanceHours !== undefined && employee.remoteHours !== undefined && (
                              <div className="hours-breakdown">
                                Office: {employee.attendanceHours.toFixed(1)}h | Remote: {employee.remoteHours.toFixed(1)}h
                              </div>
                            )}
                          </td>
                          <td>${salary.netSalary ? salary.netSalary.toLocaleString() : '0'}</td>
                          <td>
                            <div className="status-container">
                              <span className={`status-badge ${employee.status}`}>
                                {employee.status}
                              </span>
                              {employee.status === 'calculated' && (
                                <div className="status-progress">
                                  <div className="progress-fill" style={{ width: '100%' }} />
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <button
                              className="view-details-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEmployee(employee);
                                setShowAdjustmentModal(true);
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div className="scroll-indicator" />
            </div>
          </div>

          {selectedEmployee && (
            <div className="salary-details">
              <div className="details-header">
                <div className="employee-profile">
                  <img
                    src={selectedEmployee.profilePicture}
                    alt={selectedEmployee.name}
                    className="profile-picture"
                  />
                  <div>
                    <h2>{selectedEmployee.name}</h2>
                    <p className="employee-position">{selectedEmployee.position}</p>
                    <p className="employee-id">ID: {selectedEmployee.id}</p>
                  </div>
                </div>
              </div>

              <div className="salary-breakdown">
                <h3>
                  <FaCalculator className="section-icon" />
                  Salary Breakdown
                </h3>
                <div className="breakdown-grid">
                  {renderBreakdownSection(
                    'Employee Information',
                    <FaMoneyBillWave className="section-icon" />,
                    'basicSalary',
                    <>
                      <div className="breakdown-item">
                        <span className="label">Employee Type:</span>
                        <span className="value">{selectedEmployee.employeeType || 'N/A'}</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="label">Hourly Rate:</span>
                        <span className="value">${selectedEmployee.hourlyRate ? selectedEmployee.hourlyRate.toLocaleString() : '0'}/hr</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="label">Base Salary:</span>
                        <span className="value">${calculateSalary(selectedEmployee).baseSalary ? calculateSalary(selectedEmployee).baseSalary.toLocaleString() : '0'}</span>
                      </div>
                    </>
                  )}

                  {renderBreakdownSection(
                    'Work Hours',
                    <FaChartLine className="section-icon" />,
                    'additionalEarnings',
                    <>
                      <div className="breakdown-item">
                        <span className="label">Office Hours:</span>
                        <span className="value">{selectedEmployee.attendanceHours ? selectedEmployee.attendanceHours.toFixed(1) : '0'}h</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="label">Remote Hours:</span>
                        <span className="value">{selectedEmployee.remoteHours ? selectedEmployee.remoteHours.toFixed(1) : '0'}h</span>
                      </div>
                      <div className="breakdown-item">
                        <span className="label">Total Hours:</span>
                        <span className="value tooltip">
                          {selectedEmployee.workingHours ? selectedEmployee.workingHours.toFixed(1) : '0'}h
                          <span className="tooltip-text">
                            Combined from attendance and remote work sessions
                          </span>
                        </span>
                      </div>
                    </>
                  )}

                  {renderBreakdownSection(
                    'Deductions',
                    <FaFileInvoiceDollar className="section-icon" />,
                    'deductions',
                    <>
                      <div className="breakdown-item">
                        <span className="label">Total Deductions:</span>
                        <span className="value">-${calculateSalary(selectedEmployee).deductions ? calculateSalary(selectedEmployee).deductions.toLocaleString() : '0'}</span>
                      </div>
                      {selectedEmployee.salaryData?.details && (
                        <div className="breakdown-item">
                          <span className="label">Details:</span>
                          <span className="value" style={{ fontSize: '0.9em', color: '#666' }}>
                            {selectedEmployee.salaryData.details.calculation ||
                              selectedEmployee.salaryData.details.status ||
                              'No additional details'}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="breakdown-item total">
                    <span className="label">Net Salary:</span>
                    <span className="value">${calculateSalary(selectedEmployee).netSalary ? calculateSalary(selectedEmployee).netSalary.toLocaleString() : '0'}</span>
                  </div>
                </div>
              </div>


              {selectedEmployee.adjustments && selectedEmployee.adjustments.length > 0 && (
                <div className="adjustment-history">
                  <h3>Adjustment History</h3>
                  <div className="adjustment-list">
                    {selectedEmployee.adjustments.map((adj, index) => (
                      <div key={index} className="adjustment-item">
                        <div className="adjustment-header">
                          <span className={`adjustment-type ${adj.type}`}>
                            {adj.type === 'bonus' ? 'Bonus' : 'Deduction'}
                          </span>
                          <span className="adjustment-date">
                            {new Date(adj.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="adjustment-amount">
                          {adj.type === 'bonus' ? '+' : '-'}${adj.amount.toLocaleString()}
                        </div>
                        <div className="adjustment-comment">
                          {selectedEmployee.comments && selectedEmployee.comments[index]?.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="approval-actions">
                <button
                  className="edit-button"
                  onClick={() => {
                    setEditSalaryData({
                      hourlyRate: selectedEmployee.hourlyRate || '',
                      baseSalaryOverride: calculateSalary(selectedEmployee).baseSalary || '',
                      bonuses: '',
                      deductions: calculateSalary(selectedEmployee).deductions || '',
                      notes: ''
                    });
                    setShowEditSalaryModal(true);
                  }}
                  style={{ backgroundColor: '#4CAF50', marginRight: '10px' }}
                >
                  Edit Salary
                </button>
                <button
                  className="approve-button"
                  onClick={() => {
                    setApprovalAction('approved');
                    setShowApprovalModal(true);
                  }}
                  disabled={selectedEmployee.status !== 'calculated'}
                >
                  Approve Salary
                </button>
                <button
                  className="reject-button"
                  onClick={() => {
                    setApprovalAction('rejected');
                    setShowApprovalModal(true);
                  }}
                  disabled={selectedEmployee.status !== 'calculated'}
                >
                  Reject Salary
                </button>
              </div>
            </div>
          )}
        </div>

        {showAdjustmentModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Adjust Salary</h3>
                <button
                  className="close-button"
                  onClick={() => setShowAdjustmentModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-content">
                <div className="form-group">
                  <label>Adjustment Type</label>
                  <select
                    value={adjustmentData.type}
                    onChange={(e) => setAdjustmentData(prev => ({
                      ...prev,
                      type: e.target.value
                    }))}
                  >
                    <option value="bonus">Bonus</option>
                    <option value="deduction">Deduction</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    value={adjustmentData.amount}
                    onChange={(e) => setAdjustmentData(prev => ({
                      ...prev,
                      amount: e.target.value
                    }))}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    value={adjustmentData.comment}
                    onChange={(e) => setAdjustmentData(prev => ({
                      ...prev,
                      comment: e.target.value
                    }))}
                    placeholder="Enter reason for adjustment"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="cancel-button"
                  onClick={() => setShowAdjustmentModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="apply-button"
                  onClick={handleAdjustment}
                  disabled={!adjustmentData.amount || !adjustmentData.comment}
                >
                  Apply Adjustment
                </button>
              </div>
            </div>
          </div>
        )}

        {showApprovalModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Confirm Salary {approvalAction === 'approved' ? 'Approval' : 'Rejection'}</h3>
                <button
                  className="close-button"
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalAction('');
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-content">
                <p>Are you sure you want to {approvalAction === 'approved' ? 'approve' : 'reject'} the salary calculation for {selectedEmployee?.name}?</p>
                <div className="salary-summary">
                  <div className="summary-item">
                    <span>Base Salary:</span>
                    <span>${(calculateSalary(selectedEmployee)?.baseSalary || 0).toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span>Net Salary:</span>
                    <span>${(calculateSalary(selectedEmployee)?.netSalary || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="cancel-button"
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalAction('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className={approvalAction === 'approved' ? 'approve-button' : 'reject-button'}
                  onClick={() => handleApproval(approvalAction)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditSalaryModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Edit Salary Details</h3>
                <button
                  className="close-button"
                  onClick={() => setShowEditSalaryModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="modal-content">
                <p style={{ marginBottom: '20px', color: '#666' }}>
                  Update salary details for <strong>{selectedEmployee?.name}</strong>
                </p>

                <div className="form-group">
                  <label>Hourly Rate ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editSalaryData.hourlyRate}
                    onChange={(e) => setEditSalaryData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    placeholder="Enter hourly rate"
                  />
                  <small style={{ color: '#888', fontSize: '0.85em' }}>
                    Current: ${selectedEmployee?.hourlyRate || 0}/hr
                  </small>
                </div>

                <div className="form-group">
                  <label>Base Salary Override ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editSalaryData.baseSalaryOverride}
                    onChange={(e) => setEditSalaryData(prev => ({ ...prev, baseSalaryOverride: e.target.value }))}
                    placeholder="Override calculated base salary"
                  />
                  <small style={{ color: '#888', fontSize: '0.85em' }}>
                    Calculated: ${calculateSalary(selectedEmployee).baseSalary?.toLocaleString() || 0}
                  </small>
                </div>

                <div className="form-group">
                  <label>Bonuses ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editSalaryData.bonuses}
                    onChange={(e) => setEditSalaryData(prev => ({ ...prev, bonuses: e.target.value }))}
                    placeholder="Add bonuses"
                  />
                </div>

                <div className="form-group">
                  <label>Deductions ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editSalaryData.deductions}
                    onChange={(e) => setEditSalaryData(prev => ({ ...prev, deductions: e.target.value }))}
                    placeholder="Add deductions"
                  />
                  <small style={{ color: '#888', fontSize: '0.85em' }}>
                    Current: ${calculateSalary(selectedEmployee).deductions?.toLocaleString() || 0}
                  </small>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={editSalaryData.notes}
                    onChange={(e) => setEditSalaryData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Reason for adjustment (optional)"
                    rows="3"
                  />
                </div>

                <div className="salary-summary" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>Projected Net Salary:</h4>
                  <div className="summary-item">
                    <span>Base Salary:</span>
                    <span>${(parseFloat(editSalaryData.baseSalaryOverride) || calculateSalary(selectedEmployee).baseSalary || 0).toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span>+ Bonuses:</span>
                    <span>${(parseFloat(editSalaryData.bonuses) || 0).toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span>- Deductions:</span>
                    <span>${(parseFloat(editSalaryData.deductions) || calculateSalary(selectedEmployee).deductions || 0).toLocaleString()}</span>
                  </div>
                  <div className="summary-item" style={{ fontWeight: 'bold', borderTop: '2px solid #ddd', paddingTop: '10px', marginTop: '10px' }}>
                    <span>Net Salary:</span>
                    <span style={{ color: '#4CAF50' }}>
                      ${((parseFloat(editSalaryData.baseSalaryOverride) || calculateSalary(selectedEmployee).baseSalary || 0) +
                        (parseFloat(editSalaryData.bonuses) || 0) -
                        (parseFloat(editSalaryData.deductions) || calculateSalary(selectedEmployee).deductions || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="cancel-button"
                  onClick={() => setShowEditSalaryModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="approve-button"
                  onClick={handleEditSalary}
                >
                  Update Salary
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SalaryCalculation; 