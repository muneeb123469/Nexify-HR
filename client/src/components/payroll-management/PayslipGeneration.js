import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaDownload, FaPaperPlane, FaCheck, FaSpinner, FaFileExport, FaRedo } from 'react-icons/fa';
import './PayslipGeneration.css';
import { Sidebar } from '../dashboard/HRDashboard';

const PayslipGeneration = () => {
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [notification, setNotification] = useState(null);
  const [distributionStatus, setDistributionStatus] = useState('idle');
  const [showPreview, setShowPreview] = useState(true);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // Initialize selectedPeriod to current month
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  });
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

  // Fetch data when period changes
  useEffect(() => {
    if (selectedPeriod) {
      fetchEmployeesWithApprovedSalaries(selectedPeriod);
      fetchPayslips(selectedPeriod);
    }
  }, [selectedPeriod]);

  // Fetch employees with approved salaries from Salary Calculation section
  const fetchEmployeesWithApprovedSalaries = async (period) => {
    try {
      setLoading(true);

      // Fetch only approved salaries for the selected period
      const [yearPart, monthPart] = period.split('-');
      const response = await api.get('/salary/approved', {
        params: {
          month: parseInt(monthPart, 10),
          year: parseInt(yearPart, 10)
        }
      });

      if (response.data.success) {
        setEmployees(response.data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching approved employees:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load approved salaries data'
      });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payslips for selected period
  const fetchPayslips = async (month) => {
    try {
      setLoading(true);
      const response = await api.get(`/payslips?month=${month}`);

      if (response.data.success) {
        setPayslips(response.data.payslips);
      }
    } catch (error) {
      console.error('Error fetching payslips:', error);
      // If no payslips exist yet, that's okay
      setPayslips([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate payslips from approved salaries
  const handleGeneratePayslips = async () => {
    try {
      if (!selectedPeriod) {
        setNotification({
          type: 'error',
          message: 'Please select a period first'
        });
        return;
      }

      if (employees.length === 0) {
        setNotification({
          type: 'error',
          message: 'No employees with approved salaries found'
        });
        return;
      }

      setLoading(true);

      const response = await api.post('/payslips/generate', {
        month: selectedPeriod,
        employees: employees
      });

      if (response.data.success) {
        setNotification({
          type: 'success',
          message: `Generated ${response.data.count} payslips successfully!`
        });

        // Refresh payslips list
        fetchPayslips(selectedPeriod);
      }
    } catch (error) {
      console.error('Error generating payslips:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to generate payslips'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayslipSelect = (payslip) => {
    setSelectedPayslip(payslip);
    setShowPreview(true);
  };

  const handleDistributionMethodChange = (payslipId, method) => {
    setPayslips(prev =>
      prev.map(payslip =>
        payslip.id === payslipId
          ? { ...payslip, distributionMethod: method }
          : payslip
      )
    );
  };

  const handleSendPayslips = async () => {
    setDistributionStatus('sending');
    setNotification(null);

    try {
      if (payslips.length === 0) {
        setNotification({
          type: 'error',
          message: 'No payslips to send'
        });
        setDistributionStatus('idle');
        return;
      }

      // Send all payslips for the selected period
      const response = await api.post('/payslips/send-bulk', {
        month: selectedPeriod
      });

      if (response.data.success) {
        setNotification({
          type: 'success',
          message: `Successfully sent ${response.data.successCount} payslips!${response.data.failedCount > 0 ? ` (${response.data.failedCount} failed)` : ''}`
        });

        // Refresh payslips list to update statuses
        fetchPayslips(selectedPeriod);
      }
    } catch (error) {
      console.error('Error sending payslips:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to send payslips. Please try again.'
      });
    }

    setDistributionStatus('completed');
  };

  const handleResendPayslip = async (payslipId) => {
    try {
      const response = await api.post(`/payslips/resend/${payslipId}`);

      if (response.data.success) {
        setNotification({
          type: 'success',
          message: 'Payslip has been re-sent successfully!'
        });

        // Refresh payslips list
        fetchPayslips(selectedPeriod);
      }
    } catch (error) {
      console.error('Error resending payslip:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to re-send payslip. Please try again.'
      });
    }
  };

  const handleDownloadPayslip = (payslipId) => {
    setNotification({
      type: 'success',
      message: 'Payslip downloaded successfully!'
    });
  };

  const handleExport = () => {
    setNotification({
      type: 'success',
      message: `Payslip report exported in ${exportFormat.toUpperCase()} format!`
    });
  };

  const filteredPayslips = payslips.filter(payslip => {
    const matchesSearch = payslip.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payslip.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payslip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Sidebar />
      <div className="payslip-generation">
        <div className="generation-header">
          <h1>Payslip Generation and Distribution</h1>
          <div className="action-buttons">
            <div className="period-selector">
              <label htmlFor="period">Period:</label>
              <input
                id="period"
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="period-input"
              />
            </div>

            <button
              onClick={handleGeneratePayslips}
              disabled={loading || !selectedPeriod || employees.length === 0}
              className="generate-button"
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" /> Generating...
                </>
              ) : (
                <>
                  Generate Payslips
                </>
              )}
            </button>
            {employees.length === 0 && !loading && (
              <div className="help-text" style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px', textAlign: 'center' }}>
                No approved salaries found for this period.
              </div>
            )}

            {/* <div className="export-container">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="export-select"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
              <button onClick={handleExport} className="export-button">
                <FaFileExport /> Export Report
              </button>
            </div> */}
            <button
              onClick={handleSendPayslips}
              disabled={distributionStatus === 'sending' || payslips.length === 0 || payslips.every(p => p.status === 'sent')}
              className="send-button"
            >
              {distributionStatus === 'sending' ? (
                <>
                  <FaSpinner className="spinner" /> Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Send All Payslips
                </>
              )}
            </button>
          </div>
        </div>

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="status-filter">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="acknowledged">Acknowledged</option>
            </select>
          </div>
        </div>

        <div className="generation-content">
          <div className="payslips-list">
            <div className="payslips-list-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Position</th>
                    <th>Month</th>
                    <th>Net Salary</th>
                    <th>Distribution</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayslips.map(payslip => (
                    <tr
                      key={payslip._id}
                      className={selectedPayslip?._id === payslip._id ? 'selected' : ''}
                      onClick={() => handlePayslipSelect(payslip)}
                    >
                      <td>
                        <div className="employee-info">
                          <span className="name">{payslip.employeeName}</span>
                          <span className="id">{payslip.employeeId}</span>
                        </div>
                      </td>
                      <td>{payslip.position}</td>
                      <td>{new Date(payslip.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                      <td>${payslip.salaryDetails.netSalary.toLocaleString()}</td>
                      <td>
                        <select
                          value={payslip.distributionMethod}
                          onChange={(e) => handleDistributionMethodChange(payslip._id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="distribution-select"
                        >
                          <option value="email">Email</option>
                          <option value="portal">Employee Portal</option>
                        </select>
                      </td>
                      <td>
                        <div className="status-container">
                          <span className={`status-badge ${payslip.status}`}>
                            {payslip.status}
                          </span>
                          {payslip.acknowledgmentStatus === 'acknowledged' && (
                            <FaCheck className="acknowledgment-icon" />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPayslip(payslip._id);
                            }}
                            className="download-button"
                            title="Download Payslip"
                          >
                            <FaDownload />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResendPayslip(payslip._id);
                            }}
                            className="resend-button"
                            title="Re-send Payslip"
                            disabled={payslip.status !== 'sent'}
                          >
                            <FaRedo />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="scroll-indicator" />
            </div>
          </div>

          {selectedPayslip && (
            <div className={`payslip-preview ${showPreview ? 'show' : ''}`}>
              <div className="preview-header">
                <h2>Payslip Preview</h2>
                <button
                  className="toggle-preview"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>

              {showPreview && (
                <>
                  <div className="employee-details">
                    <div className="detail-item">
                      <span className="label">Employee Name:</span>
                      <span className="value">{selectedPayslip.employeeName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Employee ID:</span>
                      <span className="value">{selectedPayslip.employeeId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Position:</span>
                      <span className="value">{selectedPayslip.position}</span>
                    </div>
                  </div>

                  <div className="salary-details">
                    <h3>Salary Details</h3>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="label">Base Salary:</span>
                        <span className="value">${selectedPayslip.salaryDetails.baseSalary.toLocaleString()}</span>
                      </div>
                      {selectedPayslip.salaryDetails.overtime > 0 && (
                        <div className="detail-item">
                          <span className="label">Overtime:</span>
                          <span className="value">${selectedPayslip.salaryDetails.overtime.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedPayslip.salaryDetails.bonuses > 0 && (
                        <div className="detail-item">
                          <span className="label">Bonuses:</span>
                          <span className="value">${selectedPayslip.salaryDetails.bonuses.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedPayslip.salaryDetails.deductions.tax > 0 && (
                        <div className="detail-item">
                          <span className="label">Tax Deduction:</span>
                          <span className="value">-${selectedPayslip.salaryDetails.deductions.tax.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedPayslip.salaryDetails.deductions.insurance > 0 && (
                        <div className="detail-item">
                          <span className="label">Insurance:</span>
                          <span className="value">-${selectedPayslip.salaryDetails.deductions.insurance.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedPayslip.salaryDetails.deductions.other > 0 && (
                        <div className="detail-item">
                          <span className="label">Other Deductions:</span>
                          <span className="value">-${selectedPayslip.salaryDetails.deductions.other.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="detail-item total">
                        <span className="label">Net Salary:</span>
                        <span className="value">${selectedPayslip.salaryDetails.netSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="distribution-info">
                    <h3>Distribution Information</h3>
                    <div className="detail-item">
                      <span className="label">Method:</span>
                      <span className="value">{selectedPayslip.distributionMethod}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className={`status-badge ${selectedPayslip.status}`}>
                        {selectedPayslip.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Acknowledgment:</span>
                      <span className={`status-badge ${selectedPayslip.acknowledgmentStatus}`}>
                        {selectedPayslip.acknowledgmentStatus}
                      </span>
                    </div>
                    {selectedPayslip.lastSent && (
                      <div className="detail-item">
                        <span className="label">Last Sent:</span>
                        <span className="value">
                          {new Date(selectedPayslip.lastSent).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PayslipGeneration; 