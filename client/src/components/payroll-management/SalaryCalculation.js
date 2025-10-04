import React, { useState, useEffect } from 'react';
import { FaSpinner, FaCheck, FaExclamationTriangle, FaSearch, FaFilter, FaDownload, FaTimes, FaUserCircle, FaInfoCircle, FaChevronDown, FaCalculator, FaChartLine, FaMoneyBillWave, FaFileInvoiceDollar, FaClipboardCheck } from 'react-icons/fa';
import './SalaryCalculation.css';
import { Sidebar } from '../dashboard/HRDashboard';

const SalaryCalculation = () => {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'Ammar Majid',
      position: 'Software Engineer',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      basicSalary: 5000,
      workingHours: 160,
      overtime: 10,
      bonuses: 500,
      deductions: {
        tax: 1000,
        insurance: 200,
        other: 100
      },
      status: 'pending',
      approvalStatus: 'pending',
      adjustments: [],
      comments: []
    },
    {
      id: 2,
      name: 'Maryam Junaid',
      position: 'HR Manager',
      profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
      basicSalary: 4500,
      workingHours: 155,
      overtime: 5,
      bonuses: 300,
      deductions: {
        tax: 900,
        insurance: 180,
        other: 90
      },
      status: 'pending',
      approvalStatus: 'pending',
      adjustments: [],
      comments: []
    }
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [calculationStatus, setCalculationStatus] = useState('idle');
  const [notification, setNotification] = useState(null);
  const [verificationIssues, setVerificationIssues] = useState([]);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    amount: '',
    type: 'bonus',
    comment: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [progress, setProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState('csv');

  const [collapsedSections, setCollapsedSections] = useState({
    basicSalary: false,
    additionalEarnings: false,
    deductions: false,
    adjustments: false
  });

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculateSalary = (employee) => {
    const {
      basicSalary,
      overtime,
      bonuses,
      deductions,
      adjustments
    } = employee;

    const overtimeRate = basicSalary / 160;
    const overtimePay = overtime * overtimeRate;
    const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
    const totalAdjustments = adjustments.reduce((sum, adj) => 
      sum + (adj.type === 'bonus' ? adj.amount : -adj.amount), 0);
    const netSalary = basicSalary + overtimePay + bonuses + totalAdjustments - totalDeductions;

    return {
      basicSalary,
      overtimePay,
      bonuses,
      totalAdjustments,
      totalDeductions,
      netSalary
    };
  };

  const handleCalculateAll = async () => {
    setCalculationStatus('processing');
    setVerificationIssues([]);
    setNotification(null);
    setProgress(0);

    const totalEmployees = employees.length;
    const issues = [];

    for (let i = 0; i < totalEmployees; i++) {
      const employee = employees[i];
      if (employee.workingHours < 160) {
        issues.push(`${employee.name}: Incomplete attendance records`);
      }
      if (!employee.deductions.tax) {
        issues.push(`${employee.name}: Missing tax information`);
      }
      setProgress(((i + 1) / totalEmployees) * 100);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (issues.length > 0) {
      setVerificationIssues(issues);
      setNotification({
        type: 'error',
        message: 'Some employees have incomplete records',
        icon: <FaExclamationTriangle />
      });
    } else {
      setEmployees(prev =>
        prev.map(emp => ({
          ...emp,
          status: 'calculated'
        }))
      );
      setNotification({
        type: 'success',
        message: 'Salary calculation completed successfully!',
        icon: <FaCheck />
      });
    }

    setCalculationStatus('completed');
    setProgress(100);
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
    const headers = ['Employee', 'Position', 'Basic Salary', 'Working Hours', 'Overtime', 'Bonuses', 'Deductions', 'Net Salary', 'Status'];
    const data = filteredEmployees.map(emp => {
      const salary = calculateSalary(emp);
      return [
        emp.name,
        emp.position,
        emp.basicSalary,
        emp.workingHours,
        emp.overtime,
        emp.bonuses,
        Object.values(emp.deductions).reduce((a, b) => a + b, 0),
        salary.netSalary,
        emp.status
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
                ...emp.adjustments,
                {
                  ...adjustmentData,
                  amount: Number(adjustmentData.amount),
                  date: new Date().toISOString()
                }
              ],
              comments: [
                ...emp.comments,
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

  const handleApproval = (status) => {
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
    setNotification({
      type: 'success',
      message: `Salary ${status} successfully!`,
      icon: <FaCheck />
    });
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
          <h1>Salary Calculation and Deductions</h1>
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
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
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
        <div className={`notification ${notification.type}`}>
          {notification.icon}
          <span>{notification.message}</span>
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
                  <th>Basic Salary</th>
                  <th>Working Hours</th>
                  <th>Overtime</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(employee => {
                  const salary = calculateSalary(employee);
                  return (
                    <tr
                      key={employee.id}
                      className={selectedEmployee?.id === employee.id ? 'selected' : ''}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <td className="employee-cell">
                        <img 
                          src={employee.profilePicture} 
                          alt={employee.name}
                          className="employee-avatar"
                        />
                        <div className="employee-info">
                          <span className="employee-name">{employee.name}</span>
                          <span className="employee-position">{employee.position}</span>
                        </div>
                      </td>
                      <td>{employee.position}</td>
                      <td>${employee.basicSalary.toLocaleString()}</td>
                      <td>{employee.workingHours}</td>
                      <td>{employee.overtime}</td>
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
                })}
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
                  'Basic Salary',
                  <FaMoneyBillWave className="section-icon" />,
                  'basicSalary',
                  <>
                    <div className="breakdown-item">
                      <span className="label">Base Amount:</span>
                      <span className="value">${selectedEmployee.basicSalary.toLocaleString()}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="label">Working Hours:</span>
                      <span className="value">{selectedEmployee.workingHours} hrs</span>
                    </div>
                  </>
                )}

                {renderBreakdownSection(
                  'Additional Earnings',
                  <FaChartLine className="section-icon" />,
                  'additionalEarnings',
                  <>
                    <div className="breakdown-item">
                      <span className="label">Overtime Pay:</span>
                      <span className="value tooltip">
                        ${calculateSalary(selectedEmployee).overtimePay.toLocaleString()}
                        <span className="tooltip-text">
                          Calculated at 1.5x hourly rate for hours over 160
                        </span>
                      </span>
                    </div>
                    <div className="breakdown-item">
                      <span className="label">Bonuses:</span>
                      <span className="value">${selectedEmployee.bonuses.toLocaleString()}</span>
                    </div>
                  </>
                )}

                {renderBreakdownSection(
                  'Deductions',
                  <FaFileInvoiceDollar className="section-icon" />,
                  'deductions',
                  <>
                    <div className="breakdown-item">
                      <span className="label">Tax:</span>
                      <span className="value">-${selectedEmployee.deductions.tax.toLocaleString()}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="label">Insurance:</span>
                      <span className="value">-${selectedEmployee.deductions.insurance.toLocaleString()}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="label">Other:</span>
                      <span className="value">-${selectedEmployee.deductions.other.toLocaleString()}</span>
                    </div>
                  </>
                )}

                {renderBreakdownSection(
                  'Adjustments',
                  <FaClipboardCheck className="section-icon" />,
                  'adjustments',
                  <>
                    <div className="breakdown-item">
                      <span className="label">Total Adjustments:</span>
                      <span className="value">${calculateSalary(selectedEmployee).totalAdjustments.toLocaleString()}</span>
                    </div>
                  </>
                )}

                <div className="breakdown-item total">
                  <span className="label">Net Salary:</span>
                  <span className="value">${calculateSalary(selectedEmployee).netSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {selectedEmployee.adjustments.length > 0 && (
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
                        {selectedEmployee.comments[index]?.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="approval-actions">
              <button
                className="approve-button"
                onClick={() => setShowApprovalModal(true)}
                disabled={selectedEmployee.status !== 'calculated'}
              >
                Approve Salary
              </button>
              <button
                className="reject-button"
                onClick={() => setShowApprovalModal(true)}
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
              <h3>Confirm Salary {selectedEmployee?.approvalStatus === 'approved' ? 'Approval' : 'Rejection'}</h3>
              <button 
                className="close-button"
                onClick={() => setShowApprovalModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to {selectedEmployee?.approvalStatus === 'approved' ? 'approve' : 'reject'} the salary calculation for {selectedEmployee?.name}?</p>
              <div className="salary-summary">
                <div className="summary-item">
                  <span>Basic Salary:</span>
                  <span>${selectedEmployee?.basicSalary.toLocaleString()}</span>
                </div>
                <div className="summary-item">
                  <span>Net Salary:</span>
                  <span>${calculateSalary(selectedEmployee).netSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </button>
              <button
                className={selectedEmployee?.approvalStatus === 'approved' ? 'approve-button' : 'reject-button'}
                onClick={() => handleApproval(selectedEmployee?.approvalStatus === 'approved' ? 'approved' : 'rejected')}
              >
                Confirm
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