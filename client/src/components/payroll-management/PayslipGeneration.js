import React, { useState } from 'react';
import { FaDownload, FaPaperPlane, FaCheck, FaSpinner, FaFileExport, FaRedo } from 'react-icons/fa';
import './PayslipGeneration.css';
import { Sidebar } from '../dashboard/HRDashboard';

const PayslipGeneration = () => {
  const [payslips, setPayslips] = useState([
    {
      id: 1,
      employeeName: 'John Doe',
      employeeId: 'EMP001',
      position: 'Software Engineer',
      month: 'March 2024',
      basicSalary: 5000,
      overtime: 500,
      bonuses: 300,
      deductions: {
        tax: 1000,
        insurance: 200,
        other: 100
      },
      netSalary: 4500,
      status: 'pending',
      distributionMethod: 'email',
      acknowledgmentStatus: 'pending',
      lastSent: null
    },
    {
      id: 2,
      employeeName: 'Jane Smith',
      employeeId: 'EMP002',
      position: 'Product Manager',
      month: 'March 2024',
      basicSalary: 4500,
      overtime: 300,
      bonuses: 200,
      deductions: {
        tax: 900,
        insurance: 180,
        other: 90
      },
      netSalary: 4030,
      status: 'pending',
      distributionMethod: 'portal',
      acknowledgmentStatus: 'pending',
      lastSent: null
    }
  ]);

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [notification, setNotification] = useState(null);
  const [distributionStatus, setDistributionStatus] = useState('idle');
  const [showPreview, setShowPreview] = useState(true);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPayslips(prev =>
        prev.map(payslip => ({
          ...payslip,
          status: 'sent',
          lastSent: new Date().toISOString()
        }))
      );

      setNotification({
        type: 'success',
        message: 'Payslips have been sent successfully!'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to send payslips. Please try again.'
      });
    }

    setDistributionStatus('completed');
  };

  const handleResendPayslip = async (payslipId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPayslips(prev =>
        prev.map(payslip =>
          payslip.id === payslipId
            ? { ...payslip, lastSent: new Date().toISOString() }
            : payslip
        )
      );

      setNotification({
        type: 'success',
        message: 'Payslip has been re-sent successfully!'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to re-send payslip. Please try again.'
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
          <div className="export-container">
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
          </div>
          <button
            onClick={handleSendPayslips}
            disabled={distributionStatus === 'sending' || payslips.every(p => p.status === 'sent')}
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
                    key={payslip.id}
                    className={selectedPayslip?.id === payslip.id ? 'selected' : ''}
                    onClick={() => handlePayslipSelect(payslip)}
                  >
                    <td>
                      <div className="employee-info">
                        <span className="name">{payslip.employeeName}</span>
                        <span className="id">{payslip.employeeId}</span>
                      </div>
                    </td>
                    <td>{payslip.position}</td>
                    <td>{payslip.month}</td>
                    <td>${payslip.netSalary.toLocaleString()}</td>
                    <td>
                      <select
                        value={payslip.distributionMethod}
                        onChange={(e) => handleDistributionMethodChange(payslip.id, e.target.value)}
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
                            handleDownloadPayslip(payslip.id);
                          }}
                          className="download-button"
                          title="Download Payslip"
                        >
                          <FaDownload />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResendPayslip(payslip.id);
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
                      <span className="label">Basic Salary:</span>
                      <span className="value">${selectedPayslip.basicSalary.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Overtime:</span>
                      <span className="value">${selectedPayslip.overtime.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Bonuses:</span>
                      <span className="value">${selectedPayslip.bonuses.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Tax Deduction:</span>
                      <span className="value">-${selectedPayslip.deductions.tax.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Insurance:</span>
                      <span className="value">-${selectedPayslip.deductions.insurance.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Other Deductions:</span>
                      <span className="value">-${selectedPayslip.deductions.other.toLocaleString()}</span>
                    </div>
                    <div className="detail-item total">
                      <span className="label">Net Salary:</span>
                      <span className="value">${selectedPayslip.netSalary.toLocaleString()}</span>
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