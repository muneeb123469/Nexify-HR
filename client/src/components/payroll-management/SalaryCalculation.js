import React, { useMemo, useState } from 'react';
import { FaSpinner, FaCheck, FaExclamationTriangle, FaSearch, FaFilter, FaDownload, FaTimes, FaChevronDown, FaCalculator, FaChartLine, FaMoneyBillWave, FaFileInvoiceDollar, FaClipboardCheck } from 'react-icons/fa';
import './SalaryCalculation.css';

const EMPLOYEE_STORAGE_KEY = 'nexify_hr_employee_records';
const OFFER_STORAGE_KEY = 'nexify_hr_offer_letters';

const readStorageArray = (key) => {
  try {
    const storedValue = localStorage.getItem(key);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return [];
  }
};

const parseSalaryValue = (salary) => {
  if (typeof salary === 'number') return Number.isFinite(salary) ? salary : 0;
  const match = String(salary || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const findOfferForEmployee = (employee, offers) =>
  offers.find((offer) =>
    (employee.sourceApplicationId && offer.applicationId === employee.sourceApplicationId) ||
    (employee.email && offer.email === employee.email) ||
    (employee.sourceOfferId && offer.id === employee.sourceOfferId)
  );

const formatMoney = (value) => `$${Number(value || 0).toLocaleString()}`;

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NA';

const buildPayrollEmployees = () => {
  const employeeRecords = readStorageArray(EMPLOYEE_STORAGE_KEY);
  const offers = readStorageArray(OFFER_STORAGE_KEY);

  return employeeRecords.map((employee) => {
    const offer = findOfferForEmployee(employee, offers);
    const salarySource = offer?.offerDetails?.salary || employee.salary || employee.basicSalary || '';
    const basicSalary = parseSalaryValue(salarySource);
    const tax = basicSalary ? Math.round(basicSalary * 0.12) : 0;
    const insurance = basicSalary ? Math.round(basicSalary * 0.02) : 0;

    return {
      id: employee.id,
      name: employee.name || 'Unknown Employee',
      position: employee.role || offer?.position || 'Unassigned Role',
      department: employee.department || 'Pending Assignment',
      employeeStatus: employee.status || 'Active',
      salaryDisplay: salarySource ? String(salarySource) : 'Not Set',
      basicSalary,
      workingHours: 160,
      overtime: 0,
      bonuses: 0,
      deductions: {
        tax,
        insurance,
        other: 0
      },
      status: 'pending',
      approvalStatus: 'pending',
      adjustments: [],
      comments: []
    };
  });
};

const SalaryCalculation = () => {
  const [employees, setEmployees] = useState(buildPayrollEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [calculationStatus, setCalculationStatus] = useState('idle');
  const [notification, setNotification] = useState(null);
  const [verificationIssues, setVerificationIssues] = useState([]);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('approved');
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
    if (!employee) {
      return {
        basicSalary: 0,
        overtimePay: 0,
        bonuses: 0,
        totalAdjustments: 0,
        totalDeductions: 0,
        netSalary: 0
      };
    }

    const { basicSalary, overtime, bonuses, deductions, adjustments } = employee;
    const overtimeRate = basicSalary ? basicSalary / 160 : 0;
    const overtimePay = overtime * overtimeRate;
    const totalDeductions = Object.values(deductions).reduce((a, b) => a + Number(b || 0), 0);
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
    if (employees.length === 0) {
      setNotification({
        type: 'info',
        message: 'No employee records found. Sync employees from prepared offers first.',
        icon: <FaExclamationTriangle />
      });
      return;
    }

    setCalculationStatus('processing');
    setVerificationIssues([]);
    setNotification(null);
    setProgress(0);

    const issues = [];

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      if (!employee.basicSalary) {
        issues.push(`${employee.name}: Salary is not set`);
      }
      setProgress(((i + 1) / employees.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    setEmployees(prev =>
      prev.map(emp => ({
        ...emp,
        status: 'calculated'
      }))
    );

    if (issues.length > 0) {
      setVerificationIssues(issues);
      setNotification({
        type: 'info',
        message: 'Salary calculation completed with missing salary values shown as 0.',
        icon: <FaExclamationTriangle />
      });
    } else {
      setNotification({
        type: 'success',
        message: 'Salary calculation completed for local demo records.',
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

    await new Promise(resolve => setTimeout(resolve, 800));
    setProgress(100);

    setNotification({
      type: 'success',
      message: 'Payslips prepared for local demo review.',
      icon: <FaCheck />
    });
    setCalculationStatus('completed');
  };

  const filteredEmployees = useMemo(
    () =>
      employees.filter(emp => {
        const matchesSearch =
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [employees, searchTerm, statusFilter],
  );

  const handleExport = () => {
    if (filteredEmployees.length === 0) {
      setNotification({
        type: 'info',
        message: 'No payroll rows are available to export.',
        icon: <FaExclamationTriangle />
      });
      return;
    }

    if (exportFormat !== 'csv') {
      setNotification({
        type: 'info',
        message: 'Excel/PDF export is not configured in this local demo. Use CSV export.',
        icon: <FaExclamationTriangle />
      });
      return;
    }

    const headers = ['Employee', 'Position', 'Department', 'Basic Salary', 'Working Hours', 'Overtime', 'Bonuses', 'Deductions', 'Net Salary', 'Status'];
    const data = filteredEmployees.map(emp => {
      const salary = calculateSalary(emp);
      return [
        emp.name,
        emp.position,
        emp.department,
        emp.salaryDisplay,
        emp.workingHours,
        emp.overtime,
        emp.bonuses,
        Object.values(emp.deductions).reduce((a, b) => a + b, 0),
        salary.netSalary,
        emp.status
      ];
    });

    const content = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'payroll_report.csv';
    link.click();
  };

  const handleAdjustment = () => {
    if (!adjustmentData.amount || !adjustmentData.comment || !selectedEmployee) return;

    const updatedEmployees = employees.map(emp =>
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
    );

    setEmployees(updatedEmployees);
    setSelectedEmployee(updatedEmployees.find(emp => emp.id === selectedEmployee.id));
    setShowAdjustmentModal(false);
    setAdjustmentData({ amount: '', type: 'bonus', comment: '' });
    setNotification({
      type: 'success',
      message: 'Salary adjustment applied locally.',
      icon: <FaCheck />
    });
  };

  const handleApproval = (status) => {
    if (!selectedEmployee) return;

    const updatedEmployees = employees.map(emp =>
      emp.id === selectedEmployee.id
        ? {
            ...emp,
            status,
            approvalStatus: status
          }
        : emp
    );

    setEmployees(updatedEmployees);
    setSelectedEmployee(updatedEmployees.find(emp => emp.id === selectedEmployee.id));
    setShowApprovalModal(false);
    setNotification({
      type: 'success',
      message: `Salary ${status} locally.`,
      icon: <FaCheck />
    });
  };

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
            placeholder="Search employees by name, department, or position..."
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
            {employees.length === 0 ? (
              <div className="empty-state">
                No employee records found. Sync employees from prepared offers first.
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="empty-state">
                No payroll rows match the selected filters.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Basic Salary</th>
                    <th>Working Hours</th>
                    <th>Overtime</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(employee => (
                    <tr
                      key={employee.id}
                      className={selectedEmployee?.id === employee.id ? 'selected' : ''}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <td className="employee-cell">
                        <div className="employee-avatar">
                          {getInitials(employee.name)}
                        </div>
                        <div className="employee-info">
                          <span className="employee-name">{employee.name}</span>
                          <span className="employee-position">{employee.employeeStatus}</span>
                        </div>
                      </td>
                      <td>{employee.position}</td>
                      <td>{employee.department}</td>
                      <td>{employee.salaryDisplay}</td>
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
                  ))}
                </tbody>
              </table>
            )}
            <div className="scroll-indicator" />
          </div>
        </div>

        {selectedEmployee && (
          <div className="salary-details">
            <div className="details-header">
              <div className="employee-profile">
                <div className="profile-picture">
                  {getInitials(selectedEmployee.name)}
                </div>
                <div>
                  <h2>{selectedEmployee.name}</h2>
                  <p className="employee-position">{selectedEmployee.position}</p>
                  <p className="employee-id">ID: {selectedEmployee.id}</p>
                  <p className="employee-id">Department: {selectedEmployee.department}</p>
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
                      <span className="value">{selectedEmployee.salaryDisplay}</span>
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
                        {formatMoney(calculateSalary(selectedEmployee).overtimePay)}
                        <span className="tooltip-text">
                          Calculated from local demo payroll values
                        </span>
                      </span>
                    </div>
                    <div className="breakdown-item">
                      <span className="label">Bonuses:</span>
                      <span className="value">{formatMoney(selectedEmployee.bonuses)}</span>
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
                      <span className="value">-{formatMoney(selectedEmployee.deductions.tax)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="label">Insurance:</span>
                      <span className="value">-{formatMoney(selectedEmployee.deductions.insurance)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="label">Other:</span>
                      <span className="value">-{formatMoney(selectedEmployee.deductions.other)}</span>
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
                      <span className="value">{formatMoney(calculateSalary(selectedEmployee).totalAdjustments)}</span>
                    </div>
                  </>
                )}

                <div className="breakdown-item total">
                  <span className="label">Net Salary:</span>
                  <span className="value">{formatMoney(calculateSalary(selectedEmployee).netSalary)}</span>
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
                        {adj.type === 'bonus' ? '+' : '-'}{formatMoney(adj.amount)}
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

      {showAdjustmentModal && selectedEmployee && (
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

      {showApprovalModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Salary {approvalAction === 'approved' ? 'Approval' : 'Rejection'}</h3>
              <button
                className="close-button"
                onClick={() => setShowApprovalModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to {approvalAction === 'approved' ? 'approve' : 'reject'} the salary calculation for {selectedEmployee.name}?</p>
              <div className="salary-summary">
                <div className="summary-item">
                  <span>Basic Salary:</span>
                  <span>{selectedEmployee.salaryDisplay}</span>
                </div>
                <div className="summary-item">
                  <span>Net Salary:</span>
                  <span>{formatMoney(calculateSalary(selectedEmployee).netSalary)}</span>
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
                className={approvalAction === 'approved' ? 'approve-button' : 'reject-button'}
                onClick={() => handleApproval(approvalAction)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryCalculation;
